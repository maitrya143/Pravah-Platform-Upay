// backend/src/routes/diary.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/diaryController');

// POST /api/diary/generate-combined
router.post('/generate-combined', controller.generateCombined);

module.exports = router;
