// backend/tests/attendance.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const config = require('../src/config');
const studentService = require('../src/services/studentService');
const { buildQrPayload, qrPngBuffer } = require('../src/utils/qr');

// helper to ensure folders
beforeAll(async () => {
  if (!fs.existsSync(config.DATA_DIR)) fs.mkdirSync(config.DATA_DIR, { recursive: true });
  if (!fs.existsSync(config.UPLOADS_DIR)) fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
});

describe('Attendance API', () => {
  let student;
  test('create a student to mark attendance', async () => {
    const res = await request(app).post('/api/students').send({ name:'Attendee', centerId:'C1' });
    expect(res.status).toBe(201);
    student = res.body.students[0];
    expect(student).toBeDefined();
  }, 10000);

  test('POST /api/attendance/scan marks attendance', async () => {
    // build payload & sig using same util the service uses
    const { payloadString, sig } = buildQrPayload({ studentId: student.id || student.student_id || student.id, centerId: 'C1' });
    const qr = { payloadString, sig };
    const res = await request(app).post('/api/attendance/scan').send({ qr });
    expect([200,201]).toContain(res.status);
    expect(res.body.record).toBeDefined();
    expect(res.body.record.student_id || res.body.record.studentId).toBeDefined();
  }, 10000);

  test('Duplicate scan returns 409', async () => {
    const { payloadString, sig } = buildQrPayload({ studentId: student.id || student.student_id || student.id, centerId: 'C1' });
    const res = await request(app).post('/api/attendance/scan').send({ qr: { payloadString, sig } });
    expect(res.status).toBe(409);
  }, 10000);
});
