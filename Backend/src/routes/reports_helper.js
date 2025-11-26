const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const PDFDocument = require("pdfkit");

// very small CSS
function cssStyles() {
  return `<style>
    body{font-family:Arial, sans-serif; margin:12px; color:#222}
    header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
    h1{font-size:18px;margin:0}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{border:1px solid #ddd;padding:6px;font-size:12px}
    thead{background:#f7fafa}
  </style>`;
}

function buildAttendanceHtml(center_id, date, students, attendance) {
  const presentIds = new Set((attendance||[]).map(a=>a.student_id));
  const rows = (students||[]).map((s,i)=>{
    const present = presentIds.has(s.student_id) ? 'Present' : 'Absent';
    return `<tr><td>${i+1}</td><td>${s.student_id||''}</td><td>${s.name||''}</td><td>${s.class||''}</td><td>${present}</td></tr>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8">${cssStyles()}</head><body>
    <header><h1>Daily Attendance Report</h1><div style="margin-left:12px">${center_id} • ${date}</div></header>
    <div>Total students: ${(students||[]).length} • Present: ${(attendance||[]).length}</div>
    <table><thead><tr><th>#</th><th>Student ID</th><th>Name</th><th>Class</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
}

function buildDiaryHtml(center_id, date, presentCount, user, students, attendance) {
  // simple diary layout; you will extend later
  const rows = (students||[]).map((s,i)=>`<tr><td>${i+1}</td><td>${s.student_id||''}</td><td>${s.name||''}</td><td>${attendance.find(a=>a.student_id===s.student_id)?'Yes':'No'}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">${cssStyles()}</head><body>
    <header><h1>UPAY Daily Diary</h1><div style="margin-left:12px">${center_id} • ${date}</div></header>
    <table><tr><th>Prepared by</th><td>${user.name||user.volunteer_id||'unknown'}</td></tr>
      <tr><th>Total enrolled</th><td>${(students||[]).length}</td></tr>
      <tr><th>Present today</th><td>${presentCount}</td></tr></table>
    <h3>Attendance</h3>
    <table><thead><tr><th>#</th><th>Student ID</th><th>Name</th><th>Present</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
}

async function generatePdfWithPuppeteer(html, outPath) {
  // Note: on Windows, puppeteer may use its own Chromium or fail — check console if it fails
  const browser = await puppeteer.launch({ args: ["--no-sandbox","--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({ path: outPath, format: "A4", printBackground: true });
  await browser.close();
}

// simple pdfkit fallback (sync-ish)
function generatePdfWithPdfKitPlain(diary, outPath) {
  const doc = new PDFDocument({ margin: 18, size: "A4" });
  doc.pipe(fs.createWriteStream(outPath));
  doc.fontSize(16).text('UPAY Daily Centre Report / Diary', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Center: ${diary.center_id || ''}   Date: ${diary.date || ''}`);
  doc.moveDown();
  doc.text(`Prepared by: ${(diary.prepared_by && diary.prepared_by.name) || diary.prepared_by || ''}`);
  doc.moveDown();
  doc.text(`Total enrolled: ${diary.total_enrolled || 0}   Present: ${diary.present_count || 0}`);
  doc.moveDown();
  (diary.volunteer_reports || []).forEach((v,i) => {
    doc.text(`${i+1}. ${v.volunteer_name || ''} | In: ${v.in_time || ''} Out: ${v.out_time || ''} | Subject: ${v.subject_taught || ''}`);
  });
  doc.end();
}

module.exports = {
  cssStyles,
  buildAttendanceHtml,
  buildDiaryHtml,
  generatePdfWithPuppeteer,
  generatePdfWithPdfKitPlain
};