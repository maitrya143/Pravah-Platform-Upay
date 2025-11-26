// backend/src/routes/diary.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { buildDiaryHtml } = require('../routes/reports_helper') || {}; // optional helper; fallback below
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
const reportsDir = path.join(__dirname, '..', '..', 'storage', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// minimal HTML builder (simple fallback, you can later import the reports html builder)
function cssStyles() {
  return `<style>body{font-family:Arial;margin:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px}</style>`;
}
function simpleDiaryHtml(diary) {
  const volRows = (diary.volunteer_reports || []).map((v,i)=>`<tr><td>${i+1}</td><td>${v.volunteer_name||''}</td><td>${v.in_time||''}</td><td>${v.out_time||''}</td><td>${v.subject_taught||''}</td></tr>`).join('');
  const attRows = (diary.attendance_list || []).map((s,i)=>`<tr><td>${i+1}</td><td>${s.student_id||''}</td><td>${s.name||''}</td><td>${s.class||''}</td><td>${s.present?'Yes':'No'}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">${cssStyles()}</head><body>
    <h2>UPAY Daily Diary - ${diary.center_id} • ${diary.date}</h2>
    <p><strong>Prepared by:</strong> ${diary.prepared_by?.name || diary.prepared_by?.volunteer_id || ''}</p>
    <h3>Summary</h3>
    <table><tr><th>Total enrolled</th><td>${diary.total_enrolled||0}</td></tr><tr><th>Present</th><td>${diary.present_count||0}</td></tr>
    <tr><th>In time</th><td>${diary.in_time||''}</td></tr><tr><th>Out time</th><td>${diary.out_time||''}</td></tr></table>
    <h3>Volunteer Reports</h3>
    <table><thead><tr><th>#</th><th>Name</th><th>In</th><th>Out</th><th>Subject</th></tr></thead><tbody>${volRows}</tbody></table>
    <h3>Attendance</h3>
    <table><thead><tr><th>#</th><th>Student ID</th><th>Name</th><th>Class</th><th>Present</th></tr></thead><tbody>${attRows}</tbody></table>
    <p>Remarks: ${diary.remarks||''}</p>
  </body></html>`;
}

// POST /api/diary/generate-combined
// Expects body: a diary JSON that includes attendance_list, volunteer_reports, and metadata (center_id, date, prepared_by, etc)
router.post('/generate-combined', authMiddleware, async (req, res) => {
  try {
    const diary = req.body || {};
    if (!diary.center_id || !diary.date) return res.status(400).json({ error: 'center_id and date required' });

    // Build HTML (use your more complete builder if available)
    const html = (typeof buildDiaryHtml === 'function') ? buildDiaryHtml(diary.center_id, diary.date, diary.present_count || 0, diary.prepared_by, diary.attendance_list || [], diary.volunteer_reports || []) : simpleDiaryHtml(diary);

    // generate filename
    const filename = `${diary.center_id}_combined_diary_${diary.date}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g,'_');
    const outPath = path.join(reportsDir, filename);

    // Use Puppeteer if available, else fallback to a simple html->pdf helper (you already have puppeteer in project)
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outPath, format: 'A4', printBackground: true });
    await browser.close();

    // Save metadata
    const reportsFile = path.join(__dirname, '..', '..', 'db', 'seed', 'reports.json');
    const reports = fs.existsSync(reportsFile) ? JSON.parse(fs.readFileSync(reportsFile,'utf8')||'[]') : [];
    reports.push({ file: filename, center_id: diary.center_id, type: 'combined', date: diary.date, created_at: new Date().toISOString(), created_by: req.user.volunteer_id || req.user.name || 'unknown' });
    fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2), 'utf8');

    return res.json({ ok: true, file: filename, path: `storage/reports/${filename}` });
  } catch (err) {
    console.error('generate-combined error', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Could not generate combined diary' });
  }
});

module.exports = router;
