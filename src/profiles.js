// Schools and each student's study profile: school, programme, grade, class, subjects (with level) and course.
const db = require('./db');
const courses = require('./courses');
const programmes = require('./programmes');

// ---------- schools ----------
function listSchools() {
  return db.prepare(`SELECT s.id, s.name, s.kind, s.active, s.created_at,
      (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role='student') students
    FROM schools s ORDER BY s.kind DESC, s.name`).all();
}
function createSchool(name, kind) {
  name = String(name || '').trim();
  if (name.length < 2 || name.length > 80) return { error: 'School name: 2-80 characters.' };
  if (!['school', 'family'].includes(kind)) return { error: 'Choose school or family group.' };
  try { return { id: db.prepare('INSERT INTO schools (name, kind) VALUES (?,?)').run(name, kind).lastInsertRowid }; }
  catch (e) { return { error: 'A school with that name already exists.' }; }
}
const getSchool = (id) => db.prepare('SELECT id, name, kind FROM schools WHERE id=?').get(Number(id));

// ---------- student profile ----------
function get(userId) {
  const u = db.prepare('SELECT school_id, programme, grade, class_name, subjects, course_id, plan FROM users WHERE id=?').get(userId);
  if (!u) return null;
  let subjects = []; try { subjects = JSON.parse(u.subjects || '[]'); } catch (e) { /* keep empty */ }
  const school = u.school_id ? getSchool(u.school_id) : null;
  const course = courses.get(u.course_id);
  return { school_id: u.school_id, school: school ? school.name : null, programme: u.programme, grade: u.grade, class_name: u.class_name || '',
    subjects, course_id: course ? course.id : null, course: course ? course.title : null, plan: u.plan };
}

// Validate everything first, then write once. A changed course archives the old sessions.
function set(userId, input) {
  const school = getSchool(input.school_id);
  if (!school) return { error: 'Choose a school.' };
  const v = programmes.validate(input);
  if (v.error) return v;
  let courseId = input.course_id ? String(input.course_id) : null;
  if (courseId) {
    const c = courses.get(courseId);
    if (!c) return { error: 'Unknown course.' };
    if (c.programme !== v.profile.programme || c.grade !== v.profile.grade) return { error: `That course is for ${c.programme} Grade ${c.grade}.` };
  }
  const cur = db.prepare('SELECT course_id FROM users WHERE id=?').get(userId);
  db.transaction(() => {
    if (cur && cur.course_id && cur.course_id !== courseId) archiveSessions(userId);
    db.prepare('UPDATE users SET school_id=?, programme=?, grade=?, class_name=?, subjects=?, course_id=? WHERE id=?')
      .run(school.id, v.profile.programme, v.profile.grade, v.profile.class_name, JSON.stringify(v.profile.subjects), courseId, userId);
  })();
  return get(userId);
}

// Session keys ("0-1") repeat in every course, so before a student moves to another course their old
// sessions get a unique prefix ("h1:0-1"). Answers, history and the memory bank are all kept.
function archiveSessions(userId) {
  const used = db.prepare("SELECT skey FROM runs WHERE user_id=? AND skey LIKE 'h%:%'").all(userId)
    .map((r) => Number((/^h(\d+):/.exec(r.skey) || [])[1] || 0));
  const pre = `h${Math.max(0, ...used) + 1}:`;
  const live = "NOT LIKE 'h%:%'";
  for (const t of ['runs', 'answers', 'srs_snap', 'explanations', 'seen']) {
    db.prepare(`UPDATE ${t} SET skey = ? || skey WHERE user_id=? AND skey ${live}`).run(pre, userId);
  }
  db.prepare(`UPDATE srs SET first_skey = ? || first_skey WHERE user_id=? AND first_skey ${live}`).run(pre, userId);
  db.prepare(`UPDATE srs SET learned_skey = ? || learned_skey WHERE user_id=? AND learned_skey IS NOT NULL AND learned_skey ${live}`).run(pre, userId);
}

// Everything the admin form needs to build its dropdowns.
const options = () => ({ programmes: programmes.PROGRAMMES, schools: listSchools(), courses: courses.list() });

module.exports = { get, set, listSchools, createSchool, getSchool, options };
