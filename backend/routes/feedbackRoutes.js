const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public route: submit feedback
router.post('/', submitFeedback);

// Admin routes: protected
router.get('/', verifyToken, requireRole('ADMIN', 'OWNER'), getAllFeedback);
router.delete('/:feedbackId', verifyToken, requireRole('ADMIN', 'OWNER'), deleteFeedback);

module.exports = router;
