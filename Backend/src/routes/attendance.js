// backend/src/routes/attendance.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { verifySignedPayload } = require('../utils/qr');

const router = express.Router();
const ATT_FILE = path.join(__dirname, '..', '..', 'db', 'seed', 'attendance.json');

// Auth middleware (same pattern as center.js)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function loadAttendance() {
  try {
    return JSON.parse(fs.readFileSync(ATT_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}
function saveAttendance(arr) {
  fs.writeFileSync(ATT_FILE, JSON.stringify(arr, null, 2));
}

// POST /api/attendance/scan
// Body JSON: { payloadString: "<json-string>", sig: "<hex>" }
router.post('/scan', authMiddleware, (req, res) => {
  const { payloadString, sig } = req.body || {};
  if (!payloadString || !sig) return res.status(400).json({ error: 'payloadString and sig required' });

  // verify signature
  if (!verifySignedPayload(payloadString, sig)) return res.status(401).json({ error: 'Invalid QR signature' });

  // parse payload and mark attendance
  let payload;
  try { payload = JSON.parse(payloadString); } catch (e) { return res.status(400).json({ error: 'Invalid payload JSON' }); }

  const { student_id, center_id } = payload;
  if (!student_id) return res.status(400).json({ error: 'student_id missing in payload' });

  const attendance = loadAttendance();
  const today = new Date().toISOString().slice(0,10);

  // prevent duplicate marking
  const exists = attendance.find(a => a.student_id === student_id && a.date === today);
  if (exists) return res.status(409).json({ error: 'Attendance already marked' });

  const entry = {
    student_id,
    center_id,
    date: today,
    time: new Date().toISOString(),
    marked_by: req.user.volunteer_id || req.user.name || 'unknown'
  };
  attendance.push(entry);
  saveAttendance(attendance);

  return res.json({ ok: true, entry });
});
// GET /api/attendance?center=<center_id>&date=YYYY-MM-DD
router.get('/', authMiddleware, (req, res) => {
    const center = req.query.center;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
  
    let attendance = [];
    try {
      const attFile = path.join(__dirname, '..', '..', 'db', 'seed', 'attendance.json');
      if (fs.existsSync(attFile)) {
        attendance = JSON.parse(fs.readFileSync(attFile, 'utf8') || '[]');
      }
    } catch (e) {
      console.error('read attendance error', e);
      return res.status(500).json({ error: 'Could not read attendance' });
    }
  
    const out = attendance.filter(a =>
      a.date === date &&
      (!center || a.center_id === center)
    );
  
    return res.json({ attendance: out });
  });

  // POST /api/attendance/bulk-sync
router.post('/bulk-sync', authMiddleware, (req, res) => {
    const items = req.body || [];
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Array required' });
    }
  
    const attFile = path.join(__dirname, '..', '..', 'db', 'seed', 'attendance.json');
    let attendance = [];
  
    try {
      attendance = JSON.parse(fs.readFileSync(attFile, 'utf8') || '[]');
    } catch (e) {
      attendance = [];
    }
  
    const added = [];
  
    items.forEach(item => {
      if (!item.student_id || !item.date) return;
  
      const exists = attendance.find(a =>
        a.student_id === item.student_id &&
        a.date === item.date
      );
  
      if (!exists) {
        attendance.push({
          ...item,
          marked_by: req.user.volunteer_id || req.user.name || 'unknown',
          time: item.time || new Date().toISOString()
        });
        added.push(item);
      }
    });
  
    fs.writeFileSync(attFile, JSON.stringify(attendance, null, 2), 'utf8');
  
    return res.json({ ok: true, added });
  });
  

module.exports = router;
