// HTTP server: student API, admin API and static pages.
const path = require('path');
const express = require('express');
const db = require('./db');
const auth = require('./auth');
const tutor = require('./tutor');
const ai = require('./ai');
const courses = require('./courses');
const profiles = require('./profiles');
const { SUBJ } = require('./plan');

const payments = require('./payments');
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '0' ? false : 1); // behind nginx

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});
// Payment webhooks use the raw request body for signature verification.
app.post('/webhooks/stripe',express.raw({type:'application/json',limit:'128kb'}),(req,res)=>{
 try{
  const event=payments.verifiedEvent(req.body,req.get('stripe-signature'));
  if(!event)return res.status(400).send('Invalid signature');
  payments.recordPayment(event);
  res.json({received:true});
 }catch(e){console.error('Stripe webhook error:',e);res.status(500).send('Webhook failed');}
});
// Small JSON bodies everywhere, except photo uploads of handwritten working.
const jsonSmall = express.json({ limit: '64kb' }), jsonPhoto = express.json({ limit: '4mb' });
app.use((req, res, next) => (/^\/api\/runs\/[^/]+\/photo$/.test(req.path) ? jsonPhoto : jsonSmall)(req, res, next));
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
app.get('/api/me', auth.requireUser, (req, res) => {
  const C = req.user.role === 'student' ? courses.forUser(req.user.id) : null;
  const p = req.user.role === 'student' ? profiles.get(req.user.id) : null;
  res.json({ ...req.user, today: new Date().toISOString().slice(0, 10), termStart: C ? C.TERM_START : null,
    course: C ? C.summary() : null, profile: p && { school: p.school, programme: p.programme, grade: p.grade, class_name: p.class_name } });
});
app.post('/api/me/password', auth.requireUser, (req, res) => {
  const { current, next } = req.body;
  if (!auth.checkPassword(req.user.username, current)) return res.status(400).json({ error: 'Current password is wrong.' });
  if (!auth.validPassword(next)) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(auth.hashPassword(next), req.user.id);
  res.json({ ok: true });
});

// ---------- student ----------
const S = auth.requireStudent;
const prefs = require('./prefs');
app.get('/api/me/prefs', S, (req, res) => res.json(prefs.get(req.user.id)));
app.post('/api/me/prefs', S, (req, res) => send(res, prefs.set(req.user.id, req.body || {})));
function skeyOr400(req, res) {
  const C = courses.forUser(req.user.id);
  const p = C ? C.parseSkey(req.params.skey) : null;
  if (!p) res.status(400).json({ error: C ? 'Unknown session.' : 'No study plan is set up for this account yet.' });
  return p;
}

app.get('/api/plan', S, (req, res) => {
  const C = courses.forUser(req.user.id);
  res.json({ weeks: tutor.planView(req.user.id), tests: C ? C.TESTS : [], memory: tutor.memory(req.user.id), course: C ? C.summary() : null });
});
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
// Daily reminder notifications
const push = require('./push');
app.get('/api/push/settings', S, (req, res) => res.json(push.settings(req.user.id)));
app.post('/api/push/subscribe', S, (req, res) => send(res, push.subscribe(req.user.id, req.body.subscription, req.body.time)));
app.post('/api/push/unsubscribe', S, (req, res) => send(res, push.unsubscribe(req.user.id, req.body.endpoint)));
app.post('/api/push/test', S, wrap(async (req, res) => {
  const n = await push.sendTo(req.user.id, { title: 'Reminders are on', body: 'You will get a reminder at your study time each day.', url: '/' });
  send(res, n ? { ok: true, sent: n } : { error: 'No device is subscribed yet.' });
}));
app.post('/api/runs/:skey/photo', S, wrap(async (req, res) => { if (skeyOr400(req, res)) send(res, await tutor.photoMark(req.user.id, req.params.skey, String(req.body.qid), req.body.image)); }));
app.post('/api/runs/:skey/aimark', S, wrap(async (req, res) => { if (skeyOr400(req, res)) send(res, await tutor.aiMark(req.user.id, req.params.skey, String(req.body.qid))); }));
app.post('/api/runs/:skey/done', S, (req, res) => {
  if (!skeyOr400(req, res)) return;
  if (!tutor.getRun(req.user.id, req.params.skey)) return res.status(400).json({ error: 'Start the session first.' });
  db.prepare("UPDATE runs SET done_at = CASE WHEN ? THEN datetime('now') ELSE NULL END WHERE user_id=? AND skey=?").run(req.body.done ? 1 : 0, req.user.id, req.params.skey);
  res.json({ ok: true });
});
app.post('/api/runs/:skey/reset', S, (req, res) => { if (skeyOr400(req, res)) { tutor.resetRun(req.user.id, req.params.skey); res.json(tutor.runView(req.user.id, req.params.skey)); } });
// ---------- Learn topics ----------
// Learn topics belong to a course (course.learn); a topic id is one of the course's set codes.
const topicOk = (req) => { const C = courses.forUser(req.user.id); return !!(C && C.learn && C.SET_NAMES[req.params.id]); };
app.get('/api/topics/stats', S, (req, res) => res.json(tutor.topicStats(req.user.id)));
app.get('/api/topics/:id/last', S, (req, res) => {
  if (!topicOk(req)) return res.status(404).json({ error: 'Unknown topic.' });
  res.json({ skey: tutor.lastTopicQuiz(req.user.id, req.params.id) });
});
app.post('/api/topics/:id/ask', S, wrap(async (req, res) => {
  const id = req.params.id;
  if (!topicOk(req)) return res.status(404).json({ error: 'Unknown topic.' });
  const SET_NAMES = courses.forUser(req.user.id).SET_NAMES;
  const question = String(req.body.question || '').trim().slice(0, 600);
  if (question.length < 3) return res.status(400).json({ error: 'Type your question first.' });
  const off = prefs.aiOffReason(req.user.id);
  if (off) return res.status(400).json({ error: off + '.' });
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

// ---------- Teacher / Parent marketplace (phase 1) ----------
const T = auth.requireTeacher, P = auth.requireParent;
const validId = (v) => Number.isSafeInteger(Number(v)) && Number(v) > 0;
const linked = (teacher, student) => !!db.prepare('SELECT 1 FROM teacher_students WHERE teacher_id=? AND student_id=?').get(teacher, student);
const parentOf = (parent, student) => !!db.prepare('SELECT 1 FROM parent_students WHERE parent_id=? AND student_id=?').get(parent, student);
const publicTeacher = (u) => ({ ...u, subjects: JSON.parse(u.subjects), grades: JSON.parse(u.grades), curricula: JSON.parse(u.curricula), languages: JSON.parse(u.languages) });
app.get('/api/teachers', auth.requireUser, (req, res) => res.json(db.prepare(`SELECT u.id, u.display_name, t.bio, t.subjects, t.grades, t.curricula, t.languages, t.rate_45_aed, t.rate_60_aed
  FROM teacher_profiles t JOIN users u ON u.id=t.user_id WHERE t.approved=1 AND u.active=1 AND u.role='teacher' ORDER BY u.display_name`).all().map(publicTeacher)));
app.get('/api/teacher/me', T, (req, res) => {
  const profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id=?').get(req.user.id);
  const students = db.prepare(`SELECT DISTINCT u.id,u.display_name,u.grade,u.programme FROM teacher_students ts JOIN users u ON u.id=ts.student_id WHERE ts.teacher_id=? AND u.role='student' AND u.active=1`).all(req.user.id);
  res.json({ profile: profile ? publicTeacher(profile) : null, students });
});
app.put('/api/teacher/profile', T, (req, res) => {
  const b = req.body || {}, rate = (v) => v == null || v === '' ? null : Number(v);
  const r45 = rate(b.rate_45_aed), r60 = rate(b.rate_60_aed);
  if ([r45,r60].some((v) => v !== null && (!Number.isSafeInteger(v) || v < 0 || v > 100000))) return res.status(400).json({ error: 'Rates must be whole AED amounts from 0 to 100000.' });
  const list = (key) => Array.isArray(b[key]) && b[key].length <= 30 && b[key].every((v) => typeof v === 'string' && v.length <= 80) ? JSON.stringify(b[key]) : null;
  const subjects = list('subjects'), grades = list('grades'), curricula = list('curricula'), languages = list('languages');
  if ([subjects,grades,curricula,languages].some((v) => v === null) || typeof b.bio !== 'string' || b.bio.length > 2000) return res.status(400).json({ error: 'Invalid profile.' });
  db.prepare(`INSERT INTO teacher_profiles (user_id,bio,subjects,grades,curricula,languages,rate_45_aed,rate_60_aed,approved)
    VALUES (?,?,?,?,?,?,?,?,0) ON CONFLICT(user_id) DO UPDATE SET bio=excluded.bio,subjects=excluded.subjects,grades=excluded.grades,curricula=excluded.curricula,languages=excluded.languages,rate_45_aed=excluded.rate_45_aed,rate_60_aed=excluded.rate_60_aed,approved=0`).run(req.user.id,b.bio,subjects,grades,curricula,languages,r45,r60);
  res.json({ ok:true, approved:false, message:'Profile updated; admin approval required.' });
});
app.get('/api/parent/children', P, (req,res) => res.json(db.prepare(`SELECT u.id,u.display_name,u.grade,u.programme FROM parent_students ps JOIN users u ON u.id=ps.student_id WHERE ps.parent_id=? AND u.role='student'`).all(req.user.id)));
app.get('/api/parent/children/:id/progress', P, (req,res) => {
  if (!validId(req.params.id) || !parentOf(req.user.id,Number(req.params.id))) return res.status(404).json({ error:'Child not found.' });
  const id=Number(req.params.id);
  const totals=db.prepare('SELECT COUNT(*) answered, COALESCE(SUM(correct),0) correct FROM answers WHERE user_id=? AND choice IS NOT NULL').get(id);
  const sessions=db.prepare('SELECT COUNT(*) completed FROM runs WHERE user_id=? AND done_at IS NOT NULL').get(id);
  res.json({ ...totals,...sessions });
});
app.get('/api/teacher/students/:id/progress', T, (req,res) => {
  if (!validId(req.params.id) || !linked(req.user.id,Number(req.params.id))) return res.status(404).json({ error:'Student not found.' });
  const id=Number(req.params.id);
  const totals=db.prepare('SELECT COUNT(*) answered, COALESCE(SUM(correct),0) correct FROM answers WHERE user_id=? AND choice IS NOT NULL').get(id);
  const sessions=db.prepare('SELECT COUNT(*) completed FROM runs WHERE user_id=? AND done_at IS NOT NULL').get(id);
  res.json({ ...totals,...sessions });
});
app.get('/api/student/materials', S, (req,res) => res.json(db.prepare(`SELECT m.id,m.kind,m.title,m.body,m.due_at,m.created_at,u.display_name teacher FROM teacher_materials m JOIN users u ON u.id=m.teacher_id WHERE m.student_id=? AND u.active=1 ORDER BY m.created_at DESC LIMIT 100`).all(req.user.id)));
app.post('/api/teacher/materials', T, (req,res) => {
  const b=req.body||{}, id=Number(b.student_id);
  if (!validId(id) || !linked(req.user.id,id)) return res.status(403).json({ error:'Student is not assigned to you.' });
  if (!['lesson','assignment','exam'].includes(b.kind) || typeof b.title !== 'string' || !b.title.trim() || b.title.length>160 || typeof b.body !== 'string' || !b.body.trim() || b.body.length>20000) return res.status(400).json({ error:'Invalid material.' });
  const due=b.due_at == null || b.due_at === '' ? null : String(b.due_at);
  if (due && !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(due)) return res.status(400).json({ error:'Invalid due date.' });
  const result=db.prepare('INSERT INTO teacher_materials (teacher_id,student_id,kind,title,body,due_at) VALUES (?,?,?,?,?,?)').run(req.user.id,id,b.kind,b.title.trim(),b.body.trim(),due);
  res.status(201).json({ id:result.lastInsertRowid });
});
app.get('/api/student/teachers', S, (req,res) => res.json(db.prepare(`SELECT DISTINCT u.id,u.display_name FROM teacher_students ts JOIN users u ON u.id=ts.teacher_id WHERE ts.student_id=? AND u.active=1`).all(req.user.id)));
app.get('/api/messages/:studentId/:teacherId', auth.requireUser, (req,res) => {
  const sid=Number(req.params.studentId),tid=Number(req.params.teacherId);
  if (!validId(sid) || !validId(tid) || !linked(tid,sid) || !(req.user.role==='admin' || req.user.role==='student' && req.user.id===sid || req.user.role==='teacher' && req.user.id===tid)) return res.status(403).json({ error:'Not allowed.' });
  res.json(db.prepare('SELECT id,sender_id,body,created_at FROM teacher_messages WHERE student_id=? AND teacher_id=? ORDER BY id DESC LIMIT 100').all(sid,tid).reverse());
});
app.post('/api/messages/:studentId/:teacherId', auth.requireUser, (req,res) => {
  const sid=Number(req.params.studentId),tid=Number(req.params.teacherId);
  if (!validId(sid) || !validId(tid) || !linked(tid,sid) || !(req.user.role==='student' && req.user.id===sid || req.user.role==='teacher' && req.user.id===tid)) return res.status(403).json({ error:'Not allowed.' });
  const body=req.body && req.body.body;
  if (typeof body!=='string' || !body.trim() || body.length>2000) return res.status(400).json({ error:'Message must be 1–2000 characters.' });
  const result=db.prepare('INSERT INTO teacher_messages (teacher_id,student_id,sender_id,body) VALUES (?,?,?,?)').run(tid,sid,req.user.id,body.trim());
  res.status(201).json({ id:result.lastInsertRowid });
});

// ---------- admin ----------
const A = auth.requireAdmin;
app.post('/api/parent/bookings',P,(req,res)=>{
 const b=req.body||{},sid=Number(b.student_id),tid=Number(b.teacher_id),minutes=Number(b.minutes);
 if(!validId(sid)||!validId(tid)||!parentOf(req.user.id,sid)||![45,60].includes(minutes))return res.status(403).json({error:'Invalid booking request.'});
 if(typeof b.start_at!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(b.start_at))return res.status(400).json({error:'Invalid date.'});
 const start=Date.parse(b.start_at+'+04:00');
 if(!Number.isFinite(start)||start<Date.now()+3600000)return res.status(400).json({error:'Choose a future Dubai time.'});
 const t=db.prepare('SELECT t.* FROM teacher_profiles t JOIN users u ON u.id=t.user_id WHERE t.user_id=? AND t.approved=1 AND u.active=1').get(tid);
 if(!t)return res.status(404).json({error:'Teacher not available.'});
 const amount=minutes===45?t.rate_45_aed:t.rate_60_aed;
 if(!Number.isSafeInteger(amount)||amount<0)return res.status(400).json({error:'Rate not set.'});
 const conflicts=db.prepare("SELECT start_at,minutes FROM lesson_bookings WHERE teacher_id=? AND status IN ('requested','confirmed')").all(tid);
 if(conflicts.some(x=>{const a=Date.parse(x.start_at+'+04:00');return start<a+x.minutes*60000&&a<start+minutes*60000;}))return res.status(409).json({error:'Time slot unavailable.'});
 const id=db.prepare('INSERT INTO lesson_bookings(parent_id,student_id,teacher_id,start_at,minutes,amount_aed) VALUES(?,?,?,?,?,?)').run(req.user.id,sid,tid,b.start_at,minutes,amount).lastInsertRowid;
 res.status(201).json({id,status:'requested',amount_aed:amount,payment_status:'unpaid'});
});
app.post('/api/teacher/bookings/:id/confirm',T,(req,res)=>{
 const row=db.prepare('SELECT id FROM lesson_bookings WHERE id=? AND teacher_id=? AND status=?').get(Number(req.params.id),req.user.id,'requested');
 if(!row)return res.status(409).json({error:'Booking not available for confirmation.'});
 db.prepare('UPDATE lesson_bookings SET status=? WHERE id=?').run('confirmed',row.id);
 res.json({ok:true,status:'confirmed'});
});
app.post('/api/parent/bookings/:id/checkout',P,wrap(async(req,res)=>{
 const booking=db.prepare('SELECT * FROM lesson_bookings WHERE id=? AND parent_id=?').get(Number(req.params.id),req.user.id);
 if(!booking)return res.status(404).json({error:'Booking not found.'});
 if(booking.status!=='confirmed'||booking.payment_status==='paid')return res.status(409).json({error:'Booking must be confirmed and unpaid.'});
 if(!payments.configured())return res.status(503).json({error:'Online payment is not configured yet.'});
 const result=await payments.checkout(booking);
 db.prepare("UPDATE lesson_bookings SET payment_status='pending' WHERE id=? AND payment_status='unpaid'").run(booking.id);
 res.json({url:result.url});
}));
app.get('/api/parent/bookings',P,(req,res)=>res.json(db.prepare('SELECT * FROM lesson_bookings WHERE parent_id=? ORDER BY start_at DESC LIMIT 100').all(req.user.id)));
app.get('/api/teacher/bookings',T,(req,res)=>res.json(db.prepare('SELECT * FROM lesson_bookings WHERE teacher_id=? ORDER BY start_at DESC LIMIT 100').all(req.user.id)));
app.get('/api/admin/bookings',A,(req,res)=>res.json(db.prepare('SELECT * FROM lesson_bookings ORDER BY id DESC LIMIT 200').all()));
app.get('/api/admin/overview', A, (req, res) => {
  const students = db.prepare(`SELECT u.id, u.username, u.display_name, u.active, u.created_at, u.last_seen_at, u.programme, u.grade, u.class_name, u.course_id, s.name school
    FROM users u LEFT JOIN schools s ON s.id = u.school_id WHERE u.role='student' ORDER BY s.name, u.grade, u.display_name`).all().map((u) => {
    const done = db.prepare('SELECT COUNT(*) n FROM runs WHERE user_id=? AND done_at IS NOT NULL').get(u.id).n;
    const wk = db.prepare("SELECT COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND choice IS NOT NULL AND updated_at >= datetime('now','-7 days')").get(u.id);
    const all = db.prepare('SELECT COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND choice IS NOT NULL').get(u.id);
    return { ...u, sessionsDone: done, week: { n: wk.n, right: wk.c || 0 }, all: { n: all.n, right: all.c || 0 }, memory: tutor.memory(u.id) };
  });
  const flags = db.prepare('SELECT COUNT(*) n FROM flags WHERE resolved=0').get().n;
  res.json({ students, flags, billing: billing.get(), aiGlobal: prefs.globalOn(), ai: { available: ai.available(), mock: ai.MOCK, model: ai.MODEL, models: ai.MODELS, monthCost: ai.monthCost(), limit: ai.MONTHLY_LIMIT_USD } });
});
app.post('/api/admin/accounts', A, (req,res) => {
  const b=req.body||{};
  if (!['teacher','parent'].includes(b.role) || !auth.validUsername(b.username) || !auth.validPassword(b.password) || typeof b.display_name!=='string' || !b.display_name.trim() || b.display_name.length>60) return res.status(400).json({ error:'Invalid account details.' });
  if (db.prepare('SELECT 1 FROM users WHERE username=?').get(b.username)) return res.status(409).json({ error:'Username already taken.' });
  const result=db.transaction(() => {
    const id=db.prepare('INSERT INTO users (username,display_name,role,password_hash) VALUES (?,?,?,?)').run(b.username,b.display_name.trim(),b.role,auth.hashPassword(b.password)).lastInsertRowid;
    if (b.role==='teacher') db.prepare('INSERT INTO teacher_profiles (user_id) VALUES (?)').run(id);
    return id;
  })();
  res.status(201).json({ id:result });
});
app.get('/api/admin/accounts', A, (req,res) => res.json(db.prepare(`SELECT u.id,u.username,u.display_name,u.role,u.active,t.approved FROM users u LEFT JOIN teacher_profiles t ON t.user_id=u.id WHERE u.role IN ('teacher','parent') ORDER BY u.role,u.display_name`).all()));
app.post('/api/admin/teachers/:id/approve', A, (req,res) => {
  const result=db.prepare(`UPDATE teacher_profiles SET approved=? WHERE user_id=? AND EXISTS (SELECT 1 FROM users WHERE id=? AND role='teacher')`).run(req.body && req.body.approved===true ? 1:0,Number(req.params.id),Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error:'Teacher not found.' });
  res.json({ ok:true });
});
app.post('/api/admin/links', A, (req,res) => {
  const b=req.body||{}, actor=Number(b.actor_id),student=Number(b.student_id);
  if (!['teacher','parent'].includes(b.role) || !validId(actor) || !validId(student)) return res.status(400).json({ error:'Invalid link.' });
  const users=db.prepare('SELECT id,role FROM users WHERE id IN (?,?) AND active=1').all(actor,student);
  if (!users.some((u)=>u.id===actor && u.role===b.role) || !users.some((u)=>u.id===student && u.role==='student')) return res.status(400).json({ error:'Account roles do not match.' });
  if (b.role==='parent') db.prepare('INSERT OR IGNORE INTO parent_students (parent_id,student_id) VALUES (?,?)').run(actor,student);
  else { const subject=typeof b.subject==='string' ? b.subject.trim().slice(0,80):'';db.prepare('INSERT OR IGNORE INTO teacher_students (teacher_id,student_id,subject) VALUES (?,?,?)').run(actor,student,subject); }
  res.json({ ok:true });
});
app.get('/api/admin/options', A, (req, res) => res.json(profiles.options()));
const billing = require('./billing');
app.get('/api/admin/billing', A, (req, res) => res.json(billing.get()));
app.put('/api/admin/billing', A, (req, res) => send(res, billing.set(req.body || {})));
app.put('/api/admin/ai-global', A, (req, res) => res.json(prefs.setGlobal(!!(req.body || {}).on)));
app.post('/api/admin/students/:id/plan', A, (req, res) => send(res, billing.setPlan(Number(req.params.id), String(req.body.plan || ''))));
app.post('/api/admin/schools', A, (req, res) => send(res, profiles.createSchool(req.body.name, req.body.kind)));
app.post('/api/admin/students', A, (req, res) => {
  const { username, display_name, password } = req.body;
  if (!auth.validUsername(username)) return res.status(400).json({ error: 'Username: 3-32 letters, numbers, dot, dash or underscore.' });
  if (!display_name || String(display_name).length > 60) return res.status(400).json({ error: 'Enter a display name (max 60 characters).' });
  if (!auth.validPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (db.prepare('SELECT 1 FROM users WHERE username=?').get(username)) return res.status(400).json({ error: 'That username is already taken.' });
  // The study profile is checked before the account is created, so a bad grade or subject never leaves half an account.
  const check = require('./programmes').validate(req.body.profile || {});
  if (check.error) return res.status(400).json(check);
  const r = db.transaction(() => {
    const id = db.prepare("INSERT INTO users (username, display_name, role, password_hash) VALUES (?,?,'student',?)").run(username, String(display_name), auth.hashPassword(password)).lastInsertRowid;
    const p = profiles.set(id, req.body.profile || {});
    if (p.error) throw Object.assign(new Error(p.error), { userError: true });
    return { id };
  });
  try { res.json(r()); } catch (e) { if (e.userError) return res.status(400).json({ error: e.message }); throw e; }
});
app.put('/api/admin/students/:id/profile', A, (req, res) => {
  const u = db.prepare("SELECT id FROM users WHERE id=? AND role='student'").get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Student not found.' });
  send(res, profiles.set(u.id, req.body || {}));
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
  const u = db.prepare("SELECT id, username, display_name, last_seen_at, ai_allowed, plan FROM users WHERE id=? AND role='student'").get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Student not found.' });
  res.json({ student: u, prefs: prefs.get(u.id), profile: profiles.get(u.id), ...tutor.report(u.id) });
});
app.post('/api/admin/students/:id/ai', A, (req, res) => send(res, prefs.setAllowed(Number(req.params.id), !!req.body.allowed)));
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
// Weekly report for the parent (Persian). Admin login, or ?token=REPORT_TOKEN (used by the Friday email task).
const weekly = require('./weekly');
app.get('/report/weekly', (req, res) => {
  const tok = process.env.REPORT_TOKEN || '', given = typeof req.query.token === 'string' ? req.query.token : '';
  const tokenOk = tok.length >= 24 && given.length === tok.length && require('crypto').timingSafeEqual(Buffer.from(given), Buffer.from(tok));
  if (!tokenOk && !(req.user && req.user.role === 'admin')) return res.status(404).send('Not found');
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" });
  const r = weekly.build();
  if (req.query.format === 'json') return res.json(r);
  res.type('html').send(`<!doctype html><html lang="fa"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weekly report</title></head><body>${weekly.html(r)}</body></html>`);
});

// Pages link scripts/styles with ?v=<hash of their contents>, so browsers fetch new code right after an update
// instead of using a cached copy for up to an hour.
const PUB = path.join(__dirname, '..', 'public');
const ASSET_V = require('crypto').createHash('sha1')
  .update(require('fs').readdirSync(PUB).filter((f) => /\.(js|css)$/.test(f)).sort().map((f) => require('fs').readFileSync(path.join(PUB, f))).join('|'))
  .digest('hex').slice(0, 10);
const pageCache = {};
function sendPage(res, file) {
  if (!pageCache[file]) pageCache[file] = require('fs').readFileSync(path.join(PUB, file), 'utf8').replace(/(src|href)="\/([\w.-]+\.(?:js|css))"/g, `$1="/$2?v=${ASSET_V}"`);
  res.set('Cache-Control', 'no-cache').type('html').send(pageCache[file]);
}
app.get('/admin', (req, res) => sendPage(res, 'admin.html'));
app.get('/portal', (req, res) => sendPage(res, 'portal.html'));
app.get('/', (req, res) => sendPage(res, 'index.html'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

const PORT = Number(process.env.PORT || 3100);
const HOST = process.env.HOST || '127.0.0.1';
if (require.main === module) {
  app.listen(PORT, HOST, () => console.log(`Amer Tutor running on http://${HOST}:${PORT}  (Claude: ${ai.MOCK ? 'mock' : ai.available() ? Object.entries(ai.MODELS).map(([k, m]) => k + '=' + m).join(', ') : 'not configured'})`));
  push.start();
}
module.exports = app;
