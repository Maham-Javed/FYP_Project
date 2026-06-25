/**
 * Application Routes
 * ------------------
 * Defines all REST endpoints for the candidate application workflow.
 * Routes are grouped by role (candidate vs recruiter) and protected
 * by JWT authentication and role-based access control.
 */

const express = require('express');
const router = express.Router();

const ApplicationController = require('../controllers/application.controller');
const { verifyAuth, requireRole } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');

// ═══════════════════════════════════════════════════════════════
//  CANDIDATE ROUTES
//  All require authenticated user with 'candidate' role
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/applications/apply
 * Apply to a job — triggers the full AI matching pipeline.
 * Rate-limited because it calls the HuggingFace embedding API.
 *
 * Body: { job_id: UUID }
 */
router.post(
  '/apply',
  verifyAuth,
  requireRole('candidate'),
  aiLimiter,
  ApplicationController.applyToJob
);

/**
 * GET /api/applications/my-applications
 * List all applications for the authenticated candidate.
 */
router.get(
  '/my-applications',
  verifyAuth,
  requireRole('candidate'),
  ApplicationController.getMyApplications
);

/**
 * GET /api/applications/recommended-jobs
 * Get AI-powered job recommendations based on profile similarity.
 * Rate-limited because it may generate embeddings on first call.
 *
 * Query: ?limit=10
 */
router.get(
  '/recommended-jobs',
  verifyAuth,
  requireRole('candidate'),
  aiLimiter,
  ApplicationController.getRecommendedJobs
);

// ═══════════════════════════════════════════════════════════════
//  RECRUITER ROUTES
//  All require authenticated user with 'recruiter' role
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/applications/rematch/:applicationId
 * Re-trigger AI matching for an existing application.
 * Useful after job description or threshold is updated.
 */
router.post(
  '/rematch/:applicationId',
  verifyAuth,
  requireRole('recruiter'),
  aiLimiter,
  ApplicationController.rematchApplication
);

/**
 * GET /api/applications/job/:jobId/candidates
 * View all applicants for a job, ranked by match score.
 */
router.get(
  '/job/:jobId/candidates',
  verifyAuth,
  requireRole('recruiter'),
  ApplicationController.getJobApplicants
);

/**
 * GET /api/applications/top-candidates/:jobId
 * Get AI-ranked candidates for a job (includes non-applicants).
 *
 * Query: ?limit=20
 */
router.get(
  '/top-candidates/:jobId',
  verifyAuth,
  requireRole('recruiter'),
  aiLimiter,
  ApplicationController.getTopCandidates
);

// ═══════════════════════════════════════════════════════════════
//  SHARED ROUTES
//  Accessible by both candidates and recruiters (with ownership check)
// ═══════════════════════════════════════════════════════════════

/**
 * PATCH /api/applications/status/:applicationId
 * Update application status (e.g. accepted, rejected)
 */
router.patch(
  '/status/:applicationId',
  verifyAuth,
  requireRole('recruiter'),
  ApplicationController.updateApplicationStatus
);

/**
 * GET /api/applications/status/:applicationId
 * Get detailed status and match results for a specific application.
 * Ownership is validated inside the controller.
 */
router.get(
  '/status/:applicationId',
  verifyAuth,
  ApplicationController.getApplicationStatus
);

module.exports = router;
