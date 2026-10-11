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
  const sessionDate = (wi, di) => addDays(def.termStart, wi * 7 + di);
  function currentWeek() {
    const n = Math.floor((new Date(today() + 'T00:00:00Z') - new Date(def.termStart + 'T00:00:00Z')) / 864e5 / 7);
    return Math.max(0, Math.min(weeks.length - 1, n));
  }
  function parseSkey(skey) {
    if (typeof skey !== 'string') return null;
    const t = skey.match(/^t-([A-Z]\d{1,2})-[a-z0-9]{4,14}$/);
    if (t) {
      if (!setNames[t[1]] || !SUBJ[t[1][0]]) return null;
      return { w: currentWeek(), d: -1, topicQuiz: true, date: today(),
        session: { sub: SUBJ[t[1][0]], topic: 'Topic quiz: ' + setNames[t[1]], kind: 'practice', sets: [t[1]] } };
    }
    const m = /^(\d{1,2})-([0-6])$/.exec(skey);
    if (!m) return null;
    const w = Number(m[1]), d = Number(m[2]);
    if (w >= weeks.length) return null;
    return { w, d, session: def.weekPlan(w)[d], date: sessionDate(w, d) };
  }
  function subjectsOf(session) {
    if (session.sub === 'Mock' || session.sub === 'Mistakes') return [...new Set(session.sets.map((s) => SUBJ[s[0]]))];
    return [session.sub];
  }
  return {
    id: def.id, title: def.title, school: def.school, programme: def.programme, grade: def.grade, learn: !!def.learn,
    subjects: def.subjects, TERM_START: def.termStart, WEEKS: weeks, TESTS: def.tests, SET_NAMES: setNames,
    weekPlan: def.weekPlan, sessionDate, currentWeek, parseSkey, subjectsOf, skeyLabel,
    summary: () => ({ id: def.id, title: def.title, programme: def.programme, grade: def.grade, learn: !!def.learn, termStart: def.termStart }),
  };
}

module.exports = { DAYS, SUBJ, addDays, skeyLabel, weekOfSkey, ARCHIVED, makeCourse };
