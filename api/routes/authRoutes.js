const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/adminController');

// Public route: Admin login
// POST /api/auth/login
router.post('/login', adminLogin);

module.exports = router;
