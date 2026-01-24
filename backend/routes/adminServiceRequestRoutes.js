// routes/adminServiceRequestRoutes.js
const express = require('express');
const router = express.Router();

// Import controller
const { assignProviderToRequest } = require('../controllers/adminServiceRequestController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
// Import your admin-only middleware
const { adminAuth } = require('../middleware/authMiddleware'); // Adjust path if needed

/**
 * @route   POST /admin/requests/:requestId/assign-provider
 * @desc    Assign providers to a service request
 * @access  Admin only
 */
router.post(
  '/requests/:requestId/assign-provider',verifyToken, requireRole('ADMIN', 'OWNER'), assignProviderToRequest
);

module.exports = router;
