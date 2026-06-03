const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * General API Limiter
 * Limits generic API usage per IP.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 999999 : 300, // Effectively disabled in development
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests from this IP, please try again after 15 minutes'
        });
    }
});

/**
 * Strict AI Limiter
 * Stricter configuration for expensive AI generation routes to prevent abuse or infinite loops.
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 999999 : 180, // Effectively disabled in development
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many AI generation requests from this IP, please try again after a while'
        });
    }
});

module.exports = {
    apiLimiter,
    aiLimiter
};
