const express = require('express');
const router = express.Router();
const { submitServiceRequest, estimateCost } = require('../controllers/serviceRequestController');
const { getServices, createService, updateService } = require('../controllers/serviceController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public: list active services
router.get('/', getServices);

// Estimate cost for a service (does not save)
router.post('/requests/estimate', estimateCost);

// Submit a service request (existing)
router.post('/', submitServiceRequest);

// Admin: create a service
router.post('/admin/services', verifyToken, requireRole('ADMIN', 'OWNER'), createService);

// Admin: update a service
router.put('/admin/services/:id', verifyToken, requireRole('ADMIN', 'OWNER'), updateService);

module.exports = router;
