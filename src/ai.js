// Claude integration: new practice questions, explanations, and suggested marks for written answers.
// Without ANTHROPIC_API_KEY the app still works with the question bank only.
// AI_MOCK=1 returns fake answers, for testing without spending anything.
const { Anthropic } = require('@anthropic-ai/sdk');
const db = require('./db');

// Model per job, to keep cost down: Opus writes new questions (accuracy matters most),
// Sonnet explains and answers topic questions, Haiku suggests marks against the mark scheme.
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const MODELS = {
  generate: MODEL,
  explain: process.env.CLAUDE_MODEL_EXPLAIN || 'claude-sonnet-5-5',
  ask: process.env.CLAUDE_MODEL_EXPLAIN || 'claude-sonnet-5-5',
  mark: process.env.CLAUDE_MODEL_MARK || 'claude-haiku-5-5',
  photo: process.env.CLAUDE_MODEL_PHOTO || 'claude-sonnet-5-5', // reading handwriting needs a stronger model than Haiku
  level: process.env.CLAUDE_MODEL_EXPLAIN || 'claude-sonnet-5-5', // MYP level judgement for criterion tasks
};
const modelFor = (kind) => MODELS[kind] || MODEL;
const MOCK = process.env.AI_MOCK === '1';
const client = !MOCK && process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
// USD per million tokens [input, output]. Update if prices change: https://platform.claude.com/docs/en/about-claude/pricing
const PRICES = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5] };
const MONTHLY_LIMIT_USD = Number(process.env.AI_MONTHLY_LIMIT_USD || 10);

const available = () => MOCK || !!client;

function monthCost() {
  const rows = db.prepare(`SELECT model, SUM(input_tokens) i, SUM(output_tokens) o FROM ai_log
    WHERE created_at >= date('now','start of month') GROUP BY model`).all();
  return rows.reduce((s, r) => { const p = PRICES[r.model] || PRICES['claude-opus-5-5']; return s + (r.i * p[0] + r.o * p[1]) / 1e6; }, 0);
}

// What one student has spent on Claude today (UTC day), for the per-student daily cap.
function userDayCost(userId) {
  const rows = db.prepare(`SELECT model, SUM(input_tokens) i, SUM(output_tokens) o FROM ai_log
    WHERE user_id = ? AND created_at >= date('now') GROUP BY model`).all(userId);
  return rows.reduce((s, r) => { const p = PRICES[r.model] || PRICES['claude-opus-5-5']; return s + (r.i * p[0] + r.o * p[1]) / 1e6; }, 0);
}

function log(userId, kind, usage, ok = 1, model = modelFor(kind)) {
  db.prepare('INSERT INTO ai_log (user_id, kind, model, input_tokens, output_tokens, ok) VALUES (?,?,?,?,?,?)')
    .run(userId, kind, MOCK ? 'mock' : model, usage?.input_tokens || 0, usage?.output_tokens || 0, ok);
}

class AIError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

async function call(userId, kind, params) {
  if (!available()) throw new AIError('not_configured', 'Claude is not set up on this server.');
  if (!MOCK && monthCost() >= MONTHLY_LIMIT_USD) throw new AIError('budget', `This month's Claude budget ($${MONTHLY_LIMIT_USD}) is used up.`);
  try {
    const res = await client.messages.create({ model: modelFor(kind), ...params });
    log(userId, kind, res.usage);
    return res;
  } catch (e) {
    log(userId, kind, null, 0);
    const detail = (e && e.error && e.error.error && e.error.error.message) || (e && e.message) || String(e);
    console.error(`[ai] ${kind} failed: status=${e && e.status} ${detail}`);
    throw new AIError('api', explainApiError(e, detail, modelFor(kind)));
  }
}

// Turn Anthropic API errors into a message the admin can act on.
function explainApiError(e, detail, model = MODEL) {
  const st = e && e.status, d = String(detail).toLowerCase();
  if (st === 401) return 'Claude rejected the API key. Check ANTHROPIC_API_KEY in /opt/amer-tutor/.env (no spaces, whole key), then restart.';
  if (st === 403) return 'This API key is not allowed to use Claude. Check the key\'s workspace and permissions in platform.claude.com.';
  if (d.includes('credit balance')) return 'The Claude API account has no credit left. Add credit in platform.claude.com → Billing.';
  if (st === 404) return `The model "${model}" was not found for this key. Check the CLAUDE_MODEL settings in /opt/amer-tutor/.env.`;
  if (st === 429) return 'Too many Claude requests right now (rate limit). Wait a minute and try again.';
  if (st === 529 || st >= 500) return 'Claude is busy right now. Try again in a minute.';
  if (!st) return 'The server could not reach Claude (network problem). Try again in a minute.';
  return `Claude did not answer (error ${st}: ${String(detail).slice(0, 160)}).`;
}

const textOf = (res) => res.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
const toolInput = (res) => (res.content.find((b) => b.type === 'tool_use') || {}).input;
// Some models don't allow forcing a tool, so the tool is offered with tool_choice "auto".
// If Claude answers in text instead, take the JSON object out of the text.
function structured(res) {
  const t = toolInput(res); if (t) return t;
  const m = textOf(res).match(/\{[\s\S]*\}/);
  try { return m ? JSON.parse(m[0]) : {}; } catch (e) { return {}; }
}

// ---- 1. New questions ----
const QUESTION_TOOL = {
  name: 'save_questions',
  description: 'Save the practice questions you wrote.',
  input_schema: {
    type: 'object',
    properties: {
      mcq: { type: 'array', items: { type: 'object', properties: {
        q: { type: 'string' }, options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        answer: { type: 'integer', minimum: 0, maximum: 3 }, explanation: { type: 'string' } }, required: ['q', 'options', 'answer', 'explanation'] } },
      written: { type: 'array', items: { type: 'object', properties: {
        q: { type: 'string' }, points: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
        criterion: { type: 'string', enum: ['A', 'B', 'C', 'D'] }, command: { type: 'string' },
        levels: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 } }, required: ['q', 'points'] } },
    },
    required: ['mcq', 'written'],
  },
};

async function generateQuestions(userId, { subject, topic, nm, nw, avoid, crit }) {
  if (MOCK) {
    log(userId, 'generate', { input_tokens: 0, output_tokens: 0 });
    return {
      mcq: Array.from({ length: nm }, (_, i) => ({ q: `[Test] ${topic}: practice question ${i + 1}. Pick B.`, options: ['Option A', 'Option B', 'Option C', 'Option D'], answer: 1, explanation: 'Test question: B is correct.' })),
      written: Array.from({ length: nw }, (_, i) => (crit && i === 0
        ? { q: `[Test] Criterion ${crit.criterion} task on ${topic}. Explain fully.`, points: ['First element', 'Second element', 'Third element'], criterion: crit.criterion, command: 'Explain', levels: ['L1-2', 'L3-4', 'L5-6', 'L7-8'] }
        : { q: `[Test] ${topic}: written question ${i + 1}. Explain.`, points: ['First point', 'Second point'] })),
    };
  }
  const prompt = `You write practice questions for a Grade 9 IB MYP student (Extended level) at an international school in Dubai.
Subject: ${subject}
Topic: ${topic}

Write ${nm} multiple-choice questions and ${nw} written exam-style questions on exactly this topic. Mix easier questions with harder Extension ones, like a real MYP test. ${subject === 'English' ? 'This is MYP English Language and Literature. Do NOT quote To Kill a Mockingbird or any other published text; for analysis questions write your own short original extract (2-4 sentences or lines) inside the question.' : 'Use SI units and Unicode for symbols (x², H₂O, Δ, →).'}
Do not repeat any of these existing questions:
${avoid.slice(0, 40).map((a) => '- ' + a).join('\n')}

Rules:
- Each multiple-choice question has exactly 4 options and exactly one correct answer. Wrong options should reflect common student mistakes.
- Work out every answer and every calculation twice before you save it. Accuracy matters more than variety.
- "explanation": 1-2 sentences on why the correct answer is right, showing the calculation if there is one.
- Each written question says what to do (calculate, explain, describe) and has 2 to 4 mark-scheme points, 1 mark each.
${crit ? critInstructions(subject, crit) : ''}
Save them by calling the save_questions tool. Do not write anything else.`;
  const res = await call(userId, 'generate', {
    max_tokens: 8000,
    tools: [QUESTION_TOOL],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: prompt }],
  });
  const out = structured(res) || {};
  return {
    mcq: (out.mcq || []).filter((q) => q && typeof q.q === 'string' && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4).slice(0, nm),
    written: (out.written || []).filter((q) => q && typeof q.q === 'string' && Array.isArray(q.points) && q.points.length >= 1).slice(0, nw).map((q) => {
      const okCrit = crit && q.criterion === crit.criterion && Array.isArray(q.levels) && q.levels.length === 4;
      return okCrit ? { q: q.q, points: q.points, criterion: q.criterion, command: String(q.command || '').trim(), levels: q.levels.map(String) } : { q: q.q, points: q.points };
    }),
  };
}

// ---- 2. Explanations ----
const L = 'ABCD';
async function explainMcq(userId, body, choice) {
  if (MOCK) { log(userId, 'explain', null); return `[Test explanation] The answer is ${L[body.answer]} because ${body.explanation}`; }
  const right = choice === body.answer;
  const res = await call(userId, 'explain', {
    max_tokens: 700,
    messages: [{ role: 'user', content: `You are AMER, a patient tutor for a Grade 9 IB MYP student (age 14). Explain this multiple-choice question simply and step by step, in under 150 words. Plain text only: no markdown, no headings, no bold.

Question: ${body.q}
Options: ${body.options.map((o, j) => L[j] + '. ' + o).join(' | ')}
Correct answer: ${L[body.answer]}. ${body.options[body.answer]}
Student chose: ${L[choice]}. ${body.options[choice]}

${right ? 'The student was right. Explain why, so they understand it, not just remember it.' : 'The student was wrong. Explain what mistake in thinking leads to their choice, then how to get the right answer.'} End with one short tip to remember.` }],
  });
  return textOf(res);
}

async function explainWritten(userId, body, text) {
  if (MOCK) { log(userId, 'explain', null); return '[Test explanation] A full-marks answer covers every mark-scheme point.'; }
  const res = await call(userId, 'explain', {
    max_tokens: 900,
    messages: [{ role: 'user', content: `You are AMER, a patient tutor for a Grade 9 IB MYP student (age 14). Help them understand this written exam question, in under 200 words. Plain text only: no markdown, no headings, no bold.

Question: ${body.q}
Mark scheme (1 mark per point): ${body.points.map((p, j) => `${j + 1}) ${p}`).join(' ')}
Student's answer: ${text || '(blank)'}

Say which mark-scheme points their answer earned and which were missing, then write a short full-marks model answer.` }],
  });
  return textOf(res);
}

// ---- 3. Suggested marking of a written answer ----
const MARK_TOOL = {
  name: 'mark_answer',
  description: 'Record which mark-scheme points the answer earned.',
  input_schema: { type: 'object', properties: {
    awarded: { type: 'array', items: { type: 'boolean' }, description: 'One true/false per mark-scheme point, in order.' },
    feedback: { type: 'string', description: 'One or two sentences of feedback for the student.' } }, required: ['awarded', 'feedback'] },
};
async function markWritten(userId, body, text) {
  if (MOCK) { log(userId, 'mark', null); return { awarded: body.points.map((_, i) => i === 0), feedback: '[Test] First point earned.' }; }
  const res = await call(userId, 'mark', {
    max_tokens: 600,
    tools: [MARK_TOOL],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: `Mark this Grade 9 IB MYP student's answer fairly against the mark scheme. Award a point only if the answer clearly contains it (different wording is fine; correct units required where the point includes them).

Question: ${body.q}
Mark scheme:
${body.points.map((p, j) => `${j + 1}) ${p}`).join('\n')}

Student's answer:
${text}

Record the result by calling the mark_answer tool. Do not write anything else.` }],
  });
  const out = structured(res) || {};
  const awarded = body.points.map((_, i) => !!(out.awarded || [])[i]);
  return { awarded, feedback: String(out.feedback || '') };
}


// ---- 3b. Check a photo of handwritten working ----
const PHOTO_TOOL = {
  name: 'record_photo_check',
  description: 'Record the transcript of the handwritten working, the mark-scheme points earned, and step-by-step feedback.',
  input_schema: { type: 'object', properties: {
    readable: { type: 'boolean', description: 'false if the photo is unreadable or is not working for this question.' },
    transcript: { type: 'string', description: 'The working, line by line, as written (use Unicode for maths: x², √, ×, →).' },
    awarded: { type: 'array', items: { type: 'boolean' }, description: 'One true/false per mark-scheme point, in order.' },
    feedback: { type: 'string', description: 'Short feedback for the student: which line has the first mistake (quote it), what the correct step is, and one tip.' } },
  required: ['readable', 'transcript', 'awarded', 'feedback'] },
};
async function markPhoto(userId, body, imageB64, mediaType) {
  if (MOCK) { log(userId, 'photo', null); return { readable: true, transcript: '[Test] Line 1: working from the photo\nLine 2: answer', awarded: body.points.map((_, i) => i === 0), feedback: '[Test] Line 2 has the first mistake.' }; }
  const res = await call(userId, 'photo', {
    max_tokens: 1500,
    tools: [PHOTO_TOOL],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageB64 } },
      { type: 'text', text: `The photo shows a Grade 9 IB MYP student's handwritten working for this question.

Question: ${body.q}
Mark scheme (1 mark per point):
${body.points.map((p, j) => `${j + 1}) ${p}`).join('\n')}

1. Transcribe the working line by line, exactly as written (do not fix mistakes).
2. Check every step. Find the first line that is wrong, if any.
3. Award a mark-scheme point only if the working clearly shows it (correct units required where the point includes them).
4. Feedback in under 120 words, plain text: name the first wrong line and the correct step, or say the working is fully correct; end with one tip.
If the photo is unreadable or is not working for this question, set readable to false and say what to fix (lighting, focus, whole page in view).
Record the result by calling the record_photo_check tool. Do not write anything else.` },
    ] }],
  });
  const out = structured(res) || {};
  return {
    readable: out.readable !== false,
    transcript: String(out.transcript || '').slice(0, 4000),
    awarded: body.points.map((_, i) => !!(out.awarded || [])[i]),
    feedback: String(out.feedback || ''),
  };
}


// Extra instructions so exactly one written question is an MYP criterion task.
const CRIT_HOW = {
  science: { A: 'explain or apply scientific knowledge to a new situation, in several parts', B: 'design an investigation: research question, hypothesis with a scientific reason, variables and how they are controlled, method with repeats', C: 'give a small data table (invented, realistic) and ask the student to present it, describe the trend, conclude against a hypothesis, and evaluate the method with improvements', D: 'discuss how this science affects society, the environment or the economy, with arguments on different sides and a justified conclusion' },
  math: { A: 'solve problems with the methods of this topic, in several parts', B: 'investigate a pattern: describe it, find a general rule, test it, and justify why it always works', C: 'show full working for a problem, presenting it clearly with correct notation so another student could follow it', D: 'model a real-life situation, solve it, and judge whether the answer is realistic, suggesting an improvement to the model' },
  english: { A: 'analyse an original short extract (write it yourself): techniques and their effect on the reader', B: 'plan and organise an analytical response: thesis, topic sentences, evidence, links', C: 'produce an original piece of writing for a stated purpose and audience, using named techniques', D: 'improve or rewrite a short original passage for register, vocabulary and sentence variety, and explain the choices' },
};
function critInstructions(subject, crit) {
  const kind = /Math/.test(subject) ? 'math' : /English/.test(subject) ? 'english' : 'science';
  return `MYP criterion task: exactly ONE of the written questions (put it first) must be a Criterion ${crit.criterion} practice task (${crit.name}). It should ${CRIT_HOW[kind][crit.criterion]}.
For that question also set "criterion": "${crit.criterion}", "command": the main IB command term it uses (e.g. Explain, Design, Evaluate, Discuss, Investigate, Justify, Analyse, Show), "points": 3 to 5 key elements a full answer includes, and "levels": exactly 4 short descriptions (one sentence each, written for THIS task) of what an answer at level 1–2, 3–4, 5–6 and 7–8 includes. The other written questions have no criterion fields.`;
}

// ---- 3c. MYP-style level for a criterion task ----
const LEVEL_TOOL = {
  name: 'record_level',
  description: 'Record the MYP-style level for the answer.',
  input_schema: { type: 'object', properties: {
    level: { type: 'integer', minimum: 0, maximum: 8 },
    awarded: { type: 'array', items: { type: 'boolean' }, description: 'One true/false per key element, in order.' },
    strengths: { type: 'string', description: 'One or two sentences on what the answer does well.' },
    next: { type: 'string', description: 'What exactly to add or change to reach the next band (concrete, 1–3 short points).' } },
  required: ['level', 'awarded', 'strengths', 'next'] },
};
async function markLevel(userId, subject, criterionName, body, text) {
  if (MOCK) { log(userId, 'level', null); return { level: 5, awarded: body.points.map((_, i) => i < 2), feedback: '[Test] Good start. To reach 7–8: add an evaluation.' }; }
  const res = await call(userId, 'level', {
    max_tokens: 900,
    tools: [LEVEL_TOOL],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: `You are an experienced IB MYP ${subject} teacher marking a Grade 9 (MYP Year 4) practice task for Criterion ${body.criterion} (${criterionName}).
Task: ${body.q}
Command term: ${body.command || '(not given)'}
Key elements of a full answer:
${body.points.map((p, j) => `${j + 1}) ${p}`).join('\n')}
Level descriptions for this task:
1–2: ${body.levels[0]}
3–4: ${body.levels[1]}
5–6: ${body.levels[2]}
7–8: ${body.levels[3]}

Student's answer:
${text}

Choose the band that best fits the answer as a whole, then the higher number of the band if the answer fully meets it, else the lower. Level 0 if the answer does not reach 1–2. Check that the answer does what the command term asks (e.g. "explain" needs reasons, "evaluate" needs a judgement). Be fair and encouraging but honest. This is a practice estimate.
Record the result by calling the record_level tool. Do not write anything else.` }],
  });
  const out = structured(res) || {};
  const level = Math.max(0, Math.min(8, Math.round(Number(out.level) || 0)));
  return { level, awarded: body.points.map((_, i) => !!(out.awarded || [])[i]), feedback: [String(out.strengths || ''), out.next ? 'To reach the next band: ' + String(out.next) : ''].filter(Boolean).join('\n') };
}

// ---- 4. Questions about a Learn topic ----
async function askTopic(userId, { subject, title, context, question }) {
  if (MOCK) { log(userId, 'ask', null); return `[Test answer] About ${title}: ${question}`; }
  const res = await call(userId, 'ask', {
    max_tokens: 900,
    messages: [{ role: 'user', content: `You are AMER, a patient tutor for a Grade 9 IB MYP student (age 14, Extended level) at an international school in Dubai.
Topic: ${subject}: ${title}
What the lesson covers: ${context}
The student asks: ${question}

Answer clearly and simply in under 220 words. Use a small worked example with numbers if it helps. Plain text only: no markdown, no headings, no bold. If the question is not about this subject, answer briefly and steer back to the topic.` }],
  });
  return textOf(res);
}

module.exports = { askTopic, available, generateQuestions, explainMcq, explainWritten, markWritten, markPhoto, markLevel, monthCost, userDayCost, MODEL, MODELS, MOCK, MONTHLY_LIMIT_USD, AIError };
