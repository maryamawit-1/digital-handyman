const pool = require('../config/db');

async function checkRequestExists(requestId) {
  const sql = 'SELECT id FROM service_requests WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [requestId]);
  return rows;
}

async function checkProviderExists(providerId) {
  const sql = 'SELECT id FROM service_providers WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [providerId]);
  return rows;
}

async function checkProviderAlreadyAssigned(requestId, providerId) {
  const sql = 'SELECT id FROM service_request_assignments WHERE request_id = ? AND provider_id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [requestId, providerId]);
  return rows;
}

async function insertAssignment(requestId, providerId) {
  const sql = `
    INSERT INTO service_request_assignments
    (request_id, provider_id, assigned_at, assignment_status)
    VALUES (?, ?, NOW(), 'PENDING')
  `;
  const [result] = await pool.query(sql, [requestId, providerId]);
  return result;
}

async function countAssignmentsForRequest(requestId) {
  const sql = 'SELECT COUNT(*) AS count FROM service_request_assignments WHERE request_id = ?';
  const [rows] = await pool.query(sql, [requestId]);
  return rows;
}

module.exports = {
  checkRequestExists,
  checkProviderExists,
  checkProviderAlreadyAssigned,
  insertAssignment,
  countAssignmentsForRequest,
};
