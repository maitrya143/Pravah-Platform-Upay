// backend/scripts/makeScanPayload.js
// Usage: node scripts/makeScanPayload.js <student_id> [center_id]
const fs = require('fs');
const path = require('path');

const studentId = process.argv[2];
const centerId = process.argv[3] || null;

if (!studentId) {
  console.error('Usage: node scripts/makeScanPayload.js <student_id> [center_id]');
  process.exit(1);
}

// attempt to require the qr util from your src utils
let qrUtil;
try {
  qrUtil = require('../src/utils/qr');
} catch (e) {
  console.error('Could not load ../src/utils/qr — please ensure this file exists. Error:', e.message);
  process.exit(1);
}

if (typeof qrUtil.generateSignedPayload !== 'function') {
  console.error('generateSignedPayload not found in utils/qr. Inspect that file.');
  process.exit(1);
}

// Build payload object and sign it using server utility
const obj = {
  student_id: studentId,
  center_id: centerId,
  ts: Date.now()
};

const signed = qrUtil.generateSignedPayload(obj);

// generateSignedPayload in your code returns { payloadString, sig } (synchronous).
console.log(JSON.stringify(signed, null, 2));
