// Express App Configuration
// Sets up middleware, routing, and core server configuration.
const express = require('express');
const cors = require('cors');
const { apiLimiter } = require('./middlewares/rateLimiter');
const apiLogger = require('./middlewares/logger');

// ── Route Imports ─────────────────────────────────────────────
const applicationRoutes = require('./routes/application.routes');
const embeddingRoutes = require('./routes/embedding.routes');
const matchingRoutes = require('./routes/matching.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');

const app = express();

// ── Global Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(apiLogger);
app.use('/api', apiLimiter);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  message: 'Xenon AI Recruitment Backend',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}));

// ── Route Registration ────────────────────────────────────────
// Application workflow: apply, status, my-applications, rematch, recommendations
app.use('/api/applications', applicationRoutes);

// Embedding management: generate job/profile embeddings, check readiness
app.use('/api/embeddings', embeddingRoutes);

// Matching engine: batch re-match, preview scores
app.use('/api/matching', matchingRoutes);

// Resume parsing and processing
app.use('/api/resume', resumeRoutes);

// AI Interview process
app.use('/api/interviews', interviewRoutes);

// ── Global Error Handler ──────────────────────────────────────
const { globalErrorHandler } = require('./middlewares/errorHandler');
app.use(globalErrorHandler);

module.exports = { app };

