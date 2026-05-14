/**
 * Embedding Controller
 * --------------------
 * Handles HTTP endpoints for explicit embedding management.
 *
 * These endpoints allow:
 * - Recruiters to trigger embedding generation for their jobs
 * - Candidates to trigger embedding generation for their profile
 * - Status checks on whether embeddings exist
 *
 * Embeddings are also auto-generated during the application flow (Step 4),
 * but these endpoints allow upfront generation for better UX.
 */

const { supabaseAdmin } = require('../config/supabase');
const EmbeddingService = require('../services/embedding.service');

class EmbeddingController {

  /**
   * POST /api/embeddings/job/:jobId
   *
   * Recruiter triggers embedding generation for a specific job.
   * Typically called after creating or editing a job posting.
   *
   * Auth: Requires authenticated recruiter who owns the job
   */
  static async generateJobEmbedding(req, res) {
    try {
      const userId = req.user.id;
      const { jobId } = req.params;

      // Verify recruiter owns this job
      const { data: recruiter } = await supabaseAdmin
        .from('recruiters')
        .select('recruiter_id')
        .eq('user_id', userId)
        .single();

      if (!recruiter) {
        return res.status(403).json({ error: 'Recruiter profile not found.' });
      }

      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('job_id, title, description, required_skill, qualification, experience_level, location')
        .eq('job_id', jobId)
        .eq('recruiter_id', recruiter.recruiter_id)
        .single();

      if (jobError || !job) {
        return res.status(404).json({ error: 'Job not found or you do not own this job.' });
      }

      // Build the text representation and generate the embedding
      const jobText = EmbeddingService.buildJobText(job);

      if (!jobText || jobText.trim().length === 0) {
        return res.status(422).json({
          error: 'Job has no text content to embed. Please add a description or required skills.'
        });
      }

      const result = await EmbeddingService.generateJobEmbedding(job.job_id, jobText);

      return res.json({
        message: result.cached
          ? 'Job embedding is already up to date (content unchanged).'
          : 'Job embedding generated successfully.',
        job_id: job.job_id,
        title: job.title,
        cached: result.cached,
        hash: result.hash
      });

    } catch (error) {
      console.error('[EmbeddingController] Generate job embedding error:', error);
      return res.status(500).json({ error: 'Failed to generate job embedding.' });
    }
  }

  /**
   * POST /api/embeddings/profile
   *
   * Candidate triggers embedding generation for their own profile.
   * Typically called after updating CV / resume_parse_data.
   *
   * Auth: Requires authenticated candidate
   */
  static async generateProfileEmbedding(req, res) {
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

      // Fetch resume parse data
      const { data: parseData, error: parseError } = await supabaseAdmin
        .from('resume_parse_data')
        .select('skills, education, experience_years')
        .eq('candidate_id', candidate.candidate_id)
        .single();

      if (parseError || !parseData) {
        return res.status(422).json({
          error: 'No resume data found. Please upload and parse your resume first.'
        });
      }

      // Build profile text and generate embedding
      const profileText = EmbeddingService.buildProfileText(parseData);

      if (!profileText || profileText.trim().length === 0) {
        return res.status(422).json({
          error: 'Profile data is empty. Please ensure your resume has been parsed with skills/education.'
        });
      }

      const result = await EmbeddingService.generateProfileEmbedding(
        candidate.candidate_id,
        profileText
      );

      return res.json({
        message: result.cached
          ? 'Profile embedding is already up to date (content unchanged).'
          : 'Profile embedding generated successfully.',
        candidate_id: candidate.candidate_id,
        cached: result.cached,
        hash: result.hash
      });

    } catch (error) {
      console.error('[EmbeddingController] Generate profile embedding error:', error);
      return res.status(500).json({ error: 'Failed to generate profile embedding.' });
    }
  }

  /**
   * GET /api/embeddings/status/:jobId/:candidateId
   *
   * Check whether embeddings exist for both a job and a candidate.
   * Useful for the frontend to show a loading/ready state before applying.
   *
   * Auth: Requires authenticated user
   */
  static async checkEmbeddingStatus(req, res) {
    try {
      const { jobId, candidateId } = req.params;

      const status = await EmbeddingService.checkEmbeddingsExist(jobId, candidateId);

      return res.json({
        job_id: jobId,
        candidate_id: candidateId,
        job_embedding_ready: status.jobHasEmbedding,
        profile_embedding_ready: status.profileHasEmbedding,
        both_ready: status.jobHasEmbedding && status.profileHasEmbedding
      });

    } catch (error) {
      console.error('[EmbeddingController] Check status error:', error);
      return res.status(500).json({ error: 'Failed to check embedding status.' });
    }
  }
}

module.exports = EmbeddingController;
