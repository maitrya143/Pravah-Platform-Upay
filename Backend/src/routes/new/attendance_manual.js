// backend/src/routes/attendance_manual.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const ATT_FILE = path.join(__dirname, '..', '..', 'db', 'seed', 'attendance.json');

function authMiddleware(req, res, next){
  const auth = req.headers.authorization || '';
  if(!auth.startsWith('Bearer ')) return res.status(401).json({error:'Missing token'});
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch(e){ return res.status(401).json({error:'Invalid token'}); }
}

function load(){ try { return JSON.parse(fs.readFileSync(ATT_FILE,'utf8')); } catch { return []; } }
function save(a){ fs.writeFileSync(ATT_FILE, JSON.stringify(a,null,2)); }

router.post('/manual', authMiddleware, (req,res) => {
  const { date, student_ids } = req.body || {};
  if(!date || !Array.isArray(student_ids)) return res.status(400).json({error:'date and student_ids[] required'});
  const att = load();
  const added = [];
  student_ids.forEach(sid => {
    if(!att.find(a=>a.student_id===sid && a.date===date)){
      const entry = { student_id: sid, date, time: new Date().toISOString(), marked_by: req.user.volunteer_id || req.user.name || 'unknown' };
      att.push(entry);
      added.push(entry);
    }
  });
  save(att);
  return res.json({ ok:true, added });
});

module.exports = router;
