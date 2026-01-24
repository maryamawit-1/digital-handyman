const jwt = require('jsonwebtoken');

/**
 * verifyToken
 * Middleware to check if the request has a valid JWT token in the header.
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    // 1. Check if Authorization header exists
    if (!authHeader) {
        console.log("[middleware] Access Denied: No Authorization header found.");
        return res.status(401).json({ message: 'Missing token. Please login first.' });
    }

    // 2. Extract token (Format: "Bearer <token>")
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token error: Format must be "Bearer <token>"' });
    }

    const token = parts[1];

    try {
        // 3. Verify the token using your secret
        // Make sure this fallback 'super_secret_handyman_key' matches your .env or adminController
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_handyman_key');

        // 4. Attach the decoded payload (id, username, role) to the request object
        req.admin = payload;

        console.log(`[middleware] Token verified for: ${payload.username} (Role: ${payload.role})`);
        next();
    } catch (err) {
        console.log("[middleware] Token verification failed:", err.message);
        return res.status(401).json({ message: 'Invalid or expired token. Please login again.' });
    }
}

/**
 * requireRole
 * Middleware to restrict access based on user roles (e.g., 'OWNER', 'ADMIN').
 * Usage: requireRole('OWNER', 'ADMIN')
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const admin = req.admin;

        // 1. Check if verifyToken was called before this
        if (!admin) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // 2. Check if the user's role is in the allowed list
        if (!roles.includes(admin.role)) {
            console.log(`[middleware] Forbidden: User ${admin.username} with role ${admin.role} tried to access a restricted route.`);
            return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
        }

        next();
    };
}

module.exports = { verifyToken, requireRole };