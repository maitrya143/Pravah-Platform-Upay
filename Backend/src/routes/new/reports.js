// backend/src/routes/reports.js
const express = require('express');
const router = express.Router();

// Lightweight stub for reports while we implement full PDF generator.
// POST /api/reports/diary -> create a fake pdf metadata response.
router.post('/diary', (req, res) => {
  const now = new Date().toISOString().slice(0,19).replace(/:/g,'-');
  const filename = `diary-sample-${now}.pdf`;
  return res.status(201).json({ success: true, file: filename, url: `/reports/${filename}` });
});

// GET /api/reports/:file -> return 404 (or serve a sample)
router.get('/:file', (req, res) => {
  return res.status(404).json({ success: false, error: 'report_not_found (stub)' });
});

module.exports = router;
