const ProviderModel = require('../models/providerModel');
const pool = require('../config/db');
const ServiceProviderModel = require('../models/serviceProviderModel');
const bcrypt = require('bcryptjs');

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

async function submitProviderApplication(req, res) {
  try {
    const { email, phone, experience_details, skills, first_name, last_name } = req.body || {};

    if (!email || !phone || !experience_details || !skills) {
      return res.status(400).json({ message: 'email, phone, experience_details and skills are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const data = {
      first_name: first_name || req.body.firstName || null,
      last_name: last_name || req.body.lastName || null,
      email,
      phone,
      experience_details,
      skills,
      status: 'PENDING',
    };

    const result = await ProviderModel.insertApplication(data);
    return res.status(201).json({ message: 'Provider application submitted', id: result.insertId });
  } catch (err) {
    console.error('submitProviderApplication error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function adminUpdateApplication(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Application id is required' });

    const { status, first_name, last_name, email, phone, experience_details, skills } = req.body || {};

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (email !== undefined) {
      if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
      updates.email = email;
    }
    if (phone !== undefined) updates.phone = phone;
    if (experience_details !== undefined) updates.experience_details = experience_details;
    if (skills !== undefined) updates.skills = skills;

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No update fields provided' });

    const result = await ProviderModel.updateApplication(id, updates);
    let message = 'Application updated';

    // If admin approved, transfer application to service_providers
    if (status === 'APPROVED') {
      try {
        const transfer = await ProviderModel.transferAppToProvider(id);
        if (transfer && transfer.message) {
          // e.g., application not found or duplicate
          return res.status(400).json({ message: transfer.message, result });
        }

        // success
        message = 'Provider approved and moved to active service providers list';
        return res.json({ message, result, transfer });
      } catch (err) {
        console.error('transferAppToProvider error', err);
        return res.status(500).json({ message: 'Error transferring provider' });
      }
    }

    return res.json({ message, result });
  } catch (err) {
    console.error('adminUpdateApplication error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getAllApplicationsAdmin(req, res) {
  try {
    const rows = await ProviderModel.getAllApplications();
    return res.json(rows);
  } catch (err) {
    console.error('getAllApplicationsAdmin error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getApplicationByIdAdmin(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Application id is required' });

    const rows = await ProviderModel.getApplicationById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Application not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('getApplicationByIdAdmin error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function approveApplication(req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Application id is required' });

    // Ensure application exists
    const rows = await ProviderModel.getApplicationById(id);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Application not found' });

    const app = rows[0];
    const email = app.email;

    // Check if provider with this email already exists
    const [existing] = await pool.query('SELECT id FROM service_providers WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ message: 'A provider with this email already exists' });
    }

    // Transfer and approve
    const result = await ProviderModel.approveAndTransferProvider(id);
    return res.json({ message: 'Application approved and provider transferred', result });
  } catch (err) {
    console.error('approveApplication error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function adminSearchApplications(req, res) {
  try {
    const skill = req.query.skill;
    console.log('Admin searching applications for skill:', skill);

    let rows;
    if (!skill) {
      // no skill provided — return all applications
      rows = await ProviderModel.getAllApplications();
    } else {
      rows = await ProviderModel.searchApplicationsBySkill(skill);
    }

    return res.json(rows);
  } catch (err) {
    console.error('adminSearchApplications error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function adminCreateProvider(req, res) {
  try {
    const { first_name, last_name, email, password, phone, skills, is_available, rating } = req.body || {};

    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email format' });

    const hashed = await bcrypt.hash(password, 10);

    const data = {
      first_name: first_name || req.body.firstName || null,
      last_name: last_name || req.body.lastName || null,
      email,
      password: hashed,
      phone: phone || null,
      skills: skills || null,
      is_available: typeof is_available !== 'undefined' ? is_available : 1,
      rating: typeof rating !== 'undefined' ? rating : 5.0,
    };

    const result = await ServiceProviderModel.createProvider(data);
    return res.status(201).json({ message: 'Provider created', id: result.insertId });
  } catch (err) {
    console.error('adminCreateProvider error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function adminGetAllProviders(req, res) {
  try {
    const rows = await ServiceProviderModel.getAllProviders();
    return res.json(rows);
  } catch (err) {
    console.error('adminGetAllProviders error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function adminSearchProviders(req, res) {
  try {
    const skill = req.query.skill;
    console.log('Admin searching providers for skill:', skill);
    if (!skill) {
      return res.status(400).json({ message: 'skill query parameter is required' });
    }
    const rows = await ServiceProviderModel.searchProvidersBySkill(skill);
    return res.json(rows);
  } catch (err) {
    console.error('adminSearchProviders error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  submitProviderApplication,
  adminUpdateApplication,
  getAllApplicationsAdmin,
  getApplicationByIdAdmin,
  approveApplication,
  adminSearchApplications,
  adminCreateProvider,
  adminGetAllProviders,
  adminSearchProviders,
};
