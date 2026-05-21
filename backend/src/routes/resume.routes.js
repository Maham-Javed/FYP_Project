const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const { verifyAuth, requireRole } = require('../middlewares/auth');
const { supabaseAdmin } = require('../config/supabase');
const { aiLimiter } = require('../middlewares/rateLimiter');

/**
 * POST /api/resume/parse
 * Accepts raw resume text, parses it using Groq AI, stores the structured
 * result in the database, and automatically generates/stores a vector embedding.
 *
 * Body: { resumeText: string }
 * Auth: Requires authenticated candidate
 */
router.post(
  '/parse',
  verifyAuth,
  requireRole('candidate'),
  aiLimiter,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { resumeText } = req.body;

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({ error: 'resumeText is required.' });
      }

      // Resolve candidate_id from the authenticated user
      const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('candidate_id')
        .eq('user_id', userId)
        .single();

      if (candidateError || !candidate) {
        return res.status(403).json({
          error: 'Candidate profile not found. Please register as a candidate first.'
        });
      }

      console.log(`[ResumeRoutes] Triggering AI resume parser for candidate ${candidate.candidate_id}...`);
      
      const parsedData = await AIService.parseResume(candidate.candidate_id, resumeText);

      return res.status(200).json({
        message: 'Resume parsed and profile embedding generated successfully.',
        data: {
          skills: parsedData.skills,
          education: parsedData.education,
          experience_years: parsedData.experience_years
        }
      });
    } catch (error) {
      console.error('[ResumeRoutes] Parse resume error:', error);
      return res.status(500).json({
        error: 'An error occurred while parsing the resume.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
