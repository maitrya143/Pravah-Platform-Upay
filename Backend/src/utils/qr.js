// backend/src/utils/qr.js
const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const QR_SECRET = process.env.QR_SECRET || 'dev_qr_secret';

// -----------------------------------------------
// 1) Generate signed payload
// -----------------------------------------------
function generateSignedPayload(dataObj) {
  const payloadString = JSON.stringify(dataObj);
  const sig = crypto.createHmac('sha256', QR_SECRET)
    .update(payloadString)
    .digest('hex');

  return { payloadString, sig };
}

// -----------------------------------------------
// 2) Create QR PNG file
// -----------------------------------------------
async function generateQrPng(text, filepath) {
  return new Promise((resolve, reject) => {
    QRCode.toFile(filepath, text, { width: 300 }, (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

// -----------------------------------------------
// 3) Verify QR signature
// -----------------------------------------------
function verifySignedPayload(payloadString, sig) {
  const expected = crypto.createHmac('sha256', QR_SECRET)
    .update(payloadString)
    .digest('hex');

  return expected === sig;
}

// -----------------------------------------------
// EXPORT ALL THREE PROPERLY
// -----------------------------------------------
module.exports = {
  generateSignedPayload,
  generateQrPng,
  verifySignedPayload
};

