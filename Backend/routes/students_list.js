// backend/routes/students_list.js
const express = require('express');
const router = express.Router();

// For compatibility: returns same as /students (could be expanded)
router.get('/', (req, res) => {
  res.json({ success:true, message:'students_list placeholder. Use /api/students' });
});

module.exports = router;
