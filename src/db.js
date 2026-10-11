// SQLite database: schema, migrations and question-bank seeding.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const BANK = require('./question-bank');
const { SUBJ, SET_NAMES } = require('./plan');

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

// Seed / refresh the hand-written bank (fixes in question-bank.js reach the DB on restart).
function seedBank() {
  const upsert = db.prepare(`INSERT INTO questions (id, subject, set_code, topic, type, body, source)
    VALUES (@id, @subject, @set_code, @topic, @type, @body, 'bank')
    ON CONFLICT(id) DO UPDATE SET body = excluded.body, topic = excluded.topic`);
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
}
seedBank();

module.exports = db;
