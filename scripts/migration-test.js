// Reproduce a legacy database with user sessions and an index before upgrading roles.
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const Database=require('better-sqlite3');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'amer-role-migration-'));
const file=path.join(dir,'legacy.db');
try{
 const old=new Database(file);
 old.pragma('foreign_keys = ON');
 old.exec(`
 CREATE TABLE users(id INTEGER PRIMARY KEY,username TEXT NOT NULL UNIQUE COLLATE NOCASE,display_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','student')),password_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT (datetime('now')),last_seen_at TEXT);
 CREATE TABLE auth_sessions(token_hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')));
 CREATE INDEX idx_user_role ON users(role);
 INSERT INTO users(id,username,display_name,role,password_hash) VALUES(123,'legacy','Legacy Student','student','hash');
 INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES('legacy-session',123,9999999999999);
 `);
 old.close();
 const child=spawnSync(process.execPath,['-e',`
 const db=require('./src/db');
 const assert=require('node:assert/strict');
 assert.equal(db.prepare('SELECT id FROM users WHERE username=?').get('legacy').id,123);
 assert.equal(db.prepare('SELECT user_id FROM auth_sessions WHERE token_hash=?').get('legacy-session').user_id,123);
 assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE type='index' AND name='idx_user_role'").get());
 db.prepare("INSERT INTO users(username,display_name,role,password_hash) VALUES('teacher','Teacher','teacher','hash')").run();
 assert.deepEqual(db.pragma('foreign_key_check'),[]);
 assert.equal(db.pragma('integrity_check',{simple:true}),'ok');
 db.close();
 `],{cwd:path.join(__dirname,'..'),env:{...process.env,DB_PATH:file,AI_MOCK:'1'},encoding:'utf8'});
 assert.equal(child.status,0,child.stderr||child.stdout);
 console.log('Legacy migration regression passed');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
