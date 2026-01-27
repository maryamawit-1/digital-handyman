const db = require('../config/db');
const bcrypt = require('bcryptjs');

const ProviderApplication = {
    insertApplication: async (data) => {
        return db.query('INSERT INTO provider_applications SET ?', data);
    },

    getAllApplications: async () => {
        const [rows] = await db.query('SELECT * FROM provider_applications');
        return rows;
    },

    transferAppToProvider: async (id) => {
        const [apps] = await db.query('SELECT * FROM provider_applications WHERE id = ?', [id]);
        if (apps.length === 0) throw new Error('Application not found');
        
        const app = apps[0];
        const defaultPassword = 'ChangeMe123!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insert into service_providers
        const [insertResult] = await db.query(
            'INSERT INTO service_providers (first_name, last_name, email, password, phone, skills) VALUES (?, ?, ?, ?, ?, ?)',
            [app.first_name, app.last_name, app.email, hashedPassword, app.phone, app.skills]
        );

        // Update application status
        const [updateResult] = await db.query('UPDATE provider_applications SET status = "APPROVED" WHERE id = ?', [id]);
        
        return { insertResult, updateResult, defaultPassword };
    }
};

module.exports = ProviderApplication;