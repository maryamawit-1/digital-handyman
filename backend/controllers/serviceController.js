// controllers/serviceController.js
const { getActiveServices, getServiceById } = require('../models/serviceModel');
const pool = require('../config/db');

/**
 * Public: Get all active services
 */
async function getServices(req, res) {
    try {
        const services = await getActiveServices();
        res.json(services);
    } catch (err) {
        console.error('[getServices]', err);
        res.status(500).json({ message: 'Failed to fetch services' });
    }
}

/**
 * Admin: create a new service
 */
async function createService(req, res) {
    try {
        const { name, pricing_model, unit_price, unit_label, is_active } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Service name is required' });
        }

        if (!pricing_model || !['FLAT', 'PER_SQM', 'PER_INCH'].includes(pricing_model.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid or missing pricing_model' });
        }

        const sql = `
            INSERT INTO services (name, pricing_model, unit_price, unit_label, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const params = [
            name.trim(),
            pricing_model.toUpperCase(),
            Number(unit_price) || 0,
            unit_label || '',
            typeof is_active !== 'undefined' ? Boolean(is_active) : true
        ];

        const [result] = await pool.query(sql, params);
        res.status(201).json({ message: 'Service created', serviceId: result.insertId });
    } catch (err) {
        console.error('[createService]', err);
        res.status(500).json({ message: 'Failed to create service' });
    }
}

/**
 * Admin: update existing service
 */
async function updateService(req, res) {
    try {
        const serviceId = req.params.id;
        const { name, pricing_model, unit_price, unit_label, is_active } = req.body;

        const fields = [];
        const params = [];

        if (name !== undefined) {
            if (name.trim() === '') return res.status(400).json({ message: 'Service name cannot be empty' });
            fields.push('name = ?');
            params.push(name.trim());
        }

        if (pricing_model !== undefined) {
            if (!['FLAT', 'PER_SQM', 'PER_INCH'].includes(pricing_model.toUpperCase())) {
                return res.status(400).json({ message: 'Invalid pricing_model' });
            }
            fields.push('pricing_model = ?');
            params.push(pricing_model.toUpperCase());
        }

        if (unit_price !== undefined) {
            const priceNum = Number(unit_price);
            if (isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({ message: 'unit_price must be a non-negative number' });
            }
            fields.push('unit_price = ?');
            params.push(priceNum);
        }

        if (unit_label !== undefined) {
            fields.push('unit_label = ?');
            params.push(unit_label);
        }

        if (is_active !== undefined) {
            fields.push('is_active = ?');
            params.push(Boolean(is_active));
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields provided to update' });
        }

        fields.push('updated_at = NOW()');
        const sql = `UPDATE services SET ${fields.join(', ')} WHERE id = ?`;
        params.push(serviceId);

        const [result] = await pool.query(sql, params);
        res.json({ message: 'Service updated', affectedRows: result.affectedRows });
    } catch (err) {
        console.error('[updateService]', err);
        res.status(500).json({ message: 'Failed to update service' });
    }
}

module.exports = {
    getServices,
    createService,
    updateService
};
