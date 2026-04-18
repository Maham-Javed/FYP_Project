const rateLimit = require('express-rate-limit');

/**
 * General API Limiter
 * Limits generic API usage per IP.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

/**
 * Strict AI Limiter
 * Stricter configuration for expensive AI generation routes to prevent abuse or infinite loops.
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 AI generation requests per window
    message: 'Too many AI generation requests from this IP, please try again after a while'
});

module.exports = {
    apiLimiter,
    aiLimiter
};
