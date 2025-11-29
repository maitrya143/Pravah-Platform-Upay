// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * requireAuth: middleware that expects Authorization: Bearer <token>
 * On success it sets req.user = tokenPayload
 */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || config.JWT_SECRET || 'dev_jwt_secret');
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * optionalAuth: if token provided, set req.user, but don't 401 if missing.
 */
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return next();
  const token = auth.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || config.JWT_SECRET || 'dev_jwt_secret');
  } catch (e) {
    // ignore invalid
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };
