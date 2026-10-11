// Course registry. Each student is linked to one course (users.course_id); everything that needs
// "the plan" asks for the student's course here. A student without a course sees an empty plan.
const { makeCourse, makeDynamicCourse } = require('../plan');

// Fixed courses have one plan for everyone; dynamic ones build a plan from each student's subjects.
const DEFS = [require('./uptown-g9-2026t1'), require('./uptown-g11-2026t1')];
const COURSES = DEFS.map((d) => (d.dynamic ? makeDynamicCourse(d, []) : makeCourse(d)));
const defById = Object.fromEntries(DEFS.map((d) => [d.id, d]));
const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]));

const get = (id) => (id && byId[id]) || null;
const list = () => COURSES.map((c) => ({ ...c.summary(), school: c.school, dynamic: c.dynamic }));
const cache = new Map();
function forSubjects(id, subjects) {
  const def = defById[id];
  if (!def || !def.dynamic) return get(id);
  const key = id + '|' + JSON.stringify(subjects);
  if (!cache.has(key)) { if (cache.size > 500) cache.clear(); cache.set(key, makeDynamicCourse(def, subjects)); }
  return cache.get(key);
}

// Lazy require: db.js seeds the question bank from a course definition, so it cannot depend on this file at load time.
function forUser(userId) {
  const db = require('../db');
  const r = db.prepare('SELECT course_id, subjects FROM users WHERE id=?').get(userId);
  if (!r || !byId[r.course_id]) return null;
  let subjects = []; try { subjects = JSON.parse(r.subjects || '[]'); } catch (e) { /* none */ }
  return forSubjects(r.course_id, subjects);
}

module.exports = { get, list, forUser, forSubjects, COURSES, DEFAULT_ID: 'uptown-g9-2026t1' };
