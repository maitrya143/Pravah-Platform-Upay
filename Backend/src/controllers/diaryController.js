// backend/src/controllers/diaryController.js
const path = require('path');
const fs = require('fs');
const pdfService = require('../services/pdfService');
const studentService = require('../services/studentService');
const attendanceService = require('../services/attendanceService');

async function generateCombined(req, res, next) {
  try {
    const diary = req.body || {};
    if (!diary.center_id || !diary.date) return res.status(400).json({ error: 'center_id and date required' });

    // load students and attendance for center and date
    const students = await studentService.listStudents({ centerId: diary.center_id }) || [];
    const attendance = await attendanceService.getAttendance({ date: diary.date, centerId: diary.center_id }) || [];

    const outPath = await pdfService.generateCombinedPdf(diary, students, attendance);
    const filename = path.basename(outPath);
    const url = `/reports/${filename}`;

    return res.status(201).json({ ok: true, file: filename, url });
  } catch (err) {
    return next(err);
  }
}

module.exports = { generateCombined };
