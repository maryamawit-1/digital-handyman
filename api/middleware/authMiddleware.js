const jwt = require('jsonwebtoken');

/**
 * Middleware: Verify JWT Token
 * Checks if Authorization header has a valid Bearer token.
 * Attaches decoded payload to req.admin
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization format. Expected: Bearer <token>' });
  }

  const token = tokenParts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // attach admin info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Middleware: Require Role(s)
 * Ensures the logged-in user has one of the allowed roles
 * @param  {...string} roles - list of allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !req.admin.role) {
      return res.status(403).json({ message: 'Access denied: role missing' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: `Access denied: requires role ${roles.join(' or ')}` });
    }

    next();
  };
}

module.exports = { verifyToken, requireRole };
