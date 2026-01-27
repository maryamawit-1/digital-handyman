const express = require('express');
const router = express.Router();
const { assignProviderToRequest } = require('../controllers/adminServiceRequestController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// POST /admin/requests/:requestId/assign-provider
// Assign one or multiple providers to a service request
router.post(
  '/requests/:requestId/assign-provider',
  verifyToken,
  requireRole('ADMIN', 'OWNER'),
  assignProviderToRequest
);

module.exports = router;
