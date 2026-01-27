const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendApplicationReceivedEmail } = require('../services/emailService'); // Required for this controller

/**
 * 1. Public: Submit provider application
 */
async function submitProviderApplication(req, res) {
    try {
        const data = req.body;
        
        const firstName = data.first_name || data.firstName;
        const email = data.email;
        const skills = data.skills;

        if (!firstName || !email || !data.phone || !skills) {
            return res.status(400).json({ message: 'First Name, Email, Phone, and Skills are required.' });
        }

        const sql = `
            INSERT INTO provider_applications 
            (first_name, last_name, email, phone, experience_details, skills, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        `;
        
        const params = [
            firstName, 
            data.last_name || '',        
            email, 
            data.phone, 
            data.experience_details || '', 
            skills
        ];

        await db.query(sql, params);

        // Send Acknowledgment Email
        try {
            await sendApplicationReceivedEmail(email, firstName, skills);
        } catch (e) {
            console.error("📧 Application Acknowledgment Email failed:", e.message);
        }

        res.status(201).json({ message: 'Application submitted successfully!' });

    } catch (err) {
        console.error('❌ SUBMIT PROVIDER APPLICATION ERROR:', err);
        res.status(500).json({ message: 'Database Error', error: err.message });
    }
}

/**
 * 2. Provider Login
 */
async function providerLogin(req, res) {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM service_providers WHERE email = ?', [email]);
        const provider = rows[0];

        if (!provider) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, provider.password);
        if (isMatch) {
            const token = jwt.sign({ id: provider.id, role: 'provider' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
            res.json({ token, provider: { id: provider.id, name: provider.first_name, email: provider.email } });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
}

/**
 * 3. Get My Jobs
 */
async function getMyJobs(req, res) {
    const { id } = req.params; 
    try {
        const [jobs] = await db.query(`
            SELECT sr.*, c.first_name as cust_name, c.phone as cust_phone, c.address as cust_address, s.name as service_name
            FROM service_requests sr
            JOIN customers c ON sr.customer_id = c.id
            JOIN services s ON sr.service_id = s.id
            WHERE sr.provider_id = ?`, [id]);
        res.json(jobs);
    } catch (err) { res.status(500).json({ error: err.message }); }
}

/**
 * 4. Mark Job as Completed
 */
async function completeJob(req, res) {
    const { id, jobId } = req.params; // Provider ID, Job ID
    try {
        const [check] = await db.query('SELECT * FROM service_requests WHERE id = ? AND provider_id = ?', [jobId, id]);
        
        if (check.length === 0) return res.status(403).json({ message: "Unauthorized or Job not found" });

        await db.query('UPDATE service_requests SET status = "COMPLETED" WHERE id = ?', [jobId]);
        res.json({ message: "Job completed" });
    } catch (err) { res.status(500).json({ error: err.message }); }
}


module.exports = {
    submitProviderApplication,
    providerLogin,
    getMyJobs,
    completeJob
};