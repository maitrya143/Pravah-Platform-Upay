// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// POST /api/reports/diary  (legacy placeholder here)
router.post('/diary', (req, res) => {
  // stub response to indicate endpoint exists
  return res.status(201).json({ success:true, file: 'diary-sample.pdf', url: '/reports/diary-sample.pdf' });
});
router.get('/list', requireAuth, requireRole('admin'), (req, res) => { ... });
router.get('/download', requireAuth, requireRole('admin'), (req, res) => { ... });

module.exports = router;
