// SQLite database: schema, migrations and question-bank seeding.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const BANK = require('./question-bank');
const { mix } = require('./mix');
// More Grade 9 questions, one file per subject (src/g9-extra/*.js, same shape as question-bank.js).
// Their ids get an "x" ("M1mx0") so adding to either file never renumbers the other.
const EXTRA = Object.assign({}, ...require('fs').readdirSync(require('path').join(__dirname, 'g9-extra')).filter((f) => f.endsWith('.js')).map((f) => require('./g9-extra/' + f)));
const { SUBJ } = require('./plan');
const BANK_COURSE = require('./courses/uptown-g9-2026t1'); // the hand-written bank belongs to this course

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'tutor.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','student')),
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT
);
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  set_code TEXT,
  topic TEXT,
  type TEXT NOT NULL CHECK (type IN ('m','w')),
  body TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('bank','ai')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_for INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_questions_set ON questions(set_code, type);
CREATE TABLE IF NOT EXISTS runs (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skey TEXT NOT NULL,
  date TEXT NOT NULL,
  list TEXT NOT NULL,
  rev TEXT NOT NULL DEFAULT '[]',
  ai_error TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  done_at TEXT,
  PRIMARY KEY (user_id, skey)
);
CREATE TABLE IF NOT EXISTS answers (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skey TEXT NOT NULL,
  qid TEXT NOT NULL,
  choice INTEGER,
  text TEXT,
  opened INTEGER NOT NULL DEFAULT 0,
  ticks TEXT,
  correct INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, skey, qid)
);
CREATE TABLE IF NOT EXISTS srs (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qid TEXT NOT NULL,
  box INTEGER NOT NULL,
  due TEXT NOT NULL,
  first_skey TEXT NOT NULL,
  wrong INTEGER NOT NULL DEFAULT 1,
  learned_skey TEXT,
  PRIMARY KEY (user_id, qid)
);
CREATE TABLE IF NOT EXISTS srs_snap (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skey TEXT NOT NULL,
  qid TEXT NOT NULL,
  prev TEXT,
  PRIMARY KEY (user_id, skey, qid)
);
CREATE TABLE IF NOT EXISTS seen (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qid TEXT NOT NULL,
  skey TEXT NOT NULL,
  PRIMARY KEY (user_id, qid)
);
CREATE TABLE IF NOT EXISTS explanations (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skey TEXT NOT NULL,
  qid TEXT NOT NULL,
  kind TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, skey, qid, kind)
);
CREATE TABLE IF NOT EXISTS flags (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  qid TEXT NOT NULL,
  note TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ai_log (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  ok INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Expand legacy role CHECK safely, preserving user IDs and all related rows.
// SQLite cannot ALTER a CHECK constraint in place. Disable FK checks only for this
// isolated table rebuild, then verify referential integrity before accepting it.
if (!db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get().sql.includes("'teacher'")) {
  const columns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
  const create = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get().sql;
  const expanded = create.replace("role IN ('admin','student')", "role IN ('admin','student','teacher','parent')").replace(/CREATE TABLE IF NOT EXISTS users/i, 'CREATE TABLE users_new');
  if (expanded === create || !expanded.includes('users_new')) throw new Error('Unexpected users schema; cannot migrate roles safely');
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      db.exec(expanded);
      const cols = columns.map((c) => '"' + c.replace(/"/g, '""') + '"').join(',');
      db.exec('INSERT INTO users_new (' + cols + ') SELECT ' + cols + ' FROM users');
      db.exec('DROP TABLE users');
      db.exec('ALTER TABLE users_new RENAME TO users');
    })();
  } finally { db.pragma('foreign_keys = ON'); }
  if (db.pragma('foreign_key_check').length) throw new Error('Foreign key integrity failed after role migration');
}

// ---------- multi-school: schools, study profile on users, course on questions ----------
db.exec(`
CREATE TABLE IF NOT EXISTS schools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  kind TEXT NOT NULL DEFAULT 'school' CHECK (kind IN ('school','family')),
  settings TEXT NOT NULL DEFAULT '{}',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
for (const sql of [
  'ALTER TABLE users ADD COLUMN school_id INTEGER REFERENCES schools(id)',
  'ALTER TABLE users ADD COLUMN programme TEXT',
  'ALTER TABLE users ADD COLUMN grade INTEGER',
  'ALTER TABLE users ADD COLUMN class_name TEXT',
  "ALTER TABLE users ADD COLUMN subjects TEXT NOT NULL DEFAULT '[]'",
  'ALTER TABLE users ADD COLUMN course_id TEXT',
  "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'",
  'ALTER TABLE questions ADD COLUMN course_id TEXT',
]) { try { db.exec(sql); } catch (e) { /* column already exists */ } }
db.exec('CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id, set_code, type)');

// First run after the upgrade: the existing school, a "Families" group for parents who sign up directly,
// and every existing student moved into Uptown Grade 9 MYP with the current course.
db.prepare("INSERT OR IGNORE INTO schools (name, kind) VALUES ('Uptown International School', 'school'), ('Families', 'family')").run();
{
  const uptown = db.prepare("SELECT id FROM schools WHERE name='Uptown International School'").get().id;
  const subj = JSON.stringify([{ group: 'langlit', subject: 'English' }, { group: 'sci', subject: 'Physics' }, { group: 'sci', subject: 'Chemistry' }, { group: 'math', subject: 'Mathematics', level: 'Extended' }]);
  db.prepare(`UPDATE users SET school_id=?, programme='MYP', grade=9, subjects=?, course_id=?
    WHERE role='student' AND school_id IS NULL`).run(uptown, subj, BANK_COURSE.id);
}

// Marketplace phase 1: teacher profiles, family links and student assignments.
// Never expose a child to a parent or teacher without an explicit association.
db.exec(`
CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL DEFAULT '',
  subjects TEXT NOT NULL DEFAULT '[]',
  grades TEXT NOT NULL DEFAULT '[]',
  curricula TEXT NOT NULL DEFAULT '[]',
  languages TEXT NOT NULL DEFAULT '[]',
  rate_45_aed INTEGER,
  rate_60_aed INTEGER,
  approved INTEGER NOT NULL DEFAULT 0 CHECK (approved IN (0,1))
);
CREATE TABLE IF NOT EXISTS parent_students (
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);
CREATE TABLE IF NOT EXISTS teacher_students (
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (teacher_id, student_id, subject)
);
CREATE TABLE IF NOT EXISTS teacher_materials (
  id INTEGER PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('lesson','assignment','exam')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  due_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS teacher_messages (
  id INTEGER PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_material_student ON teacher_materials(student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_student ON teacher_messages(student_id, teacher_id, created_at);
`);

// Bookings and payment ledger: no money movement until a verified PSP is integrated.
db.exec(`
CREATE TABLE IF NOT EXISTS lesson_bookings (
 id INTEGER PRIMARY KEY,
 parent_id INTEGER NOT NULL REFERENCES users(id),
 student_id INTEGER NOT NULL REFERENCES users(id),
 teacher_id INTEGER NOT NULL REFERENCES users(id),
 start_at TEXT NOT NULL,
 minutes INTEGER NOT NULL CHECK (minutes IN (45,60)),
 amount_aed INTEGER NOT NULL CHECK (amount_aed >= 0),
 status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','confirmed','completed','cancelled')),
 payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','pending','paid','refunded')),
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_booking_teacher_time ON lesson_bookings(teacher_id,start_at);
CREATE TABLE IF NOT EXISTS teacher_payouts (
 id INTEGER PRIMARY KEY,
 teacher_id INTEGER NOT NULL REFERENCES users(id),
 booking_id INTEGER NOT NULL UNIQUE REFERENCES lesson_bookings(id),
 amount_aed INTEGER NOT NULL CHECK(amount_aed>=0),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid')),
 paid_at TEXT,
 note TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Seed / refresh the hand-written bank (fixes in question-bank.js reach the DB on restart).
function seedBank() {
  const upsert = db.prepare(`INSERT INTO questions (id, subject, set_code, topic, type, body, source, course_id)
    VALUES (@id, @subject, @set_code, @topic, @type, @body, 'bank', '${BANK_COURSE.id}')
    ON CONFLICT(id) DO UPDATE SET body = excluded.body, topic = excluded.topic`);
  const SET_NAMES = BANK_COURSE.setNames;
  const tx = db.transaction(() => {
    for (const set of Object.keys(BANK)) {
      const subject = SUBJ[set[0]];
      BANK[set].m.forEach((q, i) => upsert.run({ id: `${set}m${i}`, subject, set_code: set, topic: SET_NAMES[set], type: 'm',
        body: JSON.stringify({ q: q[0], options: q[1], answer: q[2], explanation: q[3] }) }));
      BANK[set].w.forEach((q, i) => upsert.run({ id: `${set}w${i}`, subject, set_code: set, topic: SET_NAMES[set], type: 'w',
        body: JSON.stringify({ q: q[0], points: q[1] }) }));
    }
    for (const set of Object.keys(EXTRA)) {
      if (!BANK[set]) throw new Error('Grade 9 extra questions for unknown set ' + set);
      const subject = SUBJ[set[0]];
      (EXTRA[set].m || []).forEach((q, i) => {
        if (!(Array.isArray(q[1]) && q[1].length === 4 && q[2] >= 0 && q[2] < 4)) throw new Error(`Bad MCQ ${set} extra #${i}`);
        const id = `${set}mx${i}`, mx = mix(id, q[1], q[2]);
        upsert.run({ id, subject, set_code: set, topic: SET_NAMES[set], type: 'm', body: JSON.stringify({ q: q[0], options: mx.options, answer: mx.answer, explanation: q[3] }) });
      });
      (EXTRA[set].w || []).forEach((q, i) => upsert.run({ id: `${set}wx${i}`, subject, set_code: set, topic: SET_NAMES[set], type: 'w', body: JSON.stringify({ q: q[0], points: q[1] }) }));
    }
  });
  tx();
  // Questions from before courses existed (bank, criterion tasks, Claude-written) all belong to the first course.
  db.prepare('UPDATE questions SET course_id=? WHERE course_id IS NULL').run(BANK_COURSE.id);
}
seedBank();

module.exports = db;
