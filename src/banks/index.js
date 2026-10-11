// Fixed question banks for data-driven (dynamic) courses, written in advance and checked, so sessions
// work without Claude. One file per course and subject:
//   module.exports = { course, subject, units: { 1: { m: [...], w: [...] }, 2: ... }, hlUnits: { 3: ... } }
//   m = [question, [4 options], index of the right option, explanation]
//   w = [question, [mark-scheme points]]
// "units" are shared by SL and HL students (same unit numbers); "hlUnits" are extra questions only for HL
// (a whole HL-only unit, or HL-only topics inside a shared unit; their ids get an "h": "G11-CHH3-hm0").
// Ids are stable ("G<grade>-<set>-m<i>", e.g. G11-MA2-m0), so fixing a question here updates it on the next restart.
const fs = require('fs');
const path = require('path');
const db = require('../db');

const COURSE_DEFS = Object.fromEntries(fs.readdirSync(path.join(__dirname, '..', 'courses'))
  .filter((f) => f.endsWith('.js') && f !== 'index.js').map((f) => require(path.join(__dirname, '..', 'courses', f))).map((d) => [d.id, d]));

function files() {
  return fs.readdirSync(__dirname).filter((f) => f.endsWith('.js') && f !== 'index.js').map((f) => require(path.join(__dirname, f)));
}

// Answers are written mostly in one position; spread them with a fixed (id-based) shuffle so the right
// option is not always in the same place, and stays put between restarts.
function mix(id, options, answer) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const order = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = (h >>> 16) % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  return { options: order.map((k) => options[k]), answer: order.indexOf(answer) };
}

function seed() {
  const upsert = db.prepare(`INSERT INTO questions (id, subject, set_code, topic, type, body, source, course_id)
    VALUES (@id, @subject, @set_code, @topic, @type, @body, 'bank', @course)
    ON CONFLICT(id) DO UPDATE SET body = excluded.body, topic = excluded.topic, subject = excluded.subject, set_code = excluded.set_code, course_id = excluded.course_id`);
  let n = 0;
  db.transaction(() => {
    for (const b of files()) {
      const def = COURSE_DEFS[b.course];
      const cs = def && def.subjects[b.subject];
      if (!cs) throw new Error(`Question bank for unknown course/subject: ${b.course} / ${b.subject}`);
      // Seed for both levels: an HL student of a subject with one unit list uses the same units (see makeDynamicCourse).
      for (const level of ['SL', 'HL']) {
        const code = cs.code + (level === 'HL' ? 'H' : '');
        const name = `${cs.short} ${level}`;
        const units = cs.units[level] || cs.units.SL;
        const add = (num, set, tag = '') => {
          const unit = units[num - 1];
          if (!unit) return;
          const sc = code + num, pre = `G${def.grade}-${sc}`, topic = `${name}: ${unit.t}`;
          (set.m || []).forEach((q, i) => {
            if (!(Array.isArray(q[1]) && q[1].length === 4 && Number.isInteger(q[2]) && q[2] >= 0 && q[2] < 4)) throw new Error(`Bad MCQ ${sc} #${i}`);
            const id = `${pre}-${tag}m${i}`, mx = mix(id, q[1], q[2]);
            upsert.run({ id, subject: name, set_code: sc, topic, type: 'm', course: b.course, body: JSON.stringify({ q: q[0], options: mx.options, answer: mx.answer, explanation: q[3] || '' }) }); n++;
          });
          (set.w || []).forEach((q, i) => {
            if (!(Array.isArray(q[1]) && q[1].length)) throw new Error(`Bad written question ${sc} #${i}`);
            upsert.run({ id: `${pre}-${tag}w${i}`, subject: name, set_code: sc, topic, type: 'w', course: b.course, body: JSON.stringify({ q: q[0], points: q[1] }) }); n++;
          });
        };
        Object.entries(b.units || {}).forEach(([num, set]) => add(Number(num), set));
        if (level === 'HL') Object.entries(b.hlUnits || {}).forEach(([num, set]) => add(Number(num), set, 'h'));
      }
    }
  })();
  return n;
}

const count = seed();
module.exports = { count, seed };
