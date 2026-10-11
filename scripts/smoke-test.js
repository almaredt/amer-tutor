// End-to-end smoke test with a throwaway database and fake Claude answers.
// Run: npm test
process.env.AI_MOCK = '1';
process.env.DB_PATH = require('path').join(require('os').tmpdir(), `tutor-test-${process.pid}.db`);
const assert = require('assert');
const app = require('../src/server');
const db = require('../src/db');
const auth = require('../src/auth');

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const jar = {};
  async function req(who, method, path, body, extraHeaders = {}) {
    const h = { 'X-Requested-With': 'fetch', ...extraHeaders };
    if (jar[who]) h.Cookie = jar[who];
    if (body !== undefined) h['Content-Type'] = 'application/json';
    const r = await fetch(base + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = r.headers.get('set-cookie'); if (sc) jar[who] = sc.split(';')[0];
    let data = null; try { data = await r.json(); } catch (e) { /* none */ }
    return { status: r.status, data };
  }
  try {
    db.prepare("INSERT INTO users (username, display_name, role, password_hash) VALUES ('boss','Admin','admin',?)").run(auth.hashPassword('adminpass1'));

    // security basics
    assert.equal((await req('x', 'GET', '/api/plan')).status, 401, 'plan needs login');
    assert.equal((await req('x', 'POST', '/api/login', { username: 'boss', password: 'adminpass1' }, { 'X-Requested-With': '' })).status, 403, 'CSRF header required');
    assert.equal((await req('x', 'POST', '/api/login', { username: 'boss', password: 'wrong' })).status, 401, 'wrong password rejected');

    // admin creates a student
    assert.equal((await req('admin', 'POST', '/api/login', { username: 'boss', password: 'adminpass1' })).status, 200);
    assert.equal((await req('admin', 'GET', '/api/plan')).status, 403, 'admin is not a student');
    const add = await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1' });
    assert.equal(add.status, 200, JSON.stringify(add.data));
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1' })).status, 400, 'duplicate username');

    // student logs in, sees plan
    assert.equal((await req('s', 'POST', '/api/login', { username: 'amer', password: 'studypass1' })).status, 200);
    assert.equal((await req('s', 'GET', '/api/admin/overview')).status, 403, 'student cannot see admin');
    const plan = await req('s', 'GET', '/api/plan');
    assert.equal(plan.data.weeks.length, 9); assert.equal(plan.data.weeks[0].days.length, 7);

    // Monday week 1 (Physics): proposal then start
    let v = await req('s', 'GET', '/api/runs/0-1');
    assert.equal(v.data.started, false); assert.equal(v.data.mix.bank + v.data.mix.ai, 15);
    v = await req('s', 'POST', '/api/runs/0-1/start', {});
    assert.equal(v.data.mcq.length, 10, 'ten quiz questions'); assert.equal(v.data.written.length, 5, 'five written');
    assert.ok(v.data.mcq.every((q) => q.answer === undefined), 'answers hidden before answering');
    const q0 = v.data.mcq[0], q1 = v.data.mcq[1];
    // answer q0 wrong, q1 right (find the right option by peeking at the DB)
    const ansOf = (id) => JSON.parse(db.prepare('SELECT body FROM questions WHERE id=?').get(id).body).answer;
    assert.equal((await req('s', 'POST', '/api/runs/0-1/answer', { qid: q0.id, choice: (ansOf(q0.id) + 1) % 4 })).status, 200);
    assert.equal((await req('s', 'POST', '/api/runs/0-1/answer', { qid: q0.id, choice: ansOf(q0.id) })).status, 400, 'cannot change an answer');
    await req('s', 'POST', '/api/runs/0-1/answer', { qid: q1.id, choice: ansOf(q1.id) });
    assert.equal((await req('s', 'POST', '/api/runs/0-1/answer', { qid: 'C1m0', choice: 0 })).status, 400, 'question must belong to the session');
    // written: save, open, tick partially
    const w0 = v.data.written[0];
    assert.equal((await req('s', 'POST', '/api/runs/0-1/open', { qid: w0.id })).status, 400, 'must write first');
    await req('s', 'POST', '/api/runs/0-1/text', { qid: w0.id, text: 'My answer is about speed and velocity.' });
    assert.equal((await req('s', 'POST', '/api/runs/0-1/open', { qid: w0.id })).status, 200);
    v = await req('s', 'GET', '/api/runs/0-1');
    const w0v = v.data.written.find((x) => x.id === w0.id);
    assert.ok(w0v.points.length >= 2, 'mark scheme visible after opening');
    await req('s', 'POST', '/api/runs/0-1/ticks', { qid: w0.id, ticks: w0v.points.map((_, i) => i === 0) });
    // explanation + AI marking (mock)
    const ex = await req('s', 'POST', '/api/runs/0-1/explain', { qid: q0.id });
    assert.ok(ex.data.text.includes('Test explanation'));
    const mk = await req('s', 'POST', '/api/runs/0-1/aimark', { qid: w0.id });
    assert.equal(mk.status, 200);

    // SRS: q0 and w0 are due on Thursday's physics review
    let srs = db.prepare('SELECT * FROM srs').all();
    assert.equal(srs.length, 2, 'two items in memory bank: ' + JSON.stringify(srs));
    v = await req('s', 'GET', '/api/runs/0-4');
    assert.equal(v.data.mix.rev, 2, 'review items appear on Thursday');
    v = await req('s', 'POST', '/api/runs/0-4/start', {});
    const rq = v.data.mcq.find((q) => q.id === q0.id);
    assert.ok(rq && rq.tag.kind === 'review', 'old mistake is tagged REVIEW');
    assert.equal(v.data.mcq.length, 10); assert.ok(v.data.mcq.some((q) => q.tag && q.tag.kind === 'new'), 'AI fills the gaps');
    await req('s', 'POST', '/api/runs/0-4/answer', { qid: q0.id, choice: ansOf(q0.id) });
    srs = db.prepare('SELECT * FROM srs WHERE qid=?').get(q0.id);
    assert.equal(srs.box, 2, 'right answer moves the item up a box');
    // reset restores state
    await req('s', 'POST', '/api/runs/0-4/reset', {});
    assert.equal(db.prepare('SELECT box FROM srs WHERE qid=?').get(q0.id).box, 1, 'reset restores memory bank');

    // Friday mistakes day
    v = await req('s', 'GET', '/api/runs/0-5');
    assert.ok(v.data.mix.rev >= 2, 'Friday collects mistakes');

    // done + admin report
    assert.equal((await req('s', 'POST', '/api/runs/0-1/done', { done: true })).status, 200);
    const o = await req('admin', 'GET', '/api/admin/overview');
    assert.equal(o.data.students[0].sessionsDone, 1);
    const rep = await req('admin', 'GET', `/api/admin/students/${o.data.students[0].id}/report`);
    assert.equal(rep.data.bySubject.Physics.mcq, 2); assert.equal(rep.data.recentWrong.length, 1);

    // flag + disable
    await req('s', 'POST', '/api/flag', { qid: q0.id, note: 'test' });
    const fl = await req('admin', 'GET', '/api/admin/flags'); assert.equal(fl.data.length, 1);
    await req('admin', 'POST', `/api/admin/flags/${fl.data[0].id}/resolve`, { disable: true });
    assert.equal(db.prepare('SELECT status FROM questions WHERE id=?').get(q0.id).status, 'disabled');

    // blocked student is logged out
    await req('admin', 'PATCH', `/api/admin/students/${o.data.students[0].id}`, { active: false });
    assert.equal((await req('s', 'GET', '/api/plan')).status, 401, 'blocked student loses access');

    // English Saturday + Learn topic quiz + ask Claude (re-activate the student first)
    await req('admin', 'PATCH', `/api/admin/students/${o.data.students[0].id}`, { active: true });
    assert.equal((await req('s', 'POST', '/api/login', { username: 'amer', password: 'studypass1' })).status, 200);
    const p2 = await req('s', 'GET', '/api/plan');
    assert.equal(p2.data.weeks[0].days.length, 7, 'seven days a week'); assert.equal(p2.data.weeks[0].days[6].sub, 'English');
    v = await req('s', 'POST', '/api/runs/0-6/start', {});
    assert.equal(v.data.mcq.length, 10, 'English session has ten quiz questions');
    const tk = 't-M3-abc123';
    v = await req('s', 'GET', '/api/runs/' + tk); assert.equal(v.data.started, false);
    v = await req('s', 'POST', `/api/runs/${tk}/start`, {}); assert.equal(v.data.mcq.length, 10, 'topic quiz has ten questions');
    assert.equal((await req('s', 'GET', '/api/topics/M3/last')).data.skey, tk);
    const tq = v.data.mcq.find((q) => !q.tag || q.tag.kind !== 'review');
    await req('s', 'POST', `/api/runs/${tk}/answer`, { qid: tq.id, choice: (ansOf(tq.id) + 1) % 4 });
    assert.ok(db.prepare('SELECT 1 FROM srs WHERE qid=? AND first_skey=?').get(tq.id, tk), 'topic quiz mistakes go to the memory bank');
    assert.equal((await req('s', 'GET', '/api/runs/t-XX-abc123')).status, 400, 'unknown topic rejected');
    const ask = await req('s', 'POST', '/api/topics/M3/ask', { question: 'Why do we need two numbers?', title: 'Factorising', context: 'x' });
    assert.ok(ask.data.text.includes('Test answer'));
    assert.ok((await req('s', 'GET', '/api/topics/stats')).status === 200);
    const lj = await fetch(base + '/learn.js'); assert.equal(lj.status, 200);

    // pages served with security headers
    const page = await fetch(base + '/'); assert.equal(page.status, 200); assert.ok(page.headers.get('content-security-policy'));
    console.log('All smoke tests passed ✓');
  } catch (e) { console.error('TEST FAILED:', e.message); process.exitCode = 1; }
  finally { server.close(); db.close(); for (const s of ['', '-wal', '-shm']) try { require('fs').unlinkSync(process.env.DB_PATH + s); } catch (e) { /* */ } }
});
