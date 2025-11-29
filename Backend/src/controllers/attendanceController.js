// backend/src/controllers/attendanceController.js
const { verifySignedPayload } = require('../utils/verifyQr');
const attendanceService = require('../services/attendanceService');
const studentService = require('../services/studentService'); // to fetch student name if needed

/* Helper to normalize date (YYYY-MM-DD) */
function isoDateFromTs(ts) {
  const d = ts ? new Date(ts) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * POST /api/attendance/scan
 * Accepts JSON:
 * {
 *   "qr": {"payloadString":"...","sig":"..."}   // preferred
 * }
 * or raw scanned QR text: { "qrText": "{\"payloadString\":\"...\",\"sig\":\"...\"}" }
 *
 * Returns 201 on success, 409 on duplicate.
 */
async function scan(req, res, next) {
  try {
    const body = req.body || {};
    let payloadString, sig;

    if (body.qr && body.qr.payloadString && body.qr.sig) {
      payloadString = body.qr.payloadString;
      sig = body.qr.sig;
    } else if (body.qrText) {
      // qrText is the string encoded in the QR (JSON). parse it
      try {
        const parsed = typeof body.qrText === 'string' ? JSON.parse(body.qrText) : body.qrText;
        payloadString = parsed.payloadString;
        sig = parsed.sig;
      } catch (e) {
        return res.status(400).json({ error: 'invalid_qr_text' });
      }
    } else {
      return res.status(400).json({ error: 'missing_qr' });
    }

    // verify signature and parse payload
    let payload;
    try {
      payload = verifySignedPayload({ payloadString, sig });
    } catch (e) {
      return res.status(400).json({ error: e.message || 'invalid_signature' });
    }

    // build attendance record
    const ts = body.ts || new Date().toISOString();
    const date = isoDateFromTs(ts);
    const record = {
      student_id: payload.studentId || payload.student_id || payload.studentID || payload.student || payload.id,
      center_id: payload.centerId || payload.center_id || payload.center,
      method: 'scan',
      ts,
      date,
      marked_by: req.user ? req.user.id || req.user.name || null : 'anonymous'
    };

    if (!record.student_id || !record.center_id) return res.status(400).json({ error: 'invalid_payload_fields' });

    // Optional: augment with student name
    const student = await studentService.getStudentById(record.student_id);
    if (student) record.name = student.name || student.student_name || student.name || null;

    // attempt to add
    try {
      await attendanceService.addAttendance(record);
      return res.status(201).json({ ok: true, added: true, record });
    } catch (err) {
      if (err && err.code === 'DUPLICATE') {
        return res.status(409).json({ ok: false, error: 'duplicate' });
      }
      throw err;
    }
  } catch (err) { return next(err); }
}

/**
 * POST /api/attendance/manual
 * Body:
 * {
 *   student_id, center_id, date (YYYY-MM-DD optional), status (present/absent), marked_by, inTime, outTime
 * }
 */
async function manual(req, res, next) {
  try {
    const b = req.body || {};
    const date = b.date || isoDateFromTs(b.ts || new Date().toISOString());
    if (!b.student_id || !b.center_id) return res.status(400).json({ error: 'student_id and center_id required' });

    const record = {
      student_id: b.student_id,
      center_id: b.center_id,
      method: 'manual',
      ts: b.ts || new Date().toISOString(),
      date,
      marked_by: b.marked_by || (req.user ? req.user.id : 'manual'),
      status: b.status || 'present',
      inTime: b.inTime || null,
      outTime: b.outTime || null,
      remarks: b.remarks || null
    };

    // add or replace existing
    await attendanceService.addOrReplaceAttendance(record);
    return res.status(201).json({ ok: true, added: true, record });
  } catch (err) { return next(err); }
}

module.exports = { scan, manual };
