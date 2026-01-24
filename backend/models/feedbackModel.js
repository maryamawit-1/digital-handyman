const pool = require('../config/db');

async function insertFeedback(data) {
  const sql = `INSERT INTO feedback (id, request_id, customer_id, rating, comment, created_at) VALUES (?, ?, ?, ?,?,?)`;
  const params = [data.id, data.request_id, data.customer_id || null, data.rating || null, data.comment || null, data.created_at];
  const [result] = await pool.query(sql, params);
  return result;
}

async function getAllFeedbacks() {
  const [rows] = await pool.query('SELECT * FROM feedback');
  return rows;
}

module.exports = { insertFeedback, getAllFeedbacks };
