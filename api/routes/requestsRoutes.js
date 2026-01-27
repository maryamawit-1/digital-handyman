const express = require('express');
const router = express.Router();

// Import the logic from the controller (where the Email & DB logic lives)
const { 
    submitServiceRequest, 
    estimateCost, 
    trackRequestPublic,
    resendReferenceIds
} = require('../controllers/serviceRequestController');

// 1. Submit Booking (Sends Email + Saves to DB)
// POST /api/requests
router.post('/', submitServiceRequest);

// 2. Estimate Cost (Optional)
// POST /api/requests/estimate
router.post('/estimate', estimateCost);

// 3. Track Request (For the Customer Page)
// GET /api/requests/track/:refId
router.get('/track/:refId', trackRequestPublic);

const validateServiceRequest = require('../middleware/validateServiceRequest');

// ADD MIDDLEWARE HERE:
router.post('/', validateServiceRequest, submitServiceRequest);

router.post('/estimate', estimateCost);
router.get('/track/:refId', trackRequestPublic);
router.post('/resend-id', resendReferenceIds);

module.exports = router;