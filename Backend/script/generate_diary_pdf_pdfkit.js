// backend/scripts/generate_diary_pdf_pdfkit.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const reportsDir = path.join(__dirname, '..', 'storage', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

const diary = JSON.parse(fs.readFileSync(path.join(__dirname,'..','db','seed','diaries.json'),'utf8') || '[]').slice(-1)[0];
const out = path.join(reportsDir, `${diary.center_id || 'center'}_diary_${diary.date || Date.now()}.pdf`);

const doc = new PDFDocument({ margin: 20, size: 'A4' });
doc.pipe(fs.createWriteStream(out));

doc.fontSize(16).text('UPAY Daily Centre Report / Diary', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text(`Center: ${diary.center_id || ''}   Date: ${diary.date || ''}   Prepared by: ${diary.prepared_by?.name || ''}`);
doc.moveDown();

doc.fontSize(12).text('Daily Checklist:', { underline: true });
const checklist = diary.daily_checklist || {};
Object.entries(checklist).forEach(([k,v]) => {
  doc.text(`${k}: ${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}`);
});
doc.moveDown();

doc.text('Attendance summary:', { underline: true });
const att = diary.attendance_summary || {};
doc.text(`Enrolled: ${att.enrolled || 0}  Present: ${att.present_count || 0}  Percentage: ${att.percentage_present || ''}`);
doc.moveDown();

doc.text('Volunteer Reports:', { underline: true });
(diary.volunteer_reports || []).forEach((vr, i) => {
  doc.text(`${i+1}. ${vr.volunteer_name || ''} | In:${vr.in_time||''} Out:${vr.out_time||''} Subject:${vr.subject_taught||''} Topic:${vr.topic_or_activity||''}`);
});

doc.end();
console.log('Created PDF:', out);
