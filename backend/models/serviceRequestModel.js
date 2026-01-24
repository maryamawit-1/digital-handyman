const pool = require('../config/db');

async function insertServiceRequestWithService(serviceRequest) {
  const sql = `
    INSERT INTO service_requests 
    (referenceId, name, email, phone, address, description, service_id, service_type, service_quantity, estimated_cost, preferred_date, preferred_time, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    serviceRequest.referenceId,
    serviceRequest.name,
    serviceRequest.email,
    serviceRequest.phone,
    serviceRequest.address,
    serviceRequest.description || '',
    serviceRequest.serviceId,
    serviceRequest.service ? serviceRequest.service.name : 'Unknown',
    serviceRequest.serviceQuantity,
    serviceRequest.estimatedCost,
    serviceRequest.preferredDate || null,
    serviceRequest.preferredTime || null,
    serviceRequest.status || 'PENDING'
  ];

  const [result] = await pool.query(sql, params);
  return result;
}

async function assignProvidersToRequest(requestId, providerIds = []) {
  if (!requestId) throw new Error('requestId is required');
  if (!Array.isArray(providerIds) || providerIds.length === 0) {
    return { affectedRows: 0 };
  }

  // Build bulk insert for assignments
  const placeholders = providerIds.map(() => '(?, ?, NOW())').join(', ');
  const sql = `INSERT INTO service_request_assignments (request_id, provider_id, assigned_at) VALUES ${placeholders}`;
  const params = [];
  for (const pid of providerIds) {
    params.push(requestId, pid);
  }

  const [result] = await pool.query(sql, params);
  return result;
}

async function updateRequestByAdmin(id, updates = {}) {
  const fields = [];
  const params = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    params.push(updates.status);
  }
  if (updates.scheduled_at !== undefined) {
    fields.push('scheduled_at = ?');
    params.push(updates.scheduled_at);
  }
  if (updates.negotiated_price !== undefined) {
    fields.push('negotiated_price = ?');
    params.push(updates.negotiated_price);
  }
  if (updates.provider_id !== undefined) {
    fields.push('provider_id = ?');
    params.push(updates.provider_id);
  }

  if (fields.length === 0) {
    throw new Error('No fields provided to update');
  }

  fields.push('updated_at = NOW()');
  const sql = `UPDATE service_requests SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  const [result] = await pool.query(sql, params);
  return result;
}

async function deleteServiceRequest(id) {
  const sql = 'DELETE FROM service_requests WHERE id = ?';
  const params = [id];
  const [result] = await pool.query(sql, params);
  return result;
}

async function getServiceRequestByRef(referenceId) {
  const sql = 'SELECT * FROM service_requests WHERE referenceId = ? LIMIT 1';
  const [rows] = await pool.query(sql, [referenceId]);
  return rows;
}

async function deleteServiceRequestById(id) {
  const sql = 'DELETE FROM service_requests WHERE id = ?';
  const [result] = await pool.query(sql, [id]);
  return result;
}

async function deleteServiceRequestByRef(referenceId) {
  const sql = 'DELETE FROM service_requests WHERE referenceId = ?';
  const [result] = await pool.query(sql, [referenceId]);
  return result;
}

async function getAllServiceRequests() {
  const [rows] = await pool.query('SELECT * FROM service_requests');
  return rows;
}

module.exports = {
  insertServiceRequestWithService,
  getAllServiceRequests,
  updateRequestByAdmin,
  deleteServiceRequest,
  getServiceRequestByRef,
  deleteServiceRequestById,
  deleteServiceRequestByRef,
  assignProvidersToRequest,
};

/*async function insertServiceRequest(data) {
  const sql = `INSERT INTO service_requests (name, email, phone, address, description) VALUES (?, ?, ?, ?, ?)`;
  const params = [data.name, data.email, data.phone, data.address, data.description];
  const [result] = await pool.query(sql, params);
  return result;
}
*/