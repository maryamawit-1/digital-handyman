const pool = require('../config/db');

async function getServices(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name, pricing_model, unit_price, unit_label, is_active FROM services WHERE is_active = 1');
    res.json(rows);
  } catch (err) {
    console.error('getServices error', err);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
}

async function createService(req, res) {
  try {
    const { name, pricing_model, unit_price, unit_label, is_active = true } = req.body;
    if (!name || !pricing_model) return res.status(400).json({ message: 'Missing required fields' });

    const ALLOWED_MODELS = ['PER_SQM', 'PER_INCH', 'FLAT'];
    if (!ALLOWED_MODELS.includes(String(pricing_model).toUpperCase())) {
      return res.status(400).json({ message: `pricing_model must be one of: ${ALLOWED_MODELS.join(', ')}` });
    }

    if (unit_price !== undefined && unit_price !== null && String(unit_price).trim() !== '') {
      const np = Number(unit_price);
      if (Number.isNaN(np)) return res.status(400).json({ message: 'unit_price must be a numeric value' });
    }

    const sql = `INSERT INTO services (name, pricing_model, unit_price, unit_label, is_active) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, pricing_model, unit_price || 0, unit_label || null, is_active ? 1 : 0];
    const [result] = await pool.query(sql, params);
    const inserted = { id: result.insertId, name, pricing_model, unit_price, unit_label, is_active };
    res.status(201).json(inserted);
  } catch (err) {
    console.error('createService error', err);
    res.status(500).json({ message: 'Failed to create service' });
  }
}

async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, pricing_model, unit_price, unit_label, is_active } = req.body;
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (pricing_model !== undefined) {
      const ALLOWED_MODELS = ['PER_SQM', 'PER_INCH', 'FLAT'];
      if (!ALLOWED_MODELS.includes(String(pricing_model).toUpperCase())) {
        return res.status(400).json({ message: `pricing_model must be one of: ${ALLOWED_MODELS.join(', ')}` });
      }
      fields.push('pricing_model = ?'); params.push(pricing_model);
    }
    if (unit_price !== undefined) {
      const np = Number(unit_price);
      if (Number.isNaN(np)) return res.status(400).json({ message: 'unit_price must be a numeric value' });
      fields.push('unit_price = ?'); params.push(unit_price);
    }
    if (unit_label !== undefined) { fields.push('unit_label = ?'); params.push(unit_label); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

    const sql = `UPDATE services SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Service not found' });

    res.json({ id: Number(id), updated: true });
  } catch (err) {
    console.error('updateService error', err);
    res.status(500).json({ message: 'Failed to update service' });
  }
}

module.exports = { getServices, createService, updateService };
