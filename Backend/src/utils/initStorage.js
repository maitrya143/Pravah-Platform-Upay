const fs = require('fs');
const path = require('path');

function ensureStorageFolders() {
  const base = path.join(__dirname, '..', '..', 'storage');

  const paths = [
    base,
    path.join(base, 'admissions'),
    path.join(base, 'qrcards')
  ];

  paths.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created folder: ${folder}`);
    }
  });
}

module.exports = ensureStorageFolders;
