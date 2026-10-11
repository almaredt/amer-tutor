// Course registry. Each student is linked to one course (users.course_id); everything that needs
// "the plan" asks for the student's course here. A student without a course sees an empty plan.
const { makeCourse } = require('../plan');

const COURSES = [require('./uptown-g9-2026t1')].map(makeCourse);
const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]));

const get = (id) => (id && byId[id]) || null;
const list = () => COURSES.map((c) => ({ ...c.summary(), school: c.school }));

// Lazy require: db.js seeds the question bank from a course definition, so it cannot depend on this file at load time.
function forUser(userId) {
  const db = require('../db');
  const r = db.prepare('SELECT course_id FROM users WHERE id=?').get(userId);
  return r ? get(r.course_id) : null;
}

module.exports = { get, list, forUser, COURSES, DEFAULT_ID: 'uptown-g9-2026t1' };
