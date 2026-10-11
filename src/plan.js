// Course engine: turns a course definition (src/courses/*.js) into a working study plan.
// Weeks start on Sunday. Days 0-4 = Sun-Thu study sessions, day 5 = Friday mistakes day, day 6 = Saturday.
// A session key ("skey") is "<week>-<day>", e.g. "0-1" = week 1, Monday, or "t-<set>-<id>" for a Learn topic quiz.

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Set codes start with a subject letter (M1 = a Math topic).
const SUBJ = { M: 'Math', P: 'Physics', C: 'Chemistry', E: 'English' };

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const today = () => new Date().toISOString().slice(0, 10);

// Sessions from an earlier course are kept under an archive prefix, e.g. "h1:0-1" (see profiles.switchCourse).
const ARCHIVED = /^h\d+:/;
function skeyLabel(skey) {
  if (ARCHIVED.test(skey)) return skeyLabel(skey.replace(ARCHIVED, '')) + ' (earlier course)';
  if (skey[0] === 't') return 'topic quiz';
  const [w, d] = skey.split('-').map(Number);
  return DAYS[d] ? `${DAYS[d].slice(0, 3)} wk ${w + 1}` : skey;
}
// Plan week of a session key; earlier-course and topic-quiz keys count as before/at the current week.
function weekOfSkey(skey, current) {
  if (ARCHIVED.test(skey)) return -1;
  if (skey[0] === 't') return current;
  return Number(skey.split('-')[0]);
}

function makeCourse(def) {
  const { weeks, setNames } = def;
  // Which subject a set code belongs to: the course's own map, else the first letter (M1 = Math).
  const subjOfSet = (code) => (def.setSubject ? def.setSubject[code] : SUBJ[code[0]]);
  const sessionDate = (wi, di) => addDays(def.termStart, wi * 7 + di);
  function currentWeek() {
    const n = Math.floor((new Date(today() + 'T00:00:00Z') - new Date(def.termStart + 'T00:00:00Z')) / 864e5 / 7);
    return Math.max(0, Math.min(weeks.length - 1, n));
  }
  function parseSkey(skey) {
    if (typeof skey !== 'string') return null;
    const t = skey.match(/^t-([A-Z]{1,4}\d{1,2})-[a-z0-9]{4,14}$/);
    if (t) {
      if (!setNames[t[1]] || !subjOfSet(t[1])) return null;
      return { w: currentWeek(), d: -1, topicQuiz: true, date: today(),
        session: { sub: subjOfSet(t[1]), topic: 'Topic quiz: ' + setNames[t[1]], kind: 'practice', sets: [t[1]] } };
    }
    const m = /^(\d{1,2})-([0-6])$/.exec(skey);
    if (!m) return null;
    const w = Number(m[1]), d = Number(m[2]);
    if (w >= weeks.length) return null;
    return { w, d, session: def.weekPlan(w)[d], date: sessionDate(w, d) };
  }
  function subjectsOf(session) {
    if (session.sub === 'Mock' || session.sub === 'Mistakes') return [...new Set(session.sets.map(subjOfSet))];
    return [session.sub];
  }
  return {
    id: def.id, title: def.title, school: def.school, programme: def.programme, grade: def.grade, learn: !!def.learn, dynamic: !!def.dynamic,
    subjectInfo: def.subjectInfo || {}, // per subject: { full, level } (dynamic courses), used for Claude's prompts
    subjects: def.subjects, TERM_START: def.termStart, WEEKS: weeks, TESTS: def.tests, SET_NAMES: setNames,
    weekPlan: def.weekPlan, sessionDate, currentWeek, parseSkey, subjectsOf, skeyLabel,
    summary: () => ({ id: def.id, title: def.title, programme: def.programme, grade: def.grade, learn: !!def.learn, termStart: def.termStart }),
  };
}

// ---------- data-driven courses (one definition, a plan per student from their own subjects) ----------
// A dynamic course lists units and topics per subject (and level). Each student's week is built from the
// subjects in their profile: Sun-Thu and Saturday = one subject each (rotating), Friday = mistakes day.
// The topic of the week is estimated from the school's teaching pace (teachStart, teachWeeks).
const SLOTS = [0, 1, 2, 3, 4, 6];
function makeDynamicCourse(def, profileSubjects) {
  const subs = [];
  for (const ps of profileSubjects || []) {
    const cs = def.subjects[ps.subject];
    if (!cs) continue;
    const units = (cs.units[ps.level || 'SL'] || cs.units.SL || cs.units.all || []);
    if (!units.length) continue;
    const name = cs.short + (ps.level ? ' ' + ps.level : '');
    const code = cs.code + (ps.level === 'HL' ? 'H' : '');
    const flat = [];
    units.forEach((u, ui) => u.topics.forEach((t) => flat.push({ ui, unit: u.t, topic: t })));
    subs.push({ name, code, full: ps.subject, level: ps.level || null, units, flat, color: cs.color || 'Other' });
  }
  const setNames = {}, setSubject = {}, subjectInfo = {};
  subs.forEach((s) => {
    s.units.forEach((u, ui) => { setNames[s.code + (ui + 1)] = `${s.name}: ${u.t}`; setSubject[s.code + (ui + 1)] = s.name; });
    subjectInfo[s.name] = { full: s.full, level: s.level, color: s.color };
  });
  const start = Date.parse(def.teachStart + 'T00:00:00Z'), first = Date.parse(def.termStart + 'T00:00:00Z');
  const holiday = new Set(def.holidayWeeks || []);
  // Teaching weeks already done at the middle of plan week w (holiday weeks do not count).
  const elapsed = (w) => (first - start) / 6048e5 + [...Array(w).keys()].filter((i) => !holiday.has(i)).length + 0.5;
  const topicAt = (s, w) => s.flat[Math.max(0, Math.min(s.flat.length - 1, Math.floor(elapsed(w) / def.teachWeeks * s.flat.length)))];
  const tests = def.tests.filter((t) => !t[2] || subs.some((s) => s.full === t[2]));
  // The plan before test prep: subjects rotate one day each week so every subject gets a turn at each slot.
  function basePlan(w) {
    const out = [];
    const seen = new Set();
    SLOTS.forEach((day, i) => {
      if (!subs.length) { out[day] = { sub: 'Mistakes', topic: 'Add subjects to this student to fill the plan', kind: 'fix', sets: [] }; return; }
      const s = subs[(i + w) % subs.length];
      const at = topicAt(s, w);
      const kind = day === 6 ? 'review' : seen.has(s.name) ? 'practice' : 'learn';
      seen.add(s.name);
      const upTo = s.units.slice(0, at.ui + 1).map((_, ui) => s.code + (ui + 1));
      out[day] = { sub: s.name, color: s.color, kind, topic: kind === 'review' ? `Review: ${s.units.slice(0, at.ui + 1).map((u) => u.t).join(', ')}` : `${at.unit}: ${at.topic}`, sets: kind === 'review' ? upTo : [s.code + (at.ui + 1)] };
    });
    out[5] = { sub: 'Mistakes', topic: 'Fix the questions still being answered wrong', kind: 'fix', sets: [] };
    return out;
  }
  // Each test gets ONE prep session: the subject's last session in the 7 days before it,
  // or else the Saturday review in that window.
  const prep = new Map(); // "w-d" -> session
  for (const [date, what, subjFull] of tests) {
    const s = subs.find((x) => x.full === subjFull);
    if (!s) continue;
    let pick = null, sat = null;
    for (let back = 1; back <= 7 && !pick; back++) {
      const dt = addDays(date, -back), n = Math.round((Date.parse(dt) - first) / 864e5);
      if (n < 0) break;
      const w = Math.floor(n / 7), d = n % 7;
      if (w >= def.weeks.length || d === 5) continue;
      const b = basePlan(w)[d];
      if (b.sub === s.name) pick = { w, d };
      else if (d === 6 && !sat) sat = { w, d };
    }
    pick = pick || sat;
    if (!pick) continue;
    const at = topicAt(s, pick.w);
    prep.set(`${pick.w}-${pick.d}`, { sub: s.name, color: s.color, topic: `Test prep: ${what}`, kind: 'mock', sets: s.units.slice(0, at.ui + 1).map((_, ui) => s.code + (ui + 1)), test: `${what} on ${date}` });
  }
  function weekPlan(w) {
    const out = basePlan(w).map((x, d) => prep.get(`${w}-${d}`) || x);
    if (holiday.has(w)) out.forEach((x) => { if (x.kind !== 'fix') x.note = def.holidayNote || 'School holiday this week. Use it to catch up and get ahead.'; });
    return out;
  }
  return makeCourse({ ...def, setNames, setSubject, subjectInfo, subjects: subs.map((s) => s.name), tests: tests.map((t) => [t[0], t[1]]), weekPlan });
}

module.exports = { DAYS, SUBJ, addDays, skeyLabel, weekOfSkey, ARCHIVED, makeCourse, makeDynamicCourse };
