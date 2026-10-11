// HTTP server: student API, admin API and static pages.
const path = require('path');
const express = require('express');
const db = require('./db');
const auth = require('./auth');
const tutor = require('./tutor');
const ai = require('./ai');
const { parseSkey, TESTS, TERM_START } = require('./plan');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '0' ? false : 1); // behind nginx

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});
app.use(express.json({ limit: '64kb' }));
app.use(auth.loadUser);

// CSRF protection: every state-changing API call must carry this header (browsers won't add it cross-site).
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' && req.get('X-Requested-With') !== 'fetch') return res.status(403).json({ error: 'Bad request.' });
  next();
});

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => { console.error(e); res.status(500).json({ error: 'Something went wrong on the server.' }); });
const send = (res, r) => (r && r.error ? res.status(400).json(r) : res.json(r || { ok: true }));

// ---------- auth ----------
app.post('/api/login', (req, res) => {
  const ip = req.ip;
  if (!auth.loginAllowed(ip)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  const u = auth.checkPassword(req.body.username, req.body.password);
  if (!u) { auth.loginFailed(ip); return res.status(401).json({ error: 'Wrong username or password.' }); }
  auth.createSession(res, u.id);
  res.json({ role: u.role, name: u.display_name });
});
app.post('/api/logout', (req, res) => { auth.destroySession(req, res); res.json({ ok: true }); });
app.get('/api/me', auth.requireUser, (req, res) => res.json({ ...req.user, today: new Date().toISOString().slice(0, 10), termStart: TERM_START }));
app.post('/api/me/password', auth.requireUser, (req, res) => {
  const { current, next } = req.body;
  if (!auth.checkPassword(req.user.username, current)) return res.status(400).json({ error: 'Current password is wrong.' });
  if (!auth.validPassword(next)) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(auth.hashPassword(next), req.user.id);
  res.json({ ok: true });
});

// ---------- student ----------
const S = auth.requireStudent;
function skeyOr400(req, res) { const p = parseSkey(req.params.skey); if (!p) res.status(400).json({ error: 'Unknown session.' }); return p; }

app.get('/api/plan', S, (req, res) => res.json({ weeks: tutor.planView(req.user.id), tests: TESTS, memory: tutor.memory(req.user.id) }));
app.get('/api/runs/:skey', S, (req, res) => { if (skeyOr400(req, res)) res.json(tutor.runView(req.user.id, req.params.skey)); });

const starting = new Set();
app.post('/api/runs/:skey/start', S, wrap(async (req, res) => {
  if (!skeyOr400(req, res)) return;
  const key = req.user.id + ':' + req.params.skey;
  if (starting.has(key)) return res.status(409).json({ error: 'This session is already being prepared.' });
  starting.add(key);
  try { await tutor.startRun(req.user.id, req.params.skey); } finally { starting.delete(key); }
  res.json(tutor.runView(req.user.id, req.params.skey));
}));
app.post('/api/runs/:skey/more', S, wrap(async (req, res) => {
  if (!skeyOr400(req, res)) return;
  const key = req.user.id + ':' + req.params.skey;
  if (starting.has(key)) return res.status(409).json({ error: 'Already adding questions.' });
  starting.add(key);
  try { await tutor.addMore(req.user.id, req.params.skey); } finally { starting.delete(key); }
  res.json(tutor.runView(req.user.id, req.params.skey));
}));
app.post('/api/runs/:skey/answer', S, (req, res) => { if (skeyOr400(req, res)) send(res, tutor.answerMcq(req.user.id, req.params.skey, String(req.body.qid), req.body.choice)); });
app.post('/api/runs/:skey/text', S, (req, res) => { if (skeyOr400(req, res)) send(res, tutor.saveText(req.user.id, req.params.skey, String(req.body.qid), req.body.text)); });
app.post('/api/runs/:skey/open', S, (req, res) => { if (skeyOr400(req, res)) send(res, tutor.openScheme(req.user.id, req.params.skey, String(req.body.qid))); });
app.post('/api/runs/:skey/ticks', S, (req, res) => { if (skeyOr400(req, res)) send(res, tutor.setTicks(req.user.id, req.params.skey, String(req.body.qid), req.body.ticks)); });
app.post('/api/runs/:skey/explain', S, wrap(async (req, res) => { if (skeyOr400(req, res)) send(res, await tutor.explain(req.user.id, req.params.skey, String(req.body.qid))); }));
app.post('/api/runs/:skey/aimark', S, wrap(async (req, res) => { if (skeyOr400(req, res)) send(res, await tutor.aiMark(req.user.id, req.params.skey, String(req.body.qid))); }));
app.post('/api/runs/:skey/done', S, (req, res) => {
  if (!skeyOr400(req, res)) return;
  if (!tutor.getRun(req.user.id, req.params.skey)) return res.status(400).json({ error: 'Start the session first.' });
  db.prepare("UPDATE runs SET done_at = CASE WHEN ? THEN datetime('now') ELSE NULL END WHERE user_id=? AND skey=?").run(req.body.done ? 1 : 0, req.user.id, req.params.skey);
  res.json({ ok: true });
});
app.post('/api/runs/:skey/reset', S, (req, res) => { if (skeyOr400(req, res)) { tutor.resetRun(req.user.id, req.params.skey); res.json(tutor.runView(req.user.id, req.params.skey)); } });
// ---------- Learn topics ----------
const { SET_NAMES, SUBJ } = require('./plan');
app.get('/api/topics/stats', S, (req, res) => res.json(tutor.topicStats(req.user.id)));
app.get('/api/topics/:id/last', S, (req, res) => {
  if (!SET_NAMES[req.params.id]) return res.status(404).json({ error: 'Unknown topic.' });
  res.json({ skey: tutor.lastTopicQuiz(req.user.id, req.params.id) });
});
app.post('/api/topics/:id/ask', S, wrap(async (req, res) => {
  const id = req.params.id;
  if (!SET_NAMES[id]) return res.status(404).json({ error: 'Unknown topic.' });
  const question = String(req.body.question || '').trim().slice(0, 600);
  if (question.length < 3) return res.status(400).json({ error: 'Type your question first.' });
  try {
    const text = await ai.askTopic(req.user.id, { subject: SUBJ[id[0]], title: String(req.body.title || SET_NAMES[id]).slice(0, 200), context: String(req.body.context || '').slice(0, 3000), question });
    res.json({ text });
  } catch (e) { res.status(400).json({ error: e.message }); }
}));

app.post('/api/flag', auth.requireUser, (req, res) => {
  const qid = String(req.body.qid || ''), note = String(req.body.note || '').slice(0, 500);
  if (!db.prepare('SELECT 1 FROM questions WHERE id=?').get(qid)) return res.status(400).json({ error: 'Unknown question.' });
  db.prepare('INSERT INTO flags (user_id, qid, note) VALUES (?,?,?)').run(req.user.id, qid, note);
  res.json({ ok: true });
});

// ---------- admin ----------
const A = auth.requireAdmin;
app.get('/api/admin/overview', A, (req, res) => {
  const students = db.prepare("SELECT id, username, display_name, active, created_at, last_seen_at FROM users WHERE role='student' ORDER BY display_name").all().map((u) => {
    const done = db.prepare('SELECT COUNT(*) n FROM runs WHERE user_id=? AND done_at IS NOT NULL').get(u.id).n;
    const wk = db.prepare("SELECT COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND choice IS NOT NULL AND updated_at >= datetime('now','-7 days')").get(u.id);
    const all = db.prepare('SELECT COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND choice IS NOT NULL').get(u.id);
    return { ...u, sessionsDone: done, week: { n: wk.n, right: wk.c || 0 }, all: { n: all.n, right: all.c || 0 }, memory: tutor.memory(u.id) };
  });
  const flags = db.prepare('SELECT COUNT(*) n FROM flags WHERE resolved=0').get().n;
  res.json({ students, flags, ai: { available: ai.available(), mock: ai.MOCK, model: ai.MODEL, monthCost: ai.monthCost(), limit: ai.MONTHLY_LIMIT_USD } });
});
app.post('/api/admin/students', A, (req, res) => {
  const { username, display_name, password } = req.body;
  if (!auth.validUsername(username)) return res.status(400).json({ error: 'Username: 3-32 letters, numbers, dot, dash or underscore.' });
  if (!display_name || String(display_name).length > 60) return res.status(400).json({ error: 'Enter a display name (max 60 characters).' });
  if (!auth.validPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  try {
    const r = db.prepare("INSERT INTO users (username, display_name, role, password_hash) VALUES (?,?,'student',?)").run(username, String(display_name), auth.hashPassword(password));
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(400).json({ error: 'That username is already taken.' }); }
});
app.patch('/api/admin/students/:id', A, (req, res) => {
  const u = db.prepare("SELECT id FROM users WHERE id=? AND role='student'").get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Student not found.' });
  const { display_name, password, active } = req.body;
  if (display_name !== undefined) db.prepare('UPDATE users SET display_name=? WHERE id=?').run(String(display_name).slice(0, 60), u.id);
  if (password !== undefined) {
    if (!auth.validPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(auth.hashPassword(password), u.id);
    db.prepare('DELETE FROM auth_sessions WHERE user_id=?').run(u.id);
  }
  if (active !== undefined) { db.prepare('UPDATE users SET active=? WHERE id=?').run(active ? 1 : 0, u.id); if (!active) db.prepare('DELETE FROM auth_sessions WHERE user_id=?').run(u.id); }
  res.json({ ok: true });
});
app.get('/api/admin/students/:id/report', A, (req, res) => {
  const u = db.prepare("SELECT id, username, display_name, last_seen_at FROM users WHERE id=? AND role='student'").get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Student not found.' });
  res.json({ student: u, ...tutor.report(u.id) });
});
app.get('/api/admin/flags', A, (req, res) => {
  res.json(db.prepare(`SELECT f.id, f.qid, f.note, f.created_at, u.display_name who, q.body, q.type, q.source, q.status FROM flags f
    JOIN questions q ON q.id=f.qid LEFT JOIN users u ON u.id=f.user_id WHERE f.resolved=0 ORDER BY f.created_at DESC`).all().map((r) => ({ ...r, body: JSON.parse(r.body) })));
});
app.post('/api/admin/flags/:id/resolve', A, (req, res) => {
  const f = db.prepare('SELECT * FROM flags WHERE id=?').get(Number(req.params.id));
  if (!f) return res.status(404).json({ error: 'Not found.' });
  if (req.body.disable) db.prepare("UPDATE questions SET status='disabled' WHERE id=?").run(f.qid);
  db.prepare('UPDATE flags SET resolved=1 WHERE qid=?').run(f.qid);
  res.json({ ok: true });
});

// ---------- pages ----------
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false, maxAge: '1h' }));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

const PORT = Number(process.env.PORT || 3100);
const HOST = process.env.HOST || '127.0.0.1';
if (require.main === module) {
  app.listen(PORT, HOST, () => console.log(`Amer Tutor running on http://${HOST}:${PORT}  (Claude: ${ai.MOCK ? 'mock' : ai.available() ? ai.MODEL : 'not configured'})`));
}
module.exports = app;
