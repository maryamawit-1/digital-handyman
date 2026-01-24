const pool = require('../config/db');

async function getServiceById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, pricing_model, unit_price, unit_label, is_active FROM services WHERE id = ?',
    [id]
  );
  return rows;
}

async function getActiveServices() {
  const [rows] = await pool.query(
    'SELECT id, name, pricing_model, unit_price, unit_label, is_active FROM services WHERE is_active = 1'
  );
  return rows;
}

module.exports = { getServiceById, getActiveServices };
