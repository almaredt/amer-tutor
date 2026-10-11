// MYP assessment criteria practice: every session includes one "criterion task" (A, B, C or D),
// marked by Claude at an MYP-style level (0–8) with what is needed for the next band.
// Level descriptions are written for each task in plain words; they are practice estimates, not official IB rubrics.
const db = require('./db');

const NAMES = {
  Math: { A: 'Knowing and understanding', B: 'Investigating patterns', C: 'Communicating', D: 'Applying mathematics in real-life contexts' },
  Physics: { A: 'Knowing and understanding', B: 'Inquiring and designing', C: 'Processing and evaluating', D: 'Reflecting on the impacts of science' },
  Chemistry: { A: 'Knowing and understanding', B: 'Inquiring and designing', C: 'Processing and evaluating', D: 'Reflecting on the impacts of science' },
  English: { A: 'Analysing', B: 'Organizing', C: 'Producing text', D: 'Using language' },
};
// What each command term asks for (own wording).
const COMMANDS = {
  State: 'give the answer or fact, no explanation needed',
  Outline: 'give a brief account or summary',
  Describe: 'say what happens or what something is like, in detail',
  Explain: 'give the reasons or causes (because…), using science or maths',
  Justify: 'give valid reasons or evidence to support your answer',
  Calculate: 'work out a number, showing the working and units',
  Show: 'give every step that leads to the result',
  Design: 'plan an investigation: question, hypothesis, variables, method',
  Analyse: 'break it into parts, pick out the key features and what they show',
  Interpret: 'say what the data or text means and draw a conclusion',
  Evaluate: 'weigh strengths and limitations, then give a judgement',
  Discuss: 'give a balanced view with arguments from different sides, then conclude',
  Investigate: 'look for a pattern, test it, generalise it, and verify it',
  Suggest: 'propose a sensible answer or improvement',
  Predict: 'say what will happen, with a reason',
  Compare: 'give similarities and differences, referring to both',
  Organize: 'arrange ideas in a clear, logical structure',
  Create: 'produce an original piece of writing',
};
const CRITS = ['A', 'B', 'C', 'D'];

try { db.exec('ALTER TABLE answers ADD COLUMN level INTEGER'); } catch (e) { /* exists */ }

// Rotate A → B → C → D through the plan; topic quizzes use a hash of their key.
function criterionFor(skey) {
  const m = /^(\d+)-(\d+)$/.exec(skey);
  const n = m ? Number(m[1]) * 7 + Number(m[2]) : [...skey].reduce((s, c) => s + c.charCodeAt(0), 0);
  return CRITS[n % 4];
}
const nameOf = (subject, c) => (NAMES[subject] || NAMES.Physics)[c] || '';
const isCritId = (id) => typeof id === 'string' && id[0] === 'K';

// ---- bank tasks (used when Claude is off, or if Claude fails) ----
// [id, subject, set, criterion, command, question, points (checklist), levels (1–2, 3–4, 5–6, 7–8)]
const BANK = [
  ['KMA1', 'Math', 'M5', 'A', 'Calculate', 'For the equation 2x² − 5x − 3 = 0:\n(a) Calculate the discriminant.\n(b) State how many real roots the equation has and explain how you know.\n(c) Solve the equation by factorising.\n(d) Check one of your solutions by substitution.',
    ['Discriminant = 25 + 24 = 49', 'Two real roots because the discriminant is positive', 'Factorises to (2x + 1)(x − 3) = 0', 'x = −1/2 and x = 3', 'Correct substitution check of one root'],
    ['Some correct substitution or one simple step; most parts missing or wrong', 'Discriminant or factorising mostly correct, with errors elsewhere', 'Most parts correct with only a small slip; reasoning in (b) given', 'All parts correct, roots checked, clear reason for the number of roots']],
  ['KMB1', 'Math', 'M8', 'B', 'Investigate', 'Dots are arranged in patterns: pattern 1 has 3 dots, pattern 2 has 8 dots, pattern 3 has 15 dots, pattern 4 has 24 dots.\n(a) Describe the pattern in words.\n(b) Find a general rule for the number of dots in pattern n.\n(c) Test your rule on pattern 5 by drawing or counting.\n(d) Justify why your rule always works.',
    ['Notices differences 5, 7, 9 (second difference 2)', 'Rule n² + 2n (or n(n + 2) or (n + 1)² − 1)', 'Tests the rule correctly for n = 5 (35 dots)', 'Gives a justification linked to the structure (e.g. a square with one dot missing, or algebra)'],
    ['Continues the pattern for one or two more terms', 'Describes the pattern and suggests a rule that works for some terms', 'Finds a correct general rule and tests it', 'Correct rule, tested, and justified with a clear argument why it always works']],
  ['KMC1', 'Math', 'M6', 'C', 'Show', 'Show that y = x² − 6x + 5 can be written as y = (x − 3)² − 4.\nThen use this form to state the vertex and the axis of symmetry, and sketch the graph with its roots and y-intercept labelled.\nPresent your working so that another student could follow every step.',
    ['Completes the square with clear steps: x² − 6x + 9 − 9 + 5', 'Vertex (3, −4) and axis x = 3 stated', 'Roots x = 1 and x = 5 found', 'y-intercept (0, 5) and a labelled sketch', 'Correct notation and logical order throughout'],
    ['Some correct algebra but hard to follow; little notation', 'Main steps present with gaps in reasoning or notation', 'Clear, mostly complete working with correct notation; small omissions', 'Complete, logical, well-presented working with correct notation and a fully labelled sketch']],
  ['KMD1', 'Math', 'M7', 'D', 'Justify', 'A school wants a rectangular garden against a wall, using 24 m of fencing for the other three sides.\n(a) Write a formula for the area A in terms of the width x.\n(b) Find the width that gives the largest area and the largest area.\n(c) Justify whether your answer is realistic for the school (think about paths, doors, plants).\n(d) Suggest one way the model could be improved.',
    ['A = x(24 − 2x)', 'Maximum at x = 6 m, area 72 m² (with method: vertex or −b/2a)', 'Comments on whether the answer makes sense in the real context', 'Suggests a sensible improvement to the model'],
    ['Identifies some relevant values but no model', 'Writes a model and makes some progress towards the maximum', 'Correct model and maximum, with some comment on the real context', 'Correct model and solution, justified real-life reasoning, and a sensible improvement']],

  ['KPA1', 'Physics', 'P3', 'A', 'Explain', 'A car travels at 15 m/s and then at 30 m/s on the same road.\n(a) Explain why the thinking distance doubles.\n(b) Explain why the braking distance becomes four times larger.\n(c) Explain one driver factor and one road factor that increase stopping distance, saying which part of the stopping distance each affects.',
    ['Thinking distance = speed × reaction time, so doubling speed doubles it', 'Kinetic energy = ½mv², doubling v gives 4× kinetic energy', 'Brakes remove energy: same force → 4× distance (work = force × distance)', 'Driver factor affects thinking distance; road factor affects braking distance, each correctly linked'],
    ['States a fact (e.g. faster means longer stopping distance) without reasons', 'Explains one part correctly; other parts vague', 'Explains most parts with correct physics; small gaps', 'Full, correct explanations for all parts, using kinetic energy and work done']],
  ['KPB1', 'Physics', 'P9', 'B', 'Design', 'Design an investigation into how the surface of a ramp affects how far a toy car travels after leaving the ramp.\nInclude: a research question, a hypothesis with a scientific reason, the independent, dependent and two control variables, the equipment, and a step-by-step method that someone else could follow (including repeats).',
    ['Focused research question naming IV and DV', 'Hypothesis with a scientific reason (friction)', 'Correct IV, DV and two control variables with how they are controlled', 'Logical, repeatable method with measurements and repeats', 'Mentions safety or how data will be recorded'],
    ['States a vague question or a few steps', 'Question and some variables; method incomplete', 'Clear question, hypothesis with reason, variables and a workable method', 'Focused question, well-reasoned hypothesis, all variables controlled, detailed repeatable method with repeats']],
  ['KPC1', 'Physics', 'P7', 'C', 'Evaluate', 'A student loaded a spring and recorded: force (N) 0, 1, 2, 3, 4, 5 and extension (cm) 0, 2.0, 4.1, 5.9, 8.0, 11.5.\n(a) Describe how you would plot this data.\n(b) Describe the trend and find the spring constant.\n(c) Identify where Hooke\'s law stops applying and justify it with the data.\n(d) Evaluate the method: give one limitation and one specific improvement.',
    ['Axes with labels and units, line of best fit', 'Proportional up to about 4 N; k ≈ 50 N/m', 'Limit of proportionality between 4 N and 5 N, justified (extension jumps to 11.5 cm)', 'A real limitation (e.g. reading the ruler, one set of readings) and a specific improvement'],
    ['Some correct reading of the data', 'Describes the trend; spring constant or limit attempted', 'Correct trend, spring constant and limit with justification', 'All parts correct, with a clear evaluation of the method and specific improvements']],
  ['KPD1', 'Physics', 'P5', 'D', 'Discuss', 'Discuss whether the UAE should require every new car to have extra safety features (more airbags and stronger crumple zones), even though they make cars more expensive.\nUse the physics of momentum and force (F = Δp/t) and consider safety, economic and social factors. End with a justified conclusion.',
    ['Explains how airbags/crumple zones increase stopping time and reduce force (F = Δp/t)', 'Considers safety benefits', 'Considers economic cost (car price, insurance, health costs)', 'Considers a social or ethical factor', 'Balanced conclusion with a reason'],
    ['A simple opinion with little science', 'Some science and one factor', 'Correct science and two or three factors with some balance', 'Clear science, several factors weighed from different sides, and a justified conclusion']],

  ['KCA1', 'Chemistry', 'C2', 'A', 'Explain', 'Magnesium (atomic number 12) reacts with chlorine (atomic number 17).\n(a) Explain how each atom forms an ion, with electron configurations.\n(b) Work out the formula of magnesium chloride.\n(c) Explain why magnesium chloride has a high melting point but conducts electricity only when molten or dissolved.',
    ['Mg 2,8,2 loses 2 electrons → Mg²⁺ (2,8)', 'Cl 2,8,7 gains 1 electron → Cl⁻ (2,8,8)', 'Formula MgCl₂ (charges balance)', 'Strong electrostatic attraction in a giant lattice → high melting point', 'Ions fixed in the solid; free to move when molten/dissolved'],
    ['States one correct fact (e.g. Mg forms a positive ion)', 'Ion formation partly correct; formula or properties missing', 'Correct ions and formula; properties explained with small gaps', 'All parts fully correct with clear explanations using structure and bonding']],
  ['KCB1', 'Chemistry', 'C3', 'B', 'Design', 'Design an investigation into how temperature affects the mass of potassium nitrate that dissolves in 50 cm³ of water.\nInclude a research question, a hypothesis with a scientific reason, variables (with how controls are kept the same), equipment, a safe step-by-step method with repeats, and how you will present the results.',
    ['Focused research question', 'Hypothesis with a particle-model reason', 'IV, DV and controls with how they are controlled', 'Repeatable method with temperature range, measuring and repeats', 'Safety and a results table/graph plan'],
    ['Vague question or a few steps', 'Question and some variables; method incomplete', 'Clear question, reasoned hypothesis, variables and workable method', 'Focused question, well-reasoned hypothesis, all variables controlled, detailed safe method with repeats and data plan']],
  ['KCC1', 'Chemistry', 'C6', 'C', 'Interpret', 'Data: substance W melts at 801 °C and conducts only when molten; X melts at −114 °C and does not conduct; Y melts at 1710 °C and never conducts; Z melts at 1085 °C and conducts as a solid.\n(a) Organise the data into a table.\n(b) Interpret the data to deduce the structure of each substance.\n(c) Explain which result is most surprising for a non-metal and why.\n(d) Suggest one extra test that would make your conclusions more reliable.',
    ['Clear table with headings and units', 'W giant ionic, X simple molecular, Y giant covalent, Z metallic', 'Each deduction justified with melting point and conductivity', 'Sensible extra test (e.g. solubility, conductivity of solution, hardness)'],
    ['Some data organised or one structure identified', 'Table and two or three structures, little justification', 'All structures correct with most justifications', 'Well-organised data, all structures justified, insightful comment and a sensible extra test']],
  ['KCD1', 'Chemistry', 'C5', 'D', 'Evaluate', 'Graphene and carbon nanotubes are being used in batteries, sports equipment and water filters.\nEvaluate the use of these materials. Link their properties to their structure, and discuss benefits and possible risks (health, environment, cost). End with your own judgement.',
    ['Links strength/conductivity to structure (covalent bonds, delocalised electrons)', 'Gives benefits in real uses', 'Gives possible risks (e.g. tiny particles, cost, waste)', 'Balanced judgement with a reason'],
    ['Names a use with little science', 'Some structure–property link and one benefit or risk', 'Correct science with benefits and risks', 'Clear structure–property explanation, balanced benefits and risks, and a justified judgement']],

  ['KEA1', 'English', 'E5', 'A', 'Analyse', 'Extract (original): "The market woke before the sun. Crates thudded onto wet stone, and the fishmonger\'s voice cracked across the square like a whip, scattering pigeons and sleep alike."\nAnalyse how the writer creates a lively, slightly harsh atmosphere. Refer to at least two techniques and their effect on the reader.',
    ['Identifies personification ("market woke")', 'Comments on onomatopoeic/forceful verbs ("thudded", "cracked")', 'Analyses the simile "like a whip" (sharp, harsh)', 'Explains the overall effect on the reader with evidence'],
    ['Retells the extract or names a technique without effect', 'Names techniques with a simple comment on effect', 'Analyses two techniques with evidence and effect', 'Perceptive analysis of several techniques, precise evidence and clear effect on the reader']],
  ['KEB1', 'English', 'E2', 'B', 'Organize', 'Plan an analytical essay answering: "How does Lee present courage in To Kill a Mockingbird?"\nWrite a thesis statement, then the topic sentence and the evidence you would use for each of three body paragraphs (describe the moments; no long quotations), and one sentence of conclusion. Use linking words between paragraphs.',
    ['Clear, arguable thesis', 'Three focused topic sentences linked to the thesis', 'Relevant evidence chosen for each paragraph', 'Logical order with linking words and a conclusion sentence'],
    ['A few ideas with little structure', 'Thesis or topic sentences present but loosely connected', 'Clear thesis and paragraphs in a logical order', 'Precise thesis, well-sequenced paragraphs with strong evidence and effective links']],
  ['KEC1', 'English', 'E3', 'C', 'Create', 'Write the opening (120–180 words) of a story told by a teenager arriving in a new country, on their first morning at a new school.\nUse first person, at least two senses, one metaphor, and show feelings through actions rather than naming them.',
    ['Consistent first-person voice', 'At least two senses used', 'One clear metaphor', 'Feelings shown through actions/details', 'Engaging opening and controlled ending'],
    ['Some relevant ideas with little control', 'A basic narrative with some techniques', 'Clear voice and several techniques used effectively', 'Original, controlled writing with a distinctive voice and techniques that create a strong effect']],
  ['KED1', 'English', 'E5', 'D', 'Create', 'Rewrite this paragraph in a formal register suitable for a school report, improving vocabulary and sentence variety:\n"So basically the trip was really good and we saw loads of stuff. The museum was kind of boring but the guide was nice. Then we went home and everyone was tired."\nThen explain two choices you made and why they suit the register.',
    ['Formal register throughout (no slang)', 'More precise vocabulary', 'Varied sentence structures', 'Explains two choices and why they fit the purpose and audience'],
    ['Some words changed but still informal', 'Mostly formal with limited vocabulary or variety', 'Formal, precise and varied with a reasonable explanation', 'Consistently formal, precise and varied writing with a clear, perceptive explanation of choices']],
];
(function seed() {
  const ins = db.prepare(`INSERT INTO questions (id, subject, set_code, topic, type, body, source) VALUES (?,?,?,?, 'w', ?, 'bank')
    ON CONFLICT(id) DO UPDATE SET body = excluded.body, topic = excluded.topic, set_code = excluded.set_code`);
  db.transaction(() => BANK.forEach(([id, subject, set, criterion, command, q, points, levels]) =>
    ins.run(id, subject, set, `Criterion ${criterion}`, JSON.stringify({ q, points, criterion, command, levels })) ))();
})();

// A bank criterion task for this session (unseen first, then the session's sets, then any of the subject).
function bankTask(userId, subjects, sets, crit, exclude = []) {
  const rows = db.prepare(`SELECT id, subject, set_code, body FROM questions WHERE id LIKE 'K%' AND status='active'`).all()
    .map((r) => ({ ...r, b: JSON.parse(r.body) })).filter((r) => subjects.includes(r.subject) && !exclude.includes(r.id));
  const seen = new Set(db.prepare('SELECT qid FROM seen WHERE user_id=?').all(userId).map((r) => r.qid));
  const score = (r) => (r.b.criterion === crit ? 4 : 0) + (seen.has(r.id) ? 0 : 2) + (sets.includes(r.set_code) ? 1 : 0);
  rows.sort((a, b) => score(b) - score(a));
  return rows[0] ? rows[0].id : null;
}

// Info the student may see before answering.
function publicInfo(subject, body) {
  if (!body || !body.criterion) return null;
  const cmd = body.command && COMMANDS[body.command] ? body.command : null;
  return { criterion: body.criterion, name: nameOf(subject, body.criterion), command: cmd, commandHint: cmd ? COMMANDS[cmd] : null };
}

module.exports = { NAMES, COMMANDS, CRITS, criterionFor, nameOf, isCritId, bankTask, publicInfo };
