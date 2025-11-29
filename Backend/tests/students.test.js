// backend/tests/students.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const config = require('../src/config');

describe('Students API', () => {
  const sampleStudent = { name: 'Test Student', roll: '1', centerId: 'C1' };

  beforeAll(() => {
    // ensure data and uploads dir exist
    if (!fs.existsSync(config.DATA_DIR)) fs.mkdirSync(config.DATA_DIR, { recursive: true });
    if (!fs.existsSync(config.UPLOADS_DIR)) fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
  });

  afterAll(() => {
    // no teardown for now
  });

  test('POST /api/students with JSON creates student', async () => {
    const res = await request(app).post('/api/students').send(sampleStudent);
    expect(res.status).toBe(201);
    expect(res.body.created).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.students)).toBe(true);
    const stud = res.body.students[0];
    expect(stud).toHaveProperty('id');
    expect(stud).toHaveProperty('qr');
    expect(stud.qr).toHaveProperty('qrUrl');
  }, 10000);

  test('GET /api/students?center=C1 returns list', async () => {
    const res = await request(app).get('/api/students').query({ center: 'C1' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/students/:id/qr returns png', async () => {
    // create one student then fetch qr
    const post = await request(app).post('/api/students').send({ name:'QRS', centerId:'C1' });
    const id = post.body.students[0].id;
    const res = await request(app).get(`/api/students/${id}/qr`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/png/);
    expect(res.body && res.body.length).toBeGreaterThan(100); // png bytes
  }, 10000);
});
