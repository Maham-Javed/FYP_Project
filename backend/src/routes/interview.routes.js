const express = require('express');
const router = express.Router();
const InterviewController = require('../controllers/interview.controller');
const { verifyAuth, requireRole } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { startInterviewSchema, submitAnswerSchema } = require('./interview.validation');

/**
 * POST /api/interviews/start
 * Initialize a new interview session for a candidate application
 */
router.post(
  '/start',
  verifyAuth,
  requireRole('candidate'),
  aiLimiter,
  validate(startInterviewSchema),
  InterviewController.startInterview
);

/**
 * POST /api/interviews/:interviewId/answer
 * Submit an answer to a question. Returns evaluation + next question or final completion status.
 */
router.post(
  '/:interviewId/answer',
  verifyAuth,
  requireRole('candidate'),
  aiLimiter,
  validate(submitAnswerSchema),
  InterviewController.submitAnswer
);

/**
 * GET /api/interviews/my-interviews
 * List all interviews taken by the candidate
 */
router.get(
  '/my-interviews',
  verifyAuth,
  requireRole('candidate'),
  InterviewController.getMyInterviews
);

/**
 * GET /api/interviews/:interviewId/results
 * Retrieve final results and breakdown of questions, answers, and scores.
 */
router.get(
  '/:interviewId/results',
  verifyAuth,
  InterviewController.getInterviewResults
);

module.exports = router;
