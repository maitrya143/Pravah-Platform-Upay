// backend/src/routes/students_list.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const studentsFile = path.join(__dirname, '..', '..', 'db', 'seed', 'students.json');

// simple auth middleware (reuse pattern)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function readStudents() {
  try {
    if (!fs.existsSync(studentsFile)) return [];
    return JSON.parse(fs.readFileSync(studentsFile, 'utf8') || '[]');
  } catch (e) {
    console.error('readStudents error', e);
    return [];
  }
}

// GET /api/students?center=<id>
router.get('/', authMiddleware, (req, res) => {
  const center = req.query.center;
  const students = readStudents();
  const out = center ? students.filter(s => s.center_id === center) : students;
  return res.json({ students: out });
});

module.exports = router;
