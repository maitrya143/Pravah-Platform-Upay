// backend/routes/center.js
const express = require('express');
const router = express.Router();

// Simple dev stub: list centers
router.get('/', (req, res) => {
  return res.json([{ id: 'C1', name: 'Center 1' }, { id: 'C2', name: 'Center 2' }]);
});

module.exports = router;
