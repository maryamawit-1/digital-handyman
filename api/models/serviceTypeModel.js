const db = require('../config/db');

class ServiceType {
    constructor(data) {
        this.id = data.id || data.service_id;
        this.name = data.name || data.service_name;
        this.unit_price = data.unit_price || 0;
        this.pricing_model = data.pricing_model || 'FLAT';
    }

    calculateCost(qty) {
        return (this.unit_price * (qty || 1));
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM services WHERE is_active = true');
        return rows;
    }
}

module.exports = ServiceType;