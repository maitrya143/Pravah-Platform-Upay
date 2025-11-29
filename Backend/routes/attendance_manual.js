// backend/routes/attendance_manual.js
const express = require('express');
const router = express.Router();

// POST /api/attendance/manual
router.post('/manual', (req, res) => {
  const body = req.body || {};
  // In real impl: validate and append to attendance file
  return res.json({ success:true, message:'manual attendance (stub)', body });
});

module.exports = router;
