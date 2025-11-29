// backend/src/controllers/authController.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const USERS_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]'); } catch (e) { return []; }
}
function writeUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8'); }

/** POST /api/auth/register  (create user)  */
async function register(req, res, next) {
  try {
    const { username, password, role, name, center_id } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const users = readUsers();
    if (users.find(u => u.username === username)) return res.status(409).json({ error: 'user_exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: `user_${Date.now()}`, username, passwordHash: hash, role: role || 'centerHead', name: name || username, center_id: center_id || null, created_at: new Date().toISOString() };
    users.push(user);
    writeUsers(users);
    return res.status(201).json({ ok: true, user: { id: user.id, username: user.username, role: user.role, center_id: user.center_id }});
  } catch (e) { next(e); }
}

/** POST /api/auth/login  -> returns { token, user } */
async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    // sign token
    const payload = { sub: user.id, username: user.username, role: user.role, center_id: user.center_id, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET || config.JWT_SECRET || 'dev_jwt_secret', { expiresIn: '12h' });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role, center_id: user.center_id, name: user.name } });
  } catch (e) { next(e); }
}

module.exports = { register, login };
