/**
 * Application Controller
 * ----------------------
 * Handles HTTP request/response logic for the candidate application workflow.
 * All heavy business logic is delegated to the service layer (MatchingService, EmbeddingService).
 *
 * Endpoints:
 * - POST   /apply           → Candidate applies to a job (triggers AI matching)
 * - GET    /status/:id      → Get application status + match results
 * - GET    /my-applications → Candidate views their own applications
 * - POST   /rematch/:id     → Recruiter re-triggers matching for an application
 */

const { supabaseAdmin } = require('../config/supabase');
const MatchingService = require('../services/matching.service');
const EmbeddingService = require('../services/embedding.service');

class ApplicationController {

  /**
   * POST /api/applications/apply
   * 
   * Candidate applies to a job. This is the main entry point that triggers
   * the full AI-powered matching pipeline:
   *   1. Validate candidate ownership + prevent duplicates
   *   2. Create application record (status: 'pending')
   *   3. Trigger async matching (embedding + similarity + threshold)
   *   4. Return match result immediately
   *
   * Body: { job_id: UUID }
   * Auth: Requires authenticated candidate
   */
  static async applyToJob(req, res) {
    try {
      const userId = req.user.id;
      const { job_id } = req.body;

      // ── Validation ──────────────────────────────────────────
      if (!job_id) {
        return res.status(400).json({ error: 'job_id is required.' });
      }

      // Resolve candidate_id from the authenticated user
      const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (candidateError || !candidate) {
        return res.status(403).json({
          error: 'Only registered candidates can apply for jobs.'
        });
      }

      // Verify the job exists
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('job_id, title, similarity_threshold')
        .eq('job_id', job_id)
        .single();

      if (jobError || !job) {
        return res.status(404).json({ error: 'Job not found.' });
      }

      // Prevent duplicate applications
      const { data: existingApp } = await supabaseAdmin
        .from('applications')
        .select('application_id, status')
        .eq('candidate_id', candidate.candidate_id)
        .eq('job_id', job_id)
        .single();

      if (existingApp) {
        return res.status(409).json({
          error: 'You have already applied to this job.',
          application_id: existingApp.application_id,
          status: existingApp.status
        });
      }

      // Verify candidate has resume/profile data for matching
      const { data: profileData } = await supabaseAdmin
        .from('resume_parse_data')
        .select('parsed_id, skills, education, experience_years')
        .eq('candidate_id', candidate.candidate_id)
        .single();

      if (!profileData) {
        return res.status(422).json({
          error: 'Please upload and parse your resume before applying. Your profile data is required for AI matching.'
        });
      }

      // ── Create Application ──────────────────────────────────
      const { data: application, error: insertError } = await supabaseAdmin
        .from('applications')
        .insert({
          candidate_id: candidate.candidate_id,
          job_id: job_id,
          status: 'pending'
        })
        .select('application_id, status, created_at')
        .single();

      if (insertError) {
        throw new Error(`Failed to create application: ${insertError.message}`);
      }

      // ── Trigger AI Matching Pipeline ────────────────────────
      console.log(`[ApplicationController] Application ${application.application_id} created. Starting AI matching...`);

      const matchResult = await MatchingService.processApplicationMatch(
        application.application_id,
        candidate.candidate_id,
        job_id
      );

      // ── Return Result ───────────────────────────────────────
      return res.status(201).json({
        message: matchResult.meetsThreshold
          ? 'Application submitted! You have been selected for an interview based on your profile match.'
          : 'Application submitted. Unfortunately, your profile did not meet the minimum match threshold for this position.',
        application: {
          application_id: application.application_id,
          job_title: job.title,
          status: matchResult.status,
          match_score: matchResult.matchPercentage,
          threshold: matchResult.jobThreshold,
          created_at: application.created_at
        }
      });

    } catch (error) {
      console.error('[ApplicationController] Apply error:', error);
      return res.status(500).json({
        error: 'An error occurred while processing your application.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * GET /api/applications/status/:applicationId
   *
   * Get the current status and match details for a specific application.
   * Accessible by both the candidate (owner) and the recruiter (job owner).
   *
   * Auth: Requires authenticated user
   */
  static async getApplicationStatus(req, res) {
    try {
      const userId = req.user.id;
      const { applicationId } = req.params;

      if (!applicationId) {
        return res.status(400).json({ error: 'Application ID is required.' });
      }

      // Fetch application with joined job and candidate data
      const { data: application, error } = await supabaseAdmin
        .from('applications')
        .select(`
          application_id,
          status,
          match_score,
          matched_at,
          match_metadata,
          created_at,
          jobs (job_id, title, similarity_threshold, recruiter_id),
          candidates (candidate_id, user_id)
        `)
        .eq('application_id', applicationId)
        .single();

      if (error || !application) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      // Ownership check: candidate must own the application, or recruiter must own the job
      const isCandidate = application.candidates?.user_id === userId;

      let isRecruiter = false;
      if (!isCandidate && application.jobs?.recruiter_id) {
        const { data: recruiter } = await supabaseAdmin
          .from('recruiters')
          .select('recruiter_id')
          .eq('user_id', userId)
          .eq('recruiter_id', application.jobs.recruiter_id)
          .single();
        isRecruiter = !!recruiter;
      }

      if (!isCandidate && !isRecruiter) {
        return res.status(403).json({ error: 'You do not have access to this application.' });
      }

      return res.json({
        application: {
          application_id: application.application_id,
          job_title: application.jobs?.title,
          status: application.status,
          match_score: application.match_score,
          threshold: application.jobs?.similarity_threshold,
          matched_at: application.matched_at,
          match_metadata: application.match_metadata,
          created_at: application.created_at
        }
      });

    } catch (error) {
      console.error('[ApplicationController] Status error:', error);
      return res.status(500).json({ error: 'Failed to fetch application status.' });
    }
  }

  /**
   * GET /api/applications/my-applications
   *
   * Candidate views all their own applications with match scores.
   *
   * Auth: Requires authenticated candidate
   */
  static async getMyApplications(req, res) {
    try {
      const userId = req.user.id;

      // Resolve candidate_id
      const { data: candidate } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (!candidate) {
        return res.status(403).json({ error: 'Candidate profile not found.' });
      }

      // Fetch all applications for this candidate
      const { data: applications, error } = await supabaseAdmin
        .from('applications')
        .select(`
          application_id,
          status,
          match_score,
          matched_at,
          created_at,
          jobs (job_id, title, location, experience_level, similarity_threshold)
        `)
        .eq('candidate_id', candidate.candidate_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }

      return res.json({ applications: applications || [] });

    } catch (error) {
      console.error('[ApplicationController] My applications error:', error);
      return res.status(500).json({ error: 'Failed to fetch your applications.' });
    }
  }

  /**
   * POST /api/applications/rematch/:applicationId
   *
   * Recruiter re-triggers the AI matching for an existing application.
   * Useful when job description or threshold has been updated.
   * Forces re-generation of the job embedding.
   *
   * Auth: Requires authenticated recruiter who owns the job
   */
  static async rematchApplication(req, res) {
    try {
      const userId = req.user.id;
      const { applicationId } = req.params;

      // Fetch the application
      const { data: application, error: appError } = await supabaseAdmin
        .from('applications')
        .select(`
          application_id,
          candidate_id,
          job_id,
          jobs (recruiter_id, title)
        `)
        .eq('application_id', applicationId)
        .single();

      if (appError || !application) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      // Verify the recruiter owns this job
      const { data: recruiter } = await supabaseAdmin
        .from('recruiters')
        .select('recruiter_id')
        .eq('user_id', userId)
        .single();

      if (!recruiter || recruiter.recruiter_id !== application.jobs?.recruiter_id) {
        return res.status(403).json({ error: 'You can only rematch applications for your own jobs.' });
      }

      // Clear existing embedding hash to force re-generation
      await supabaseAdmin
        .from('jobs')
        .update({ embedding_text_hash: null })
        .eq('job_id', application.job_id);

      // Re-run the full matching pipeline
      const matchResult = await MatchingService.processApplicationMatch(
        application.application_id,
        application.candidate_id,
        application.job_id
      );

      return res.json({
        message: 'Application re-matched successfully.',
        result: {
          application_id: application.application_id,
          job_title: application.jobs?.title,
          new_status: matchResult.status,
          match_score: matchResult.matchPercentage,
          threshold: matchResult.jobThreshold
        }
      });

    } catch (error) {
      console.error('[ApplicationController] Rematch error:', error);
      return res.status(500).json({ error: 'Failed to re-match application.' });
    }
  }

  /**
   * GET /api/applications/job/:jobId/candidates
   *
   * Recruiter views all applicants for a specific job, ranked by match score.
   *
   * Auth: Requires authenticated recruiter who owns the job
   */
  static async getJobApplicants(req, res) {
    try {
      const userId = req.user.id;
      const { jobId } = req.params;

      // Verify the recruiter owns this job
      const { data: recruiter } = await supabaseAdmin
        .from('recruiters')
        .select('recruiter_id')
        .eq('user_id', userId)
        .single();

      if (!recruiter) {
        return res.status(403).json({ error: 'Recruiter profile not found.' });
      }

      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('job_id, title, similarity_threshold')
        .eq('job_id', jobId)
        .eq('recruiter_id', recruiter.recruiter_id)
        .single();

      if (!job) {
        return res.status(404).json({ error: 'Job not found or you do not own this job.' });
      }

      // Fetch all applications for this job, ranked by match score
      const { data: applications, error } = await supabaseAdmin
        .from('applications')
        .select(`
          application_id,
          job_id,
          status,
          match_score,
          matched_at,
          created_at,
          candidates (
            candidate_id,
            user_id,
            profile_score,
            users (name, email)
          ),
          interviews (
            total_score,
            result,
            status
          )
        `)
        .eq('job_id', jobId)
        .order('match_score', { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(`Failed to fetch applicants: ${error.message}`);
      }

      return res.json({
        job: { job_id: job.job_id, title: job.title, threshold: job.similarity_threshold },
        applicants: applications || []
      });

    } catch (error) {
      console.error('[ApplicationController] Job applicants error:', error);
      return res.status(500).json({ error: 'Failed to fetch applicants.' });
    }
  }

  /**
   * GET /api/applications/recommended-jobs
   *
   * Candidate gets AI-powered job recommendations based on their profile vector.
   *
   * Auth: Requires authenticated candidate
   */
  static async getRecommendedJobs(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      // Resolve candidate_id
      const { data: candidate } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (!candidate) {
        return res.status(403).json({ error: 'Candidate profile not found.' });
      }

      const recommendations = await MatchingService.findRecommendedJobs(
        candidate.candidate_id,
        limit
      );

      return res.json({ recommendations: recommendations || [] });

    } catch (error) {
      console.error('[ApplicationController] Recommendations error:', error);
      return res.status(500).json({ error: 'Failed to fetch job recommendations.' });
    }
  }

  /**
   * GET /api/applications/top-candidates/:jobId
   *
   * Recruiter gets AI-ranked candidates for a specific job.
   *
   * Auth: Requires authenticated recruiter who owns the job
   */
  static async getTopCandidates(req, res) {
    try {
      const userId = req.user.id;
      const { jobId } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      // Verify recruiter owns this job
      const { data: recruiter } = await supabaseAdmin
        .from('recruiters')
        .select('recruiter_id')
        .eq('user_id', userId)
        .single();

      if (!recruiter) {
        return res.status(403).json({ error: 'Recruiter profile not found.' });
      }

      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('job_id')
        .eq('job_id', jobId)
        .eq('recruiter_id', recruiter.recruiter_id)
        .single();

      if (!job) {
        return res.status(404).json({ error: 'Job not found or you do not own this job.' });
      }

      const topCandidates = await MatchingService.findTopCandidatesForJob(jobId, limit);

      return res.json({ candidates: topCandidates || [] });

    } catch (error) {
      console.error('[ApplicationController] Top candidates error:', error);
      return res.status(500).json({ error: 'Failed to fetch top candidates.' });
    }
  }
}

module.exports = ApplicationController;
