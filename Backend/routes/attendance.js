// backend/routes/attendance.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');


// POST /api/attendance/scan
router.post('/scan', (req, res) => {
  // stub: echo back received payload
  const payload = req.body || {};
  return res.json({ success:true, message:'scan received (stub)', payload });
});
// scan: allow volunteers or centerHead/admin; centerHead always allowed
router.post('/scan', requireAuth, requireRole('volunteer','admin'), controller.scan);

// manual: centerHead or admin
router.post('/manual', requireAuth, requireRole('admin'), controller.manual);

module.exports = router;
