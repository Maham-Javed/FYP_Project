/**
 * Matching Routes
 * ---------------
 * Standalone matching endpoints that operate independently of
 * the application workflow. These provide direct access to the
 * vector similarity engine for dashboards and analytics.
 */

const express = require('express');
const router = express.Router();

const { supabaseAdmin } = require('../config/supabase');
const MatchingService = require('../services/matching.service');
const { verifyAuth, requireRole } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');

// ═══════════════════════════════════════════════════════════════
//  RECRUITER: Batch match all applicants for a job
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/matching/batch/:jobId
 *
 * Re-run AI matching for ALL applications of a specific job.
 * Useful when a recruiter updates the job description or threshold
 * and wants to re-evaluate all existing applicants.
 *
 * Auth: Requires authenticated recruiter who owns the job
 */
router.post(
  '/batch/:jobId',
  verifyAuth,
  requireRole('recruiter'),
  aiLimiter,
  async (req, res) => {
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

      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('job_id, title')
        .eq('job_id', jobId)
        .eq('recruiter_id', recruiter.recruiter_id)
        .single();

      if (!job) {
        return res.status(404).json({ error: 'Job not found or you do not own this job.' });
      }

      // Fetch all applications for this job
      const { data: applications, error: fetchError } = await supabaseAdmin
        .from('applications')
        .select('application_id, candidate_id')
        .eq('job_id', jobId);

      if (fetchError) {
        throw new Error(`Failed to fetch applications: ${fetchError.message}`);
      }

      if (!applications || applications.length === 0) {
        return res.json({ message: 'No applications found for this job.', results: [] });
      }

      // Clear the job embedding hash to force re-generation
      await supabaseAdmin
        .from('jobs')
        .update({ embedding_text_hash: null })
        .eq('job_id', jobId);

      // Process all applications sequentially to avoid HuggingFace rate limits
      const results = [];
      for (const app of applications) {
        try {
          const matchResult = await MatchingService.processApplicationMatch(
            app.application_id,
            app.candidate_id,
            jobId
          );
          results.push({
            application_id: app.application_id,
            status: matchResult.status,
            match_score: matchResult.matchPercentage,
            success: true
          });
        } catch (err) {
          results.push({
            application_id: app.application_id,
            success: false,
            error: err.message
          });
        }
      }

      const succeeded = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return res.json({
        message: `Batch matching complete: ${succeeded} succeeded, ${failed} failed.`,
        job: { job_id: job.job_id, title: job.title },
        total: applications.length,
        succeeded,
        failed,
        results
      });

    } catch (error) {
      console.error('[MatchingRoutes] Batch match error:', error);
      return res.status(500).json({ error: 'Batch matching failed.' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════
//  RECRUITER: Preview match score without creating an application
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/matching/preview/:jobId/:candidateId
 *
 * Preview the similarity score between a specific job and candidate
 * without creating or modifying any application record.
 * Useful for recruiter dashboards.
 *
 * Auth: Requires authenticated recruiter who owns the job
 */
router.get(
  '/preview/:jobId/:candidateId',
  verifyAuth,
  requireRole('recruiter'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { jobId, candidateId } = req.params;

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
        .select('job_id, title, similarity_threshold')
        .eq('job_id', jobId)
        .eq('recruiter_id', recruiter.recruiter_id)
        .single();

      if (!job) {
        return res.status(404).json({ error: 'Job not found or you do not own this job.' });
      }

      // Execute the database matching function (read-only)
      const { data, error } = await supabaseAdmin.rpc('match_candidate_to_job', {
        p_candidate_id: candidateId,
        p_job_id: jobId
      });

      if (error) {
        throw new Error(`Matching failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return res.status(422).json({
          error: 'Cannot preview match — one or both embeddings are missing. Generate them first.'
        });
      }

      const result = data[0];

      return res.json({
        job: { job_id: job.job_id, title: job.title },
        candidate_id: candidateId,
        similarity_percentage: parseFloat(result.similarity_percentage),
        meets_threshold: result.meets_threshold,
        threshold: job.similarity_threshold
      });

    } catch (error) {
      console.error('[MatchingRoutes] Preview match error:', error);
      return res.status(500).json({ error: 'Failed to preview match score.' });
    }
  }
);

module.exports = router;
