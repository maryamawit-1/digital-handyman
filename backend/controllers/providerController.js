const ProviderModel = require('../models/providerModel');

async function submitProviderApplication(req, res) {
  try {
    const result = await ProviderModel.insertProviderApplication(req.body);
    res.status(201).json({ message: 'Provider application submitted', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { submitProviderApplication };
