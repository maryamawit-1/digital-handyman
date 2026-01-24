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

module.exports = { insertProviderApplication, getAllProviderApplications };
