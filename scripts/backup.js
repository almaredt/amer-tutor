// Safe online backup of the SQLite database. Keeps the newest 30 copies.
// Usage: node --env-file=.env scripts/backup.js   (cron example in INSTALL-fa.md)
const fs = require('fs');
const path = require('path');
const db = require('../src/db');
const dir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `tutor-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.db`);
db.backup(file).then(() => {
  const all = fs.readdirSync(dir).filter((f) => f.endsWith('.db')).sort();
  all.slice(0, Math.max(0, all.length - 30)).forEach((f) => fs.unlinkSync(path.join(dir, f)));
  console.log('Backup saved:', file);
  process.exit(0);
}).catch((e) => { console.error('Backup failed:', e.message); process.exit(1); });
