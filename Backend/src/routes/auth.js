const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// load roster once (prototype)
const rosterPath = path.join(__dirname, '..', '..', 'db', 'seed', 'volunteer_roster.json');
let roster = [];
try {
  const raw = fs.readFileSync(rosterPath, 'utf8');
  roster = JSON.parse(raw);
} catch (err) {
  console.warn('Could not load volunteer_roster.json:', err.message);
}

// helper to find volunteer
function findVolunteer(volunteer_id) {
  return roster.find(v => v.volunteer_id === volunteer_id);
}

// POST /auth/login
router.post('/login', (req, res) => {
  const { volunteer_id, password } = req.body || {};
  if (!volunteer_id || !password) return res.status(400).json({ error: 'volunteer_id and password required' });

  const volunteer = findVolunteer(volunteer_id);
  if (!volunteer) return res.status(401).json({ error: 'Invalid volunteer_id or password' });

  // Prototype simple auth: accept default password "upay123"
  const PROTOTYPE_PASSWORD = 'upay123';
  if (password !== PROTOTYPE_PASSWORD) {
    return res.status(401).json({ error: 'Invalid volunteer_id or password' });
  }

  // Build payload
  const payload = {
    volunteer_id: volunteer.volunteer_id,
    name: volunteer.name,
    role: volunteer.role,
    city: volunteer.city,
    center_id: volunteer.center_id
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
  return res.json({ token, user: payload });
});

module.exports = router;
