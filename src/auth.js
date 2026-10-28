// Login sessions: random token in an httpOnly cookie; only its SHA-256 hash is stored.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');

const COOKIE = 'sid';
const SESSION_DAYS = 30;
const SECURE = process.env.COOKIE_SECURE !== '0' && process.env.NODE_ENV === 'production';

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function setCookie(res, value, maxAgeSec) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`];
  if (SECURE) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = Date.now() + SESSION_DAYS * 864e5;
  db.prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(hash(token), userId, expires);
  setCookie(res, token, SESSION_DAYS * 86400);
}

function destroySession(req, res) {
  const t = parseCookies(req)[COOKIE];
  if (t) db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(hash(t));
  setCookie(res, '', 0);
}

// Attach req.user if the cookie is valid.
function loadUser(req, _res, next) {
  const t = parseCookies(req)[COOKIE];
  if (t) {
    const row = db.prepare(`SELECT u.id, u.username, u.display_name, u.role, u.active, s.expires_at
      FROM auth_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(hash(t));
    if (row && row.expires_at > Date.now() && row.active) {
      req.user = { id: row.id, username: row.username, name: row.display_name, role: row.role };
      db.prepare("UPDATE users SET last_seen_at = datetime('now') WHERE id = ?").run(row.id);
    }
  }
  next();
}

const requireUser = (req, res, next) => (req.user ? next() : res.status(401).json({ error: 'Please log in.' }));
const requireStudent = (req, res, next) => (req.user && req.user.role === 'student' ? next() : res.status(req.user ? 403 : 401).json({ error: 'Students only.' }));
const requireTeacher = (req, res, next) => (req.user && req.user.role === 'teacher' ? next() : res.status(req.user ? 403 : 401).json({ error: 'Teachers only.' }));
const requireParent = (req, res, next) => (req.user && req.user.role === 'parent' ? next() : res.status(req.user ? 403 : 401).json({ error: 'Parents only.' }));
const requireAdmin = (req, res, next) => (req.user && req.user.role === 'admin' ? next() : res.status(req.user ? 403 : 401).json({ error: 'Admins only.' }));

// Simple in-memory login throttle: 10 failed tries per IP per 15 minutes.
const tries = new Map();
function loginAllowed(ip) {
  const t = tries.get(ip);
  if (!t) return true;
  if (Date.now() > t.until) { tries.delete(ip); return true; }
  return t.count < 10;
}
function loginFailed(ip) {
  const t = tries.get(ip) || { count: 0, until: Date.now() + 15 * 60e3 };
  t.count++; tries.set(ip, t);
}

function checkPassword(username, password) {
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || '').trim());
  // Compare against a dummy hash when the user doesn't exist so timing doesn't reveal valid usernames.
  const ok = bcrypt.compareSync(String(password || ''), u ? u.password_hash : DUMMY_HASH);
  return ok && u && u.active ? u : null;
}

function validPassword(p) { return typeof p === 'string' && p.length >= 8 && p.length <= 200; }
function validUsername(u) { return typeof u === 'string' && /^[a-zA-Z0-9._-]{3,32}$/.test(u); }
const hashPassword = (p) => bcrypt.hashSync(p, 12);

// Clean expired sessions once an hour.
setInterval(() => db.prepare('DELETE FROM auth_sessions WHERE expires_at < ?').run(Date.now()), 3600e3).unref();

module.exports = { loadUser, requireUser, requireStudent, requireTeacher, requireParent, requireAdmin, createSession, destroySession, loginAllowed, loginFailed, checkPassword, validPassword, validUsername, hashPassword };
