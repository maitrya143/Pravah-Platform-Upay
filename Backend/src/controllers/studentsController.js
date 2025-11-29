// backend/src/controllers/studentsController.js
const fs = require('fs');
const path = require('path');
const studentService = require('../services/studentService');

async function getStudents(req, res, next) {
  try {
    const center = req.query.center;
    const students = await studentService.listStudents({ centerId: center });
    return res.json(students);
  } catch (err) { return next(err); }
}

async function postStudents(req, res, next) {
  try {
    // support multipart CSV upload (multer stores file in req.file)
    if (req.file && req.file.buffer) {
      const csvText = req.file.buffer.toString('utf8');
      const created = await studentService.createStudents({ fromCsvText: csvText });
      return res.status(201).json({ created: created.length, students: created });
    }

    // support JSON array in body
    if (Array.isArray(req.body)) {
      const created = await studentService.createStudents({ fromArray: req.body });
      return res.status(201).json({ created: created.length, students: created });
    }

    // single student JSON
    if (req.body && (req.body.name || req.body.centerId)) {
      const created = await studentService.createStudents({ fromArray: [req.body] });
      return res.status(201).json({ created: created.length, students: created });
    }

    return res.status(400).json({ error: 'No students provided. Send CSV file (multipart/form-data) or JSON array.' });
  } catch (err) { return next(err); }
}

async function getStudentQr(req, res, next) {
  try {
    const id = req.params.id;
    const student = await studentService.getStudentById(id);
    if (!student) return res.status(404).json({ error: 'student_not_found' });
    const qrPath = student.qr && student.qr.qrPath;
    if (!qrPath || !fs.existsSync(qrPath)) return res.status(404).json({ error: 'qr_not_found' });
    res.type('image/png');
    return res.sendFile(path.resolve(qrPath));
  } catch (err) { return next(err); }
}

module.exports = { getStudents, postStudents, getStudentQr };
