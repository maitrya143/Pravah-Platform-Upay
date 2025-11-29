// backend/src/services/attendanceService.js
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { atomicWriteJson, ensureDirExists } = require('../utils/atomicWrite');

const ATT_DIR = path.resolve(config.DATA_DIR, 'attendance');

/** Ensure attendance folder exists */
async function ensureAttendanceDir() {
  await ensureDirExists(ATT_DIR);
}

/**
 * Build attendance filepath for a given date (YYYY-MM-DD) and center.
 * Example: data/attendance/2025-11-27_centerC1.json
 */
function attendanceFilePath({ date, centerId }) {
  const fname = `${date}_center_${centerId}.json`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  return path.join(ATT_DIR, fname);
}

/** Read attendance file, returns array */
async function readAttendanceFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = await fs.promises.readFile(filePath, 'utf8');
  try { return JSON.parse(raw || '[]'); } catch (e) { return []; }
}

/**
 * Add attendance record with duplicate detection.
 * - record must include student_id, center_id, ts (ISO) or date
 * - returns { added: true, record } or throws { code:'DUPLICATE' } on duplicate
 */
async function addAttendance(record) {
  if (!record || !record.student_id || !record.center_id || !record.date) {
    throw new Error('invalid_record');
  }
  await ensureAttendanceDir();
  const file = attendanceFilePath({ date: record.date, centerId: record.center_id });
  const arr = await readAttendanceFile(file);

  // duplicate check: same student_id present
  const exists = arr.find(r => r.student_id === record.student_id);
  if (exists) {
    const err = new Error('duplicate');
    err.code = 'DUPLICATE';
    throw err;
  }

  arr.push(record);
  await atomicWriteJson(file, arr);
  return { added: true, record };
}

/** Manual add or override (no duplicate error) */
async function addOrReplaceAttendance(record) {
  if (!record || !record.student_id || !record.center_id || !record.date) {
    throw new Error('invalid_record');
  }
  await ensureAttendanceDir();
  const file = attendanceFilePath({ date: record.date, centerId: record.center_id });
  const arr = await readAttendanceFile(file);

  // Remove any existing record for student_id and add new
  const filtered = arr.filter(r => r.student_id !== record.student_id);
  filtered.push(record);
  await atomicWriteJson(file, filtered);
  return { added: true, record };
}

/** Fetch attendance for given date+center */
async function getAttendance({ date, centerId }) {
  const file = attendanceFilePath({ date, centerId });
  return readAttendanceFile(file);
}

module.exports = { addAttendance, addOrReplaceAttendance, getAttendance };
