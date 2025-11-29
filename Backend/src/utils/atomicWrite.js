// Backend/src/utils/atomicWrite.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const rename = promisify(fs.rename);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

async function ensureDirExists(dir) {
  try {
    await stat(dir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(dir, { recursive: true });
    } else {
      throw err;
    }
  }
}

/**
 * Atomically write JSON to a file.
 * - Writes to a temp file first, then renames.
 *
 * @param {string} filePath
 * @param {any} data
 * @returns {Promise<void>}
 */
async function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  await ensureDirExists(dir);

  const tmpFile = path.join(dir, `.tmp-${Date.now()}-${path.basename(filePath)}`);
  const json = JSON.stringify(data, null, 2);

  // use writeFile (atomic rename later)
  await writeFile(tmpFile, json, { encoding: 'utf8' });
  await rename(tmpFile, filePath);
}

module.exports = { atomicWriteJson, ensureDirExists };
