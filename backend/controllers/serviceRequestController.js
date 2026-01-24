const ServiceType = require('../models/domain/ServiceType');
const ServiceRequest = require('../models/domain/ServiceRequest');
const ServiceModel = require('../models/serviceRequestModel');
const serviceModel = require('../models/serviceModel');
const pool = require('../config/db');

async function submitServiceRequest(req, res) {
  try {
    // Prefer validated input from middleware, fall back to request body
    const validated = req.validatedServiceRequest || {};
    const name = validated.name ?? req.body.name;
    const email = validated.email ?? req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    const description = req.body.description ?? '';
    const preferredDate = validated.preferred_date ?? req.body.preferred_date ?? req.body.preferredDate ?? null;
    const preferredTime = validated.preferred_time ?? req.body.preferred_time ?? req.body.preferredTime ?? null;
    const service_id = validated.service_id ?? req.body.service_id;
    const quantity = validated.quantity ?? Number(req.body.quantity ?? req.body.service_quantity ?? req.body.serviceQuantity ?? 1);

    // fetch service details via serviceModel
    const rows = await serviceModel.getServiceById(service_id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Service not found' });

    const svc = rows[0];
    if (!svc.is_active) return res.status(400).json({ message: 'Selected service is not active' });
    const serviceType = new ServiceType({
      id: svc.id,
      name: svc.name,
      pricing_model: svc.pricing_model,
      unit_price: svc.unit_price,
      unit_label: svc.unit_label,
      is_active: svc.is_active,
    });

    // build domain ServiceRequest
    const serviceRequest = new ServiceRequest({
      name,
      email,
      phone,
      address,
      description,
      preferredDate,
      preferredTime,
      service: serviceType,
      serviceId: svc.id,
      serviceQuantity: quantity,
      status: 'PENDING',
    });

    // generate reference and estimate
    serviceRequest.generateReferenceId();
    serviceRequest.calculateEstimatedCost();

    // save via model helper that includes service fields
    const result = await ServiceModel.insertServiceRequestWithService(serviceRequest);

    res.status(201).json({ message: 'Service request submitted', referenceId: serviceRequest.referenceId, id: result.insertId });
  } catch (err) {
    console.error('submitServiceRequest error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function estimateCost(req, res) {
   console.log("--- Estimate Cost Check ---");
  console.log("Request Body:", req.body)
  try {
    const { service_id, quantity = 1 } = req.body;
    if (!service_id) return res.status(400).json({ message: 'service_id is required' });

    const rows = await serviceModel.getServiceById(service_id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Service not found' });

    const svc = rows[0];
    const serviceType = new ServiceType({
      id: svc.id,
      name: svc.name,
      pricing_model: svc.pricing_model,
      unit_price: svc.unit_price,
      unit_label: svc.unit_label,
      is_active: svc.is_active,
    });

    const estimated = serviceType.calculateCost(quantity);
    res.json({ estimated_cost: estimated });
  } catch (err) {
    console.error('estimateCost error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getAllServiceRequestsAdmin(req, res) {
  try {
    const sql = `
      SELECT sr.id, sr.referenceId, sr.customer_id, sr.provider_id, sr.service_id, sr.service_type, sr.description,
             sr.status, sr.scheduled_at, sr.created_at, sr.updated_at, sr.service_quantity, sr.estimated_cost,
             s.name AS service_name, s.pricing_model AS service_pricing_model, s.unit_price AS service_unit_price, s.unit_label AS service_unit_label,
             c.first_name AS customer_first_name, c.last_name AS customer_last_name, c.email AS customer_email,
             p.first_name AS provider_first_name, p.last_name AS provider_last_name, p.email AS provider_email
      FROM service_requests sr
      LEFT JOIN services s ON sr.service_id = s.id
      LEFT JOIN customers c ON sr.customer_id = c.id
      LEFT JOIN service_providers p ON sr.provider_id = p.id
      ORDER BY sr.created_at DESC
    `;

    const [rows] = await pool.query(sql);
    return res.json(rows);
  } catch (err) {
    console.error('getAllServiceRequestsAdmin error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function adminUpdateServiceRequest(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Request id is required' });

    const { status, scheduled_at, negotiated_price, provider_id } = req.body || {};

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;
    if (negotiated_price !== undefined) updates.negotiated_price = negotiated_price;
    if (provider_id !== undefined) updates.provider_id = provider_id;

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No update fields provided' });

    const result = await ServiceModel.updateRequestByAdmin(id, updates);
    return res.json({ message: 'Service request updated', result });
  } catch (err) {
    console.error('adminUpdateServiceRequest error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteRequestAdmin(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Request id is required' });

    const result = await ServiceModel.deleteServiceRequest(id);
    // MySQL returns affectedRows
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    return res.json({ message: 'Service request deleted' });
  } catch (err) {
    console.error('deleteRequestAdmin error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function searchRequestByRef(req, res) {
  try {
    const referenceId = req.params.referenceId || req.params.ref || req.params.id;
    if (!referenceId) return res.status(400).json({ message: 'referenceId is required' });

    const rows = await ServiceModel.getServiceRequestByRef(referenceId);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    return res.json(rows[0]);
  } catch (err) {
    console.error('searchRequestByRef error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteRequest(req, res) {
  try {
    const identifier = req.params.id || req.params.referenceId || req.params.ref;
    if (!identifier) return res.status(400).json({ message: 'Identifier is required' });

    // numeric id
    if (/^\d+$/.test(String(identifier))) {
      const result = await ServiceModel.deleteServiceRequestById(Number(identifier));
      if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Service request not found' });
      return res.json({ message: 'Service request deleted' });
    }

    // reference id starting with SR-
    if (typeof identifier === 'string' && identifier.startsWith('SR-')) {
      const result = await ServiceModel.deleteServiceRequestByRef(identifier);
      if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Service request not found' });
      return res.json({ message: 'Service request deleted' });
    }

    return res.status(400).json({ message: 'Invalid identifier format' });
  } catch (err) {
    console.error('deleteRequest error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  submitServiceRequest,
  estimateCost,
  getAllServiceRequestsAdmin,
  adminUpdateServiceRequest,
  deleteRequestAdmin,
  searchRequestByRef,
  deleteRequest,
};
