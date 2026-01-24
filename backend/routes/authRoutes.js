const express = require('express');
const router = express.Router();
// Ensure the filename and function names match!
const { adminLogin } = require('../controllers/adminController');


// The path here is just '/', but it will be prefixed in app.js


// This creates: POST /api/auth/login
router.post('/login', adminLogin);

module.exports = router;