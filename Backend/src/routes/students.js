// backend/src/routes/students.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { generateSignedPayload, generateQrPng } = require('../utils/qr');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// storage dirs (explicit, safe)
const storageBase = path.join(__dirname, '..', '..', 'storage');
const admissionsDir = path.join(storageBase, 'admissions');
const qrDir = path.join(storageBase, 'qrcards');

// ensure folders exist
[storageBase, admissionsDir, qrDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// students JSON file path
const studentsFile = path.join(__dirname, '..', '..', 'db', 'seed', 'students.json');

// multer: store file in memory and we write it using fs
const upload = multer({ storage: multer.memoryStorage() });

// helpers
const readStudents = () => {
  try {
    if (!fs.existsSync(studentsFile)) {
      return [];
    }
    const data = fs.readFileSync(studentsFile, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('readStudents error:', error);
    return [];
  }
};

const writeStudents = (students) => {
  fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2), 'utf-8');
};

// auth middleware (same pattern)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/students  (create + upload + generate QR)
router.post('/', authMiddleware, upload.single('admission_scan'), async (req, res) => {
  try {
    const { name, class: studentClass, parent_name, center_id } = req.body || {};

    if (!name || !studentClass || !parent_name || !center_id || !req.file) {
      return res.status(400).json({ error: 'Missing required fields or admission scan' });
    }

    // create student id
    const studentId = `STU${Date.now()}`;

    // save admission scan
    const ext = path.extname(req.file.originalname) || '.jpg';
    const admissionFilename = `${studentId}${ext}`;
    const admissionPath = path.join(admissionsDir, admissionFilename);
    fs.writeFileSync(admissionPath, req.file.buffer);

    // prepare student record
    const studentRecord = {
      student_id: studentId,
      name,
      class: studentClass,
      parent_name,
      center_id,
      admission_scan: path.relative(path.join(__dirname, '..', '..'), admissionPath).replace(/\\/g, '/'),
      created_at: new Date().toISOString()
    };

    // append to students.json
    const students = readStudents();
    students.push(studentRecord);
    writeStudents(students);

    // generate signed payload and QR (encode both payloadString and sig together)
    const { payloadString, sig } = generateSignedPayload({
      student_id: studentRecord.student_id,
      center_id: studentRecord.center_id,
      ts: Date.now()
    });
    const qrContent = JSON.stringify({ payloadString, sig });

    const qrFilename = `${studentId}.png`;
    const qrPath = path.join(qrDir, qrFilename);

    await generateQrPng(qrContent, qrPath);

    return res.status(201).json({
      student: {
        ...studentRecord,
        qr_path: path.relative(path.join(__dirname, '..', '..'), qrPath).replace(/\\/g, '/')
      }
    });
  } catch (err) {
    console.error('POST /api/students error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/:id
router.get('/:id', authMiddleware, (req, res) => {
  const students = readStudents();
  const student = students.find((entry) => entry.student_id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  return res.json(student);
});

// GET /api/students/:id/qr
router.get('/:id/qr', authMiddleware, (req, res) => {
  const qrPath = path.join(qrDir, `${req.params.id}.png`);
  if (!fs.existsSync(qrPath)) return res.status(404).json({ error: 'QR not found' });
  // send absolute path
  return res.sendFile(qrPath);
});

module.exports = router;
