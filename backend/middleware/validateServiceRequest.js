const pool = require('../config/db');

async function validateServiceRequest(req, res, next) {
  try {
    const { name, email, service_id } = req.body;
    const qtyInput = req.body.quantity ?? req.body.service_quantity ?? req.body.serviceQuantity;

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ message: 'name is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (!service_id) {
      return res.status(400).json({ message: 'service_id is required' });
    }

    const quantity = Number(qtyInput ?? 0);
    if (Number.isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'quantity must be a number greater than 0' });
    }

    // verify service exists
    const [rows] = await pool.query('SELECT id FROM services WHERE id = ?', [service_id]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'service_id not found' });
    }

    // attach normalized values for downstream handlers
    req.validatedServiceRequest = {
      name: String(name).trim(),
      email: String(email).trim(),
      service_id: rows[0].id,
      quantity,
    };

    next();
  } catch (err) {
    console.error('validateServiceRequest error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = validateServiceRequest;
