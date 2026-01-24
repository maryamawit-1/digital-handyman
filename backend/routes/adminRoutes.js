const express = require('express');
const router = express.Router();

// Import the controller functions
// Note: We use the adminController for both login and dashboard logic
const { adminLogin, dashboard } = require('../controllers/adminController');
const { adminUpdateServiceRequest, deleteRequestAdmin, searchRequestByRef, deleteRequest } = require('../controllers/serviceRequestController');

// Import the middleware for protection
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { createService, updateService } = require('../controllers/serviceController');

/**
 * PUBLIC ROUTES
 */
// POST /api/admin/login
router.post('/login', adminLogin);

/**
 * PROTECTED ROUTES
 * These require a valid JWT token and specific roles
 */

// GET /api/admin/dashboard
// 1. verifyToken: Checks if the user is logged in
// 2. requireRole: Checks if the user is an 'ADMIN' or 'OWNER'
// 3. dashboard: Fetches the data
router.get('/dashboard', verifyToken, requireRole('ADMIN', 'OWNER'), dashboard);

/**
 * EXAMPLE FOR FUTURE ROUTES
 * You can add more management routes here following the same pattern
 */
// router.get('/requests', verifyToken, requireRole('ADMIN', 'OWNER'), (req, res) => { ... });

// Admin: create a service
router.post('/services', verifyToken, requireRole('ADMIN', 'OWNER'), createService);

// Admin: update a service
router.put('/services/:id', verifyToken, requireRole('ADMIN', 'OWNER'), updateService);

// Admin: update a service request after negotiation (status, scheduled_at, negotiated_price, provider_id)
router.patch('/requests/:id', verifyToken, requireRole('ADMIN', 'OWNER'), adminUpdateServiceRequest);

// Admin: search a service request by reference
router.get('/requests/search/:referenceId', verifyToken, requireRole('ADMIN', 'OWNER'), searchRequestByRef);

// Admin: delete a service request (accepts numeric id or referenceId like 'SR-...')
router.delete('/requests/:id', verifyToken, requireRole('ADMIN', 'OWNER'), deleteRequest);

module.exports = router;