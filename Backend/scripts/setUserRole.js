// backend/scripts/setUserRole.js
const fs = require('fs');
const path = require('path');

const username = process.argv[2];
const newRole = process.argv[3];

if (!username || !newRole) {
  console.error('Usage: node scripts/setUserRole.js <username> <newRole>');
  process.exit(1);
}

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

if (!fs.existsSync(USERS_FILE)) {
  console.error('users.json not found');
  process.exit(1);
}

const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');

const user = users.find(u => u.username === username);

if (!user) {
  console.error('User not found:', username);
  process.exit(1);
}

user.role = newRole;

fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');

console.log(`Updated role for ${username} → ${newRole}`);
