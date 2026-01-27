const db = require('../config/db');

// 1. PUBLIC: Submit Feedback (The Loophole Fix is here)
async function submitFeedback(req, res) {
    const { referenceId, rating, comment } = req.body;
    try {
        // Check if job exists and if it is COMPLETED
        const [rows] = await db.query('SELECT id, status, customer_id FROM service_requests WHERE referenceId = ?', [referenceId]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Reference ID not found." });
        
        if (rows[0].status !== 'COMPLETED') {
            return res.status(400).json({ message: "Loophole Blocked: Feedback is only allowed for COMPLETED jobs." });
        }

        await db.query('INSERT INTO feedback (request_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)', 
            [rows[0].id, rows[0].customer_id, rating, comment]);

        res.json({ message: "Feedback submitted. Thank you!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 2. ADMIN: Get All Feedback
async function getAllFeedback(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT f.*, c.first_name, c.last_name, sr.referenceId 
            FROM feedback f
            JOIN customers c ON f.customer_id = c.id
            LEFT JOIN service_requests sr ON f.request_id = sr.id
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 3. ADMIN: Delete Feedback
async function deleteFeedback(req, res) {
    try {
        await db.query('DELETE FROM feedback WHERE id = ?', [req.params.id]);
        res.json({ message: "Feedback removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { submitFeedback, getAllFeedback, deleteFeedback };