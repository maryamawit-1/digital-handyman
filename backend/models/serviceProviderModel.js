const pool = require('../config/db');

async function findBestProviderForService(keywords) {
  if (!keywords || keywords.length === 0) return null;

  // 1. Build dynamic SQL for multiple keywords
  // Example result: (skills LIKE ? OR skills LIKE ? OR skills LIKE ?)
  const filterConditions = keywords.map(() => 'skills LIKE ?').join(' OR ');

  const sql = `
    SELECT id, first_name, last_name, rating 
    FROM service_providers 
    WHERE is_available = 1 
    AND (${filterConditions}) 
    ORDER BY rating DESC 
    LIMIT 1
  `;

  // 2. Prepare parameters by adding wildcards % to each keyword
  const params = keywords.map(kw => `%${kw}%`);

  const [rows] = await pool.query(sql, params);
  
  return rows[0] || null; 
}

async function findTopProvidersForService(keywords, limit = 2) {
  if (!keywords || keywords.length === 0) return [];

  const filterConditions = keywords.map(() => 'skills LIKE ?').join(' OR ');
  const sql = `
    SELECT id, first_name, last_name, rating 
    FROM service_providers 
    WHERE is_available = 1 
    AND (${filterConditions}) 
    ORDER BY rating DESC 
    LIMIT ?
  `;
  const params = keywords.map(kw => `%${kw}%`);
  params.push(limit);
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function createProvider(data) {
  const sql = `
    INSERT INTO service_providers
    (first_name, last_name, email, password, phone, skills, is_available, rating, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const params = [
    data.first_name || data.firstName || null,
    data.last_name || data.lastName || null,
    data.email || null,
    data.password || null,
    data.phone || null,
    data.skills || null,
    typeof data.is_available !== 'undefined' ? data.is_available : 1,
    typeof data.rating !== 'undefined' ? data.rating : 5.0,
  ];
  const [result] = await pool.query(sql, params);
  return result;
}

async function getAllProviders() {
  const sql = `SELECT * FROM service_providers ORDER BY created_at DESC`;
  const [rows] = await pool.query(sql);
  return rows;
}

async function searchProvidersBySkill(keyword) {
  const pattern = `%${String(keyword || '').toLowerCase()}%`;
  const sql = `SELECT * FROM service_providers WHERE LOWER(skills) LIKE ? ORDER BY created_at DESC`;
  const [rows] = await pool.query(sql, [pattern]);
  return rows;
}

module.exports = { findBestProviderForService, findTopProvidersForService, createProvider, getAllProviders, searchProvidersBySkill };