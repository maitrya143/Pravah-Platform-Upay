/* backend/scripts/createUser.js */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const username = process.argv[2];
const password = process.argv[3];
const center_id = process.argv[4] || null;

if (!username || !password) {
  console.error('Usage: node scripts/createUser.js <username> <password> [center_id]');
  process.exit(1);
}

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

let users = [];
if (fs.existsSync(USERS_FILE)) {
  try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]'); } catch (e) { users = []; }
}

if (users.find(u => u.username === username)) {
  console.error('User already exists.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

users.push({
  id: `user_${Date.now()}`,
  username,
  passwordHash: hash,
  role: 'centerHead',
  name: username,
  center_id,
  created_at: new Date().toISOString()
});

fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

console.log('User created successfully:', username);
