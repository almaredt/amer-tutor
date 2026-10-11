// The tutoring engine: builds each session's questions, applies spaced repetition, records answers.
const crypto = require('crypto');
const db = require('./db');
const ai = require('./ai');
const prefs = require('./prefs');
const { parseSkey, subjectsOf, addDays, skeyLabel, weekPlan, sessionDate, WEEKS, DAYS, TESTS, SET_NAMES } = require('./plan');

const NM = 10, NW = 5, REV_M = 3, REV_W = 1;
// Leitner boxes: wrong → box 1 (due next day); each right answer moves up: box 2 (+3 days), box 3 (+7 days), box 4 = learned.
const GAP = [0, 1, 3, 7];

const getQ = db.prepare('SELECT * FROM questions WHERE id = ?');
function question(id) { const r = getQ.get(id); return r ? { ...r, body: JSON.parse(r.body) } : null; }

// ---------- spaced repetition ----------
function applySRS(prev, correct, skey, date) {
  if (!correct) return { box: 1, due: addDays(date, 1), first_skey: prev ? prev.first_skey : skey, wrong: (prev ? prev.wrong : 0) + 1, learned_skey: null };
  if (!prev || prev.learned_skey) return prev || null;
  const box = prev.box + 1;
  return box >= 4 ? { ...prev, box, learned_skey: skey } : { ...prev, box, due: addDays(date, GAP[box]) };
}
// Results can change within a session (e.g. ticking mark-scheme boxes), so always recompute from the
// state the item had when the session first touched it.
function record(userId, skey, date, qid, correct) {
  let snap = db.prepare('SELECT prev FROM srs_snap WHERE user_id=? AND skey=? AND qid=?').get(userId, skey, qid);
  if (!snap) {
    const cur = db.prepare('SELECT box, due, first_skey, wrong, learned_skey FROM srs WHERE user_id=? AND qid=?').get(userId, qid);
    db.prepare('INSERT INTO srs_snap (user_id, skey, qid, prev) VALUES (?,?,?,?)').run(userId, skey, qid, cur ? JSON.stringify(cur) : null);
    snap = { prev: cur ? JSON.stringify(cur) : null };
  }
  const next = applySRS(snap.prev ? JSON.parse(snap.prev) : null, correct, skey, date);
  if (next) db.prepare(`INSERT INTO srs (user_id, qid, box, due, first_skey, wrong, learned_skey) VALUES (@u,@q,@box,@due,@first_skey,@wrong,@learned_skey)
    ON CONFLICT(user_id, qid) DO UPDATE SET box=excluded.box, due=excluded.due, first_skey=excluded.first_skey, wrong=excluded.wrong, learned_skey=excluded.learned_skey`)
    .run({ u: userId, q: qid, ...next });
  else db.prepare('DELETE FROM srs WHERE user_id=? AND qid=?').run(userId, qid);
}

// ---------- building a session ----------
function dueItems(userId, session, skey, date, wi) {
  const subs = subjectsOf(session);
  const rows = db.prepare(`SELECT s.qid, s.due, s.first_skey, q.subject, q.type FROM srs s JOIN questions q ON q.id = s.qid
    WHERE s.user_id = ? AND s.learned_skey IS NULL AND s.first_skey != ? AND q.status = 'active' ORDER BY s.due`).all(userId, skey);
  if (session.kind === 'fix') return rows.filter((r) => (r.first_skey[0] === 't' ? wi : Number(r.first_skey.split('-')[0])) <= wi);
  return rows.filter((r) => r.due <= date && subs.includes(r.subject));
}
function bankPool(userId, session, type, exclude = []) {
  if (!session.sets.length) return [];
  const ph = session.sets.map(() => '?').join(',');
  let ids = db.prepare(`SELECT q.id FROM questions q WHERE q.set_code IN (${ph}) AND q.type = ? AND q.source = 'bank' AND q.status = 'active'
    AND q.id NOT IN (SELECT qid FROM seen WHERE user_id = ?) ORDER BY q.set_code, CAST(substr(q.id, 4) AS INTEGER)`).all(...session.sets, type, userId).map((r) => r.id);
  ids = ids.filter((id) => !exclude.includes(id));
  if (session.kind === 'practice' || session.kind === 'mock') ids.reverse();
  if (session.sets.length > 1) ids = shuffle(ids, session.sets.join('').length * 7 + userId);
  return ids;
}
function shuffle(a, seed) {
  const b = a.slice(); let s = seed;
  const r = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
function proposal(userId, skey) {
  const p = parseSkey(skey); const { session, date, w } = p;
  const due = dueItems(userId, session, skey, date, w);
  const dueM = due.filter((r) => r.type === 'm').map((r) => r.qid), dueW = due.filter((r) => r.type === 'w').map((r) => r.qid);
  if (session.kind === 'fix') return { rev: { m: dueM.slice(0, 15), w: dueW.slice(0, 6) }, bank: { m: [], w: [] }, ai: { m: 0, w: 0 } };
  const rm = dueM.slice(0, REV_M), rw = dueW.slice(0, REV_W);
  const bm = bankPool(userId, session, 'm').slice(0, NM - rm.length), bw = bankPool(userId, session, 'w').slice(0, NW - rw.length);
  return { rev: { m: rm, w: rw }, bank: { m: bm, w: bw }, ai: { m: NM - rm.length - bm.length, w: NW - rw.length - bw.length } };
}

async function addAiQuestions(userId, session, nm, nw) {
  const subject = subjectsOf(session).join(' and ');
  const avoid = db.prepare(`SELECT body FROM questions WHERE (set_code IN (${session.sets.map(() => '?').join(',') || "''"}) OR topic = ?) AND type='m' LIMIT 60`)
    .all(...session.sets, session.topic).map((r) => JSON.parse(r.body).q);
  const g = await ai.generateQuestions(userId, { subject, topic: session.topic, nm, nw, avoid });
  const ins = db.prepare(`INSERT INTO questions (id, subject, set_code, topic, type, body, source, created_for) VALUES (?,?,?,?,?,?,'ai',?)`);
  const mainSubject = subjectsOf(session)[0];
  const out = { m: [], w: [] };
  const mkId = () => 'G' + crypto.randomBytes(6).toString('hex');
  db.transaction(() => {
    g.mcq.forEach((q) => { const id = mkId(); ins.run(id, mainSubject, session.sets[0] || null, session.topic, 'm', JSON.stringify({ q: q.q, options: q.options.map(String), answer: q.answer, explanation: String(q.explanation || '') }), userId); out.m.push(id); });
    g.written.forEach((q) => { const id = mkId(); ins.run(id, mainSubject, session.sets[0] || null, session.topic, 'w', JSON.stringify({ q: q.q, points: q.points.map(String).slice(0, 5) }), userId); out.w.push(id); });
  })();
  return out;
}

const getRun = (userId, skey) => {
  const r = db.prepare('SELECT * FROM runs WHERE user_id=? AND skey=?').get(userId, skey);
  return r ? { ...r, list: JSON.parse(r.list), rev: JSON.parse(r.rev) } : null;
};

async function startRun(userId, skey) {
  const p = parseSkey(skey);
  if (getRun(userId, skey)) return;
  const prop = proposal(userId, skey);
  const list = { m: [...prop.rev.m, ...prop.bank.m], w: [...prop.rev.w, ...prop.bank.w] };
  const rev = [...prop.rev.m, ...prop.rev.w];
  // Save the run first so a slow or failed Claude call never loses the session.
  db.transaction(() => {
    db.prepare('INSERT INTO runs (user_id, skey, date, list, rev) VALUES (?,?,?,?,?)').run(userId, skey, p.date, JSON.stringify(list), JSON.stringify(rev));
    const s = db.prepare('INSERT OR IGNORE INTO seen (user_id, qid, skey) VALUES (?,?,?)');
    [...prop.bank.m, ...prop.bank.w].forEach((id) => s.run(userId, id, skey));
  })();
  if (prop.ai.m + prop.ai.w > 0) await fillWithAi(userId, skey, prop.ai.m, prop.ai.w);
}

async function fillWithAi(userId, skey, nm, nw) {
  const { session } = parseSkey(skey);
  let err = null;
  const off = prefs.aiOffReason(userId);
  if (off) err = off + ', so only question-bank questions are here.';
  else {
    try {
      const g = await addAiQuestions(userId, session, nm, nw);
      const run = getRun(userId, skey);
      run.list.m.push(...g.m); run.list.w.push(...g.w);
      db.prepare('UPDATE runs SET list=? WHERE user_id=? AND skey=?').run(JSON.stringify(run.list), userId, skey);
    } catch (e) { err = e.message || 'Claude could not write new questions.'; }
  }
  db.prepare('UPDATE runs SET ai_error=? WHERE user_id=? AND skey=?').run(err, userId, skey);
}

async function addMore(userId, skey) {
  const run = getRun(userId, skey); const { session } = parseSkey(skey);
  if (!run || session.kind === 'fix') return;
  const short = run.list.m.length < NM || run.list.w.length < NW;
  const needM = short ? Math.max(0, NM - run.list.m.length) : 4, needW = short ? Math.max(0, NW - run.list.w.length) : 1;
  const bm = bankPool(userId, session, 'm', run.list.m).slice(0, needM), bw = bankPool(userId, session, 'w', run.list.w).slice(0, needW);
  run.list.m.push(...bm); run.list.w.push(...bw);
  db.prepare('UPDATE runs SET list=? WHERE user_id=? AND skey=?').run(JSON.stringify(run.list), userId, skey);
  const s = db.prepare('INSERT OR IGNORE INTO seen (user_id, qid, skey) VALUES (?,?,?)');
  [...bm, ...bw].forEach((id) => s.run(userId, id, skey));
  if (needM - bm.length + needW - bw.length > 0) await fillWithAi(userId, skey, needM - bm.length, needW - bw.length);
}

function resetRun(userId, skey) {
  db.transaction(() => {
    for (const s of db.prepare('SELECT qid, prev FROM srs_snap WHERE user_id=? AND skey=?').all(userId, skey)) {
      if (s.prev) { const p = JSON.parse(s.prev); db.prepare('INSERT OR REPLACE INTO srs (user_id, qid, box, due, first_skey, wrong, learned_skey) VALUES (?,?,?,?,?,?,?)').run(userId, s.qid, p.box, p.due, p.first_skey, p.wrong, p.learned_skey); }
      else db.prepare('DELETE FROM srs WHERE user_id=? AND qid=?').run(userId, s.qid);
    }
    db.prepare('DELETE FROM srs_snap WHERE user_id=? AND skey=?').run(userId, skey);
    db.prepare('DELETE FROM answers WHERE user_id=? AND skey=?').run(userId, skey);
    db.prepare('DELETE FROM explanations WHERE user_id=? AND skey=?').run(userId, skey);
  })();
}

// ---------- answering ----------
function inRun(run, qid, type) { return run && run.list[type].includes(qid); }
const getAns = (u, s, q) => db.prepare('SELECT * FROM answers WHERE user_id=? AND skey=? AND qid=?').get(u, s, q);
function upsertAnswer(u, s, q, fields) {
  const cur = getAns(u, s, q) || { choice: null, text: null, opened: 0, ticks: null, correct: null };
  const n = { ...cur, ...fields };
  db.prepare(`INSERT INTO answers (user_id, skey, qid, choice, text, opened, ticks, correct, updated_at) VALUES (?,?,?,?,?,?,?,?,datetime('now'))
    ON CONFLICT(user_id, skey, qid) DO UPDATE SET choice=excluded.choice, text=excluded.text, opened=excluded.opened, ticks=excluded.ticks, correct=excluded.correct, updated_at=excluded.updated_at`)
    .run(u, s, q, n.choice, n.text, n.opened, n.ticks, n.correct);
}

function answerMcq(userId, skey, qid, choice) {
  const run = getRun(userId, skey);
  if (!inRun(run, qid, 'm')) return { error: 'That question is not in this session.' };
  if (!Number.isInteger(choice) || choice < 0 || choice > 3) return { error: 'Invalid choice.' };
  const prev = getAns(userId, skey, qid);
  if (prev && prev.choice !== null) return { error: 'Already answered.' };
  const q = question(qid); const correct = choice === q.body.answer;
  upsertAnswer(userId, skey, qid, { choice, correct: correct ? 1 : 0 });
  record(userId, skey, run.date, qid, correct);
  return { ok: true };
}
function saveText(userId, skey, qid, text) {
  const run = getRun(userId, skey);
  if (!inRun(run, qid, 'w')) return { error: 'That question is not in this session.' };
  if (typeof text !== 'string' || text.length > 5000) return { error: 'Answer is too long (5000 characters max).' };
  upsertAnswer(userId, skey, qid, { text });
  return { ok: true };
}
function openScheme(userId, skey, qid) {
  const run = getRun(userId, skey);
  if (!inRun(run, qid, 'w')) return { error: 'That question is not in this session.' };
  const a = getAns(userId, skey, qid);
  if (!a || !a.text || a.text.trim().length < 10) return { error: 'Write an answer first.' };
  if (a.opened) return { ok: true };
  const n = question(qid).body.points.length;
  upsertAnswer(userId, skey, qid, { opened: 1, ticks: JSON.stringify(Array(n).fill(false)), correct: 0 });
  record(userId, skey, run.date, qid, false);
  return { ok: true };
}
function setTicks(userId, skey, qid, ticks) {
  const run = getRun(userId, skey);
  if (!inRun(run, qid, 'w')) return { error: 'That question is not in this session.' };
  const a = getAns(userId, skey, qid);
  if (!a || !a.opened) return { error: 'Open the mark scheme first.' };
  const n = question(qid).body.points.length;
  if (!Array.isArray(ticks) || ticks.length !== n) return { error: 'Invalid marks.' };
  const t = ticks.map(Boolean), full = t.every(Boolean);
  upsertAnswer(userId, skey, qid, { ticks: JSON.stringify(t), correct: full ? 1 : 0 });
  record(userId, skey, run.date, qid, full);
  return { ok: true };
}

async function explain(userId, skey, qid) {
  { const off = prefs.aiOffReason(userId); if (off) return { error: off + '.' }; }
  const run = getRun(userId, skey);
  if (!run || (!run.list.m.includes(qid) && !run.list.w.includes(qid))) return { error: 'That question is not in this session.' };
  const q = question(qid), a = getAns(userId, skey, qid);
  if (q.type === 'm' && (!a || a.choice === null)) return { error: 'Answer the question first.' };
  if (q.type === 'w' && (!a || !a.opened)) return { error: 'Open the mark scheme first.' };
  const input = q.type === 'm' ? String(a.choice) : a.text || '';
  const h = crypto.createHash('sha1').update(input).digest('hex');
  const cached = db.prepare("SELECT text, input_hash FROM explanations WHERE user_id=? AND skey=? AND qid=? AND kind='explain'").get(userId, skey, qid);
  if (cached && cached.input_hash === h) return { text: cached.text };
  try {
    const text = q.type === 'm' ? await ai.explainMcq(userId, q.body, a.choice) : await ai.explainWritten(userId, q.body, a.text);
    db.prepare("INSERT OR REPLACE INTO explanations (user_id, skey, qid, kind, input_hash, text) VALUES (?,?,?,'explain',?,?)").run(userId, skey, qid, h, text);
    return { text };
  } catch (e) { return { error: e.message }; }
}
async function aiMark(userId, skey, qid) {
  { const off = prefs.aiOffReason(userId); if (off) return { error: off + '.' }; }
  const run = getRun(userId, skey);
  if (!inRun(run, qid, 'w')) return { error: 'That question is not in this session.' };
  const a = getAns(userId, skey, qid);
  if (!a || !a.opened) return { error: 'Open the mark scheme first.' };
  try {
    const r = await ai.markWritten(userId, question(qid).body, a.text);
    setTicks(userId, skey, qid, r.awarded);
    return { ok: true, feedback: r.feedback };
  } catch (e) { return { error: e.message }; }
}


// Photo of handwritten working: Claude reads it, the transcript becomes the answer, the mark scheme opens
// with Claude's suggested ticks, and the step-by-step feedback is kept. The photo itself is not stored.
async function photoMark(userId, skey, qid, dataUrl) {
  { const off = prefs.aiOffReason(userId); if (off) return { error: off + '.' }; }
  const run = getRun(userId, skey);
  if (!inRun(run, qid, 'w')) return { error: 'That question is not in this session.' };
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return { error: 'Send a JPG, PNG or WebP photo.' };
  if (m[2].length > 4_000_000) return { error: 'The photo is too large. Try again (it is shrunk automatically).' };
  const q = question(qid), prev = getAns(userId, skey, qid);
  if (prev && prev.opened) return { error: 'The mark scheme is already open for this question.' };
  let r;
  try { r = await ai.markPhoto(userId, q.body, m[2], m[1]); } catch (e) { return { error: e.message }; }
  if (!r.readable || r.transcript.trim().length < 3) return { error: r.feedback || 'Claude could not read the photo. Try a clearer photo of the whole working.' };
  const typed = prev && prev.text ? prev.text.trim() : '';
  const text = (typed ? typed + '\n\n[From photo]\n' : '') + r.transcript;
  upsertAnswer(userId, skey, qid, { text: text.slice(0, 5000) });
  upsertAnswer(userId, skey, qid, { opened: 1, ticks: JSON.stringify(Array(q.body.points.length).fill(false)), correct: 0 });
  record(userId, skey, run.date, qid, false);
  setTicks(userId, skey, qid, r.awarded);
  db.prepare("INSERT OR REPLACE INTO explanations (user_id, skey, qid, kind, input_hash, text) VALUES (?,?,?,'photo','',?)").run(userId, skey, qid, r.feedback);
  return { ok: true, feedback: r.feedback };
}

// ---------- views for the client (never send answers before they are earned) ----------
// A session whose questions are all from another subject was built from an older plan
// (e.g. a day that changed from Chemistry to Math). Throw it away so it is built again.
function dropIfStale(userId, skey, p, run) {
  if (!run || p.session.kind === 'fix') return run;
  const ids = [...run.list.m, ...run.list.w];
  if (!ids.length) return run;
  const want = new Set(subjectsOf(p.session));
  if (ids.some((id) => { const q = question(id); return q && want.has(q.subject); })) return run;
  resetRun(userId, skey);
  db.transaction(() => {
    db.prepare('DELETE FROM seen WHERE user_id=? AND skey=?').run(userId, skey);
    db.prepare('DELETE FROM runs WHERE user_id=? AND skey=?').run(userId, skey);
  })();
  return null;
}

function runView(userId, skey) {
  const p = parseSkey(skey); const run = dropIfStale(userId, skey, p, getRun(userId, skey));
  if (!run) {
    const prop = proposal(userId, skey);
    return { started: false, mix: { rev: prop.rev.m.length + prop.rev.w.length, bank: prop.bank.m.length + prop.bank.w.length, ai: prop.ai.m + prop.ai.w }, aiAvailable: prefs.aiOn(userId), kind: p.session.kind };
  }
  const revSet = new Set(run.rev);
  const ans = Object.fromEntries(db.prepare('SELECT * FROM answers WHERE user_id=? AND skey=?').all(userId, skey).map((a) => [a.qid, a]));
  const srsMap = Object.fromEntries(db.prepare(`SELECT qid, first_skey, learned_skey FROM srs WHERE user_id=? AND qid IN (${[...run.list.m, ...run.list.w].map(() => '?').join(',') || "''"})`).all(userId, ...run.list.m, ...run.list.w).map((r) => [r.qid, r]));
  const expl = Object.fromEntries(db.prepare("SELECT qid, text FROM explanations WHERE user_id=? AND skey=? AND kind='explain'").all(userId, skey).map((r) => [r.qid, r.text]));
  const photoFb = Object.fromEntries(db.prepare("SELECT qid, text FROM explanations WHERE user_id=? AND skey=? AND kind='photo'").all(userId, skey).map((r) => [r.qid, r.text]));
  const tag = (q) => revSet.has(q.id) ? { kind: 'review', from: srsMap[q.id] ? skeyLabel(srsMap[q.id].first_skey) : 'earlier' } : q.source === 'ai' ? { kind: 'new' } : null;
  const mcq = run.list.m.map(question).filter(Boolean).map((q) => {
    const a = ans[q.id]; const out = { id: q.id, q: q.body.q, options: q.body.options, tag: tag(q) };
    if (a && a.choice !== null) Object.assign(out, { choice: a.choice, answer: q.body.answer, explanation: q.body.explanation, learned: !!(srsMap[q.id] && srsMap[q.id].learned_skey === skey), ai: expl[q.id] || null });
    return out;
  });
  const written = run.list.w.map(question).filter(Boolean).map((q) => {
    const a = ans[q.id]; const out = { id: q.id, q: q.body.q, marks: q.body.points.length, tag: tag(q), text: a ? a.text || '' : '' };
    if (a && a.opened) Object.assign(out, { points: q.body.points, ticks: JSON.parse(a.ticks || '[]'), ai: expl[q.id] || null, feedback: photoFb[q.id] || null });
    return out;
  });
  // A "not set up" note saved before the API key was added is stale once Claude is available.
  const aiError = run.ai_error && prefs.aiOn(userId) && /^Claude is (not set up|turned off)/.test(run.ai_error) ? null : run.ai_error;
  return { started: true, mcq, written, aiError, done: !!run.done_at, aiAvailable: prefs.aiOn(userId) };
}

function memory(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = db.prepare('SELECT q.subject, s.learned_skey, s.due FROM srs s JOIN questions q ON q.id=s.qid WHERE s.user_id=?').all(userId);
  const out = { Math: { toLearn: 0, due: 0, learned: 0 }, Physics: { toLearn: 0, due: 0, learned: 0 }, Chemistry: { toLearn: 0, due: 0, learned: 0 }, English: { toLearn: 0, due: 0, learned: 0 } };
  rows.forEach((r) => { const o = out[r.subject]; if (!o) return; if (r.learned_skey) o.learned++; else { o.toLearn++; if (r.due <= today) o.due++; } });
  return out;
}

function planView(userId) {
  const runs = Object.fromEntries(db.prepare("SELECT skey, done_at FROM runs WHERE user_id=? AND skey NOT LIKE 't-%'").all(userId).map((r) => [r.skey, r]));
  return WEEKS.map((w, wi) => ({ label: w.d, days: weekPlan(wi).map((s, di) => {
    const skey = `${wi}-${di}`;
    return { skey, day: DAYS[di], date: sessionDate(wi, di), sub: s.sub, topic: s.topic, kind: s.kind, test: s.test || null, note: s.note || null, started: !!runs[skey], done: !!(runs[skey] && runs[skey].done_at) };
  }) }));
}

// ---------- reports for the admin ----------
function report(userId) {
  const mcq = db.prepare(`SELECT q.subject, q.set_code, a.correct, a.updated_at FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.choice IS NOT NULL`).all(userId);
  const wr = db.prepare(`SELECT q.subject, q.body, a.ticks FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.opened=1`).all(userId);
  const bySubject = {};
  for (const s of ['Math', 'Physics', 'Chemistry', 'English']) bySubject[s] = { mcq: 0, mcqRight: 0, marks: 0, marksMax: 0 };
  mcq.forEach((r) => { const o = bySubject[r.subject]; if (o) { o.mcq++; o.mcqRight += r.correct; } });
  wr.forEach((r) => { const o = bySubject[r.subject]; if (!o) return; const t = JSON.parse(r.ticks || '[]'); o.marks += t.filter(Boolean).length; o.marksMax += JSON.parse(r.body).points.length; });
  const topics = {};
  mcq.forEach((r) => { if (!r.set_code) return; const t = topics[r.set_code] || (topics[r.set_code] = { set: r.set_code, name: SET_NAMES[r.set_code], n: 0, right: 0 }); t.n++; t.right += r.correct; });
  const sessions = db.prepare('SELECT skey, date, started_at, done_at FROM runs WHERE user_id=? ORDER BY started_at DESC').all(userId).map((r) => {
    const a = db.prepare(`SELECT COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND skey=? AND choice IS NOT NULL`).get(userId, r.skey);
    const p = parseSkey(r.skey);
    return { skey: r.skey, label: skeyLabel(r.skey), sub: p.session.sub, topic: p.session.topic, started: r.started_at, done: !!r.done_at, mcqAnswered: a.n, mcqRight: a.c || 0 };
  });
  const recentWrong = db.prepare(`SELECT a.skey, a.qid, a.choice, a.updated_at, q.subject, q.body FROM answers a JOIN questions q ON q.id=a.qid
    WHERE a.user_id=? AND a.choice IS NOT NULL AND a.correct=0 ORDER BY a.updated_at DESC LIMIT 20`).all(userId).map((r) => {
    const b = JSON.parse(r.body); return { when: r.updated_at, label: skeyLabel(r.skey), subject: r.subject, q: b.q, chose: b.options[r.choice], correct: b.options[b.answer] };
  });
  const weekly = db.prepare(`SELECT strftime('%Y-%W', updated_at) wk, COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND choice IS NOT NULL GROUP BY wk ORDER BY wk DESC LIMIT 8`).all(userId).reverse();
  return { bySubject, topics: Object.values(topics).sort((a, b) => a.right / a.n - b.right / b.n), sessions, recentWrong, weekly, memory: memory(userId) };
}

function lastTopicQuiz(userId, set) {
  const r = db.prepare("SELECT skey FROM runs WHERE user_id=? AND skey LIKE ? ORDER BY started_at DESC LIMIT 1").get(userId, `t-${set}-%`);
  return r ? r.skey : null;
}
function topicStats(userId) {
  const rows = db.prepare(`SELECT q.set_code s, COUNT(*) n, SUM(a.correct) c FROM answers a JOIN questions q ON q.id=a.qid
    WHERE a.user_id=? AND a.choice IS NOT NULL AND q.set_code IS NOT NULL GROUP BY q.set_code`).all(userId);
  return Object.fromEntries(rows.filter((r) => r.n >= 3).map((r) => [r.s, Math.round((r.c || 0) / r.n * 100)]));
}

module.exports = { lastTopicQuiz, topicStats, proposal, startRun, addMore, resetRun, answerMcq, saveText, openScheme, setTicks, explain, aiMark, photoMark, runView, planView, memory, report, getRun, TESTS };
