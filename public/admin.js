// Admin page: students, progress reports, reported questions, Claude usage.
async function boot() {
  let me;
  try { me = await api('/api/me'); }
  catch (e) { if (e.status === 401) return renderLogin($('root'), (r) => (r.role === 'admin' ? boot() : (location.href = '/')), true); $('root').innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  if (me.role !== 'admin') { location.href = '/'; return; }
  $('root').innerHTML = `<div class="topbar"><div class="label">Tutor admin</div><div class="who">${esc(me.name)} · <button class="linkbtn" id="outBtn">Log out</button></div></div><div id="view" class="section"></div>`;
  $('outBtn').onclick = logout;
  overview();
}
const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
const lvl = (p) => (p == null ? '' : p >= 80 ? 'lvl-good' : p >= 50 ? 'lvl-mid' : 'lvl-low');
function meter(p) { return `<div class="meter"><i class="${lvl(p)}" data-w="${p || 0}"></i></div>`; }
function applyMeters(root) { root.querySelectorAll('[data-w]').forEach((i) => { i.style.width = i.dataset.w + '%'; }); root.querySelectorAll('[data-h]').forEach((i) => { i.style.height = i.dataset.h + '%'; }); }
function ago(ts) { if (!ts) return 'never'; const d = (Date.now() - new Date(ts.replace(' ', 'T') + 'Z')) / 6e4; return d < 60 ? Math.round(d) + ' min ago' : d < 1440 ? Math.round(d / 60) + ' h ago' : Math.round(d / 1440) + ' days ago'; }

// ---------- study profile form (school, programme, grade, class, course, subjects) ----------
let OPTS = null;
async function options(force) { if (!OPTS || force) OPTS = await api('/api/admin/options'); return OPTS; }
const progOf = (g) => Object.keys(OPTS.programmes).find((k) => OPTS.programmes[k].grades.includes(Number(g)));

// Renders the form into `box` and returns a function that reads it back as the API's profile object.
function profileForm(box, v) {
  v = v || {};
  const P = OPTS.programmes, prog0 = v.programme || 'MYP';
  box.innerHTML = `<div class="form-row">
      <label class="field"><span>School</span><select data-f="school">${OPTS.schools.map((x) => `<option value="${x.id}" ${x.id === v.school_id ? 'selected' : ''}>${esc(x.name)}${x.kind === 'family' ? ' (direct families)' : ''}</option>`).join('')}</select></label>
      <label class="field"><span>Programme</span><select data-f="prog">${Object.keys(P).map((k) => `<option value="${k}" ${k === prog0 ? 'selected' : ''}>${esc(P[k].name)}</option>`).join('')}</select></label>
      <label class="field"><span>Grade</span><select data-f="grade"></select></label>
      <label class="field"><span>Class (optional)</span><input data-f="cls" maxlength="20" placeholder="9B" value="${esc(v.class_name || '')}"></label>
      <label class="field"><span>Study plan (course)</span><select data-f="course"></select></label></div>
    <div class="subj-pick" data-f="subjects"></div>`;
  const q = (f) => box.querySelector(`[data-f="${f}"]`);
  const had = new Map((v.subjects || []).map((s) => [s.group + '|' + s.subject, s.level || '']));
  function fillGrade(keep) {
    const g = P[q('prog').value].grades;
    q('grade').innerHTML = g.map((n) => `<option value="${n}" ${n === Number(keep) ? 'selected' : ''}>Grade ${n}</option>`).join('');
  }
  function fillCourse(keep) {
    const list = OPTS.courses.filter((c) => c.programme === q('prog').value && c.grade === Number(q('grade').value));
    q('course').innerHTML = '<option value="">No plan yet</option>' + list.map((c) => `<option value="${esc(c.id)}" ${c.id === keep ? 'selected' : ''}>${esc(c.title)}</option>`).join('');
  }
  function fillSubjects() {
    q('subjects').innerHTML = `<span class="label">Subjects</span>` + P[q('prog').value].groups.map((g) => `<div class="subj-group"><b>${esc(g.name)}</b><div class="subj-list">${g.subjects.map((s) => {
      const key = g.id + '|' + s, on = had.has(key), lv = had.get(key) || '';
      return `<span class="subj"><label><input type="checkbox" data-g="${g.id}" data-s="${esc(s)}" ${on ? 'checked' : ''}> ${esc(s)}</label>${g.levels ? `<select data-lv aria-label="Level for ${esc(s)}" ${on ? '' : 'disabled'}>${g.levels.map((l) => `<option ${l === lv ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>` : ''}</span>`;
    }).join('')}</div></div>`).join('');
    q('subjects').querySelectorAll('input[type=checkbox]').forEach((c) => (c.onchange = () => { const l = c.closest('.subj').querySelector('[data-lv]'); if (l) l.disabled = !c.checked; }));
  }
  fillGrade(v.grade || P[prog0].grades[0]); fillCourse(v.course_id || ''); fillSubjects();
  q('prog').onchange = () => { fillGrade(); fillCourse(); fillSubjects(); };
  q('grade').onchange = () => fillCourse();
  return () => ({
    school_id: Number(q('school').value), programme: q('prog').value, grade: Number(q('grade').value), class_name: q('cls').value.trim(),
    course_id: q('course').value || null,
    subjects: [...q('subjects').querySelectorAll('input[type=checkbox]:checked')].map((c) => {
      const l = c.closest('.subj').querySelector('[data-lv]');
      return { group: c.dataset.g, subject: c.dataset.s, ...(l ? { level: l.value } : {}) };
    }),
  });
}

async function overview() {
  const v = $('view'); v.innerHTML = '<p class="note"><span class="spin"></span>Loading…</p>';
  let o; try { [o] = await Promise.all([api('/api/admin/overview'), options(true)]); } catch (e) { v.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  v.innerHTML = `
    <header><div><h1>Students</h1><p class="sub">Tap a student to see their full report. <a href="/report/weekly" target="_blank" rel="noopener">Weekly report (Persian)</a></p></div></header>
    <div class="tiles">
      <div class="tile"><span class="label">Students</span><b>${o.students.length}</b></div>
      <div class="tile"><span class="label">Claude this month</span><b>$${o.ai.monthCost.toFixed(2)}</b><span class="note">${o.ai.mock ? 'test mode' : o.ai.available ? `questions: ${esc(o.ai.model)} · explain: ${esc((o.ai.models||{}).explain||'')} · mark: ${esc((o.ai.models||{}).mark||'')} · limit $${o.ai.limit}` : 'not set up'}</span></div>
      <div class="tile"><span class="label">Reported questions</span><b>${o.flags}</b>${o.flags ? '<button class="linkbtn" id="flagsBtn">Review</button>' : '<span class="note">none open</span>'}</div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Student</th><th>School · grade</th><th class="n">Sessions done</th><th>Quiz accuracy (7 days)</th><th class="n">All-time</th><th class="n">To learn</th><th>Last active</th><th>Status</th></tr></thead>
    <tbody>${o.students.map((s) => { const w = pct(s.week.right, s.week.n), a = pct(s.all.right, s.all.n); const tl = Object.values(s.memory).reduce((x, m) => x + m.toLearn, 0);
      return `<tr class="click" data-id="${s.id}"><td><b>${esc(s.display_name)}</b><br><span class="note">@${esc(s.username)}</span></td><td>${s.grade ? `${esc(s.programme)} ${s.grade}${s.class_name ? ' · ' + esc(s.class_name) : ''}` : '–'}<br><span class="note">${esc(s.school || '')}${s.grade && !s.course_id ? ' · no plan yet' : ''}</span></td><td class="n">${s.sessionsDone}</td>
      <td>${w == null ? '<span class="note">no answers yet</span>' : `${w}% <span class="note">(${s.week.right}/${s.week.n})</span>${meter(w)}`}</td><td class="n">${a == null ? '–' : a + '%'}</td><td class="n">${tl}</td>
      <td>${ago(s.last_seen_at)}</td><td><span class="pill ${s.active ? 'ok' : 'off'}">${s.active ? 'active' : 'blocked'}</span></td></tr>`; }).join('') || '<tr><td colspan="8" class="note">No students yet. Add one below.</td></tr>'}</tbody></table></div>
    <form class="panel" id="addForm"><h3>Add a student</h3>
      <div class="form-row">
        <label class="field"><span>Name shown</span><input id="an" required maxlength="60" placeholder="Amer"></label>
        <label class="field"><span>Username</span><input id="au" required pattern="[a-zA-Z0-9._\-]{3,32}" placeholder="amer"></label>
        <label class="field"><span>Password (min 8)</span><input id="ap" type="text" minlength="8" required></label></div>
      <div id="aprof"></div>
      <div class="row"><button class="btn primary s-Math">Add student</button></div>
      <div class="err" id="aerr"></div>
      <p class="note">Only a username, a display name and the study profile are stored. Share the password with the student privately.</p></form>
    <div class="section"><h2>Schools</h2>
      <div class="table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th class="n">Students</th></tr></thead><tbody>
      ${OPTS.schools.map((x) => `<tr><td>${esc(x.name)}</td><td>${x.kind === 'family' ? 'Direct families' : 'School'}</td><td class="n">${x.students}</td></tr>`).join('')}</tbody></table></div>
      <form class="panel" id="schForm"><h3>Add a school</h3><div class="form-row">
        <label class="field"><span>Name</span><input id="sn" required minlength="2" maxlength="80" placeholder="Dubai International Academy"></label>
        <label class="field"><span>Type</span><select id="sk"><option value="school">School</option><option value="family">Group of direct families</option></select></label>
        <button class="btn primary s-Math">Add school</button></div><div class="err" id="serr"></div></form></div>`;
  const readProfile = profileForm($('aprof'), { school_id: (OPTS.schools[0] || {}).id, programme: 'MYP', grade: 9 });
  $('schForm').onsubmit = async (e) => {
    e.preventDefault(); $('serr').textContent = '';
    try { await api('/api/admin/schools', { name: $('sn').value.trim(), kind: $('sk').value }); toast('School added'); overview(); }
    catch (err) { $('serr').textContent = err.message; }
  };
  applyMeters(v);
  v.querySelectorAll('tr.click').forEach((tr) => (tr.onclick = () => student(+tr.dataset.id)));
  if ($('flagsBtn')) $('flagsBtn').onclick = flags;
  $('addForm').onsubmit = async (e) => {
    e.preventDefault(); $('aerr').textContent = '';
    try { await api('/api/admin/students', { display_name: $('an').value.trim(), username: $('au').value.trim(), password: $('ap').value, profile: readProfile() }); toast('Student added'); overview(); }
    catch (err) { $('aerr').textContent = err.message; }
  };
}

async function student(id) {
  const v = $('view'); v.innerHTML = '<p class="note"><span class="spin"></span>Loading…</p>';
  let r; try { [r] = await Promise.all([api(`/api/admin/students/${id}/report`), options()]); } catch (e) { v.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  const pf = r.profile || {};
  const subj = Object.entries(r.bySubject);
  const maxN = Math.max(1, ...r.weekly.map((w) => w.n));
  v.innerHTML = `
    <button class="linkbtn" id="back">← All students</button>
    <header><div><h1>${esc(r.student.display_name)}</h1><p class="sub">@${esc(r.student.username)} · ${pf.grade ? `${esc(pf.programme)} Grade ${pf.grade}${pf.class_name ? ' · ' + esc(pf.class_name) : ''} · ${esc(pf.school || '')} · ` : ''}last active ${ago(r.student.last_seen_at)}</p></div></header>
    <div class="tiles">${subj.map(([s, o]) => { const m = pct(o.mcqRight, o.mcq), w = pct(o.marks, o.marksMax); const mem = r.memory[s];
      return `<div class="tile s-${s}"><span class="label">${s}</span><b>${m == null ? '–' : m + '%'}</b><span class="note">quiz (${o.mcqRight}/${o.mcq}) · written ${w == null ? '–' : w + '%'}</span>${meter(m)}<span class="note">${mem.toLearn} to learn · ${mem.due} due · ${mem.learned} learned</span></div>`; }).join('')}</div>
    <div class="section"><h2>Topics, weakest first</h2>
      <div class="table-wrap"><table><thead><tr><th>Topic</th><th>Quiz accuracy</th><th class="n">Answered</th></tr></thead><tbody>
      ${r.topics.map((t) => { const p = pct(t.right, t.n); return `<tr><td>${esc(t.name || t.set)}</td><td>${p}% ${meter(p)}</td><td class="n">${t.n}</td></tr>`; }).join('') || '<tr><td colspan="3" class="note">No answers yet.</td></tr>'}</tbody></table></div></div>
    <div class="section"><h2>MYP criteria (Claude's level estimates)</h2>
      <div class="table-wrap"><table><thead><tr><th>Subject</th><th>Criterion</th><th class="n">Average level</th><th class="n">Best</th><th class="n">Tasks</th></tr></thead><tbody>
      ${(r.criteria || []).map((c) => `<tr><td>${esc(c.sub)}</td><td>${esc(c.crit)} · ${esc(c.name)}</td><td class="n">${c.avg} / 8 ${meter(c.avg / 8 * 100)}</td><td class="n">${c.best}</td><td class="n">${c.n}</td></tr>`).join('') || '<tr><td colspan="5" class="note">No criterion tasks marked with Claude yet.</td></tr>'}</tbody></table></div></div>
    <div class="section"><h2>Questions answered per week</h2>
      <div class="panel">${r.weekly.length ? `<div class="bars">${r.weekly.map((w) => `<div><span>${pct(w.c || 0, w.n)}%</span><span class="b" data-h="${(w.n / maxN) * 100}"></span><span>wk ${w.wk.slice(5)}</span></div>`).join('')}</div><p class="note">Bar height = questions answered that week; the number on top = accuracy.</p>` : '<p class="note">No answers yet.</p>'}</div></div>
    <div class="section"><h2>Recent mistakes</h2>
      <div class="table-wrap"><table><thead><tr><th>Session</th><th>Question</th><th>Chose</th><th>Correct</th></tr></thead><tbody>
      ${r.recentWrong.map((w) => `<tr><td>${esc(w.label)}<br><span class="note">${esc(w.subject)}</span></td><td>${esc(w.q)}</td><td>${esc(w.chose)}</td><td>${esc(w.correct)}</td></tr>`).join('') || '<tr><td colspan="4" class="note">No mistakes yet.</td></tr>'}</tbody></table></div></div>
    <div class="section"><h2>Sessions</h2>
      <div class="table-wrap"><table><thead><tr><th>Session</th><th>Topic</th><th class="n">Quiz</th><th>Status</th></tr></thead><tbody>
      ${r.sessions.map((s) => `<tr><td>${esc(s.label)}<br><span class="note">${esc(s.sub)}</span></td><td>${esc(s.topic)}</td><td class="n">${s.mcqRight}/${s.mcqAnswered}</td><td><span class="pill ${s.done ? 'ok' : 'mid'}">${s.done ? 'done' : 'started'}</span></td></tr>`).join('') || '<tr><td colspan="4" class="note">No sessions started yet.</td></tr>'}</tbody></table></div></div>
    <form class="panel" id="profForm"><h3>Study profile</h3>
      <div id="eprof"></div>
      <div class="row"><button class="btn primary s-Math">Save profile</button><span class="note">Plan now: <b>${esc(pf.course || 'none')}</b></span></div>
      <div class="err" id="perr"></div>
      <p class="note">Changing the study plan starts a fresh plan for the student. Earlier sessions, answers and the memory bank are kept and shown as "earlier course".</p></form>
    <form class="panel" id="editForm"><h3>Account</h3>
      <div class="form-row"><label class="field"><span>New password</span><input id="np" type="text" minlength="8" placeholder="leave empty to keep"></label>
      <button class="btn">Save password</button><button class="btn" type="button" id="toggle">Block / unblock</button></div><div class="err" id="eerr"></div>
      <div class="form-row"><span>Claude (AI) for this student: <b>${r.student.ai_allowed ? 'allowed' : 'blocked'}</b>${r.student.ai_allowed && r.prefs && r.prefs.ai === false ? ' (the student turned it off in Settings)' : ''}</span>
      <button class="btn" type="button" id="aiToggle">${r.student.ai_allowed ? 'Block Claude' : 'Allow Claude'}</button></div>
      <p class="note">Blocked: no Claude-written questions, explanations, marking or photo checks for this student (question bank only, no cost).</p></form>`;
  applyMeters(v);
  $('back').onclick = overview;
  const readP = profileForm($('eprof'), pf);
  $('profForm').onsubmit = async (e) => {
    e.preventDefault(); $('perr').textContent = '';
    const next = readP();
    if ((next.course_id || null) !== (pf.course_id || null) && !confirm('Change the study plan? The student starts the new plan from the beginning; history is kept.')) return;
    try { await api(`/api/admin/students/${id}/profile`, next, 'PUT'); toast('Profile saved'); student(id); } catch (err) { $('perr').textContent = err.message; }
  };
  $('aiToggle').onclick = async () => { try { await api(`/api/admin/students/${id}/ai`, { allowed: !r.student.ai_allowed }); toast(r.student.ai_allowed ? 'Claude blocked for this student' : 'Claude allowed'); student(id); } catch (e) { $('eerr').textContent = e.message; } };
  $('editForm').onsubmit = async (e) => { e.preventDefault(); if (!$('np').value) return; try { await api(`/api/admin/students/${id}`, { password: $('np').value }, 'PATCH'); toast('Password changed; the student must log in again'); $('np').value = ''; } catch (err) { $('eerr').textContent = err.message; } };
  $('toggle').onclick = async () => {
    const o = await api('/api/admin/overview'); const s = o.students.find((x) => x.id === id);
    try { await api(`/api/admin/students/${id}`, { active: !s.active }, 'PATCH'); toast(s.active ? 'Student blocked' : 'Student unblocked'); } catch (err) { $('eerr').textContent = err.message; }
  };
}

async function flags() {
  const v = $('view'); v.innerHTML = '<p class="note"><span class="spin"></span>Loading…</p>';
  const list = await api('/api/admin/flags');
  v.innerHTML = `<button class="linkbtn" id="back">← All students</button><header><div><h1>Reported questions</h1><p class="sub">Disable a question to remove it from every future session.</p></div></header>
    <div class="list">${list.map((f) => `<div class="panel"><span class="label">${f.source === 'ai' ? 'Written by Claude' : 'Question bank'} · reported by ${esc(f.who || '?')} · ${esc(f.created_at)}</span>
      <b>${esc(f.body.q)}</b>
      ${f.type === 'm' ? `<ol type="A">${f.body.options.map((o, j) => `<li>${esc(o)}${j === f.body.answer ? ' ✓' : ''}</li>`).join('')}</ol><p class="note">${esc(f.body.explanation)}</p>` : `<ul>${f.body.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`}
      ${f.note ? `<p><strong>Note:</strong> ${esc(f.note)}</p>` : ''}
      <div class="row"><button class="btn" data-id="${f.id}" data-dis="1">Disable question</button><button class="btn" data-id="${f.id}" data-dis="0">Question is fine</button></div></div>`).join('') || '<p class="note">Nothing reported.</p>'}</div>`;
  $('back').onclick = overview;
  v.querySelectorAll('[data-id]').forEach((b) => (b.onclick = async () => { await api(`/api/admin/flags/${b.dataset.id}/resolve`, { disable: b.dataset.dis === '1' }); toast('Done'); flags(); }));
}

boot();
