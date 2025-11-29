// backend/src/services/pdfService.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const config = require('../config');
const { ensureDirExists } = require('../utils/atomicWrite');

async function ensureReportsDir() {
  await ensureDirExists(config.REPORTS_DIR);
}

/**
 * Pretty PDF generator (A4).
 * diary: object with center_id, date, prepared_by, in_time, out_time, thought, remarks, daily_checklist, volunteer_reports
 * students: array of students (objects with student_id, name, class)
 * attendance: array of attendance records (with student_id)
 *
 * Returns the absolute filepath of the generated PDF.
 */
async function generateCombinedPdf(diary, students = [], attendance = []) {
  await ensureReportsDir();

  const center = diary.center_id || 'center';
  const date = diary.date || new Date().toISOString().slice(0,10);
  const filename = `${center}_diary_attendance_${date}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const outPath = path.join(config.REPORTS_DIR, filename);

  // create PDF
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  // Header with optional logo if exists in backend/assets/pravah_logo.png
  try {
    const logoPath = path.join(process.cwd(), 'backend', 'assets', 'pravah_logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [64, 64], align: 'left' });
    }
  } catch (e) {
    // ignore logo errors
  }

  doc.fontSize(18).font('Helvetica-Bold').text('UPAY Daily Centre Report', { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(10).font('Helvetica').fillColor('#444')
    .text(`${center} • ${date}`, { align: 'center' });
  doc.moveDown();

  // Diary summary box
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('Diary Summary');
  doc.moveDown(0.2);
  doc.fontSize(10).font('Helvetica');

  // summary content
  doc.text(`Prepared by: ${diary.prepared_by?.name || diary.prepared_by || ''}`);
  doc.text(`In Time: ${diary.in_time || ''}`);
  doc.text(`Out Time: ${diary.out_time || ''}`);
  doc.text(`Thought: ${diary.thought || ''}`, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
  doc.moveDown(0.5);

  // Daily Checklist (key: value)
  if (diary.daily_checklist && Object.keys(diary.daily_checklist).length) {
    doc.font('Helvetica-Bold').text('Daily Checklist');
    doc.font('Helvetica');
    Object.entries(diary.daily_checklist).forEach(([k,v]) => {
      doc.text(`${k.replace(/_/g,' ')}: ${v ? 'Yes' : 'No'}`);
    });
    doc.moveDown(0.5);
  }

  // Volunteers table
  doc.font('Helvetica-Bold').text('Volunteer Reports');
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(10);
  const volunteers = diary.volunteer_reports || [];
  if (volunteers.length === 0) {
    doc.text('No volunteer reports provided');
  } else {
    // table header
    const leftColX = doc.x;
    doc.font('Helvetica-Bold');
    doc.text('#', leftColX, doc.y, { width: 30, continued: true });
    doc.text('Name', leftColX + 30, doc.y, { width: 140, continued: true });
    doc.text('In-Out', leftColX + 170, doc.y, { width: 90, continued: true });
    doc.text('Subject/Topic', leftColX + 260, doc.y, { width: 200 });
    doc.moveDown(0.3);
    doc.font('Helvetica');
    volunteers.forEach((v, i) => {
      const y = doc.y;
      doc.text(String(i+1), leftColX, y, { width: 30, continued: true });
      doc.text(v.volunteer_name || v.volunteer_id || '', leftColX + 30, y, { width: 140, continued: true });
      doc.text(`${v.in_time || ''} - ${v.out_time || ''}`, leftColX + 170, y, { width: 90, continued: true });
      doc.text(`${v.subject_taught || ''} ${v.topic ? ' | ' + v.topic : ''}`, leftColX + 260, y, { width: 200 });
      doc.moveDown(0.3);
    });
  }
  doc.moveDown(0.5);

  //
  // ATTENDANCE SECTION: improved fixed-column layout to avoid overlapping text
  //
  doc.font('Helvetica-Bold').fontSize(12).text('Attendance', { underline: false });
  const totalEnrolled = Array.isArray(students) ? students.length : 0;
  const presentSet = new Set((attendance || []).map(a => a.student_id));
  doc.font('Helvetica').fontSize(10).text(`Total enrolled: ${totalEnrolled}    Present: ${(attendance || []).length}`);
  doc.moveDown(0.3);

  // Table columns (explicit positions)
  const tableX = doc.x;
  // column widths tailored to A4 minus margins
  const colWidths = { sl: 30, id: 160, name: 200, cls: 60, status: 80 };
  const colX = {
    sl: tableX,
    id: tableX + colWidths.sl,
    name: tableX + colWidths.sl + colWidths.id,
    cls: tableX + colWidths.sl + colWidths.id + colWidths.name,
    status: tableX + colWidths.sl + colWidths.id + colWidths.name + colWidths.cls
  };

  // header row
  doc.font('Helvetica-Bold').fontSize(10);
  let headerY = doc.y;
  doc.text('SNo', colX.sl, headerY, { width: colWidths.sl, align: 'left' });
  doc.text('Student ID', colX.id, headerY, { width: colWidths.id, align: 'left' });
  doc.text('Name', colX.name, headerY, { width: colWidths.name, align: 'left' });
  doc.text('Class', colX.cls, headerY, { width: colWidths.cls, align: 'left' });
  doc.text('Status', colX.status, headerY, { width: colWidths.status, align: 'left' });
  doc.moveDown(0.2);

  // rows: measure heights per cell, then draw with consistent row height
  doc.font('Helvetica').fontSize(9);
  const rowGap = 6; // vertical space between rows

  let y = doc.y;
  for (let idx = 0; idx < students.length; idx++) {
    const s = students[idx];
    // prepare string values
    const idText = String(s.student_id || s.id || s.studentId || '');
    const nameText = String(s.name || '');
    const clsText = String(s.class || s.cls || '');
    const statusText = presentSet.has(s.student_id || s.id || s.studentId) ? 'Present' : 'Absent';

    // estimate required height by checking heightOfString for each cell
    const h1 = doc.heightOfString(String(idx + 1), { width: colWidths.sl });
    const h2 = doc.heightOfString(idText, { width: colWidths.id });
    const h3 = doc.heightOfString(nameText, { width: colWidths.name });
    const h4 = doc.heightOfString(clsText, { width: colWidths.cls });
    const h5 = doc.heightOfString(statusText, { width: colWidths.status });

    const rowHeight = Math.max(h1, h2, h3, h4, h5);

    if (y + rowHeight + rowGap > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage();
      y = doc.y;
    }

    // draw each cell at exact positions
    // Use ellipsis for ID so it doesn't wrap into multiple lines
    doc.fontSize(9).text(String(idx + 1), colX.sl, y, { width: colWidths.sl, align: 'left' });
    doc.fontSize(8).text(idText, colX.id, y, { width: colWidths.id, align: 'left', ellipsis: true });
    doc.fontSize(9).text(nameText, colX.name, y, { width: colWidths.name, align: 'left' });
    doc.fontSize(9).text(clsText, colX.cls, y, { width: colWidths.cls, align: 'left' });
    doc.fontSize(9).text(statusText, colX.status, y, { width: colWidths.status, align: 'left' });

    // advance y by rowHeight + gap
    y = y + rowHeight + rowGap;
    doc.y = y;
  }

  // Footer
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('#666').text(`Generated by Pravah • ${new Date().toLocaleString()}`, { align: 'right' });

  doc.end();

  // wait for stream to finish
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return outPath;
}

module.exports = { generateCombinedPdf };
