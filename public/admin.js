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

async function overview() {
  const v = $('view'); v.innerHTML = '<p class="note"><span class="spin"></span>Loading…</p>';
  let o; try { o = await api('/api/admin/overview'); } catch (e) { v.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  v.innerHTML = `
    <header><div><h1>Students</h1><p class="sub">Tap a student to see their full report.</p></div></header>
    <div class="tiles">
      <div class="tile"><span class="label">Students</span><b>${o.students.length}</b></div>
      <div class="tile"><span class="label">Claude this month</span><b>$${o.ai.monthCost.toFixed(2)}</b><span class="note">${o.ai.mock ? 'test mode' : o.ai.available ? `questions: ${esc(o.ai.model)} · explain: ${esc((o.ai.models||{}).explain||'')} · mark: ${esc((o.ai.models||{}).mark||'')} · limit $${o.ai.limit}` : 'not set up'}</span></div>
      <div class="tile"><span class="label">Reported questions</span><b>${o.flags}</b>${o.flags ? '<button class="linkbtn" id="flagsBtn">Review</button>' : '<span class="note">none open</span>'}</div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Student</th><th class="n">Sessions done</th><th>Quiz accuracy (7 days)</th><th class="n">All-time</th><th class="n">To learn</th><th>Last active</th><th>Status</th></tr></thead>
    <tbody>${o.students.map((s) => { const w = pct(s.week.right, s.week.n), a = pct(s.all.right, s.all.n); const tl = Object.values(s.memory).reduce((x, m) => x + m.toLearn, 0);
      return `<tr class="click" data-id="${s.id}"><td><b>${esc(s.display_name)}</b><br><span class="note">@${esc(s.username)}</span></td><td class="n">${s.sessionsDone}</td>
      <td>${w == null ? '<span class="note">no answers yet</span>' : `${w}% <span class="note">(${s.week.right}/${s.week.n})</span>${meter(w)}`}</td><td class="n">${a == null ? '–' : a + '%'}</td><td class="n">${tl}</td>
      <td>${ago(s.last_seen_at)}</td><td><span class="pill ${s.active ? 'ok' : 'off'}">${s.active ? 'active' : 'blocked'}</span></td></tr>`; }).join('') || '<tr><td colspan="7" class="note">No students yet. Add one below.</td></tr>'}</tbody></table></div>
    <form class="panel" id="addForm"><h3>Add a student</h3>
      <div class="form-row">
        <label class="field"><span>Name shown</span><input id="an" required maxlength="60" placeholder="Amer"></label>
        <label class="field"><span>Username</span><input id="au" required pattern="[a-zA-Z0-9._-]{3,32}" placeholder="amer"></label>
        <label class="field"><span>Password (min 8)</span><input id="ap" type="text" minlength="8" required></label>
        <button class="btn primary s-Math">Add student</button></div>
      <div class="err" id="aerr"></div>
      <p class="note">Only a username and a display name are stored. Share the password with the student privately.</p></form>`;
  applyMeters(v);
  v.querySelectorAll('tr.click').forEach((tr) => (tr.onclick = () => student(+tr.dataset.id)));
  if ($('flagsBtn')) $('flagsBtn').onclick = flags;
  $('addForm').onsubmit = async (e) => {
    e.preventDefault(); $('aerr').textContent = '';
    try { await api('/api/admin/students', { display_name: $('an').value.trim(), username: $('au').value.trim(), password: $('ap').value }); toast('Student added'); overview(); }
    catch (err) { $('aerr').textContent = err.message; }
  };
}

async function student(id) {
  const v = $('view'); v.innerHTML = '<p class="note"><span class="spin"></span>Loading…</p>';
  let r; try { r = await api(`/api/admin/students/${id}/report`); } catch (e) { v.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  const subj = Object.entries(r.bySubject);
  const maxN = Math.max(1, ...r.weekly.map((w) => w.n));
  v.innerHTML = `
    <button class="linkbtn" id="back">← All students</button>
    <header><div><h1>${esc(r.student.display_name)}</h1><p class="sub">@${esc(r.student.username)} · last active ${ago(r.student.last_seen_at)}</p></div></header>
    <div class="tiles">${subj.map(([s, o]) => { const m = pct(o.mcqRight, o.mcq), w = pct(o.marks, o.marksMax); const mem = r.memory[s];
      return `<div class="tile s-${s}"><span class="label">${s}</span><b>${m == null ? '–' : m + '%'}</b><span class="note">quiz (${o.mcqRight}/${o.mcq}) · written ${w == null ? '–' : w + '%'}</span>${meter(m)}<span class="note">${mem.toLearn} to learn · ${mem.due} due · ${mem.learned} learned</span></div>`; }).join('')}</div>
    <div class="section"><h2>Topics, weakest first</h2>
      <div class="table-wrap"><table><thead><tr><th>Topic</th><th>Quiz accuracy</th><th class="n">Answered</th></tr></thead><tbody>
      ${r.topics.map((t) => { const p = pct(t.right, t.n); return `<tr><td>${esc(t.name || t.set)}</td><td>${p}% ${meter(p)}</td><td class="n">${t.n}</td></tr>`; }).join('') || '<tr><td colspan="3" class="note">No answers yet.</td></tr>'}</tbody></table></div></div>
    <div class="section"><h2>Questions answered per week</h2>
      <div class="panel">${r.weekly.length ? `<div class="bars">${r.weekly.map((w) => `<div><span>${pct(w.c || 0, w.n)}%</span><span class="b" data-h="${(w.n / maxN) * 100}"></span><span>wk ${w.wk.slice(5)}</span></div>`).join('')}</div><p class="note">Bar height = questions answered that week; the number on top = accuracy.</p>` : '<p class="note">No answers yet.</p>'}</div></div>
    <div class="section"><h2>Recent mistakes</h2>
      <div class="table-wrap"><table><thead><tr><th>Session</th><th>Question</th><th>Chose</th><th>Correct</th></tr></thead><tbody>
      ${r.recentWrong.map((w) => `<tr><td>${esc(w.label)}<br><span class="note">${esc(w.subject)}</span></td><td>${esc(w.q)}</td><td>${esc(w.chose)}</td><td>${esc(w.correct)}</td></tr>`).join('') || '<tr><td colspan="4" class="note">No mistakes yet.</td></tr>'}</tbody></table></div></div>
    <div class="section"><h2>Sessions</h2>
      <div class="table-wrap"><table><thead><tr><th>Session</th><th>Topic</th><th class="n">Quiz</th><th>Status</th></tr></thead><tbody>
      ${r.sessions.map((s) => `<tr><td>${esc(s.label)}<br><span class="note">${esc(s.sub)}</span></td><td>${esc(s.topic)}</td><td class="n">${s.mcqRight}/${s.mcqAnswered}</td><td><span class="pill ${s.done ? 'ok' : 'mid'}">${s.done ? 'done' : 'started'}</span></td></tr>`).join('') || '<tr><td colspan="4" class="note">No sessions started yet.</td></tr>'}</tbody></table></div></div>
    <form class="panel" id="editForm"><h3>Account</h3>
      <div class="form-row"><label class="field"><span>New password</span><input id="np" type="text" minlength="8" placeholder="leave empty to keep"></label>
      <button class="btn">Save password</button><button class="btn" type="button" id="toggle">Block / unblock</button></div><div class="err" id="eerr"></div></form>`;
  applyMeters(v);
  $('back').onclick = overview;
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
