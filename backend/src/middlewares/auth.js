const { supabase } = require('../config/supabase');

/**
 * Middleware to verify Supabase JWT
 */
const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Use Supabase getUser to securely decode and verify the token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token', details: error });
    }
    
    req.user = user;
    next();
};

/**
 * Middleware for Role-Based Access Control
 * Ensure to place after verifyAuth middleware
 */
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }

        // Ideally, user role should be stored in user_metadata during registration.
        // It allows checking role synchronously through the decoded JWT.
        const userRole = req.user.user_metadata?.role;
        
        if (userRole !== requiredRole) {
            return res.status(403).json({ error: `Forbidden: Requires ${requiredRole} access` });
        }
        
        req.user.role = userRole;
        next();
    };
};

module.exports = { verifyAuth, requireRole };
