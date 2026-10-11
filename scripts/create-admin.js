// Create (or reset the password of) an admin account.
// Usage: npm run create-admin -- <username> "<display name>"
// The password is asked for interactively so it never lands in your shell history.
const readline = require('readline');
const db = require('../src/db');
const auth = require('../src/auth');

const [username, ...nameParts] = process.argv.slice(2);
const displayName = nameParts.join(' ') || username;
if (!auth.validUsername(username || '')) {
  console.error('Usage: npm run create-admin -- <username> "<display name>"\nUsername: 3-32 letters, numbers, dot, dash or underscore.');
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.stdoutMuted = false;
rl._writeToOutput = function (s) { if (rl.stdoutMuted && s !== '\n' && s !== '\r\n') rl.output.write('*'); else rl.output.write(s); };
rl.question('Password (min 8 characters): ', (pw) => {
  rl.stdoutMuted = false; rl.output.write('\n'); rl.close();
  if (!auth.validPassword(pw)) { console.error('Password must be at least 8 characters.'); process.exit(1); }
  const existing = db.prepare('SELECT id, role FROM users WHERE username = ?').get(username);
  if (existing) {
    db.prepare("UPDATE users SET password_hash=?, role='admin', active=1 WHERE id=?").run(auth.hashPassword(pw), existing.id);
    console.log(`Updated admin "${username}".`);
  } else {
    db.prepare("INSERT INTO users (username, display_name, role, password_hash) VALUES (?,?,'admin',?)").run(username, displayName, auth.hashPassword(pw));
    console.log(`Created admin "${username}". Open /admin and log in.`);
  }
  process.exit(0);
});
rl.stdoutMuted = true;
