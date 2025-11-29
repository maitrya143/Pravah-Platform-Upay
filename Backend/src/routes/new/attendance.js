// backend/src/routes/attendance.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');

// POST /api/attendance/scan
router.post('/scan', controller.scan);

// POST /api/attendance/manual
// (we will also mount attendance_manual for older endpoints; keep both)
router.post('/manual', controller.manual);

module.exports = router;
