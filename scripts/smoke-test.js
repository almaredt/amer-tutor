// End-to-end smoke test with a throwaway database and fake Claude answers.
// Run: npm test
process.env.AI_MOCK = '1';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_smoketest_only';
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
    assert.equal((await req('admin', 'GET', '/api/admin/overview')).data.aiGlobal, false, 'Claude off for everyone by default');
    await req('admin', 'PUT', '/api/admin/ai-global', { on: true }); // the tests below exercise Claude (mocked)
    const opts = (await req('admin', 'GET', '/api/admin/options')).data;
    const uptown = opts.schools.find((x) => x.name === 'Uptown International School');
    assert.ok(uptown && opts.schools.some((x) => x.kind === 'family'), 'default school and families group exist');
    assert.ok(opts.courses.some((c) => c.id === 'uptown-g9-2026t1') && opts.programmes.MYP.groups.length === 8, 'courses and the eight MYP groups listed');
    const G9 = { school_id: uptown.id, programme: 'MYP', grade: 9, class_name: '9B', course_id: 'uptown-g9-2026t1',
      subjects: [{ group: 'math', subject: 'Mathematics', level: 'Extended' }, { group: 'sci', subject: 'Physics' }, { group: 'sci', subject: 'Chemistry' }, { group: 'langlit', subject: 'English' }] };
    // a wrong profile is refused and leaves no account behind
    const bad = await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1', profile: { ...G9, grade: 11 } });
    assert.equal(bad.status, 400, 'MYP grade 11 refused');
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1', profile: { ...G9, subjects: [{ group: 'math', subject: 'Mathematics' }] } })).status, 400, 'math level required');
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1', profile: { ...G9, programme: 'DP', grade: 11 } })).status, 400, 'course must match programme and grade');
    const add = await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1', profile: G9 });
    assert.equal(add.status, 200, JSON.stringify(add.data));
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'amer', display_name: 'Amer', password: 'studypass1' })).status, 400, 'duplicate username');

    // student logs in, sees plan
    assert.equal((await req('s', 'POST', '/api/login', { username: 'amer', password: 'studypass1' })).status, 200);
    assert.equal((await req('s', 'GET', '/api/admin/overview')).status, 403, 'student cannot see admin');
    const me = (await req('s', 'GET', '/api/me')).data;
    assert.equal(me.course.id, 'uptown-g9-2026t1'); assert.equal(me.profile.grade, 9); assert.equal(me.profile.class_name, '9B');
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

    // SRS: q0 and w0 are due on next week's Thursday physics review (week 0 Thursday is the Chemistry review)
    let srs = db.prepare('SELECT * FROM srs').all();
    assert.equal(srs.length, 2, 'two items in memory bank: ' + JSON.stringify(srs));
    v = await req('s', 'GET', '/api/runs/1-4');
    assert.equal(v.data.mix.rev, 2, 'review items appear on Thursday');
    v = await req('s', 'POST', '/api/runs/1-4/start', {});
    const rq = v.data.mcq.find((q) => q.id === q0.id);
    assert.ok(rq && rq.tag.kind === 'review', 'old mistake is tagged REVIEW');
    assert.equal(v.data.mcq.length, 10, 'review items + bank fill the session');
    await req('s', 'POST', '/api/runs/1-4/answer', { qid: q0.id, choice: ansOf(q0.id) });
    srs = db.prepare('SELECT * FROM srs WHERE qid=?').get(q0.id);
    assert.equal(srs.box, 2, 'right answer moves the item up a box');
    // reset restores state
    await req('s', 'POST', '/api/runs/1-4/reset', {});
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
    const mkj = await fetch(base + '/mathkeys.js'); assert.equal(mkj.status, 200, 'symbol keys script served');
    assert.ok((await (await fetch(base + '/study')).text()).includes('/mathkeys.js'), 'student page loads symbol keys');

    for(const route of ['/','/login','/study','/portal','/admin']){
      const page=await (await fetch(base+route)).text();
      assert.ok(page.includes('/theme-dark.css'),route+' loads shared dark theme');
      assert.ok(page.includes('/theme-control.js'),route+' loads shared theme toggle');
    }
    const darkCSS=await (await fetch(base+'/theme-dark.css')).text();
    assert.ok(darkCSS.includes('prefers-color-scheme:dark')&&darkCSS.includes('data-theme="dark"'),'automatic and manual dark modes supported');
    assert.ok(darkCSS.includes('.q .opt:disabled'),'disabled answer contrast is explicitly protected');
    const directory=await fetch(base+'/tutors');
    assert.equal(directory.status,200,'public tutor directory accessible without login');
    const detailPublic=await fetch(base+'/tutor/1');
    assert.equal(detailPublic.status,200,'tutor detail page available without login');
    const detailHtml=await detailPublic.text();
    assert.ok(detailHtml.includes('txDetail')&&detailHtml.includes('/tutor-explore.js'),'detail view loads native UI');
    const listingHtml=await directory.clone().text();
    assert.ok(listingHtml.includes('txListing')&&listingHtml.includes('/tutor-explore.css'),'dedicated tutor listing loads');

    const directoryHTML=await directory.text();
    assert.ok(directoryHTML.includes('/tutor-explore.js'),'new public tutor discovery UI loads');
    const demoAvatar=await fetch(base+'/demo-avatar/aisyah.svg');
    assert.equal(demoAvatar.status,200,'illustrated avatar available locally');
    assert.ok((await demoAvatar.text()).includes('<svg'),'avatar is SVG');
    assert.equal((await fetch(base+'/demo-avatar/unknown.svg')).status,404,'unknown avatar is not exposed');
    const adminPage=await (await fetch(base+'/admin')).text();
    assert.ok(adminPage.includes('/admin-console.js')&&adminPage.includes('/admin-console.css'),'professional admin shell loaded');
    const marketJS=await (await fetch(base+'/tutor-marketplace.js')).text();
    assert.ok(marketJS.includes('market-profile-tabs')&&marketJS.includes('market-profile-rates'),'tutor profile has reference-style detail panel');
    const adminCSS=await (await fetch(base+'/admin-console.css')).text();
    assert.ok(adminCSS.includes('grid-template-columns:252px')&&adminCSS.includes('admin-nav button.active'),'admin sidebar and full-width screens styled');

    const publicTutors=await (await fetch(base+'/api/public/teachers')).json();
    assert.ok(Array.isArray(publicTutors),'public directory is an array');
    assert.ok(publicTutors.every(t=>!('username' in t)&&!('password_hash' in t)),'no private teacher account fields in directory');
    const portalHTML=await (await fetch(base+'/portal')).text();
    assert.ok(portalHTML.includes('/tutor-marketplace.js')&&portalHTML.includes('/portal-workspace.js'),'marketplace and workspaces loaded');
    assert.ok((await (await fetch(base+'/')).text()).includes('homeTutorGrid'),'home has searchable tutor directory');
    const landing = await (await fetch(base + '/')).text();
    assert.ok(landing.includes('LEARN') && landing.includes('/login'), 'public landing page available');
    assert.ok((await (await fetch(base + '/login')).text()).includes('loginRoot'), 'dedicated login page available');
    assert.ok((await (await fetch(base + '/portal')).text()).includes('availability-calendar.js'), 'calendar script linked');
    assert.ok((await (await fetch(base + '/admin')).text()).includes('admin-theme.css'), 'admin theme linked');
    // a session built from an older plan (other subject) is rebuilt
    const uid = db.prepare("SELECT id FROM users WHERE username='amer'").get().id;
    const chemQ = db.prepare("SELECT id FROM questions WHERE subject='Chemistry' AND type='m' LIMIT 1").get().id;
    db.prepare("DELETE FROM runs WHERE user_id=? AND skey='1-0'").run(uid);
    db.prepare("INSERT INTO runs (user_id, skey, date, list, rev) VALUES (?,?,?,?,?)").run(uid, '1-0', '2026-10-18', JSON.stringify({ m: [chemQ], w: [] }), '[]');
    const stale = await req('s', 'GET', '/api/runs/1-0');
    assert.equal(stale.data.started, false, 'stale Sunday (Chemistry) run is dropped for the Math plan');

    // photo of handwritten working (mock Claude): transcript becomes the answer, scheme opens with suggested ticks
    const run01 = (await req('s', 'GET', '/api/runs/0-1')).data;
    const w1 = run01.written.find((x) => !x.points);
    const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    assert.equal((await req('s', 'POST', '/api/runs/0-1/photo', { qid: w1.id, image: 'data:text/plain;base64,aGk=' })).status, 400, 'non-image rejected');
    const ph = await req('s', 'POST', '/api/runs/0-1/photo', { qid: w1.id, image: png });
    assert.equal(ph.status, 200, JSON.stringify(ph.data));
    const w1v = (await req('s', 'GET', '/api/runs/0-1')).data.written.find((x) => x.id === w1.id);
    assert.ok(w1v.points && w1v.ticks[0] === true && w1v.text.includes('working from the photo') && w1v.feedback, 'photo marks the answer');
    assert.equal((await req('s', 'POST', '/api/runs/0-1/photo', { qid: w1.id, image: png })).status, 400, 'no second photo after the scheme is open');

    // weekly report: hidden without admin or token, Persian HTML for admin, JSON with sessions and times
    assert.equal((await fetch(base + '/report/weekly')).status, 404, 'report hidden from strangers');
    const wr = await req('admin', 'GET', '/report/weekly?format=json');
    assert.equal(wr.status, 200);
    assert.ok(wr.data.students[0].sessions.length >= 1 && /^\d\d:\d\d$/.test(wr.data.students[0].sessions[0].start), 'report lists sessions with times');
    const wh = await fetch(base + '/report/weekly', { headers: { Cookie: jar.admin } });
    assert.ok((await wh.text()).includes('گزارش هفتگی'), 'report is in Persian');

    // daily reminder: key, validation, payload skipped when today's session is done
    const ps = await req('s', 'GET', '/api/push/settings');
    assert.ok(ps.data.publicKey && ps.data.publicKey.length > 40 && ps.data.time === '17:00', 'push settings');
    const fakeSub = { endpoint: 'https://push.example.invalid/abc', keys: { p256dh: 'x', auth: 'y' } };
    assert.equal((await req('s', 'POST', '/api/push/subscribe', { subscription: fakeSub, time: '25:00' })).status, 400, 'bad time rejected');
    assert.equal((await req('s', 'POST', '/api/push/subscribe', { subscription: fakeSub, time: '18:30' })).status, 200);
    assert.equal((await req('s', 'GET', '/api/push/settings')).data.enabled, true);
    const pushMod = require('../src/push');
    const d00 = require('../src/courses').get('uptown-g9-2026t1').sessionDate(0, 0);
    assert.ok(pushMod.reminderPayload(uid, d00).body.includes('Math'), 'reminder names today\'s subject');
    db.prepare("INSERT OR REPLACE INTO runs (user_id, skey, date, list, done_at) VALUES (?, '0-0', ?, '{\"m\":[],\"w\":[]}', datetime('now'))").run(uid, d00);
    assert.equal(pushMod.reminderPayload(uid, d00), null, 'no reminder once the session is done');
    assert.equal((await req('s', 'POST', '/api/push/unsubscribe', { endpoint: fakeSub.endpoint })).status, 200);
    assert.equal((await req('s', 'GET', '/api/push/settings')).data.enabled, false);
    assert.equal((await fetch(base + '/sw.js')).status, 200); assert.equal((await fetch(base + '/manifest.webmanifest')).status, 200);

    // settings: session length, Claude switch for the student and the parent
    let pf = await req('s', 'GET', '/api/me/prefs');
    assert.equal(pf.data.sessionMinutes, 30); assert.equal(pf.data.aiOn, true);
    assert.equal((await req('s', 'POST', '/api/me/prefs', { sessionMinutes: 25 })).status, 400, 'odd session length rejected');
    pf = await req('s', 'POST', '/api/me/prefs', { sessionMinutes: 45, ai: false });
    assert.equal(pf.data.sessionMinutes, 45); assert.equal(pf.data.aiOn, false);
    assert.equal((await req('s', 'POST', '/api/topics/M3/ask', { question: 'Why two numbers?' })).status, 400, 'Ask Claude blocked when off');
    assert.equal((await req('s', 'GET', '/api/runs/0-1')).data.aiAvailable, false, 'session shows Claude off');
    await req('s', 'POST', '/api/me/prefs', { ai: true });
    assert.equal((await req('admin', 'POST', `/api/admin/students/${uid}/ai`, { allowed: false })).status, 200);
    pf = await req('s', 'GET', '/api/me/prefs'); assert.equal(pf.data.aiAllowed, false); assert.equal(pf.data.aiOn, false, 'parent switch wins');
    await req('admin', 'POST', `/api/admin/students/${uid}/ai`, { allowed: true });
    assert.equal((await req('s', 'GET', '/api/me/prefs')).data.aiOn, true);

    // MYP criterion task: one per session; Claude-written when on, from the bank when off; level marking 0–8
    let cr = await req('s', 'POST', '/api/runs/2-1/start', {});
    let ct = cr.data.written.filter((x) => x.crit);
    assert.equal(ct.length, 1, 'exactly one criterion task: ' + JSON.stringify(cr.data.written.map((x) => x.crit)));
    assert.equal(ct[0].crit.criterion, ['A', 'B', 'C', 'D'][(2 * 7 + 1) % 4], 'criterion rotates through the plan');
    assert.ok(ct[0].crit.name && !ct[0].levels, 'criterion name shown, levels hidden before answering');
    await req('s', 'POST', '/api/runs/2-1/text', { qid: ct[0].id, text: 'A long enough practice answer for the criterion task.' });
    await req('s', 'POST', '/api/runs/2-1/open', { qid: ct[0].id });
    const lm = await req('s', 'POST', '/api/runs/2-1/aimark', { qid: ct[0].id });
    assert.equal(lm.data.level, 5);
    const ctv = (await req('s', 'GET', '/api/runs/2-1')).data.written.find((x) => x.id === ct[0].id);
    assert.ok(ctv.levels.length === 4 && ctv.level === 5 && ctv.levelFeedback, 'levels, estimate and feedback after marking');
    await req('s', 'POST', '/api/me/prefs', { ai: false });
    cr = await req('s', 'POST', '/api/runs/2-2/start', {});
    ct = cr.data.written.filter((x) => x.crit);
    assert.ok(ct.length === 1 && ct[0].id[0] === 'K', 'bank criterion task when Claude is off');
    await req('s', 'POST', '/api/me/prefs', { ai: true });
    const repA = await req('admin', 'GET', `/api/admin/students/${uid}/report`);
    assert.ok(repA.data.criteria.some((c) => c.avg === 5), 'admin report shows criterion levels');

    // ---- schools, profiles and courses ----
    const sch = await req('admin', 'POST', '/api/admin/schools', { name: 'Test Academy', kind: 'school' });
    assert.ok(sch.data.id, 'school created');
    assert.equal((await req('admin', 'POST', '/api/admin/schools', { name: 'test academy', kind: 'school' })).status, 400, 'duplicate school name');
    // a Grade 7 student with no course yet: empty plan, clear message, nothing breaks
    const g7 = await req('admin', 'POST', '/api/admin/students', { username: 'sara7', display_name: 'Sara', password: 'studypass1',
      profile: { school_id: sch.data.id, programme: 'MYP', grade: 7, subjects: [{ group: 'langacq', subject: 'French', level: 'Phase 2' }, { group: 'design', subject: 'Design' }, { group: 'phe', subject: 'Physical and health education' }] } });
    assert.equal(g7.status, 200, JSON.stringify(g7.data));
    await req('g7', 'POST', '/api/login', { username: 'sara7', password: 'studypass1' });
    const me7 = (await req('g7', 'GET', '/api/me')).data;
    assert.equal(me7.course, null); assert.equal(me7.profile.grade, 7);
    const plan7 = (await req('g7', 'GET', '/api/plan')).data;
    assert.ok(plan7.weeks.length === 0 && plan7.course === null, 'no plan without a course');
    const run7 = await req('g7', 'GET', '/api/runs/0-1');
    assert.ok(run7.status === 400 && /No study plan/.test(run7.data.error), 'session refused with a clear reason');
    assert.equal((await req('g7', 'GET', '/api/topics/M1/last')).status, 404, 'no Learn topics without a course');
    assert.ok((await req('admin', 'GET', '/report/weekly?format=json')).data.students.length >= 2, 'weekly report still builds');
    // admin edits Amer's profile: same course keeps his sessions
    const before = (await req('admin', 'GET', `/api/admin/students/${uid}/report`)).data.sessions.length;
    const ed = await req('admin', 'PUT', `/api/admin/students/${uid}/profile`, { ...G9, class_name: '9C' });
    assert.equal(ed.data.class_name, '9C');
    assert.equal((await req('admin', 'GET', `/api/admin/students/${uid}/report`)).data.sessions.length, before, 'sessions kept');
    assert.equal((await req('s', 'GET', '/api/runs/2-1')).data.started, true, 'same course: session still there');
    // removing the course archives sessions under "h1:" and keeps history and the memory bank
    const memBefore = (await req('s', 'GET', '/api/plan')).data.memory;
    await req('admin', 'PUT', `/api/admin/students/${uid}/profile`, { ...G9, course_id: null });
    const arch = (await req('admin', 'GET', `/api/admin/students/${uid}/report`)).data;
    assert.equal(arch.sessions.length, before, 'history kept after the course change');
    assert.ok(arch.sessions.every((x) => /earlier course/.test(x.label)), 'old sessions labelled as earlier course');
    await req('admin', 'PUT', `/api/admin/students/${uid}/profile`, G9);
    const back = await req('s', 'GET', '/api/runs/2-1');
    assert.equal(back.data.started, false, 'fresh plan after returning to a course');
    const memAfter = (await req('s', 'GET', '/api/plan')).data.memory;
    assert.equal(memAfter.Math.toLearn + memAfter.Physics.toLearn, memBefore.Math.toLearn + memBefore.Physics.toLearn, 'memory bank kept');

    // ---- Grade 11 DP: a plan built from the student's own subjects ----
    const G11 = { school_id: uptown.id, programme: 'DP', grade: 11, course_id: 'uptown-g11-2026t1',
      subjects: [{ group: 'g5', subject: 'Mathematics: analysis and approaches', level: 'SL' }, { group: 'g4', subject: 'Chemistry', level: 'HL' }, { group: 'g3', subject: 'Psychology', level: 'SL' }, { group: 'g2', subject: 'French B', level: 'SL' }] };
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'ali11', display_name: 'Ali', password: 'studypass1', profile: { ...G11, course_id: 'uptown-g9-2026t1' } })).status, 400, 'G9 course refused for DP 11');
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'ali11', display_name: 'Ali', password: 'studypass1', profile: G11 })).status, 200);
    await req('ali', 'POST', '/api/login', { username: 'ali11', password: 'studypass1' });
    const pa = (await req('ali', 'GET', '/api/plan')).data;
    const subs11 = new Set(pa.weeks.flatMap((w) => w.days.map((d) => d.sub)));
    assert.deepEqual([...subs11].sort(), ['Chemistry HL', 'Math AA SL', 'Mistakes', 'Psychology SL'], 'only his subjects (French B has no units yet)');
    assert.ok(pa.weeks[0].days.every((d) => d.kind === 'fix' || d.note), 'holiday note in week 1');
    assert.ok(pa.weeks.flatMap((w) => w.days).some((d) => d.kind === 'mock' && /Psychology/.test(d.test || '')), 'test prep before the Psychology summative');
    assert.ok(pa.tests.length === 1 && pa.weeks[1].days[0].color, 'tests and colours sent');
    const mathDay = pa.weeks[1].days.find((d) => d.sub === 'Math AA SL');
    // Fixed question bank, Claude switched off for everyone
    await req('admin', 'PUT', '/api/admin/ai-global', { on: false });
    const r11 = await req('ali', 'POST', `/api/runs/${mathDay.skey}/start`, {});
    await req('admin', 'PUT', '/api/admin/ai-global', { on: true });
    assert.equal(r11.status, 200, JSON.stringify(r11.data));
    assert.ok(r11.data.mcq.length === 10 && r11.data.written.length >= 3, 'DP session filled from the fixed bank: ' + r11.data.mcq.length + '/' + r11.data.written.length);
    assert.ok(r11.data.mcq.every((x) => /^G11-MA2-h?m\d+$/.test(x.id)) && r11.data.written.every((x) => /^G11-MA2-h?w\d+$/.test(x.id)), 'bank questions, no Claude: ' + r11.data.mcq.map((x) => x.id));
    assert.ok(db.prepare("SELECT COUNT(*) n FROM questions WHERE set_code = 'CHH3' AND id LIKE 'G11-CHH3-h%'").get().n > 0, 'HL-only questions seeded for HL');
    assert.equal(db.prepare("SELECT COUNT(*) n FROM questions WHERE set_code = 'CH3' AND id LIKE 'G11-CH3-h%'").get().n, 0, 'no HL-only questions for SL');
    assert.ok(!r11.data.written.some((x) => x.crit), 'no MYP criterion task in DP');
    const q11 = db.prepare('SELECT subject, course_id, set_code FROM questions WHERE id=?').get(r11.data.mcq[0].id);
    assert.ok(q11.subject === 'Math AA SL' && q11.course_id === 'uptown-g11-2026t1' && q11.set_code === 'MA2', JSON.stringify(q11));
    assert.equal((await req('ali', 'GET', '/api/me')).data.course.programme, 'DP');
    assert.equal((await req('ali', 'GET', '/api/topics/MA2/last')).status, 404, 'no Learn topics for this course yet');
    // Grade 12 DP: fixed banks for every session of a science/maths student, Claude off
    const G12 = { school_id: uptown.id, programme: 'DP', grade: 12, course_id: 'uptown-g12-2026t1',
      subjects: [{ group: 'g5', subject: 'Mathematics: analysis and approaches', level: 'HL' }, { group: 'g4', subject: 'Physics', level: 'HL' }, { group: 'g4', subject: 'Chemistry', level: 'SL' }, { group: 'g4', subject: 'Biology', level: 'SL' }] };
    assert.equal((await req('admin', 'POST', '/api/admin/students', { username: 'sara12', display_name: 'Sara', password: 'studypass1', profile: G12 })).status, 200);
    await req('g12', 'POST', '/api/login', { username: 'sara12', password: 'studypass1' });
    await req('admin', 'PUT', '/api/admin/ai-global', { on: false });
    const p12 = (await req('g12', 'GET', '/api/plan')).data;
    for (const d of p12.weeks[2].days.filter((x) => x.kind !== 'fix')) {
      const r = await req('g12', 'POST', `/api/runs/${d.skey}/start`, {});
      assert.ok(r.status === 200 && r.data.mcq.length === 10 && r.data.written.length >= 3, `G12 ${d.sub} ${d.skey} from the bank: ${JSON.stringify(r.data).slice(0, 200)}`);
    }
    await req('admin', 'PUT', '/api/admin/ai-global', { on: true });
    // Amer's Grade 9 plan is unchanged
    assert.equal((await req('s', 'GET', '/api/plan')).data.weeks[0].days[0].sub, 'Math');

    // ---- plans and the per-student daily Claude cap ----
    const bill = (await req('admin', 'GET', '/api/admin/billing')).data;
    assert.ok(bill.enabled === false && bill.plans.free.dailyUsd > 0, 'billing off by default, free cap set');
    assert.equal((await req('admin', 'PUT', '/api/admin/billing', { plans: { free: { dailyUsd: 99 } } })).status, 400, 'cap range checked');
    await req('admin', 'PUT', '/api/admin/billing', { plans: { free: { dailyUsd: 0 } } });
    let pr = (await req('s', 'GET', '/api/me/prefs')).data;
    assert.ok(pr.aiLimitReached && !pr.aiOn, 'cap reached: Claude paused');
    const capped = await req('s', 'POST', '/api/topics/M1/ask', { question: 'What is k?' });
    assert.ok(capped.status === 400 && /limit/.test(capped.data.error), 'Ask Claude refused with the reason');
    // billing on + family plan uses the family cap
    await req('admin', 'PUT', '/api/admin/billing', { enabled: true });
    assert.equal((await req('admin', 'POST', `/api/admin/students/${uid}/plan`, { plan: 'gold' })).status, 400, 'unknown plan refused');
    await req('admin', 'POST', `/api/admin/students/${uid}/plan`, { plan: 'family' });
    pr = (await req('s', 'GET', '/api/me/prefs')).data;
    assert.ok(pr.aiOn && !pr.aiLimitReached, 'family plan keeps Claude on');
    await req('admin', 'PUT', '/api/admin/billing', { enabled: false, plans: { free: { dailyUsd: 0.6 } } });

    // ---- four-role marketplace regression tests ----
    const teacherCreate=await req('admin','POST','/api/admin/accounts',{role:'teacher',username:'tutor01',display_name:'Teacher One',password:'teachpass1'});
    const parentCreate=await req('admin','POST','/api/admin/accounts',{role:'parent',username:'parent01',display_name:'Parent One',password:'parentpass1'});
    assert.equal(teacherCreate.status,201,JSON.stringify(teacherCreate.data));
    assert.equal(parentCreate.status,201,JSON.stringify(parentCreate.data));
    const tid=teacherCreate.data.id,pid=parentCreate.data.id;
    assert.equal((await req('teacher','POST','/api/login',{username:'tutor01',password:'teachpass1'})).status,200);
    assert.equal((await req('parent','POST','/api/login',{username:'parent01',password:'parentpass1'})).status,200);
    assert.equal((await req('parent','GET','/api/teacher/me')).status,403);
    assert.equal((await req('teacher','GET','/api/parent/children')).status,403);
    assert.equal((await req('parent','GET','/api/parent/children/'+uid+'/progress')).status,404,'unlinked parent cannot see child');
    assert.equal((await req('teacher','GET','/api/teacher/students/'+uid+'/progress')).status,404,'unlinked teacher cannot see student');
    assert.equal((await req('admin','POST','/api/admin/links',{role:'parent',actor_id:pid,student_id:uid})).status,200);
    assert.equal((await req('admin','POST','/api/admin/links',{role:'teacher',actor_id:tid,student_id:uid,subject:'Math'})).status,200);
    assert.equal((await req('parent','GET','/api/parent/children/'+uid+'/progress')).status,200);
    assert.equal((await req('teacher','GET','/api/teacher/students/'+uid+'/progress')).status,200);
    const studentInsights=await req('s','GET','/api/student/progress-insights');
    assert.equal(studentInsights.status,200,'student analytics available');
    assert.ok(Array.isArray(studentInsights.data.subjects)&&Array.isArray(studentInsights.data.focus));
    assert.equal((await req('parent','GET','/api/parent/children/'+uid+'/insights')).status,200);
    assert.equal((await req('teacher','GET','/api/teacher/students/'+uid+'/insights')).status,200);
    assert.equal((await req('x','GET','/api/parent/children/'+uid+'/insights')).status,401);
    assert.equal((await req('parent','GET','/api/parent/children/99999/insights')).status,404);

    const profile={bio:'Math teacher',subjects:['Mathematics'],grades:['9'],curricula:['MYP'],languages:['English'],rate_45_aed:100,rate_60_aed:130};
    assert.equal((await req('teacher','PUT','/api/teacher/profile',profile)).status,200);
    assert.equal((await req('parent','GET','/api/teachers')).data.length,0,'unapproved teachers hidden');
    assert.equal((await req('admin','POST','/api/admin/teachers/'+tid+'/approve',{approved:true})).status,200);
    assert.equal((await req('parent','GET','/api/teachers')).data.length,1);
    assert.equal((await req('teacher','POST','/api/teacher/materials',{student_id:uid,kind:'assignment',title:'Math homework',body:'Solve 2x=4'})).status,201);
    assert.ok((await req('s','GET','/api/student/materials')).data.some(x=>x.title==='Math homework'));
    assert.equal((await req('parent','POST','/api/messages/'+uid+'/'+tid,{body:'hello'})).status,403);
    assert.equal((await req('s','POST','/api/messages/'+uid+'/'+tid,{body:'Question about homework'})).status,201);
    assert.equal((await req('teacher','GET','/api/messages/'+uid+'/'+tid)).data.length,1);
    assert.equal((await req('teacher','PUT','/api/teacher/availability',{slots:[{weekday:new Date('2099-12-15T14:00Z').getUTCDay(),start_time:'13:00',end_time:'17:00'}]})).status,200);
    const calendar=await req('parent','GET','/api/teachers/'+tid+'/calendar?duration=45');
    assert.equal(calendar.status,200,'parent can view teacher calendar');
    assert.equal(calendar.data.days.length,14,'two weeks of dates');
    assert.equal(calendar.data.timezone,'Asia/Dubai');
    const adminAnalytics=await req('admin','GET','/api/admin/analytics');
    assert.equal(adminAnalytics.status,200,'admin analytics available');
    assert.ok(Array.isArray(adminAnalytics.data.users_by_day)&&Array.isArray(adminAnalytics.data.lesson_subjects));
    assert.ok(Array.isArray(adminAnalytics.data.points_by_month)&&Array.isArray(adminAnalytics.data.recent_users));
    assert.equal((await req('parent','GET','/api/admin/analytics')).status,403,'analytics restricted to admin');
    const publicCalendar=await req('x','GET','/api/public/teachers/'+tid+'/calendar?duration=45');
    assert.equal(publicCalendar.status,200,'public visitor can browse available lesson times');
    assert.equal(publicCalendar.data.days.length,14);
    assert.equal((await req('x','GET','/api/public/teachers/'+tid+'/calendar?duration=15')).status,400);

    assert.equal((await req('x','GET','/api/teachers/'+tid+'/calendar?duration=45')).status,401);
    assert.equal((await req('parent','GET','/api/teachers/'+tid+'/calendar?duration=120')).status,400);

    assert.equal((await req('parent','POST','/api/parent/bookings',{teacher_id:tid,student_id:uid,minutes:45,start_at:'2099-12-15T14:00'})).status,201);
    assert.equal((await req('parent','POST','/api/parent/bookings',{teacher_id:tid,student_id:uid,minutes:60,start_at:'2099-12-15T14:15'})).status,409,'overlapping requests rejected');
    assert.equal((await req('teacher','GET','/api/teacher/bookings')).data.length,1);
    assert.equal((await req('parent','GET','/api/parent/bookings')).data[0].payment_status,'unpaid');
    assert.equal((await req('admin','GET','/api/admin/bookings')).data.length,1);
    // Demo point flow: admin grants points, parent transfers, admin settles 85%.
    const booking=(await req('parent','GET','/api/parent/bookings')).data[0];
    assert.equal((await req('parent','POST','/api/parent/bookings/'+booking.id+'/points',{})).status,409,'cannot pay before confirmation');
    assert.equal((await req('teacher','POST','/api/teacher/bookings/'+booking.id+'/confirm',{})).status,200);
    assert.equal((await req('admin','POST','/api/admin/points/grant',{parent_id:pid,points:200})).status,200);
    assert.equal((await req('parent','GET','/api/points/me')).data.balance,200);
    assert.equal((await req('parent','POST','/api/parent/bookings/'+booking.id+'/points',{})).status,200);
    assert.equal((await req('parent','GET','/api/points/me')).data.balance,100);
    assert.equal((await req('parent','POST','/api/parent/bookings/'+booking.id+'/points',{})).status,409,'cannot double-pay');
    assert.equal((await req('admin','POST','/api/admin/bookings/'+booking.id+'/settle-points',{})).status,409,'cannot settle before lesson');
    db.prepare('UPDATE lesson_bookings SET start_at=? WHERE id=?').run('2020-01-01T10:00',booking.id);
    assert.equal((await req('teacher','POST','/api/teacher/bookings/'+booking.id+'/complete',{})).status,200);
    const settlement=await req('admin','POST','/api/admin/bookings/'+booking.id+'/settle-points',{});
    assert.equal(settlement.status,200,JSON.stringify(settlement.data));
    assert.equal(settlement.data.teacher_points,85);
    assert.equal(settlement.data.admin_points,15);
    assert.equal((await req('teacher','GET','/api/points/me')).data.balance,85);
    assert.equal((await req('admin','POST','/api/admin/bookings/'+booking.id+'/settle-points',{})).status,409,'cannot double-settle');
    assert.equal((await req('parent','POST','/api/parent/bookings/'+booking.id+'/checkout',{})).status,404,'real checkout disabled');

    const cancelReq=await req('parent','POST','/api/parent/bookings',{teacher_id:tid,student_id:uid,minutes:45,start_at:'2099-12-15T16:00'});
    assert.equal(cancelReq.status,201);
    assert.equal((await req('parent','POST','/api/parent/bookings/'+cancelReq.data.id+'/cancel',{})).status,200);
    assert.equal((await req('parent','GET','/api/parent/bookings')).data.find(x=>x.id===cancelReq.data.id).status,'cancelled');
    // Refund lifecycle on a separate paid booking, preserving 85/15 settlement.
    const refundBooking=await req('parent','POST','/api/parent/bookings',{teacher_id:tid,student_id:uid,minutes:45,start_at:'2099-12-15T15:00'});
    assert.equal(refundBooking.status,201);
    assert.equal((await req('teacher','POST','/api/teacher/bookings/'+refundBooking.data.id+'/confirm',{})).status,200);
    assert.equal((await req('parent','POST','/api/parent/bookings/'+refundBooking.data.id+'/points',{})).status,200);
    const beforeRefund=(await req('parent','GET','/api/points/me')).data.balance;
    const request=await req('parent','POST','/api/parent/bookings/'+refundBooking.data.id+'/refund',{reason:'Schedule changed'});
    assert.equal(request.status,201,JSON.stringify(request.data));
    assert.equal((await req('parent','POST','/api/parent/bookings/'+refundBooking.data.id+'/refund',{reason:'Schedule changed'})).status,409);
    assert.equal((await req('teacher','POST','/api/teacher/bookings/'+refundBooking.data.id+'/complete',{})).status,409);
    assert.equal((await req('parent','POST','/api/admin/refunds/'+request.data.id+'/decision',{approve:true})).status,403);
    const approved=await req('admin','POST','/api/admin/refunds/'+request.data.id+'/decision',{approve:true});
    assert.equal(approved.status,200,JSON.stringify(approved.data));
    assert.equal(approved.data.points,100);
    assert.equal((await req('parent','GET','/api/points/me')).data.balance,beforeRefund+100);
    assert.equal((await req('admin','GET','/api/admin/refunds')).data[0].status,'approved');
    assert.equal((await req('parent','GET','/api/parent/refunds')).data[0].status,'approved');
    assert.equal((await req('admin','POST','/api/admin/refunds/'+request.data.id+'/decision',{approve:true})).status,409);
    assert.equal((await req('parent','GET','/api/parent/bookings')).data.find(x=>x.id===refundBooking.data.id).payment_status,'refunded');
    assert.deepEqual(db.pragma('foreign_key_check'),[],'foreign keys valid after role migration');

    // pages served with security headers
    const page = await fetch(base + '/'); assert.equal(page.status, 200); assert.ok(page.headers.get('content-security-policy'));
    console.log('All smoke tests passed ✓');
  } catch (e) { console.error('TEST FAILED:', e.message); process.exitCode = 1; }
  finally { server.close(); db.close(); for (const s of ['', '-wal', '-shm']) try { require('fs').unlinkSync(process.env.DB_PATH + s); } catch (e) { /* */ } }
});
