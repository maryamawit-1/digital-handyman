const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Import models for the dashboard (Ensure these files exist in your models folder)
const ServiceModel = require('../models/serviceRequestModel');
const ProviderModel = require('../models/providerModel');
const FeedbackModel = require('../models/feedbackModel');

/**
 * ADMIN LOGIN
 * Verifies admin credentials against MySQL database
 */
async function adminLogin(req, res) {
    // 1. Get and Clean Input (Trimming removes accidental spaces)
    const username = req.body.username ? req.body.username.trim() : "";
    const password = req.body.password ? req.body.password.trim() : "";

    console.log(`--- [auth] Login Attempt ---`);
    console.log(`Username: "${username}"`);
    console.log(`Password Length: ${password.length}`);

    try {
        // 2. Fetch admin from database
        const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
        const admin = rows[0];

        // 3. Check if user exists
        if (!admin) {
            console.log(`[auth] Result: User not found.`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`[auth] User found in DB. Comparing passwords...`);

        // 4. Compare passwords using Bcrypt
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            console.log(`[auth] Result: Password mismatch.`);
            console.log(`[auth] DB Hash: ${admin.password}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 5. Generate JWT Token
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username, 
                role: admin.role 
            }, 
            process.env.JWT_SECRET || 'super_secret_handyman_key', 
            { expiresIn: '8h' }
        );

        console.log(`✅ [auth] Result: Login Successful for ${username}`);

        // 6. Return response
        return res.json({ 
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (err) {
        console.error("❌ [auth] Server Error:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * ADMIN DASHBOARD
 * Fetches stats and lists for the dashboard
 */
async function dashboard(req, res) {
    try {
        // Run all queries at once to save time
        const [services, providers, feedbacks] = await Promise.all([
            ServiceModel.getAllServiceRequests(),
            ProviderModel.getAllProviderApplications(),
            FeedbackModel.getAllFeedbacks()
        ]);

        res.json({ 
            summary: {
                totalRequests: services.length,
                totalProviders: providers.length,
                totalFeedbacks: feedbacks.length
            },
            services, 
            providers, 
            feedbacks 
        });
    } catch (err) {
        console.error("❌ [dashboard] Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { adminLogin, dashboard };