const express = require('express');
const router = express.Router();

// IMPORT completeJob HERE:
const { 
    submitProviderApplication, 
    providerLogin, 
    getMyJobs, 
    completeJob // <--- ADD THIS
} = require('../controllers/providerController');

// 1. Submit Application
router.post('/apply', submitProviderApplication);

// 2. Provider Login
router.post('/login', providerLogin);

// 3. Get My Jobs
router.get('/:id/jobs', getMyJobs);

// 4. Complete Job
router.patch('/:id/jobs/:jobId/complete', completeJob);

router.post('/apply', submitProviderApplication); 

module.exports = router;