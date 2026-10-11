// Per-student settings. Students choose them in Settings; the admin (parent) can block Claude for a student.
const db = require('./db');
const ai = require('./ai');

for (const sql of ["ALTER TABLE users ADD COLUMN prefs TEXT", "ALTER TABLE users ADD COLUMN ai_allowed INTEGER NOT NULL DEFAULT 1"]) {
  try { db.exec(sql); } catch (e) { /* column already exists */ }
}

const DEFAULTS = { ai: true, sessionMinutes: 30 };
const MINUTES = [20, 30, 45, 60];

function get(userId) {
  const u = db.prepare('SELECT prefs, ai_allowed FROM users WHERE id=?').get(userId) || {};
  let p = {}; try { p = JSON.parse(u.prefs || '{}') || {}; } catch (e) { p = {}; }
  const out = { ...DEFAULTS, ...p };
  out.aiAllowed = u.ai_allowed !== 0;            // parent switch
  out.aiConfigured = ai.available();             // API key on the server
  // Per-student daily Claude cap (src/billing.js); a cap of $0 means no Claude for this plan.
  const limit = require('./billing').dailyLimit(userId);
  out.aiLimitReached = limit <= 0 || ai.userDayCost(userId) >= limit;
  out.aiOn = out.aiConfigured && out.aiAllowed && out.ai !== false && !out.aiLimitReached;
  return out;
}
function set(userId, body) {
  const cur = get(userId), next = { ai: cur.ai, sessionMinutes: cur.sessionMinutes };
  if (typeof body.ai === 'boolean') next.ai = body.ai;
  if (body.sessionMinutes !== undefined) {
    const m = Number(body.sessionMinutes);
    if (!MINUTES.includes(m)) return { error: 'Session length must be 20, 30, 45 or 60 minutes.' };
    next.sessionMinutes = m;
  }
  db.prepare('UPDATE users SET prefs=? WHERE id=?').run(JSON.stringify(next), userId);
  return get(userId);
}
function setAllowed(userId, allowed) {
  db.prepare("UPDATE users SET ai_allowed=? WHERE id=? AND role='student'").run(allowed ? 1 : 0, userId);
  return { ok: true };
}
const aiOn = (userId) => get(userId).aiOn;
// Why Claude is unavailable for this student, or null when it is on.
function aiOffReason(userId) {
  const p = get(userId);
  if (!p.aiConfigured) return 'Claude is not set up on this server';
  if (!p.aiAllowed) return 'Claude is turned off for this account by the parent';
  if (p.ai === false) return 'Claude is turned off in Settings';
  if (p.aiLimitReached) return "Today's Claude limit for this account is used up (it resets tomorrow)";
  return null;
}

module.exports = { get, set, setAllowed, aiOn, aiOffReason, MINUTES };
