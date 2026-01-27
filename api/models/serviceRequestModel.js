const db = require('../config/db');

class ServiceRequest {
    constructor(data) {
        this.id = data.id;
        this.customer_id = data.customer_id;
        this.service_id = data.service_id;
        this.service = data.service; // Instance of ServiceType
        // this.service_quantity = data.service_quantity || 1;
        this.description = data.description;
        this.preferred_date = data.preferred_date;
        this.preferred_time_start = data.preferred_time_start;
        this.preferred_time_end = data.preferred_time_end;
        this.referenceId = data.referenceId;
        this.estimated_cost = data.estimated_cost;
        this.status = data.status || 'PENDING';
        
    }

    generateReferenceId() {
        this.referenceId = 'SR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    calculateEstimatedCost() {
        if (this.service) {
            this.estimated_cost = this.service.calculateCost(this.service_quantity);
        }
    }

    // Database Methods used by Controller
    static async insertServiceRequestWithService(request) {
        const [result] = await db.query(
            `INSERT INTO service_requests 
            (referenceId, customer_id, service_id, description, service_quantity, estimated_cost, preferred_date, preferred_time_start, preferred_time_end, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                request.referenceId,
                request.customer_id,
                request.service_id,
                request.description,
                request.service_quantity,
                request.estimated_cost,
                request.preferred_date,
                request.preferred_time_start,
                request.preferred_time_end
            ]
        );
        return result;
    }


    static async getAllServiceRequests() {
        const [rows] = await db.query(`
            SELECT sr.*, c.first_name, c.last_name, s.name as service_name 
            FROM service_requests sr
            JOIN customers c ON sr.customer_id = c.id
            LEFT JOIN services s ON sr.service_id = s.id
        `);
        return rows;
    }

    static async getServiceById(id) {
        return db.query('SELECT * FROM services WHERE id = ?', [id]);
    }
}

module.exports = ServiceRequest;