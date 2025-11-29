// backend/routes/diary.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');


router.get('/', (req, res) => {
  res.json({ success:true, message:'diary routes placeholder' });
});
// diary generation: centerHead or admin (centerHead allowed by default)
router.post('/generate-combined', requireAuth, requireRole('admin'), controller.generateCombined);

module.exports = router;
