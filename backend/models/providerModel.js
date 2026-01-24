const pool = require('../config/db');

async function insertProviderApplication(data) {
  const sql = `INSERT INTO provider_applications (name, email, phone, skills, experience) VALUES (?, ?, ?, ?, ?)`;
  const params = [data.name, data.email, data.phone, data.skills, data.experience];
  const [result] = await pool.query(sql, params);
  return result;
}

async function getAllProviderApplications() {
  const [rows] = await pool.query('SELECT * FROM provider_applications');
  return rows;
}

async function insertApplication(data) {
  const sql = `
    INSERT INTO provider_applications
    (first_name, last_name, email, phone, experience_details, skills)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.first_name || data.firstName || null,
    data.last_name || data.lastName || null,
    data.email || null,
    data.phone || null,
    data.experience_details || data.experienceDetails || data.experience || null,
    data.skills || null,
  ];
  const [result] = await pool.query(sql, params);
  return result;
}

async function getAllApplications() {
  const sql = `SELECT * FROM provider_applications ORDER BY applied_at DESC`;
  const [rows] = await pool.query(sql);
  return rows;
}

async function getApplicationById(id) {
  const sql = `SELECT * FROM provider_applications WHERE id = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [id]);
  return rows;
}

async function updateApplication(id, updates = {}) {
  const allowed = ['status', 'experience_details', 'skills', 'phone', 'first_name', 'last_name', 'email'];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    throw new Error('No updatable fields provided');
  }

  fields.push('updated_at = NOW()');
  const sql = `UPDATE provider_applications SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);
  const [result] = await pool.query(sql, params);
  return result;
}

async function approveAndTransferProvider(applicationId) {
  // Fetch application details
  const [rows] = await pool.query(
    'SELECT first_name, last_name, email, phone, skills FROM provider_applications WHERE id = ? LIMIT 1',
    [applicationId]
  );

  if (!rows || rows.length === 0) {
    return { affectedRows: 0, message: 'Application not found' };
  }

  const app = rows[0];

  // Insert into service_providers
  const insertSql = `INSERT INTO service_providers (first_name, last_name, email, phone, skills) VALUES (?, ?, ?, ?, ?)`;
  const insertParams = [app.first_name, app.last_name, app.email, app.phone, app.skills];
  const [insertResult] = await pool.query(insertSql, insertParams);

  // Update application status to APPROVED
  const updateSql = `UPDATE provider_applications SET status = 'APPROVED', updated_at = NOW() WHERE id = ?`;
  const [updateResult] = await pool.query(updateSql, [applicationId]);

  return { insertResult, updateResult };
}

async function transferAppToProvider(appId) {
  const bcrypt = require('bcryptjs');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT first_name, last_name, email, phone, skills FROM provider_applications WHERE id = ? LIMIT 1 FOR UPDATE',
      [appId]
    );

    if (!rows || rows.length === 0) {
      await conn.rollback();
      conn.release();
      return { affectedRows: 0, message: 'Application not found' };
    }

    const app = rows[0];

    // Prevent duplicate provider by email
    const [existing] = await conn.query('SELECT id FROM service_providers WHERE email = ? LIMIT 1', [app.email]);
    if (existing && existing.length > 0) {
      await conn.rollback();
      conn.release();
      return { affectedRows: 0, message: 'Provider with this email already exists' };
    }

    const defaultPassword = 'ChangeMe123!';
    const hashed = await bcrypt.hash(defaultPassword, 10);

    const insertSql = `
      INSERT INTO service_providers (first_name, last_name, email, phone, skills, password, is_available, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const insertParams = [app.first_name, app.last_name, app.email, app.phone, app.skills, hashed, 1, 5.0];
    const [insertResult] = await conn.query(insertSql, insertParams);

    const updateSql = `UPDATE provider_applications SET status = 'APPROVED', updated_at = NOW() WHERE id = ?`;
    const [updateResult] = await conn.query(updateSql, [appId]);

    await conn.commit();
    conn.release();

    return { insertResult, updateResult, defaultPassword };
  } catch (err) {
    try { await conn.rollback(); } catch (e) {}
    conn.release();
    throw err;
  }
}

async function searchApplicationsBySkill(skillKeyword) {
  const sql = `SELECT * FROM provider_applications WHERE skills LIKE ? ORDER BY applied_at DESC`;
  const pattern = `%${skillKeyword}%`;
  const [rows] = await pool.query(sql, [pattern]);
  return rows;
}

module.exports = {
  insertProviderApplication,
  getAllProviderApplications,
  insertApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  approveAndTransferProvider,
  transferAppToProvider,
  searchApplicationsBySkill,
};
