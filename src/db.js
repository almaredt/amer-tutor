// SQLite database: schema, migrations and question-bank seeding.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const BANK = require('./question-bank');
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
  });
  tx();
  // Questions from before courses existed (bank, criterion tasks, Claude-written) all belong to the first course.
  db.prepare('UPDATE questions SET course_id=? WHERE course_id IS NULL').run(BANK_COURSE.id);
}
seedBank();

module.exports = db;
