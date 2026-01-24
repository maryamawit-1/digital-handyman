const express = require('express');
const router = express.Router();
const { submitProviderApplication } = require('../controllers/providerController');

router.post('/', submitProviderApplication);

module.exports = router;
