// Student page: weekly plan, session card, questions, marking and explanations. All data lives on the server.
const L = 'ABCD';
const ST = { mode: 'study', quiz: null, curTopic: null, me: null, plan: null, selW: 0, selD: 0, todayW: -1, todayD: -1, run: null, busy: false, timer: null, tLeft: 1800, prefs: { sessionMinutes: 30, ai: true }, tKey: null };

const STEPS = {
  fix: [['5 min', 'Look back', 'Every question below is one you got wrong and haven\'t learned yet. Use "Explain this question" first.'], ['20 min', 'Try again', 'No notes. Each right answer moves it closer to "learned".'], ['5 min', 'Still wrong?', 'It stays in the memory bank and returns next session.']],
  mock: [['20 min', 'Timed quiz', 'Start the timer. No notes, no phone.'], ['10 min', 'Written + marking', 'Answer the written questions, then mark them.']],
  practice: [['20 min', 'Quiz', 'Work on your own. Read each explanation, even when right.'], ['10 min', 'Written', 'Full working, then check the mark scheme.']],
  review: [['15 min', 'Quiz', "This week's topic plus questions you got wrong before."], ['15 min', 'Written', 'Written questions, then the mark scheme.']],
  english: [['10 min', 'Learn', 'Open Learn topics for this lesson, or ask AMER for a short lesson.'], ['10 min', 'Quiz', 'Techniques, context and structure questions.'], ['10 min', 'Written', 'Write the paragraph, mark it, then use "Explain this question" for feedback.']],
  learn: [['10 min', 'Learn', 'New topic? Open "Need a lesson first?" and send the prompt to AMER.'], ['10 min', 'Quiz', 'Red "REVIEW" questions are old mistakes coming back.'], ['10 min', 'Written', 'Answer, then check with the mark scheme.']],
};
// Learn step for courses without the AMER lesson prompt (it is set up for Grade 9 MYP only).
const LEARN_OWN = ['10 min', 'Learn', 'New topic? Read your class notes on it first, then use "Explain this question" on every mistake.'];
const KIND = { learn: 'New lesson', practice: 'Practice', review: 'Review', mock: 'Test prep', fix: 'Mistakes day' };

async function boot() {
  try { ST.me = await api('/api/me'); }
  catch (e) { if (e.status === 401) return renderLogin($('root'), (r) => (r.role === 'admin' ? (location.href = '/admin') : boot())); $('root').innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  if (ST.me.role === 'admin') { location.href = '/admin'; return; }
  // Browser tab shows whoever is logged in, e.g. "Mahan's Study Week".
  const nm = String(ST.me.name || '').trim();
  document.title = nm ? `${nm}${/s$/i.test(nm) ? "'" : "'s"} Study Week` : 'Study Week';
  try { ST.prefs = await api('/api/me/prefs'); } catch (e) { /* defaults */ }
  ST.tLeft = sessSecs();
  await loadPlan(true);
}

async function loadPlan(pickToday) {
  ST.plan = await api('/api/plan');
  if (!ST.plan.weeks.length) { renderShell(); return; }
  if (pickToday) {
    const today = new Date(); const iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    ST.plan.weeks.forEach((w, wi) => w.days.forEach((d, di) => { if (d.date === iso) { ST.todayW = wi; ST.todayD = di; } }));
    if (ST.todayW >= 0) { ST.selW = ST.todayW; ST.selD = ST.todayD; }
    else {
      // Saturday or outside the term: jump to the next session, or the last one.
      const next = ST.plan.weeks.flatMap((w, wi) => w.days.map((d, di) => ({ d, wi, di }))).find((x) => x.d.date > iso);
      if (next) { ST.selW = next.wi; ST.selD = next.di; } else { ST.selW = ST.plan.weeks.length - 1; ST.selD = 5; }
    }
  }
  renderShell();
  await openSession();
}

function renderShell() {
  $('root').innerHTML = `
  <div class="topbar"><div class="tabs"><button data-v="study" class="sel">Study plan</button>${ST.me.course && ST.me.course.learn ? '<button data-v="learn">Learn topics</button>' : ''}</div>
    <div class="menu-wrap"><span class="who-name">${esc(ST.me.name)}</span>
      <button class="icon-btn" id="menuBtn" aria-label="Menu" aria-haspopup="true" aria-expanded="false">${ICON.menu}</button>
      <div class="menu" id="menu" role="menu" hidden>
        <div class="menu-head"><b>${esc(ST.me.name)}</b><span class="note">@${esc(ST.me.username || '')}</span></div>
        <button role="menuitem" data-act="install" id="installItem" hidden>${ICON.install}<span>Install app</span></button>
        <button role="menuitem" data-act="remind">${ICON.bell}<span>Daily reminder</span></button>
        <button role="menuitem" data-act="settings">${ICON.gear}<span>Settings</span></button>
        <button role="menuitem" data-act="password">${ICON.key}<span>Change password</span></button>
        <div class="menu-sep"></div>
        <button role="menuitem" data-act="logout">${ICON.out}<span>Log out</span></button>
      </div></div></div>
  <div class="remind" id="remindBox" hidden></div>
  <div id="learnView" hidden><div class="learn"><nav class="tlist" id="tlist" aria-label="Topics"></nav><div id="lessonWrap"></div></div></div>
  <div id="studyView" class="section">
  <header><div><h1>What do I study today?</h1><p class="sub">Every session: 10 quiz + 5 written questions. Wrong answers come back until they stick.</p></div>
    <div class="progress"><span id="progTxt"></span><div class="bar"><i id="progBar"></i></div></div></header>
  <nav class="weeks" id="weeks" aria-label="Weeks"></nav>
  <div class="days" id="days" role="tablist" aria-label="Days"></div>
  <div class="main"><section id="card" aria-live="polite"></section>
    <aside>
      <div class="panel"><h3>Memory bank</h3><div class="mem" id="mem"></div><p class="note">A wrong answer returns next session, then after 3 days, then a week. Three right in a row = learned.</p></div>
      <div class="panel"><h3>Coming up</h3><ul class="tests" id="tests"></ul></div>
      <div class="panel"><h3>Every session</h3><ul class="checks"><li>Units on every Physics &amp; Chemistry answer</li><li>Full working in Math, one step per line</li><li>Use "Explain this question" on every mistake</li></ul></div>
    </aside></div></div>`;
  document.querySelectorAll('.tabs [data-v]').forEach((b) => (b.onclick = () => setMode(b.dataset.v)));
  wireMenu();
  wireInstall();
  if (!ST.plan.weeks.length) { renderNoPlan(); return; }
  renderNav(); renderSide();
}

// A student whose grade has no study plan yet (new school or grade): say so plainly instead of an empty page.
function renderNoPlan() {
  const p = ST.me.profile || {};
  const who = [p.programme && p.grade ? `${p.programme} · Grade ${p.grade}` : '', p.class_name, p.school].filter(Boolean).join(' · ');
  $('studyView').innerHTML = `<div class="panel empty-plan"><h1>Your study plan is on its way</h1>
    <p>${who ? esc(who) + '. ' : ''}A weekly plan for your grade has not been added yet. When your school or parent adds it, your daily sessions will appear here.</p>
    <p class="note">You can already set your reminder time and preferences from the menu (☰).</p></div><section id="card" aria-live="polite"></section>`;
}

function renderNav() {
  const wb = $('weeks'); wb.innerHTML = '';
  ST.plan.weeks.forEach((w, i) => {
    const b = document.createElement('button');
    b.innerHTML = `<b>Week ${i + 1}</b><span>${esc(w.label)}</span>`;
    b.className = (i === ST.selW ? 'sel ' : '') + (i === ST.todayW ? 'now' : '');
    b.onclick = () => { ST.selW = i; ST.selD = i === ST.todayW ? ST.todayD : 0; renderNav(); openSession(); };
    wb.appendChild(b);
  });
  const db = $('days'); db.innerHTML = '';
  ST.plan.weeks[ST.selW].days.forEach((d, i) => {
    const b = document.createElement('button'); b.setAttribute('role', 'tab');
    b.className = 'day' + (i === ST.selD ? ' sel' : '') + (ST.selW === ST.todayW && i === ST.todayD ? ' today' : '') + (d.done ? ' isdone' : '');
    b.innerHTML = `<span class="dn">${d.day.slice(0, 3)}</span><span class="dd">${fmtDate(d.date)}</span><span class="chip c-${col(d)}">${d.sub === 'Mock' ? 'Mock test' : esc(d.sub)}</span>`;
    b.onclick = () => { ST.selD = i; renderNav(); openSession(); };
    db.appendChild(b);
  });
  const n = ST.plan.weeks.flatMap((w) => w.days).filter((d) => d.done).length, tot = ST.plan.weeks.flatMap((w) => w.days).length;
  $('progTxt').textContent = `${n} / ${tot} sessions done`;
  $('progBar').style.width = (n / tot * 100) + '%';
}

function renderSide() {
  if (!$('mem')) return;
  const m = ST.plan.memory;
  $('mem').innerHTML = '<div class="label"><span>Subject</span><span>to learn · due · learned</span></div>' +
    Object.entries(m).map(([s, r]) => `<div><span>${s}</span><span><b>${r.toLearn}</b> · ${r.due} · <span class="pill ok">${r.learned}</span></span></div>`).join('');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  $('tests').innerHTML = ST.plan.tests.filter((t) => new Date(t[0] + 'T00:00:00') >= now).slice(0, 5).map((t) => {
    const days = Math.round((new Date(t[0] + 'T00:00:00') - now) / 864e5);
    return `<li class="${days <= 7 ? 'soon' : ''}"><span class="d">${fmtDate(t[0])}</span><span>${esc(t[1])}<br><span class="label">${days === 0 ? 'today' : days === 1 ? 'tomorrow' : 'in ' + days + ' days'}</span></span></li>`;
  }).join('');
}

// Colour family of a session: a course may name its own (e.g. "Math AA SL" uses Math's colour).
const col = (d) => d.color || (/^[A-Za-z]+$/.test(d.sub) ? d.sub : 'Other');
const day = () => (ST.mode === 'learn' && ST.quiz ? ST.quiz : ST.plan.weeks[ST.selW].days[ST.selD]);
const skey = () => day().skey;

function lessonPrompt(d) {
  const s = d.sub === 'Mock' ? 'Mixed' : d.sub;
  return d.kind === 'learn' ? `AMER, ${s}, ${d.topic}. Teach me this in 10 minutes with one worked example, then check my understanding with 2 quick questions.`
    : `AMER, ${s}, ${d.topic}. Explain the key ideas I need for this topic, with one worked example.`;
}

async function openSession() {
  if (!ST.plan.weeks.length) { renderNoPlan(); return; }
  const d = day(), k = d.skey;
  if (ST.tKey !== k) { clearInterval(ST.timer); ST.timer = null; ST.tLeft = sessSecs(); ST.tKey = k; }
  $('card').innerHTML = `<div class="card s-${col(d)}">
    <div class="when"><span class="chip c-${col(d)}">${d.sub === 'Mock' ? 'Mock test' : esc(d.sub)}</span><span class="label">${d.day} ${fmtDate(d.date)} · ${KIND[d.kind]} · ${ST.prefs.sessionMinutes} min</span></div>
    <h2>${esc(d.topic)}</h2>
    ${d.test ? `<div class="alert"><strong>Test ahead:</strong> ${esc(d.test)}</div>` : ''}
    ${d.note ? `<div class="alert"><strong>Heads up:</strong> ${esc(d.note)}</div>` : ''}
    <ol class="steps">${(d.sub === 'English' ? STEPS.english : d.kind === 'learn' && !(ST.me.course && ST.me.course.grade === 9) ? [LEARN_OWN, ...STEPS.learn.slice(1)] : STEPS[d.kind]).map((s) => `<li><span class="t">${s[0]}</span><div><b>${s[1]}</b><p>${esc(s[2])}</p></div></li>`).join('')}</ol>
    <details class="prompt" ${d.kind === 'fix' || !(ST.me.course && ST.me.course.programme === 'MYP' && ST.me.course.grade === 9) ? 'hidden' : ''}><summary>${d.kind === 'learn' ? 'Need a lesson first? Ask AMER' : 'Need help with the topic? Ask AMER'}</summary>
      <code id="pt">${esc(lessonPrompt(d))}</code><button class="btn" id="copy">Copy prompt</button></details>
    <div class="prac" id="prac"><p class="note"><span class="spin"></span>Loading…</p></div>
    <div class="row"><button class="btn" id="doneBtn" hidden></button></div>
  </div>`;
  $('copy').onclick = async () => { try { await navigator.clipboard.writeText($('pt').textContent); toast('Copied'); } catch (e) { const r = document.createRange(); r.selectNodeContents($('pt')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Selected — press Ctrl+C'); } };
  try { ST.run = await api('/api/runs/' + k); } catch (e) { $('prac').innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  if (skey() !== k) return; // user moved on
  renderRun();
}

function renderDoneBtn() {
  const b = $('doneBtn'), d = day();
  if (!b) return;
  if (!ST.run || !ST.run.started || ST.mode === 'learn') { b.hidden = true; return; }
  b.hidden = false; b.className = 'btn ' + (d.done ? 'isdone' : 'primary'); b.textContent = d.done ? '✓ Session done' : 'Mark session done';
  b.onclick = async () => { try { await api(`/api/runs/${d.skey}/done`, { done: !d.done }); d.done = !d.done; renderNav(); renderDoneBtn(); } catch (e) { toast(e.message); } };
}

function renderRun() {
  const r = ST.run, d = day(), box = $('prac');
  renderDoneBtn();
  if (!r.started) {
    if (d.kind === 'fix' && !r.mix.rev) { box.innerHTML = '<div class="start"><b>Nothing to fix right now.</b><span class="note">Every quiz question you get wrong, and every written answer that misses marks, goes into the memory bank and shows up here.</span></div>'; return; }
    box.innerHTML = `<div class="start"><b>${d.kind === 'fix' ? "Today's mistakes" : "Today's 10 quiz + 5 written questions"}</b>
      <div class="mix">${r.mix.rev ? `<span>🔁 ${r.mix.rev} review (old mistakes)</span>` : ''}${r.mix.bank ? `<span>📘 ${r.mix.bank} from the question bank</span>` : ''}${r.mix.ai ? `<span>✨ ${r.mix.ai} new, written by Claude</span>` : ''}</div>
      ${r.mix.ai && !r.aiAvailable ? '<span class="note">Claude is not set up yet, so the session starts with bank questions only.</span>' : ''}
      ${r.mix.ai && r.aiAvailable ? '<span class="note">Claude needs up to a minute to write the new questions.</span>' : ''}
      <div class="row"><button class="btn primary" id="startBtn">Start session</button><span class="note" id="startMsg"></span></div></div>`;
    $('startBtn').onclick = async (e) => {
      e.target.disabled = true; $('startMsg').innerHTML = r.mix.ai && r.aiAvailable ? '<span class="spin"></span>Claude is writing new questions…' : '<span class="spin"></span>Preparing…';
      const k = d.skey;
      try { ST.run = await api(`/api/runs/${k}/start`, {}); if (skey() === k) { d.started = true; renderRun(); } }
      catch (err) { e.target.disabled = false; $('startMsg').textContent = err.message; }
    };
    return;
  }
  const wMax = r.written.reduce((s, q) => s + q.marks, 0);
  const short = d.kind !== 'fix' && (r.mcq.length < 10 || r.written.length < 5);
  box.innerHTML = `<div class="pbar"><h3>${d.kind === 'fix' ? 'Mistakes to fix' : "Today's questions"}</h3>
      <div class="pscore"><span>Quiz <b id="psA"></b></span><span>Written <b id="psB"></b></span></div>
      <div class="timer"><span class="clock" id="clock"></span><button class="btn" id="tgo">${ST.timer ? 'Pause' : 'Start timer'}</button></div></div>
    ${r.aiError ? `<div class="alert">${esc(r.aiError)}</div>` : ''}
    <p class="sec">Quiz · ${r.mcq.length} questions</p><div class="qgrid" id="qm"></div>
    <p class="sec">Written · ${r.written.length} question${r.written.length === 1 ? '' : 's'}</p><div class="qgrid" id="qw"></div>
    <div class="result" id="res"></div>
    <div class="row">${d.kind !== 'fix' ? `<button class="btn" id="more">${short ? 'Add the missing questions' : 'Add 5 more questions'}</button>` : ''}<button class="btn" id="redo">Clear answers and try again</button><span class="note" id="moreMsg"></span></div>`;
  r.mcq.forEach((q, n) => $('qm').appendChild(mcqEl(q, n)));
  r.written.forEach((q, n) => $('qw').appendChild(writtenEl(q, n)));
  score(wMax);
  clock();
  $('tgo').onclick = (e) => { if (ST.timer) { clearInterval(ST.timer); ST.timer = null; e.target.textContent = 'Resume'; } else { ST.timer = setInterval(() => { ST.tLeft--; clock(); }, 1000); e.target.textContent = 'Pause'; } };
  if ($('more')) $('more').onclick = async (e) => {
    e.target.disabled = true; $('moreMsg').innerHTML = '<span class="spin"></span>Adding questions…'; const k = d.skey;
    try { ST.run = await api(`/api/runs/${k}/more`, {}); if (skey() === k) renderRun(); } catch (err) { e.target.disabled = false; $('moreMsg').textContent = err.message; }
  };
  let armed = false;
  $('redo').onclick = async (e) => {
    if (!armed) { armed = true; e.target.textContent = 'Tap again to clear'; setTimeout(() => { armed = false; if (e.target.isConnected) e.target.textContent = 'Clear answers and try again'; }, 3000); return; }
    try { ST.run = await api(`/api/runs/${d.skey}/reset`, {}); clearInterval(ST.timer); ST.timer = null; ST.tLeft = sessSecs(); renderRun(); refreshMemory(); } catch (err) { toast(err.message); }
  };
}

function tagHtml(q) {
  if (!q.tag) return '';
  return q.tag.kind === 'review' ? `<span class="tag rev">REVIEW · from ${esc(q.tag.from)}</span>` : '<span class="tag ai">NEW</span>';
}

function mcqEl(q, n) {
  const el = document.createElement('div'); el.className = 'q';
  const answered = q.choice !== undefined, ok = answered && q.choice === q.answer, d = day();
  const rev = (q.tag && q.tag.kind === 'review') || d.kind === 'fix';
  el.innerHTML = `<div class="qh"><span class="num">${n + 1}</span><span class="qt">${esc(q.q)}</span>${tagHtml(q)}</div>
    <div class="opts">${q.options.map((o, j) => { let c = 'opt'; if (answered) { if (j === q.answer) c += ' right'; else if (j === q.choice) c += ' wrong'; } return `<button class="${c}" data-j="${j}" ${answered ? 'disabled' : ''}>${L[j]}. ${esc(o)}</button>`; }).join('')}</div>
    ${answered ? `<div class="fb ${ok ? 'ok' : 'no'}"><strong>${ok ? (rev ? (q.learned ? 'Learned! Out of the memory bank.' : 'Right! It comes back once more to make sure.') : 'Correct.') : 'Not quite. Saved: it will come back next session.'}</strong> ${esc(q.explanation)}</div>
      <div class="row"><button class="btn" data-exp>Explain this question</button><button class="linkbtn flag" data-flag>Report a problem</button></div>
      ${q.ai ? `<div class="exp">${esc(q.ai)}</div>` : ''}` : ''}`;
  el.querySelectorAll('.opt').forEach((b) => b.onclick = async () => {
    el.querySelectorAll('.opt').forEach((x) => (x.disabled = true));
    try { await api(`/api/runs/${d.skey}/answer`, { qid: q.id, choice: +b.dataset.j }); await reloadRun(); refreshMemory(); }
    catch (e) { toast(e.message); el.querySelectorAll('.opt').forEach((x) => (x.disabled = false)); }
  });
  wireExtras(el, q);
  return el;
}

// Shrink a phone photo to at most 1600 px on the long side (JPEG) before upload: faster, cheaper, still readable.
function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a photo the browser can open. Use JPG or PNG.')); };
    img.src = url;
  });
}

function writtenEl(q, n) {
  const el = document.createElement('div'); el.className = 'q'; const d = day();
  const cr = q.crit;
  el.innerHTML = `<div class="qh"><span class="num">W${n + 1}</span><span class="qt">${esc(q.q)}</span>${tagHtml(q)}<span class="marks">${cr ? '[0–8]' : `[${q.marks}]`}</span></div>
    ${cr ? `<div class="crit"><span class="crit-badge">MYP Criterion ${esc(cr.criterion)} · ${esc(cr.name)}</span>${cr.command ? `<span class="crit-cmd"><b>${esc(cr.command)}</b> = ${esc(cr.commandHint)}</span>` : ''}</div>` : ''}
    <textarea placeholder="Write your answer here…" ${q.points ? 'readonly' : ''}>${esc(q.text)}</textarea><div class="msw"></div>`;
  const ta = el.querySelector('textarea'), msw = el.querySelector('.msw');
  if (!q.points && window.MathKeys) MathKeys.attach(ta, d.sub);
  let saveT;
  const draw = () => {
    if (!q.points) {
      const ready = ta.value.trim().length >= 10;
      msw.innerHTML = `<div class="row"><button class="btn" data-check ${ready ? '' : 'disabled'}>Check with mark scheme</button>
        ${ST.run.aiAvailable ? '<label class="btn photo-btn">📷 Photo of my working<input type="file" accept="image/*" hidden></label>' : ''}
        ${ready ? '' : '<span class="note">Type your answer, or take a photo of your working on paper.</span>'}</div><div class="photo-msg note"></div>`;
      const fileIn = msw.querySelector('input[type=file]');
      if (fileIn) fileIn.onchange = async () => {
        const f = fileIn.files && fileIn.files[0]; if (!f) return;
        const lbl = msw.querySelector('.photo-btn'), msg = msw.querySelector('.photo-msg');
        lbl.classList.add('busy'); msg.innerHTML = '<span class="spin"></span>Claude is reading your working…';
        try {
          clearTimeout(saveT);
          if (ta.value.trim()) await api(`/api/runs/${d.skey}/text`, { qid: q.id, text: ta.value });
          const image = await shrinkPhoto(f);
          await api(`/api/runs/${d.skey}/photo`, { qid: q.id, image });
          await reloadRun(); refreshMemory();
        } catch (e) { msg.textContent = e.message; lbl.classList.remove('busy'); fileIn.value = ''; }
      };
      msw.querySelector('[data-check]').onclick = async () => {
        clearTimeout(saveT);
        try { await api(`/api/runs/${d.skey}/text`, { qid: q.id, text: ta.value }); await api(`/api/runs/${d.skey}/open`, { qid: q.id }); await reloadRun(); refreshMemory(); } catch (e) { toast(e.message); }
      };
      return;
    }
    const got = q.ticks.filter(Boolean).length, full = got >= q.marks;
    const band = (lv) => (lv == null ? -1 : lv === 0 ? -1 : Math.ceil(lv / 2) - 1);
    const levelsHtml = q.levels ? `<div class="levels"><span class="label">MYP levels for this task${q.level != null ? ` · Claude's estimate: <b class="lvl-pill">${q.level} / 8</b>` : ''}</span>
      ${['1–2', '3–4', '5–6', '7–8'].map((b, i) => `<div class="lv ${band(q.level) === i ? 'on' : ''}"><span class="lv-b">${b}</span><span>${esc(q.levels[i] || '')}</span></div>`).join('')}
      ${q.level == null ? `<span class="note">${ST.run.aiAvailable ? 'Tick the key elements, then ask Claude for a level estimate.' : 'Compare your answer with the levels to judge it yourself.'}</span>` : ''}</div>` : '';
    msw.innerHTML = `<div class="ms"><span class="label">${q.levels ? 'Key elements · tick each one the answer includes' : 'Mark scheme · tick each point the answer includes'}</span>
      ${q.points.map((p, j) => `<label><input type="checkbox" data-j="${j}" ${q.ticks[j] ? 'checked' : ''}><span>${esc(p)}</span></label>`).join('')}
      <span class="note">${got} / ${q.marks} ${q.levels ? 'elements' : 'marks'} · ${full ? 'all included' : 'saved: it will come back next session'}</span>
      ${levelsHtml}
      ${ST.run.aiAvailable ? `<div class="row"><button class="btn" data-mark>${q.levels ? 'Mark at MYP level (Claude)' : 'Mark it with Claude'}</button></div>` : ''}
      ${q.levelFeedback ? `<div class="feedback">${esc(q.levelFeedback)}</div>` : ''}
      ${q.feedback ? `<div class="feedback">${esc(q.feedback)}</div>` : ''}</div>
      <div class="row"><button class="btn" data-exp>Explain this question</button><button class="linkbtn flag" data-flag>Report a problem</button></div>
      ${q.ai ? `<div class="exp">${esc(q.ai)}</div>` : ''}`;
    msw.querySelectorAll('input').forEach((c) => c.onchange = async () => {
      const t = q.ticks.slice(); t[+c.dataset.j] = c.checked;
      try { await api(`/api/runs/${d.skey}/ticks`, { qid: q.id, ticks: t }); q.ticks = t; draw(); score(); refreshMemory(); } catch (e) { toast(e.message); c.checked = !c.checked; }
    });
    const mk = msw.querySelector('[data-mark]');
    if (mk) mk.onclick = async () => {
      mk.disabled = true; mk.innerHTML = '<span class="spin"></span>Claude is marking…';
      try { const r = await api(`/api/runs/${d.skey}/aimark`, { qid: q.id }); await reloadRun(); const nq = ST.run.written.find((x) => x.id === q.id); if (nq) { if (!nq.levels) nq.feedback = r.feedback; const i = ST.run.written.indexOf(nq); const old = $('qw').children[i]; old.replaceWith(writtenEl(nq, i)); } refreshMemory(); }
      catch (e) { toast(e.message); mk.disabled = false; mk.textContent = q.levels ? 'Mark at MYP level (Claude)' : 'Mark it with Claude'; }
    };
    wireExtras(msw, q);
  };
  ta.oninput = () => {
    const was = ta.dataset.ready === '1', now = ta.value.trim().length >= 10; ta.dataset.ready = now ? '1' : '0';
    if (was !== now) draw();
    clearTimeout(saveT); saveT = setTimeout(() => api(`/api/runs/${d.skey}/text`, { qid: q.id, text: ta.value }).catch(() => toast('Could not save the answer. Check the connection.')), 800);
  };
  ta.dataset.ready = ta.value.trim().length >= 10 ? '1' : '0';
  draw();
  return el;
}

function wireExtras(root, q) {
  const eb = root.querySelector('[data-exp]');
  if (eb) eb.onclick = async () => {
    if (!ST.run.aiAvailable) { toast(ST.prefs.aiConfigured === false ? 'Claude is not set up yet.' : 'Claude is off. Turn it on in Menu → Settings.'); return; }
    let box = eb.parentElement.nextElementSibling;
    if (!box || !box.classList.contains('exp')) { box = document.createElement('div'); box.className = 'exp'; eb.parentElement.after(box); }
    eb.disabled = true; box.className = 'exp wait'; box.textContent = 'Claude is thinking…';
    try { const r = await api(`/api/runs/${day().skey}/explain`, { qid: q.id }); box.className = 'exp'; box.textContent = r.text; q.ai = r.text; }
    catch (e) { box.className = 'exp wait'; box.textContent = e.message; }
    eb.disabled = false;
  };
  const fb = root.querySelector('[data-flag]');
  if (fb) fb.onclick = async () => {
    const wrap = document.createElement('div'); wrap.className = 'row';
    wrap.innerHTML = '<input class="field" placeholder="What looks wrong? (optional)" maxlength="300"><button class="btn">Send report</button>';
    fb.replaceWith(wrap);
    const inp = wrap.querySelector('input'); inp.focus();
    wrap.querySelector('button').onclick = async () => { try { await api('/api/flag', { qid: q.id, note: inp.value }); wrap.innerHTML = '<span class="note">Thanks. The admin will check this question.</span>'; } catch (e) { toast(e.message); } };
  };
}

async function reloadRun() { const k = skey(); const r = await api('/api/runs/' + k); if (skey() === k) { ST.run = r; const y = scrollY; renderRun(); scrollTo(0, y); } }
async function refreshMemory() { try { const p = await api('/api/plan'); ST.plan.memory = p.memory; renderSide(); } catch (e) { /* ignore */ } }

function score() {
  const r = ST.run; if (!r || !r.started || !$('psA')) return;
  const wMax = r.written.reduce((s, q) => s + q.marks, 0);
  const a = r.mcq.filter((q) => q.choice !== undefined && q.choice === q.answer).length, aDone = r.mcq.filter((q) => q.choice !== undefined).length;
  const b = r.written.reduce((s, q) => s + (q.points ? q.ticks.filter(Boolean).length : 0), 0), bDone = r.written.filter((q) => q.points).length;
  $('psA').textContent = `${a}/${r.mcq.length}`; $('psB').textContent = `${b}/${wMax}`;
  const left = r.mcq.length - aDone + r.written.length - bDone;
  const wrong = r.mcq.filter((q) => q.choice !== undefined && q.choice !== q.answer).length + r.written.filter((q) => q.points && q.ticks.filter(Boolean).length < q.marks).length;
  if (!aDone && !bDone) { $('res').textContent = 'Your score shows here. Wrong answers go into the memory bank automatically.'; return; }
  const tot = r.mcq.length + wMax, pct = tot ? Math.round((a + b) / tot * 100) : 0;
  $('res').innerHTML = `<strong>${a + b} / ${tot} (${pct}%)</strong> · ${left ? left + ' still to answer. ' : 'All answered. '}${wrong ? wrong + ' question' + (wrong > 1 ? 's' : '') + ' saved to come back in later sessions.' : 'No mistakes so far.'}`;
}
function clock() { const c = $('clock'); if (!c) return; const t = Math.abs(ST.tLeft); c.textContent = (ST.tLeft < 0 ? '+' : '') + String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); c.classList.toggle('over', ST.tLeft < 0); }

function changePassword() {
  const card = $('card');
  card.innerHTML = `<form class="card s-Math" id="pwForm"><h2>Change password</h2>
    <label class="field"><span>Current password</span><input type="password" id="pc" autocomplete="current-password" required></label>
    <label class="field"><span>New password (min 8 characters)</span><input type="password" id="pn" autocomplete="new-password" minlength="8" required></label>
    <div class="err" id="perr"></div><div class="row"><button class="btn primary">Save</button><button class="btn" type="button" id="pcancel">Cancel</button></div></form>`;
  $('pcancel').onclick = openSession;
  $('pwForm').onsubmit = async (e) => { e.preventDefault(); try { await api('/api/me/password', { current: $('pc').value, next: $('pn').value }); toast('Password changed'); openSession(); } catch (err) { $('perr').textContent = err.message; } };
}

// ---------- Learn topics ----------
function setMode(m) {
  ST.mode = m; ST.quiz = null;
  document.querySelectorAll('.tabs [data-v]').forEach((b) => b.classList.toggle('sel', b.dataset.v === m));
  $('learnView').hidden = m !== 'learn'; $('studyView').hidden = m !== 'study';
  if (m === 'learn') { $('card').innerHTML = ''; renderLearn(); } else { $('lessonWrap').innerHTML = ''; renderNav(); openSession(); }
  scrollTo(0, 0);
}
const lvlOf = (p) => (p == null ? '' : p >= 80 ? 'lvl-good' : p >= 50 ? 'lvl-mid' : 'lvl-low');
async function renderLearn() {
  let stats = {}; try { stats = await api('/api/topics/stats'); } catch (e) { /* ignore */ }
  let h = '', lastS = '', lastU = '';
  TOPICS.forEach((t) => {
    if (t.subj !== lastS) { h += `<div class="grp s-${t.subj}">${t.subj}</div>`; lastS = t.subj; lastU = ''; }
    if (t.unit !== lastU) { h += `<div class="unit">${esc(t.unit)}</div>`; lastU = t.unit; }
    const p = stats[t.id];
    h += `<button data-t="${t.id}" class="s-${t.subj} ${ST.curTopic === t.id ? 'sel' : ''}"><span>${esc(t.title)}</span>${p != null ? `<span class="acc-badge ${lvlOf(p)}">${p}%</span>` : ''}</button>`;
  });
  $('tlist').innerHTML = h;
  $('tlist').querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { openTopic(b.dataset.t); if (innerWidth < 860) $('lessonWrap').scrollIntoView(); }));
  if (!ST.curTopic) ST.curTopic = TOPICS[0].id;
  openTopic(ST.curTopic, true);
}
async function openTopic(id, keepScroll) {
  ST.curTopic = id; ST.quiz = null; const t = TOPICS.find((x) => x.id === id); if (!t) return;
  document.querySelectorAll('#tlist [data-t]').forEach((b) => b.classList.toggle('sel', b.dataset.t === id));
  const w = $('lessonWrap');
  w.innerHTML = `<article class="lesson s-${t.subj}">
    <div class="when"><span class="chip c-${t.subj}">${t.subj}</span><span class="label">${esc(t.unit)}</span></div>
    <h2>${esc(t.title)}</h2>
    <details open><summary>What your school expects you to be able to do</summary><ul class="outc">${t.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></details>
    <div class="keyidea"><span class="label">Key idea</span><p>${t.summary}</p></div>
    ${t.sections.map((sc) => `<section class="lsec"><h3>${esc(sc.h)}</h3>${sc.p ? `<p>${sc.p}</p>` : ''}${sc.fig && FIG[sc.fig] ? FIG[sc.fig]() : ''}</section>`).join('')}
    <section class="lsec"><h3>Worked examples</h3>${t.examples.map((e) => `<div class="ex"><b>${esc(e.q)}</b><ol>${e.steps.map((st, j) => `<li class="${j ? 'hid' : ''}">${esc(st)}</li>`).join('')}</ol><div class="row"><button class="btn" data-next>Show next step</button><button class="linkbtn" data-all>Show all steps</button></div></div>`).join('')}</section>
    <section class="lsec"><h3>Common mistakes</h3><ul class="mist">${t.mistakes.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></section>
    <section class="ask"><h3>Still confused? Ask Claude about this topic</h3><textarea id="askq" maxlength="600" placeholder="Type your question about this topic"></textarea>
      <div class="row"><button class="btn primary" id="askbtn">Ask</button><span class="note" id="asknote"></span></div><div id="askans"></div></section>
    <section class="quizcta"><h3>Practise this topic</h3><p class="note">10 quiz + 5 written questions on this topic only. Wrong answers go into your memory bank like any session.</p>
      <div class="row"><button class="btn primary" id="tquiz">Give me a quiz on this topic</button><button class="btn" id="tcont" hidden>Continue last quiz</button></div></section>
    <div class="prac" id="prac" hidden></div></article>`;
  w.querySelectorAll('svg.fig[data-mw]').forEach((sv) => { sv.style.maxWidth = sv.dataset.mw + 'px'; });
  w.querySelectorAll('.ex').forEach((ex) => {
    const items = [...ex.querySelectorAll('li')], nb = ex.querySelector('[data-next]'), ab = ex.querySelector('[data-all]');
    const upd = () => { if (!items.some((li) => li.classList.contains('hid'))) { nb.hidden = true; ab.hidden = true; } };
    nb.onclick = () => { const n = items.find((li) => li.classList.contains('hid')); if (n) n.classList.remove('hid'); upd(); };
    ab.onclick = () => { items.forEach((li) => li.classList.remove('hid')); upd(); }; upd();
  });
  if (window.MathKeys) MathKeys.attach($('askq'), t.subj);
  $('askbtn').onclick = () => askTopic(t);
  $('tquiz').onclick = () => openQuiz(t, 't-' + t.id + '-' + Date.now().toString(36));
  try { const r = await api(`/api/topics/${id}/last`); if (r.skey && ST.curTopic === id) { $('tcont').hidden = false; $('tcont').onclick = () => openQuiz(t, r.skey); } } catch (e) { /* ignore */ }
  if (!keepScroll) w.scrollIntoView({ block: 'start' });
}
async function openQuiz(t, key) {
  ST.quiz = { skey: key, kind: 'practice', sub: t.subj, done: false };
  if (ST.tKey !== key) { clearInterval(ST.timer); ST.timer = null; ST.tLeft = sessSecs(); ST.tKey = key; }
  const box = $('prac'); box.hidden = false; box.innerHTML = '<p class="note"><span class="spin"></span>Loading…</p>';
  try { ST.run = await api('/api/runs/' + key); } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  renderRun(); box.scrollIntoView({ block: 'start' });
}
async function askTopic(t) {
  const q = $('askq').value.trim(), out = $('askans'), note = $('asknote');
  if (q.length < 3) { note.textContent = 'Type your question first.'; return; }
  const ctx = (t.summary + ' ' + t.sections.map((x) => x.h + ': ' + x.p).join(' ')).replace(/<[^>]+>/g, '');
  $('askbtn').disabled = true; out.innerHTML = '<div class="exp wait">Claude is thinking…</div>'; note.textContent = '';
  try { const r = await api(`/api/topics/${t.id}/ask`, { question: q, title: t.title, context: ctx }); out.innerHTML = `<div class="exp">${esc(r.text)}</div>`; }
  catch (e) { out.innerHTML = `<div class="exp wait">${esc(e.message)}</div>`; }
  $('askbtn').disabled = false;
}

boot();

// ---------- install as an app + daily reminder notification ----------
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; wireInstall(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function wireInstall() {
  const b = $('installItem'); if (!b) return;
  const show = !standalone() && (installEvt || isIOS);
  b.hidden = !show;
  b.onclick = async () => {
    if (installEvt) { installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; wireInstall(); return; }
    const box = $('remindBox'); box.hidden = false;
    box.innerHTML = '<b>Install on iPhone / iPad</b><p class="note">In Safari tap the Share button, then <b>Add to Home Screen</b>. Open Study Week from the home screen icon, then turn on 🔔 Reminder there.</p><button class="linkbtn" id="rmClose">Close</button>';
    $('rmClose').onclick = () => { box.hidden = true; };
  };
}
function b64ToBytes(b64) { const p = '='.repeat((4 - (b64.length % 4)) % 4), raw = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(raw, (c) => c.charCodeAt(0)); }
async function toggleReminder() {
  const box = $('remindBox');
  box.hidden = false; box.scrollIntoView({ block: 'nearest' });
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (!supported) {
    box.innerHTML = (isIOS && !standalone()
      ? '<b>Reminders on iPhone</b><p class="note">First install the app: in Safari tap Share → <b>Add to Home Screen</b>. Open Study Week from the home screen, then tap 🔔 Reminder again.</p>'
      : '<p class="note">This browser cannot show notifications. Try Chrome on Android or a computer.</p>') + '<button class="linkbtn" id="rmClose">Close</button>';
    $('rmClose').onclick = () => { box.hidden = true; }; return;
  }
  let st; try { st = await api('/api/push/settings'); } catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
  const draw = () => {
    box.innerHTML = `<b>Daily study reminder</b>
      <div class="row"><label class="field inline"><span>Time</span><input type="time" id="rmTime" value="${esc(st.time)}" step="300"></label>
      <button class="btn primary" id="rmOn">${st.enabled ? 'Save time' : 'Turn on'}</button>
      ${st.enabled ? '<button class="btn" id="rmOff">Turn off on this device</button>' : ''}<button class="linkbtn" id="rmClose">Close</button></div>
      <p class="note" id="rmMsg">${st.enabled ? `On: a notification every day at ${esc(st.time)} (Dubai time), skipped once today's session is marked done.` : 'Get a notification on this device at your study time each day.'}</p>`;
    $('rmClose').onclick = () => { box.hidden = true; };
    $('rmOn').onclick = async () => {
      const msg = $('rmMsg'), time = $('rmTime').value;
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') { msg.textContent = 'Notifications are blocked. Allow them for this site in the browser settings, then try again.'; return; }
        const reg = await navigator.serviceWorker.ready;
        const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(st.publicKey) });
        await api('/api/push/subscribe', { subscription: sub.toJSON(), time });
        if (!st.enabled) await api('/api/push/test', {}).catch(() => {});
        st = await api('/api/push/settings'); draw(); toast('Reminder saved');
      } catch (e) { msg.textContent = 'Could not turn on reminders: ' + e.message; }
    };
    const off = $('rmOff');
    if (off) off.onclick = async () => {
      try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); const ep = sub && sub.endpoint; if (sub) await sub.unsubscribe(); await api('/api/push/unsubscribe', { endpoint: ep }); st = await api('/api/push/settings'); draw(); toast('Reminder off on this device'); }
      catch (e) { $('rmMsg').textContent = e.message; }
    };
  };
  draw();
}

// ---------- menu (☰) and settings ----------
const ICON = {
  menu: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  key: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  out: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  install: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const sessSecs = () => (Number(ST.prefs && ST.prefs.sessionMinutes) || 30) * 60;

function wireMenu() {
  const btn = $('menuBtn'), menu = $('menu');
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  btn.onclick = (e) => { e.stopPropagation(); const open = menu.hidden; menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open) { const f = menu.querySelector('button:not([hidden])'); if (f) f.focus(); } };
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
  menu.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    close();
    const a = b.dataset.act;
    if (a === 'remind') toggleReminder();
    else if (a === 'settings') openSettings();
    else if (a === 'password') { $('remindBox').hidden = true; if (ST.mode !== 'study') setMode('study'); changePassword(); }
    else if (a === 'logout') logout();
  }));
}

const LOCAL = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
};
function seg(name, opts, cur) {
  return `<div class="seg" role="radiogroup" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" role="radio" aria-checked="${String(v) === String(cur)}" data-v="${v}">${l}</button>`).join('')}</div>`;
}
async function openSettings() {
  const box = $('remindBox'); box.hidden = false;
  try { ST.prefs = await api('/api/me/prefs'); } catch (e) { /* keep current */ }
  const p = ST.prefs;
  const aiNote = !p.aiConfigured ? 'Claude is not set up on the server yet.' : !p.aiAllowed ? 'Turned off for this account by your parent.' : p.ai ? 'New questions written for you, explanations, marking and photo checks.' : 'Off: question bank only. Explanations, marking and photo checks are hidden.';
  box.innerHTML = `<div class="set-head"><b>Settings</b><button class="linkbtn" id="setClose">Close</button></div>
    <div class="set-row"><div><b>Claude (AI)</b><p class="note">${aiNote}</p></div>
      <label class="switch"><input type="checkbox" id="setAi" ${p.aiOn ? 'checked' : ''} ${p.aiConfigured && p.aiAllowed ? '' : 'disabled'}><span></span></label></div>
    <div class="set-row"><div><b>Session length</b><p class="note">Used for the session timer.</p></div>${seg('min', [[20, '20'], [30, '30'], [45, '45'], [60, '60 min']], p.sessionMinutes)}</div>
    <div class="set-row"><div><b>Theme</b></div>${seg('theme', [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], LOCAL.get('ui-theme', 'system'))}</div>
    <div class="set-row"><div><b>Text size</b></div>${seg('size', [['normal', 'Normal'], ['large', 'Large']], LOCAL.get('ui-size', 'normal'))}</div>
    <div class="set-row"><div><b>Symbol shortcuts</b><p class="note">x^2 → x², sqrt → √, H2O → H₂O while typing.</p></div>
      <label class="switch"><input type="checkbox" id="setMk" ${LOCAL.get('mathkeys-auto', '1') !== '0' ? 'checked' : ''}><span></span></label></div>
    <p class="note">Theme, text size and shortcuts are saved on this device; Claude and session length are saved to your account.</p>`;
  $('setClose').onclick = () => { box.hidden = true; };
  const savePrefs = async (body) => {
    try { ST.prefs = await api('/api/me/prefs', body); toast('Saved'); if (ST.run && ST.mode === 'study') reloadRun().catch(() => {}); }
    catch (e) { toast(e.message); }
  };
  $('setAi').onchange = async (e) => { await savePrefs({ ai: e.target.checked }); openSettings(); };
  $('setMk').onchange = (e) => { LOCAL.set('mathkeys-auto', e.target.checked ? '1' : '0'); document.querySelectorAll('.mkauto input').forEach((c) => { c.checked = e.target.checked; }); toast('Saved'); };
  box.querySelectorAll('[data-seg]').forEach((g) => g.querySelectorAll('button').forEach((b) => b.onclick = async () => {
    g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    const v = b.dataset.v, k = g.dataset.seg;
    if (k === 'min') { await savePrefs({ sessionMinutes: Number(v) }); if (!ST.timer) { ST.tLeft = sessSecs(); if (ST.mode === 'study') openSession().catch(() => {}); } }
    if (k === 'theme') { LOCAL.set('ui-theme', v); applyLook(); toast('Saved'); }
    if (k === 'size') { LOCAL.set('ui-size', v); applyLook(); toast('Saved'); }
  }));
}
