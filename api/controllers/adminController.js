const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const { sendApprovalEmail, sendJobAssignmentEmail } = require('../services/emailService'); 

// --- HELPER: Random Password Generator ---
function generateRandomPassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// 1. Admin Login (Requires Secure Hash in DB)
async function adminLogin(req, res) {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
        const admin = rows[0];

        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

        // Check if password is still plain text (OPTIONAL TEMPORARY RESET)
        // If you run this once with password123, it will hash and save it.
        if (admin.password === password) { 
             const newHash = await bcrypt.hash(password, 10);
             await db.query('UPDATE admins SET password = ? WHERE username = ?', [newHash, username]);
        }
        
        // FINAL SECURE HASH COMPARISON
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (isMatch) {
            const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
            return res.json({ token, admin: { username: admin.username, role: admin.role } });
        }
        
        res.status(401).json({ message: 'Invalid credentials' });
        
    } catch (err) {
        console.error("LOGIN CRASH:", err);
        res.status(500).json({ error: 'Server Error during login process.' });
    }
}

// 2. Dashboard Stats
async function getDashboardStats(req, res) {
    try {
        const [requests] = await db.query('SELECT COUNT(*) as count FROM service_requests');
        const [providers] = await db.query('SELECT COUNT(*) as count FROM service_providers');
        const [feedback] = await db.query('SELECT COUNT(*) as count FROM feedback');
        res.json({ summary: { totalRequests: requests[0].count, totalProviders: providers[0].count, totalFeedback: feedback[0].count } });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 3. Get All Requests (Admin View)
async function getAllRequests(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT sr.*, c.first_name, c.last_name, s.name as service_name 
            FROM service_requests sr
            JOIN customers c ON sr.customer_id = c.id
            LEFT JOIN services s ON sr.service_id = s.id
            ORDER BY sr.created_at DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 4. Update Request Status
async function updateRequest(req, res) {
    const { id } = req.params;
    const updates = req.body; 
    try {
        await db.query('UPDATE service_requests SET ? WHERE id = ?', [updates, id]);
        res.json({ message: "Request updated successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 5. Delete Request
async function deleteRequest(req, res) {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM service_requests WHERE id = ?', [id]);
        res.json({ message: "Request deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 6. Get Available Providers (With Skill Matching Logic)
// async function getAvailableProviders(req, res) {
//     const { serviceId } = req.query; 
//     let sql = 'SELECT id, first_name, last_name, skills, rating FROM service_providers WHERE is_available = 1';
//     let params = [];

//     try {
//         if (serviceId) {
//             const [serviceRow] = await db.query('SELECT name FROM services WHERE id = ?', [serviceId]);
//             const serviceName = serviceRow[0]?.name;

//             if (serviceName) {
//                 sql += ' AND LOWER(skills) LIKE ?';
//                 params.push(`%${serviceName.toLowerCase()}%`);
//             }
//         }
//         const [rows] = await db.query(sql, params);
//         res.json(rows);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// }
async function getAvailableProviders(req, res) {
  const { serviceId } = req.query; 
  let sql = 'SELECT id, first_name, last_name, skills, rating FROM service_providers WHERE is_available = 1';
  let params = [];

  try {
    if (serviceId) {
      const [serviceRow] = await db.query('SELECT name FROM services WHERE id = ?', [serviceId]);
      const serviceName = serviceRow[0]?.name;

      if (serviceName) {
        sql += ' AND LOWER(skills) LIKE ?';
        params.push(`%${serviceName.toLowerCase()}%`);
      }
    }

    const [rows] = await db.query(sql, params);

    const formatted = rows.map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      skills: p.skills,
      rating: p.rating
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ GET AVAILABLE PROVIDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}


// 7. Assign Provider (With Double-Booking Check + Email)
// Function 7: Assign Provider (FINAL VERSION with Time Window Overlap Check)
async function assignProvider(req, res) {
    const { requestId, providerId } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch Job and Provider details for the email AND conflict check
        // NOTE: We MUST fetch the time start/end columns.
        const [jobRows] = await connection.query(`
            SELECT sr.*, s.name as service_name, p.email as provider_email, p.first_name as provider_name, c.address as cust_address
            FROM service_requests sr
            JOIN services s ON sr.service_id = s.id
            JOIN service_providers p ON p.id = ?
            JOIN customers c ON sr.customer_id = c.id
            WHERE sr.id = ?`, [providerId, requestId]);
        
        const job = jobRows[0]; // This job holds the preferred_date, preferred_time_start, preferred_time_end

        // 2. --- OVERLAP CHECK (CRITICAL BUSINESS LOGIC) ---
        // Checks if ANY existing job for this provider overlaps with the new job's window.
        // Overlap Condition: (A.start < B.end) AND (A.end > B.start)
        const [conflict] = await connection.query(
            `SELECT id FROM service_requests 
             WHERE provider_id = ? 
               AND preferred_date = ? 
               AND status NOT IN ("CANCELLED", "COMPLETED")
               AND preferred_time_start < ?  /* New job ends after existing job starts */
               AND preferred_time_end > ?    /* New job starts before existing job ends */
             LIMIT 1`,
            [
                providerId, 
                job.preferred_date, 
                job.preferred_time_end,   
                job.preferred_time_start  
            ]
        );

        if (conflict.length > 0) {
            connection.release();
            return res.status(400).json({ message: "Assignment failed: Provider is already booked at that time." });
        }

        // 3. Update DB Status
        await connection.query('UPDATE service_requests SET status = "ASSIGNED", provider_id = ? WHERE id = ?', [providerId, requestId]);
        await connection.commit();

        // 4. Send Email Notification
        sendJobAssignmentEmail(job.provider_email, job.provider_name, job.referenceId, job.service_name, job.preferred_date, job.preferred_time_start, job.cust_address);

        res.json({ message: "Provider assigned and notified!" });
    } catch (err) {
        await connection.rollback();
        // Log the exact SQL error if it still crashes
        console.error("ASSIGNMENT CRASH:", err);
        res.status(500).json({ error: "Assignment failed: Server error or missing data." });
    } finally { 
        connection.release(); 
    }
}

// 8. Add Service
async function addService(req, res) {
    try {
        const [result] = await db.query('INSERT INTO services SET ?', req.body);
        res.json({ message: "Service added", id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 9. Update Service
async function updateService(req, res) {
    try {
        await db.query('UPDATE services SET ? WHERE id = ?', [req.body, req.params.id]);
        res.json({ message: "Service updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 10. Delete Service
async function deleteService(req, res) {
    try {
        const [usage] = await db.query('SELECT COUNT(*) as count FROM service_requests WHERE service_id = ?', [req.params.id]);
        if (usage[0].count > 0) return res.status(400).json({ message: "Cannot delete: This service has bookings. Deactivate it instead." });
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ message: "Service deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 11. Reports
async function getSystemReports(req, res) {
    try {
        const [serviceStats] = await db.query(`
            SELECT s.name as service_name, COUNT(sr.id) as total_bookings,
            SUM(CASE WHEN sr.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_jobs,
            SUM(CASE WHEN sr.status = 'COMPLETED' THEN s.unit_price ELSE 0 END) as estimated_revenue
            FROM services s LEFT JOIN service_requests sr ON s.id = sr.service_id GROUP BY s.id`);
        const [totals] = await db.query(`SELECT COUNT(*) as total_requests, SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as total_completed FROM service_requests`);
        res.json({ serviceStats, overall: totals[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 12. Get Applications
async function getProviderApplications(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM provider_applications ORDER BY applied_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
}

// 13. Approve Application & Send Email (Secure Hashing)
async function approveApplication(req, res) {
    const { id } = req.params;
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const [apps] = await connection.query('SELECT * FROM provider_applications WHERE id = ?', [id]);
        if (apps.length === 0) { connection.release(); return res.status(404).json({ message: "Not found" }); }
        const app = apps[0];

        const [existing] = await connection.query('SELECT id FROM service_providers WHERE email = ?', [app.email]);
        
        if (existing.length === 0) {
            const tempPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            await connection.query(
                `INSERT INTO service_providers (first_name, last_name, email, password, phone, skills, is_available, rating) 
                 VALUES (?, ?, ?, ?, ?, ?, 1, 5.0)`, 
                [app.first_name, app.last_name, app.email, hashedPassword, app.phone, app.skills]
            );

            await connection.query('UPDATE provider_applications SET status = "APPROVED" WHERE id = ?', [id]);
            await connection.commit();

            sendApprovalEmail(app.email, app.first_name, tempPassword);
            res.json({ message: "Application approved and credentials sent!" });
        } else {
            // Provider already exists, just update application status
            await connection.query('UPDATE provider_applications SET status = "APPROVED" WHERE id = ?', [id]);
            await connection.commit();
            res.json({ message: "Provider account already existed. Application marked approved." });
        }

    } catch (err) {
        await connection.rollback();
        console.error("APPROVE ERROR:", err); 
        res.status(500).json({ error: "Server error during approval." });
    } finally {
        connection.release();
    }
}

// 14. Delete Provider
async function deleteProvider(req, res) {
    try {
        await db.query('DELETE FROM service_providers WHERE id = ?', [req.params.id]);
        res.json({ message: "Provider removed" });
    } catch (err) { res.status(500).json({ error: "Cannot delete provider linked to records." }); }
}

async function adminCreateProvider(req, res) {
    const data = req.body;
    try {
        // Validation check
        if (!data.email || !data.password || !data.first_name) {
            return res.status(400).json({ message: "Name, Email, and Password are required." });
        }
        
        // Hash the input password
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const [result] = await db.query(
            `INSERT INTO service_providers (first_name, last_name, email, password, phone, skills, is_available) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [data.first_name, data.last_name || '', data.email, hashedPassword, data.phone || '', data.skills || '']
        );
        res.status(201).json({ message: "Provider created successfully.", id: result.insertId });
    } catch (err) {
        // Catch duplicate email error (ER_DUP_ENTRY)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "A provider with this email already exists." });
        }
        res.status(500).json({ error: err.message });
    }
}

module.exports = { 
    adminLogin, getDashboardStats, getAllRequests, updateRequest, deleteRequest,
    getAvailableProviders, assignProvider, addService, updateService, deleteService, 
    getSystemReports, getProviderApplications, approveApplication, deleteProvider
, adminCreateProvider };