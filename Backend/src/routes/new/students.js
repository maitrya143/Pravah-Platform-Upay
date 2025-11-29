// backend/src/routes/students.js
const express = require('express');
const multer = require('multer');
const { requireAuth, optionalAuth } = require('../middleware/auth'); // adjust import if you put auth elsewhere

// memory storage for multer — we just forward buffer to controller
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
const controller = require('../controllers/studentsController');

/**
 * Routes:
 * GET  /api/students?center=<id>         - list students (public or optionalAuth)
 * POST /api/students                     - create students (CSV upload or JSON) (protected)
 * GET  /api/students/:id/qr              - return QR PNG for a student (protected)
 *
 * Notes:
 * - POST accepts multipart/form-data with field "file" (CSV) OR application/json body
 *   - For CSV upload: use form field name "file" (multer handles it)
 *   - For JSON: send { students: [...]} or single student object
 * - We protect write endpoints with requireAuth. If you want scanning to be open,
 *   change requireAuth -> optionalAuth below for specific routes.
 */

// GET list of students (optional auth — can be public if you prefer)
router.get('/', optionalAuth, controller.getStudents);

// POST create/upload students
// Accepts:
// - multipart/form-data with file field "file" (CSV file)
// - application/json body: { students: [...] } or single student object { name, centerId, ... }
router.post('/', requireAuth, upload.single('file'), controller.postStudents);

// GET student QR PNG (protected)
router.get('/:id/qr', requireAuth, controller.getStudentQr);

module.exports = router;
