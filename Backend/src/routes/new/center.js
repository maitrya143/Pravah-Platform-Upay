const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// simple auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /center/list
router.get('/list', authMiddleware, (req, res) => {
  // for prototype, payload has center_id and city
  const user = req.user;
  const centers = [
    {
      center_id: user.center_id,
      city: user.city,
      name: user.center_id // placeholder name
    }
  ];
  return res.json({ centers });
});

module.exports = router;
