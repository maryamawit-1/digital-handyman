const ServiceRequest = require('../models/serviceRequestModel');
const ServiceType = require('../models/serviceTypeModel');
const db = require('../config/db'); 
const { sendBookingConfirmation, sendLostIdsEmail } = require('../services/emailService');

const pool = ServiceRequest; 

/**
 * 1. Public: Submit a new service request (Handles Customer Creation & Double Submission)
 */
async function submitServiceRequest(req, res) {
    try {
        const data = req.validatedServiceRequest || req.body;

        // --- DOUBLE SUBMISSION CHECK ---
        const [duplicateCheck] = await db.query(`
            SELECT id FROM service_requests 
            WHERE customer_id = (SELECT id FROM customers WHERE email = ?) 
            AND service_id = ? 
            AND created_at > NOW() - INTERVAL 1 MINUTE
        `, [data.email, data.service_id]);

        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: "We already received a booking from you. Please wait a moment." });
        }
        
        // --- CREATE/FIND CUSTOMER ---
        let customerId;
        const [existingCustomer] = await db.query('SELECT id FROM customers WHERE email = ?', [data.email]);
        
        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
        } else {
            // CRITICAL FIX: Add last_name to the query, using an empty string if not provided
            const [newCust] = await db.query(
                'INSERT INTO customers (first_name, last_name, email, phone, address, password) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    data.name, 
                    data.last_name || '', // <-- PASS EMPTY STRING HERE
                    data.email, 
                    data.phone, 
                    data.address, 
                    'NO_LOGIN'
                ]
            );
            customerId = newCust.insertId;
        }

        // --- PREPARE REQUEST ---
        const serviceInstance = new ServiceType({ id: data.service_id, name: data.service_name, unit_price: data.unit_price || 0 });
        const request = new ServiceRequest({ ...data, customer_id: customerId, service: serviceInstance,  preferred_time_start: data.preferred_time_start,  // NEW
    preferred_time_end: data.preferred_time_end   });

        request.generateReferenceId();
        request.calculateEstimatedCost();

        // --- INSERT & EMAIL ---
        await ServiceRequest.insertServiceRequestWithService(request);
        
        try {
            await sendBookingConfirmation(data.email, data.name, request.referenceId, data.service_name);
        } catch (e) { console.error("Email failed but DB saved:", e.message); }

        res.status(201).json({
            message: 'Service request submitted successfully',
            referenceId: request.referenceId
        });

    } catch (err) {
        console.error('❌ [submitServiceRequest] Error:', err);
        res.status(500).json({ message: 'Failed to submit service request', error: err.message });
    }
}


/**
 * 2. Public: Track Request Status 
 */
async function trackRequestPublic(req, res) {
    const { refId } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT sr.referenceId, sr.status, sr.scheduled_at, sr.estimated_cost,
                   s.name as service_name, 
                   sp.first_name as provider_name 
            FROM service_requests sr
            JOIN services s ON sr.service_id = s.id
            LEFT JOIN service_providers sp ON sr.provider_id = sp.id
            WHERE sr.referenceId = ?
        `, [refId]); 
        
        if (rows.length === 0) return res.status(404).json({ message: "Request not found" });

        res.json(rows[0]);
    } catch (err) {
        console.error('❌ [trackRequestPublic] CRASH:', err);
        res.status(500).json({ message: 'Failed to retrieve tracking data.' });
    }
}


/**
 * 3. Public: Resend Reference IDs 
 */
async function resendReferenceIds(req, res) {
    const { email } = req.body;
    try {
        const [rows] = await db.query(`
            SELECT sr.referenceId, c.first_name 
            FROM service_requests sr
            JOIN customers c ON sr.customer_id = c.id
            WHERE c.email = ?
        `, [email]);

        if (rows.length === 0) return res.status(404).json({ message: "No bookings found for this email." });

        const ids = rows.map(r => r.referenceId);
        const name = rows[0].first_name;

        await sendLostIdsEmail(email, name, ids);
        
        res.json({ message: "Check your email for your reference IDs!" });
    } catch (err) {
        console.error('❌ [resendReferenceIds] Error:', err);
        res.status(500).json({ error: "Failed to process recovery request" });
    }
}

// NOTE: These admin functions are required by the route file but are usually simple placeholders
async function estimateCost(req, res) {
    res.status(501).json({ message: "Cost estimation is temporarily unavailable." });
}

async function getAllServiceRequestsAdmin(req, res) {
    // NOTE: This assumes ServiceRequestModel has getAllServiceRequests
    const requests = await ServiceRequest.getAllServiceRequests(); 
    res.json(requests);
}

module.exports = {
    submitServiceRequest,
    trackRequestPublic,
    resendReferenceIds,
    estimateCost, 
    getAllServiceRequestsAdmin, 
};