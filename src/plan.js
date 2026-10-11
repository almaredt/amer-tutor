// Term 1 study plan for Grade 9 MYP (Uptown International School, 2026-27).
// Weeks start on Sunday. Days 0-4 = Sun-Thu study sessions, day 5 = Friday mistakes day.
// A session key ("skey") is "<week>-<day>", e.g. "0-1" = week 1, Monday.

const TERM_START = '2026-10-11';

const WEEKS = [
  { d: '11–15 Oct', M: 'Direct & inverse proportion, finding the constant k', P: 'Distance vs displacement, speed vs velocity, acceleration', C: 'Isotopes, relative atomic mass, electron configuration, ions, balancing equations' },
  { d: '18–22 Oct', M: 'Proportion graphs and tables of values', P: 'Distance-time and velocity-time graphs: gradient and area', C: 'How ions form, ionic bonding (dot & cross)' },
  { d: '25–29 Oct', M: 'Factorising (a = 1) and difference of two squares', P: 'Thinking distance and braking distance', C: 'Covalent bonding in simple molecules + solubility practical' },
  { d: '1–5 Nov', M: 'Factorising when a ≠ 1', P: "Forces as vectors, free body diagrams, Newton's three laws", C: 'Giant ionic and giant covalent structures, diamond and graphite' },
  { d: '8–12 Nov', M: 'Quadratic formula and the discriminant', P: 'Momentum; seat belts, airbags, crumple zones (F = Δp / t)', C: 'Fullerenes, graphene, metallic bonding' },
  { d: '15–19 Nov', M: 'Vertex form, axis of symmetry, three forms of a quadratic', P: 'Terminal velocity and moments', C: 'Predicting properties from structure' },
  { d: '22–26 Nov', M: 'Optimisation and modelling a real-life parabola', P: "Hooke's law and the limit of proportionality", C: 'Bonding: predicting properties from structure' },
  { d: '29 Nov–3 Dec', M: 'Project prep: modelling with quadratics (Criterion D)', P: 'Mixed Forces & Motion questions', C: 'Mixed Structure & Bonding questions' },
  { d: '6–10 Dec', M: 'Mixed quadratics review', P: 'Mixed multi-step questions', C: 'Mixed Structure & Bonding questions' },
];

const TESTS = [
  ['2026-10-12', 'Chemistry Unit 2 summative (Atoms, Elements & Compounds)'],
  ['2026-10-30', 'English Critical Essay: character (summative)'],
  ['2026-11-02', 'Math CFU1 · Physics stopping distance · Chem solubility practical · English Creative Essay'],
  ['2026-11-09', 'Physics road safety (formative) · English Unseen Poetry CFU'],
  ['2026-11-16', 'Math CFU2 · Physics road safety summative · Chemistry summative'],
  ['2026-11-23', 'Math Unit 2 End of Unit'],
  ['2026-11-30', 'Physics Forces & Motion summative · English PEEL Paragraph CFU'],
  ['2026-12-07', 'Chemistry Structure & Bonding summative · Math project'],
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SUBJ = { M: 'Math', P: 'Physics', C: 'Chemistry', E: 'English' };
const SET_NAMES = {
  M1: 'Direct & inverse proportion', M2: 'Proportion graphs & tables', M3: 'Factorising (a = 1)', M4: 'Factorising (a ≠ 1)',
  M5: 'Quadratic formula & discriminant', M6: 'Vertex form & three forms', M7: 'Optimisation & modelling',
  P1: 'Speed, velocity, acceleration', P2: 'Motion graphs', P3: 'Stopping distance', P4: "Forces & Newton's laws",
  P5: 'Momentum & car safety', P6: 'Terminal velocity & moments', P7: "Hooke's law",
  C1: 'Atoms, elements & compounds', C2: 'Ions & ionic bonding', C3: 'Covalent bonding', C4: 'Giant structures',
  C5: 'Fullerenes, graphene, metals', C6: 'Properties from structure',
  M8: 'Sequences', M9: 'Series', P8: 'Measurement & uncertainty', P9: 'Investigation skills', C7: 'States of matter', C8: 'Gas tests & separation',
  E1: 'TKAM context & narrative voice', E2: 'PETAL / PEEL paragraphs', E3: 'Narrative voice & perspective', E4: 'Unseen poetry', E5: 'Language techniques & dialect',
};
// Saturday English sessions (Unit 1 To Kill a Mockingbird, Unit 2 Global Tales)
const ENG = [
  { topic: "To Kill a Mockingbird: 1930s context and Scout's narrative voice", kind: 'learn', sets: ['E1'] },
  { topic: 'PETAL paragraphs and character analysis (Jem, Atticus)', kind: 'practice', sets: ['E2'], test: 'Critical Essay (character) on Fri 30 Oct' },
  { topic: "Narrative voice and perspective: writing a refugee's voice", kind: 'learn', sets: ['E3'], test: "Creative Essay: Refugee's Narrative Voice on Mon 2 Nov" },
  { topic: 'Unseen poetry: devices, structure and tone', kind: 'learn', sets: ['E4'], test: 'Unseen Poetry CFU on Mon 9 Nov' },
  { topic: 'Language techniques, dialect and effect', kind: 'learn', sets: ['E5'] },
  { topic: "Perspective: retelling events from another character's viewpoint", kind: 'practice', sets: ['E3', 'E1'] },
  { topic: 'PEEL paragraphs: point, evidence, explain, link', kind: 'practice', sets: ['E2'], test: 'PEEL Paragraph CFU on Mon 30 Nov' },
  { topic: 'Unseen prose analysis', kind: 'practice', sets: ['E5', 'E4'] },
  { topic: 'Mixed English review', kind: 'review', sets: ['E1', 'E2', 'E3', 'E4', 'E5'] },
];

const M = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];
const P = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
const C2_6 = ['C2', 'C3', 'C4', 'C5', 'C6'];
const MW = [['M1'], ['M2'], ['M3'], ['M4'], ['M5'], ['M6'], ['M7'], ['M6', 'M7'], ['M3', 'M4', 'M5', 'M6', 'M7']];
const PW = [['P1'], ['P2'], ['P3'], ['P4'], ['P5'], ['P6'], ['P7'], P, P];
const CW = [['C1'], ['C2'], ['C3'], ['C4'], ['C5'], ['C6'], ['C6', 'C2', 'C4'], C2_6, C2_6];
const THU = ['Physics', 'Physics', 'Physics', 'Physics', 'Chemistry', 'Chemistry', 'Physics', 'Chemistry', 'Chemistry'];

function weekPlan(wi) {
  const w = WEEKS[wi];
  const s = [
    { sub: 'Math', topic: w.M, kind: 'learn', sets: MW[wi] },
    { sub: 'Physics', topic: w.P, kind: 'learn', sets: PW[wi] },
    { sub: 'Chemistry', topic: w.C, kind: 'learn', sets: CW[wi] },
    { sub: 'Math', topic: w.M, kind: 'practice', sets: MW[wi] },
    THU[wi] === 'Physics'
      ? { sub: 'Physics', topic: w.P, kind: 'review', sets: PW[wi] }
      : { sub: 'Chemistry', topic: w.C, kind: 'review', sets: CW[wi] },
    { sub: 'Mistakes', topic: 'Fix the questions still being answered wrong', kind: 'fix', sets: [] },
  ];
  if (wi >= 7) { s[1].kind = 'practice'; s[2].kind = 'practice'; }
  // Sundays are always Math. Mock tests for Physics/Chemistry go on the Thursday before the Monday test.
  if (wi === 2) s[4].note = 'Stopping distance & solubility practical on Mon 2 Nov.';
  if (wi === 3) s[0] = { sub: 'Math', topic: 'Math CFU1 tomorrow: proportion and factorising', kind: 'mock', sets: ['M1', 'M2', 'M3'], test: 'Math CFU1 on Mon 2 Nov' };
  if (wi === 4) s[3] = { sub: 'Math', topic: 'Review for CFU2: factorising, quadratic formula, discriminant', kind: 'practice', sets: ['M3', 'M4', 'M5'] };
  if (wi === 5) {
    s[4] = { sub: 'Mock', topic: 'Mock: Physics road safety + Chemistry bonding', kind: 'mock', sets: ['P3', 'P5', 'C2', 'C3', 'C4', 'C5'], test: 'Physics road safety and Chemistry summative on Mon 16 Nov' };
    s[0] = { sub: 'Math', topic: 'Math CFU2 tomorrow: factorising, quadratic formula, discriminant', kind: 'mock', sets: ['M3', 'M4', 'M5'], test: 'Math CFU2 on Mon 16 Nov' };
  }
  if (wi === 6) s[0] = { sub: 'Math', topic: 'Full mock: Math Unit 2 (proportion + quadratics)', kind: 'mock', sets: M.slice(0, 6), test: 'Math End of Unit on Mon 23 Nov' };
  if (wi === 7) s[4] = { sub: 'Mock', topic: 'Full mock: Physics Forces & Motion', kind: 'mock', sets: P, test: 'Physics summative on Mon 30 Nov' };
  if (wi === 8) s[4] = { sub: 'Mock', topic: 'Full mock: Chemistry Structure & Bonding', kind: 'mock', sets: C2_6, test: 'Chemistry summative on Mon 7 Dec' };
  s.push({ sub: 'English', ...ENG[wi] });
  return s;
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function sessionDate(wi, di) { return addDays(TERM_START, wi * 7 + di); }
const today = () => new Date().toISOString().slice(0, 10);
function currentWeek() {
  const n = Math.floor((new Date(today() + 'T00:00:00Z') - new Date(TERM_START + 'T00:00:00Z')) / 864e5 / 7);
  return Math.max(0, Math.min(WEEKS.length - 1, n));
}
// Session keys: "<week>-<day>" for the plan, or "t-<set>-<id>" for a quiz started from a Learn topic.
function parseSkey(skey) {
  if (typeof skey !== 'string') return null;
  const t = skey.match(/^t-([MPCE]\d)-[a-z0-9]{4,14}$/);
  if (t) {
    if (!SET_NAMES[t[1]]) return null;
    return { w: currentWeek(), d: -1, topicQuiz: true, date: today(),
      session: { sub: SUBJ[t[1][0]], topic: 'Topic quiz: ' + SET_NAMES[t[1]], kind: 'practice', sets: [t[1]] } };
  }
  if (!/^[0-8]-[0-6]$/.test(skey)) return null;
  const [w, d] = skey.split('-').map(Number);
  return { w, d, session: weekPlan(w)[d], date: sessionDate(w, d) };
}
function subjectsOf(session) {
  if (session.sub === 'Mock' || session.sub === 'Mistakes') return [...new Set(session.sets.map((s) => SUBJ[s[0]]))];
  return [session.sub];
}
function skeyLabel(skey) {
  if (skey[0] === 't') return 'topic quiz';
  const [w, d] = skey.split('-').map(Number);
  return `${DAYS[d].slice(0, 3)} wk ${w + 1}`;
}

module.exports = { TERM_START, WEEKS, TESTS, DAYS, SUBJ, SET_NAMES, weekPlan, sessionDate, parseSkey, subjectsOf, addDays, skeyLabel };
