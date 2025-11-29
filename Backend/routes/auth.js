// backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Dev-only stub login
router.post('/login', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ success:false, error:'username required' });
  // returns a fake token (in dev we accept "Bearer <username>" as auth)
  return res.json({ success:true, token: `dev-token-for-${username}`, user: { id: username, role: 'centerHead' } });
});

module.exports = router;
