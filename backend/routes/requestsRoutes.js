const express = require('express');
const router = express.Router();
const { estimateCost, getAllServiceRequestsAdmin } = require('../controllers/serviceRequestController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// POST /requests/estimate
router.post('/estimate', estimateCost);

// GET /admin/requests - admin or owner
router.get('/admin/requests', verifyToken, requireRole('ADMIN', 'OWNER'), getAllServiceRequestsAdmin);

module.exports = router;
