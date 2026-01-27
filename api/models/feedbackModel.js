const db = require('../config/db');

const Feedback = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT f.*, c.first_name, c.last_name, sr.referenceId 
            FROM feedback f
            JOIN customers c ON f.customer_id = c.id
            JOIN service_requests sr ON f.request_id = sr.id
        `);
        return rows;
    },
    create: async (data) => {
        const [result] = await db.query('INSERT INTO feedback SET ?', data);
        return result.insertId;
    }
};

module.exports = Feedback;