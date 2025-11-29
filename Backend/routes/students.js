// backend/routes/students.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');


// GET /api/students?center=<id>
router.get('/', (req, res) => {
  const center = req.query.center;
  const dataFile = path.resolve(config.DATA_DIR, 'students.json');
  if (!fs.existsSync(dataFile)) return res.json([]);
  const students = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  if (center) return res.json(students.filter(s => s.centerId === center));
  return res.json(students);
});
router.get('/', optionalAuth, controller.getStudents);

// create/upload students — centerHead (prototype) or admin
router.post('/', requireAuth, requireRole('admin'), upload.single('file'), controller.postStudents);

// GET QR
router.get('/:id/qr', requireAuth, requireRole('admin','volunteer'), controller.getStudentQr);


module.exports = router;
