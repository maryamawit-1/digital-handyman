const express = require('express');
const router = express.Router();
const { submitProviderApplication } = require('../controllers/providerController');

// Public: submit provider application
router.post('/apply', submitProviderApplication);

// Backwards-compatible root POST
router.post('/', submitProviderApplication);

module.exports = router;
