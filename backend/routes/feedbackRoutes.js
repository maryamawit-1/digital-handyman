const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// POST /feedback - public/customer endpoint
router.post('/feedback', submitFeedback);

// GET /admin/feedback - admin or owner
router.get('/admin/feedback', verifyToken, requireRole('ADMIN', 'OWNER'), getAllFeedback);

// DELETE /admin/feedback/:id - admin or owner
router.delete('/admin/feedback/:id', verifyToken, requireRole('ADMIN', 'OWNER'), deleteFeedback);

module.exports = router;
