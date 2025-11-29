// backend/tests/pdf.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const config = require('../src/config');

describe('PDF generator', () => {
  const diaryPayload = {
    center_id: 'C1',
    date: new Date().toISOString().slice(0,10),
    prepared_by: 'Tester',
    in_time: '09:00',
    out_time: '12:00',
    thought: 'Today we taught well',
    volunteer_reports: [],
    daily_checklist: { room_swept: true }
  };

  test('POST /api/diary/generate-combined creates a PDF and returns path', async () => {
    // ensure there's at least one student so table renders
    await request(app).post('/api/students').send({ name:'PDFStudent', centerId:'C1' });

    const res = await request(app).post('/api/diary/generate-combined').send(diaryPayload);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.file).toBeDefined();
    const filePath = path.join(config.REPORTS_DIR, res.body.file);
    // file should exist after short wait
    expect(fs.existsSync(filePath)).toBe(true);
  }, 20000);
});
