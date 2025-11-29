// Backend/tests/atomicWrite.test.js
const fs = require('fs');
const path = require('path');
const { atomicWriteJson, ensureDirExists } = require('../src/utils/atomicWrite');

const tmpDir = path.resolve(__dirname, 'tmpdata');

beforeAll(async () => {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  // cleanup
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) { /* ignore */ }
});

test('atomicWriteJson writes file atomically', async () => {
  const file = path.join(tmpDir, 'test.json');
  const data = { a: 1, ts: Date.now() };
  await atomicWriteJson(file, data);
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw);
  expect(parsed.a).toBe(1);
  expect(parsed.ts).toBe(data.ts);
});
