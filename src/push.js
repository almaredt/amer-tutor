// Daily study reminder as a phone/desktop notification (Web Push).
// VAPID keys are created on first start and kept in the database, so no setup is needed.
// A student picks a time; at that time (Dubai) a reminder is sent unless today's session is already done.
const webpush = require('web-push');
const db = require('./db');
const { WEEKS, weekPlan, sessionDate } = require('./plan');

db.exec(`
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS push_subs (
  endpoint TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keys TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reminders (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_sent TEXT
);`);

const TZ = 'Asia/Dubai';
const getSetting = (k) => (db.prepare('SELECT value FROM settings WHERE key=?').get(k) || {}).value;
let pub = getSetting('vapid_public'), priv = getSetting('vapid_private');
if (!pub || !priv) {
  const k = webpush.generateVAPIDKeys(); pub = k.publicKey; priv = k.privateKey;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?), (?,?)').run('vapid_public', pub, 'vapid_private', priv);
}
webpush.setVapidDetails(process.env.PUSH_CONTACT || 'mailto:admin@irmz.com', pub, priv);

const validTime = (t) => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
function dubaiNow(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

function subscribe(userId, sub, time) {
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000) return { error: 'Invalid subscription.' };
  if (!sub.keys || typeof sub.keys.p256dh !== 'string' || typeof sub.keys.auth !== 'string') return { error: 'Invalid subscription.' };
  if (!validTime(time)) return { error: 'Pick a time like 17:00.' };
  db.prepare('INSERT OR REPLACE INTO push_subs (endpoint, user_id, keys) VALUES (?,?,?)').run(sub.endpoint, userId, JSON.stringify({ p256dh: sub.keys.p256dh, auth: sub.keys.auth }));
  db.prepare('INSERT INTO reminders (user_id, time, enabled) VALUES (?,?,1) ON CONFLICT(user_id) DO UPDATE SET time=excluded.time, enabled=1').run(userId, time);
  return { ok: true };
}
function unsubscribe(userId, endpoint) {
  if (endpoint) db.prepare('DELETE FROM push_subs WHERE user_id=? AND endpoint=?').run(userId, String(endpoint));
  if (!db.prepare('SELECT 1 FROM push_subs WHERE user_id=?').get(userId)) db.prepare('UPDATE reminders SET enabled=0 WHERE user_id=?').run(userId);
  return { ok: true };
}
function settings(userId) {
  const r = db.prepare('SELECT time, enabled FROM reminders WHERE user_id=?').get(userId);
  const n = db.prepare('SELECT COUNT(*) n FROM push_subs WHERE user_id=?').get(userId).n;
  return { publicKey: pub, time: r ? r.time : '17:00', enabled: !!(r && r.enabled && n), devices: n };
}

// Today's plan session for the reminder text, and whether it is already done.
function todaySession(userId, date) {
  for (let wi = 0; wi < WEEKS.length; wi++) for (let di = 0; di < 7; di++) {
    if (sessionDate(wi, di) !== date) continue;
    const s = weekPlan(wi)[di], skey = `${wi}-${di}`;
    const run = db.prepare('SELECT done_at FROM runs WHERE user_id=? AND skey=?').get(userId, skey);
    return { s, done: !!(run && run.done_at) };
  }
  return null;
}

async function sendTo(userId, payload) {
  const subs = db.prepare('SELECT endpoint, keys FROM push_subs WHERE user_id=?').all(userId);
  let sent = 0;
  for (const x of subs) {
    try { await webpush.sendNotification({ endpoint: x.endpoint, keys: JSON.parse(x.keys) }, JSON.stringify(payload), { TTL: 3 * 3600 }); sent++; }
    catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) db.prepare('DELETE FROM push_subs WHERE endpoint=?').run(x.endpoint); // phone unsubscribed
      else console.error(`[push] send failed: ${e.statusCode || ''} ${e.message}`);
    }
  }
  return sent;
}

function reminderPayload(userId, date) {
  const t = todaySession(userId, date);
  if (t && t.done) return null;
  const what = t ? `${t.s.sub === 'Mock' ? 'Mock test' : t.s.sub === 'Mistakes' ? 'Mistakes day' : t.s.sub}: ${t.s.topic}` : 'Open the app for today\'s practice.';
  return { title: 'Time for your 30-minute session', body: what, url: '/' };
}

// Check every minute. A reminder is due once its time has passed today (within 2 hours, so a restart doesn't skip it).
async function tick(now = new Date()) {
  const { date, time } = dubaiNow(now);
  const rows = db.prepare('SELECT user_id, time FROM reminders WHERE enabled=1 AND (last_sent IS NULL OR last_sent < ?)').all(date);
  for (const r of rows) {
    const [h, m] = r.time.split(':').map(Number), [nh, nm] = time.split(':').map(Number);
    const late = nh * 60 + nm - (h * 60 + m);
    if (late < 0 || late > 120) continue;
    db.prepare('UPDATE reminders SET last_sent=? WHERE user_id=?').run(date, r.user_id);
    const p = reminderPayload(r.user_id, date);
    if (p) await sendTo(r.user_id, p);
  }
}
function start() { setInterval(() => tick().catch((e) => console.error('[push] ' + e.message)), 60e3).unref(); }

module.exports = { subscribe, unsubscribe, settings, sendTo, tick, start, dubaiNow, reminderPayload };
