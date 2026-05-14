/**
 * Embedding Routes
 * ----------------
 * Endpoints for managing vector embeddings independently of the application flow.
 * These allow pre-generation of embeddings so the application process is faster.
 */

const express = require('express');
const router = express.Router();

const EmbeddingController = require('../controllers/embedding.controller');
const { verifyAuth, requireRole } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');

// ═══════════════════════════════════════════════════════════════
//  RECRUITER: Generate job embedding
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/embeddings/job/:jobId
 * Trigger embedding generation for a job posting.
 * Rate-limited as it calls the HuggingFace API.
 */
router.post(
  '/job/:jobId',
  verifyAuth,
  requireRole('recruiter'),
  aiLimiter,
  EmbeddingController.generateJobEmbedding
);

// ═══════════════════════════════════════════════════════════════
//  CANDIDATE: Generate profile embedding
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/embeddings/profile
 * Trigger embedding generation for the candidate's resume/profile.
 * Rate-limited as it calls the HuggingFace API.
 */
router.post(
  '/profile',
  verifyAuth,
  requireRole('candidate'),
  aiLimiter,
  EmbeddingController.generateProfileEmbedding
);

// ═══════════════════════════════════════════════════════════════
//  SHARED: Check embedding readiness
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/embeddings/status/:jobId/:candidateId
 * Check if embeddings are ready for both a job and a candidate.
 */
router.get(
  '/status/:jobId/:candidateId',
  verifyAuth,
  EmbeddingController.checkEmbeddingStatus
);

module.exports = router;
