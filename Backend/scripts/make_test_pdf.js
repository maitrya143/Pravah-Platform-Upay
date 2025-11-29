// backend/scripts/make_test_pdf.js
const fs = require('fs');
const PDFDocument = require('pdfkit');
const out = 'storage/reports/test-pdfkit.pdf';
if (!fs.existsSync('storage/reports')) fs.mkdirSync('storage/reports', { recursive: true });
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(out));
doc.fontSize(20).text('Pravah - PDFKit Test', { align: 'center' });
doc.moveDown().fontSize(12).text('This is a test PDF created with pdfkit.');
doc.end();
console.log('Test PDF created at', out);
