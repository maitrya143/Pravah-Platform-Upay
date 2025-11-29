// backend/src/utils/verifyQr.js
const crypto = require('crypto');
const config = require('../config');

/**
 * Validate QR payload (payloadString and sig).
 * Returns parsed payload object on success, throws Error on failure.
 *
 * payloadString should be the JSON string included in the QR and sig should be the HMAC hex.
 */
function verifySignedPayload({ payloadString, sig }) {
  if (!payloadString || !sig) throw new Error('invalid_payload');

  const expected = crypto.createHmac('sha256', config.JWT_SECRET || 'change-me')
    .update(payloadString)
    .digest('hex');

  if (expected !== sig) throw new Error('invalid_signature');

  // parse payloadString
  try {
    const parsed = JSON.parse(payloadString);
    return parsed;
  } catch (e) {
    throw new Error('invalid_payload_json');
  }
}

module.exports = { verifySignedPayload };
