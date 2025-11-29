// backend/src/services/studentService.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const { atomicWriteJson, ensureDirExists } = require('../utils/atomicWrite');
const config = require('../config');
const { buildQrPayload, qrPngBuffer } = require('../utils/qr');

const STUDENTS_FILE = path.resolve(config.DATA_DIR, 'students.json');
const QR_DIR = path.resolve(config.UPLOADS_DIR, 'qr');

async function _readStudents() {
  if (!fs.existsSync(STUDENTS_FILE)) return [];
  const raw = await fs.promises.readFile(STUDENTS_FILE, 'utf8');
  try { return JSON.parse(raw || '[]'); } catch (e) { return []; }
}

async function _writeStudents(students) {
  await ensureDirExists(path.dirname(STUDENTS_FILE));
  await atomicWriteJson(STUDENTS_FILE, students);
}

async function ensureQrDir() {
  await ensureDirExists(QR_DIR);
}

async function listStudents(filter = {}) {
  const all = await _readStudents();
  if (filter.centerId) return all.filter(s => s.centerId === filter.centerId);
  return all;
}

/**
 * Create students in bulk from CSV text or array of objects.
 * Returns created student objects with qrUrl.
 */
async function createStudents({ fromCsvText, fromArray }) {
  const existing = await _readStudents();
  const toCreate = [];

  if (fromCsvText) {
    const records = parse(fromCsvText, { columns: true, skip_empty_lines: true, trim: true });
    // expect columns: name, roll, centerId (case-insensitive)
    for (const r of records) {
      const name = r.name || r.Name || r.studentName || r.student || '';
      const roll = r.roll || r.Roll || '';
      const centerId = r.centerId || r.center || r.center_id || r.Center || '';
      toCreate.push({ name: String(name).trim(), roll: String(roll).trim(), centerId: String(centerId).trim() });
    }
  }

  if (Array.isArray(fromArray)) {
    for (const r of fromArray) {
      const { name = '', roll = '', centerId = '' } = r;
      toCreate.push({ name: String(name).trim(), roll: String(roll).trim(), centerId: String(centerId).trim() });
    }
  }

  if (toCreate.length === 0) throw new Error('No students found in input');

  await ensureQrDir();

  const created = [];
  for (const s of toCreate) {
    const id = uuidv4();
    const student = {
      id,
      name: s.name || `Student-${id.slice(0,6)}`,
      roll: s.roll || '',
      centerId: s.centerId || '',
      createdAt: new Date().toISOString()
    };

    // Build QR
    const { payloadString, sig } = buildQrPayload({ studentId: id, centerId: student.centerId });
    const pngBuffer = await qrPngBuffer({ payloadString, sig });
    const qrFilename = `${id}.png`;
    const qrPath = path.join(QR_DIR, qrFilename);
    await fs.promises.writeFile(qrPath, pngBuffer);

    // Save metadata about qr inside student
    student.qr = {
      payloadString,
      sig,
      qrPath,
      qrUrl: `/uploads/qr/${qrFilename}`
    };

    created.push(student);
    existing.push(student);
  }

  // persist
  await _writeStudents(existing);

  return created;
}

async function getStudentById(id) {
  const all = await _readStudents();
  return all.find(s => s.id === id) || null;
}

module.exports = {
  listStudents,
  createStudents,
  getStudentById,
  STUDENTS_FILE,
  QR_DIR
};
