// IB programmes, the grades they cover (UAE grade numbering) and their subject groups.
// Used to validate a student's profile and to build the admin form. Names are descriptive only.

const PROGRAMMES = {
  PYP: {
    name: 'Primary Years (PYP)', grades: [1, 2, 3, 4, 5],
    groups: [
      { id: 'lang', name: 'Language', subjects: ['English', 'Arabic', 'French'] },
      { id: 'math', name: 'Mathematics', subjects: ['Mathematics'] },
      { id: 'sci', name: 'Science', subjects: ['Science'] },
      { id: 'soc', name: 'Social studies', subjects: ['Social studies'] },
      { id: 'arts', name: 'Arts', subjects: ['Visual arts', 'Music', 'Drama'] },
      { id: 'pspe', name: 'Personal, social and physical education', subjects: ['PSPE'] },
    ],
  },
  MYP: {
    name: 'Middle Years (MYP)', grades: [6, 7, 8, 9, 10],
    groups: [
      { id: 'langlit', name: 'Language and literature', subjects: ['English', 'Arabic', 'French'] },
      { id: 'langacq', name: 'Language acquisition', subjects: ['Arabic', 'French', 'Spanish', 'English'], levels: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6'] },
      { id: 'indsoc', name: 'Individuals and societies', subjects: ['Individuals and societies'] },
      { id: 'sci', name: 'Sciences', subjects: ['Integrated sciences', 'Biology', 'Chemistry', 'Physics'] },
      { id: 'math', name: 'Mathematics', subjects: ['Mathematics'], levels: ['Standard', 'Extended'] },
      { id: 'arts', name: 'Arts', subjects: ['Visual arts', 'Music', 'Drama'] },
      { id: 'phe', name: 'Physical and health education', subjects: ['Physical and health education'] },
      { id: 'design', name: 'Design', subjects: ['Design'] },
    ],
  },
  DP: {
    name: 'Diploma (DP)', grades: [11, 12],
    groups: [
      { id: 'g1', name: 'Studies in language and literature', subjects: ['English A: Literature', 'English A: Language and literature', 'Arabic A'], levels: ['SL', 'HL'] },
      { id: 'g2', name: 'Language acquisition', subjects: ['Arabic B', 'French B', 'Spanish B', 'French ab initio', 'Spanish ab initio'], levels: ['SL', 'HL'] },
      { id: 'g3', name: 'Individuals and societies', subjects: ['Business management', 'Economics', 'Geography', 'History', 'Psychology'], levels: ['SL', 'HL'] },
      { id: 'g4', name: 'Sciences', subjects: ['Biology', 'Chemistry', 'Physics', 'Computer science', 'Environmental systems and societies'], levels: ['SL', 'HL'] },
      { id: 'g5', name: 'Mathematics', subjects: ['Mathematics: analysis and approaches', 'Mathematics: applications and interpretation'], levels: ['SL', 'HL'] },
      { id: 'g6', name: 'Arts', subjects: ['Visual arts', 'Music', 'Theatre'], levels: ['SL', 'HL'] },
      { id: 'core', name: 'Core', subjects: ['Theory of knowledge', 'Extended essay'] },
    ],
  },
};

const programmeForGrade = (g) => Object.keys(PROGRAMMES).find((p) => PROGRAMMES[p].grades.includes(Number(g))) || null;

// Clean and check a student's study profile. Returns { profile } or { error }.
function validate(input) {
  const programme = String(input.programme || '');
  const P = PROGRAMMES[programme];
  if (!P) return { error: 'Choose a programme: PYP, MYP or DP.' };
  const grade = Number(input.grade);
  if (!P.grades.includes(grade)) return { error: `${programme} covers Grades ${P.grades[0]}–${P.grades[P.grades.length - 1]}.` };
  const className = String(input.class_name || '').trim().slice(0, 20);
  const subjects = [];
  const raw = Array.isArray(input.subjects) ? input.subjects : [];
  if (raw.length > 20) return { error: 'Too many subjects.' };
  for (const s of raw) {
    const g = P.groups.find((x) => x.id === s.group);
    if (!g) return { error: 'Unknown subject group.' };
    if (!g.subjects.includes(s.subject)) return { error: `"${String(s.subject).slice(0, 40)}" is not in ${g.name}.` };
    const level = s.level ? String(s.level) : null;
    if (level && !(g.levels || []).includes(level)) return { error: `Level "${level.slice(0, 20)}" is not valid for ${s.subject}.` };
    if (g.levels && !level) return { error: `Choose a level for ${s.subject}.` };
    if (subjects.some((x) => x.group === g.id && x.subject === s.subject)) continue;
    subjects.push({ group: g.id, subject: s.subject, ...(level ? { level } : {}) });
  }
  return { profile: { programme, grade, class_name: className, subjects } };
}

module.exports = { PROGRAMMES, programmeForGrade, validate };
