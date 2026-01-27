const db = require('../config/db');

const Customer = {
    create: async (data) => {
        const [result] = await db.query('INSERT INTO customers SET ?', data);
        return result.insertId;
    },
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        return rows[0];
    }
};

module.exports = Customer;