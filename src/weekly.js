// Weekly report for the parent: last 7 days per student, written in Persian.
// Served at /report/weekly (admin login, or ?token=REPORT_TOKEN for the Friday email task).
const db = require('./db');
const ai = require('./ai');
const { parseSkey, skeyLabel, TESTS, SET_NAMES } = require('./plan');
const { nameOf } = require('./criteria');

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'English'];
const FA_SUB = { Math: 'ریاضی', Physics: 'فیزیک', Chemistry: 'شیمی', English: 'انگلیسی', Mock: 'آزمون آزمایشی', Mistakes: 'روز اشتباه‌ها' };
const FA_DAY = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
const TZ = 'Asia/Dubai';

// SQLite stores UTC as "YYYY-MM-DD HH:MM:SS".
const utc = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z') : null);
const dubaiTime = (d) => d.toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const dubaiDate = (d) => d.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
const dubaiDayIdx = (d) => new Date(dubaiDate(d) + 'T12:00:00Z').getUTCDay();
const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
const sqlTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

function studentWeek(u, from, to) {
  const F = sqlTime(from), T = sqlTime(to);
  // sessions with any activity in the window
  const runs = db.prepare(`SELECT r.skey, r.started_at, r.done_at,
      (SELECT MIN(updated_at) FROM answers a WHERE a.user_id=r.user_id AND a.skey=r.skey) first_a,
      (SELECT MAX(updated_at) FROM answers a WHERE a.user_id=r.user_id AND a.skey=r.skey) last_a
    FROM runs r WHERE r.user_id=? AND (r.started_at BETWEEN ? AND ? OR EXISTS (SELECT 1 FROM answers a WHERE a.user_id=r.user_id AND a.skey=r.skey AND a.updated_at BETWEEN ? AND ?))
    ORDER BY r.started_at`).all(u.id, F, T, F, T);
  const sessions = runs.map((r) => {
    const p = parseSkey(r.skey);
    const start = utc(r.first_a || r.started_at), end = utc(r.done_at || r.last_a || r.started_at);
    const q = db.prepare('SELECT COUNT(*) n, SUM(correct) c FROM answers WHERE user_id=? AND skey=? AND choice IS NOT NULL').get(u.id, r.skey);
    const w = db.prepare(`SELECT a.ticks, q.body FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.skey=? AND a.opened=1`).all(u.id, r.skey);
    let marks = 0, max = 0; w.forEach((x) => { marks += JSON.parse(x.ticks || '[]').filter(Boolean).length; max += JSON.parse(x.body).points.length; });
    const topicQuiz = r.skey.startsWith('t-');
    return {
      label: topicQuiz ? 'Learn quiz' : skeyLabel(r.skey),
      sub: p.session.sub, topic: p.session.topic,
      day: FA_DAY[dubaiDayIdx(start)], date: dubaiDate(start),
      start: dubaiTime(start), end: dubaiTime(end), minutes: Math.max(1, Math.round((end - start) / 60000)),
      done: !!r.done_at, quiz: `${q.c || 0}/${q.n}`, written: max ? `${marks}/${max}` : '—',
    };
  });
  // subject results in the window
  const bySub = Object.fromEntries(SUBJECTS.map((s) => [s, { n: 0, c: 0, m: 0, mx: 0 }]));
  db.prepare(`SELECT q.subject, a.correct FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.choice IS NOT NULL AND a.updated_at BETWEEN ? AND ?`).all(u.id, F, T)
    .forEach((r) => { const o = bySub[r.subject]; if (o) { o.n++; o.c += r.correct || 0; } });
  db.prepare(`SELECT q.subject, q.body, a.ticks FROM answers a JOIN questions q ON q.id=a.qid WHERE a.user_id=? AND a.opened=1 AND a.updated_at BETWEEN ? AND ?`).all(u.id, F, T)
    .forEach((r) => { const o = bySub[r.subject]; if (!o) return; o.m += JSON.parse(r.ticks || '[]').filter(Boolean).length; o.mx += JSON.parse(r.body).points.length; });
  const subjects = SUBJECTS.map((s) => ({ sub: s, quiz: pct(bySub[s].c, bySub[s].n), quizN: bySub[s].n, written: pct(bySub[s].m, bySub[s].mx) }));
  // weakest topics over the last 4 weeks (at least 3 quiz answers)
  const F4 = sqlTime(new Date(to - 28 * 864e5));
  const weak = db.prepare(`SELECT q.set_code s, COUNT(*) n, SUM(a.correct) c FROM answers a JOIN questions q ON q.id=a.qid
      WHERE a.user_id=? AND a.choice IS NOT NULL AND q.set_code IS NOT NULL AND a.updated_at >= ? GROUP BY q.set_code HAVING n >= 3`).all(u.id, F4)
    .map((r) => ({ set: r.s, name: SET_NAMES[r.s] || r.s, n: r.n, p: pct(r.c || 0, r.n) }))
    .filter((t) => t.p < 100).sort((a, b) => a.p - b.p || b.n - a.n).slice(0, 3);
  const today = dubaiDate(to);
  const mem = db.prepare(`SELECT COUNT(*) n, SUM(CASE WHEN due <= ? THEN 1 ELSE 0 END) d FROM srs WHERE user_id=? AND learned_skey IS NULL`).get(today, u.id);
  // MYP criterion levels (Claude estimates, last 4 weeks)
  const crit = db.prepare(`SELECT q.subject sub, json_extract(q.body, '$.criterion') c, AVG(a.level) avg, COUNT(*) n FROM answers a JOIN questions q ON q.id=a.qid
      WHERE a.user_id=? AND a.level IS NOT NULL AND a.updated_at >= ? GROUP BY sub, c ORDER BY sub, c`).all(u.id, F4)
    .map((r) => ({ sub: r.sub, crit: r.c, name: nameOf(r.sub, r.c), avg: Math.round(r.avg * 10) / 10, n: r.n }));
  return { name: u.display_name, sessions, subjects, weak, criteria: crit, memory: { toLearn: mem.n || 0, due: mem.d || 0 } };
}

function build(now = new Date()) {
  const to = now, from = new Date(now - 7 * 864e5);
  const today = dubaiDate(now), in10 = dubaiDate(new Date(now.getTime() + 10 * 864e5));
  const tests = TESTS.filter(([d]) => d > today && d <= in10).map(([d, t]) => ({ date: d, what: t }));
  const students = db.prepare("SELECT id, display_name FROM users WHERE role='student' AND active=1 ORDER BY id").all().map((u) => studentWeek(u, from, to));
  return { from: dubaiDate(from), to: today, students, tests, claude: { monthCost: ai.monthCost(), limit: ai.MONTHLY_LIMIT_USD } };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Plain, email-friendly Persian HTML (right-to-left).
function html(r) {
  const fmt = (v) => (v == null ? '—' : v + '٪');
  const parts = [`<h2>گزارش هفتگی درس — ${esc(r.from)} تا ${esc(r.to)}</h2>`];
  for (const s of r.students) {
    const done = s.sessions.filter((x) => x.done).length;
    parts.push(`<h3>${esc(s.name)}</h3>
<p><b>${s.sessions.length}</b> جلسه شروع شده، <b>${done}</b> جلسه کامل (علامت «done»). بانک حافظه: ${s.memory.toLearn} سؤال برای یادگیری، ${s.memory.due} سؤال امروز سررسید.</p>`);
    if (s.sessions.length) {
      parts.push('<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse"><tr><th>روز</th><th>تاریخ</th><th>ساعت</th><th>درس</th><th>موضوع</th><th>تست</th><th>تشریحی</th><th>تمام شد؟</th></tr>'
        + s.sessions.map((x) => `<tr><td>${x.day}</td><td>${x.date}</td><td dir="ltr">${x.start}–${x.end} (${x.minutes} min)</td><td>${FA_SUB[x.sub] || esc(x.sub)}</td><td dir="ltr">${esc(x.topic)}</td><td dir="ltr">${x.quiz}</td><td dir="ltr">${x.written}</td><td>${x.done ? '✓' : '—'}</td></tr>`).join('')
        + '</table>');
    } else parts.push('<p>این هفته جلسه‌ای انجام نشده است.</p>');
    parts.push('<p><b>درصد هر درس این هفته</b> (تست / تشریحی): '
      + s.subjects.map((x) => `${FA_SUB[x.sub]}: ${fmt(x.quiz)} / ${fmt(x.written)}`).join(' · ') + '</p>');
    if (s.criteria && s.criteria.length) parts.push('<p><b>سطح معیارهای MYP (تخمین Claude، ۴ هفته‌ی اخیر، از ۸):</b> '
      + s.criteria.map((c) => `${FA_SUB[c.sub] || esc(c.sub)} ${c.crit} <span dir="ltr">(${esc(c.name)})</span>: ${c.avg} از ${c.n} تمرین`).join(' · ') + '</p>');
    parts.push('<p><b>سه موضوع ضعیف (۴ هفته‌ی اخیر):</b> '
      + (s.weak.length ? s.weak.map((t) => `<span dir="ltr">${esc(t.name)}</span> (${t.p}٪ از ${t.n} تست)`).join('، ') : 'هنوز داده‌ی کافی نیست.') + '</p>');
  }
  parts.push('<h3>امتحان‌های ۱۰ روز آینده</h3>' + (r.tests.length ? '<ul>' + r.tests.map((t) => `<li>${t.date}: <span dir="ltr">${esc(t.what)}</span></li>`).join('') + '</ul>' : '<p>امتحانی در تقویم نیست.</p>'));
  parts.push(`<p style="color:#666">هزینه‌ی Claude این ماه: $${r.claude.monthCost.toFixed(2)} از سقف $${r.claude.limit}</p>`);
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7">${parts.join('\n')}</div>`;
}

module.exports = { build, html };
