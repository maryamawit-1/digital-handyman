const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  try {
    console.log('[auth] login attempt for username:', username);
    const [rows] = await pool.execute('SELECT id, username, password, role FROM admins WHERE username = ? LIMIT 1', [username]);
    console.log('[auth] query returned rows:', (rows || []).map(r => ({ id: r.id, username: r.username, role: r.role })));
    if (!rows || rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('[auth] password mismatch for user id:', user.id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES || '8h' });
    return res.json({ token, admin: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { login };
