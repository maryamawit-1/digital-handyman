const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllRequests, 
    updateRequest, 
    deleteRequest,
    getAvailableProviders,
    assignProvider,
    addService,
    updateService,
    deleteService,
    getSystemReports,
    getProviderApplications,
    approveApplication,
    deleteProvider,
    adminCreateProvider, // <--- AND THIS
} = require('../controllers/adminController');

const { getAllFeedback, deleteFeedback } = require('../controllers/feedbackController');

// 1. Dashboard & Stats
router.get('/dashboard', getDashboardStats);
router.get('/reports', getSystemReports);

// 2. Service Requests
router.get('/requests', getAllRequests);
router.patch('/requests/:id', updateRequest);
router.delete('/requests/:id', deleteRequest);

// 3. Request Assignment
router.get('/providers/available', getAvailableProviders);
router.post('/requests/assign', assignProvider);

// 4. Service Management
router.post('/services', addService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// 5. Provider Management
router.get('/applications', getProviderApplications);
router.post('/applications/:id/approve', approveApplication);
router.delete('/providers/:id', deleteProvider);

// 6. Feedback Management
router.get('/feedback', getAllFeedback); 
router.delete('/feedback/:id', deleteFeedback);

router.post('/providers', adminCreateProvider);

module.exports = router;