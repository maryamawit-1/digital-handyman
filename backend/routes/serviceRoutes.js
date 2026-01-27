const express = require('express');
const router = express.Router();
const { getServices, createService, updateService } = require('../controllers/serviceController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// GET /services
// Public: list all active services
router.get('/', getServices);

// Admin: create a service
router.post('/admin', verifyToken, requireRole('ADMIN', 'OWNER'), createService);

// Admin: update a service
router.put('/admin/:id', verifyToken, requireRole('ADMIN', 'OWNER'), updateService);

module.exports = router;
