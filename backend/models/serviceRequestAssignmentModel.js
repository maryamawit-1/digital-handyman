const pool = require('../config/db');

async function checkRequestExists(id) {
    const [rows] = await pool.query('SELECT id FROM service_requests WHERE id = ?', [id]);
    return rows;
}

async function checkProviderExists(id) {
    const [rows] = await pool.query('SELECT id FROM service_providers WHERE id = ?', [id]);
    return rows;
}

async function checkProviderAlreadyAssigned(requestId, providerId) {
    const [rows] = await pool.query(
        'SELECT id FROM service_request_assignments WHERE request_id = ? AND provider_id = ?',
        [requestId, providerId]
    );
    return rows;
}

async function insertAssignment(requestId, providerId) {
    return pool.query(
        'INSERT INTO service_request_assignments (request_id, provider_id, assignment_status) VALUES (?, ?, "PENDING")',
        [requestId, providerId]
    );
}

module.exports = { 
    checkRequestExists, 
    checkProviderExists, 
    checkProviderAlreadyAssigned, 
    insertAssignment 
};