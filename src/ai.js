// Claude integration: new practice questions, explanations, and suggested marks for written answers.
// Without ANTHROPIC_API_KEY the app still works with the question bank only.
// AI_MOCK=1 returns fake answers, for testing without spending anything.
const { Anthropic } = require('@anthropic-ai/sdk');
const db = require('./db');

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
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

function log(userId, kind, usage, ok = 1) {
  db.prepare('INSERT INTO ai_log (user_id, kind, model, input_tokens, output_tokens, ok) VALUES (?,?,?,?,?,?)')
    .run(userId, kind, MOCK ? 'mock' : MODEL, usage?.input_tokens || 0, usage?.output_tokens || 0, ok);
}

class AIError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

async function call(userId, kind, params) {
  if (!available()) throw new AIError('not_configured', 'Claude is not set up on this server.');
  if (!MOCK && monthCost() >= MONTHLY_LIMIT_USD) throw new AIError('budget', `This month's Claude budget ($${MONTHLY_LIMIT_USD}) is used up.`);
  try {
    const res = await client.messages.create({ model: MODEL, ...params });
    log(userId, kind, res.usage);
    return res;
  } catch (e) {
    log(userId, kind, null, 0);
    const detail = (e && e.error && e.error.error && e.error.error.message) || (e && e.message) || String(e);
    console.error(`[ai] ${kind} failed: status=${e && e.status} ${detail}`);
    throw new AIError('api', explainApiError(e, detail));
  }
}

// Turn Anthropic API errors into a message the admin can act on.
function explainApiError(e, detail) {
  const st = e && e.status, d = String(detail).toLowerCase();
  if (st === 401) return 'Claude rejected the API key. Check ANTHROPIC_API_KEY in /opt/amer-tutor/.env (no spaces, whole key), then restart.';
  if (st === 403) return 'This API key is not allowed to use Claude. Check the key\'s workspace and permissions in platform.claude.com.';
  if (d.includes('credit balance')) return 'The Claude API account has no credit left. Add credit in platform.claude.com → Billing.';
  if (st === 404) return `The model "${MODEL}" was not found for this key. Check CLAUDE_MODEL in /opt/amer-tutor/.env.`;
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
        q: { type: 'string' }, points: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 } }, required: ['q', 'points'] } },
    },
    required: ['mcq', 'written'],
  },
};

async function generateQuestions(userId, { subject, topic, nm, nw, avoid }) {
  if (MOCK) {
    log(userId, 'generate', { input_tokens: 0, output_tokens: 0 });
    return {
      mcq: Array.from({ length: nm }, (_, i) => ({ q: `[Test] ${topic}: practice question ${i + 1}. Pick B.`, options: ['Option A', 'Option B', 'Option C', 'Option D'], answer: 1, explanation: 'Test question: B is correct.' })),
      written: Array.from({ length: nw }, (_, i) => ({ q: `[Test] ${topic}: written question ${i + 1}. Explain.`, points: ['First point', 'Second point'] })),
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
    written: (out.written || []).filter((q) => q && typeof q.q === 'string' && Array.isArray(q.points) && q.points.length >= 1).slice(0, nw),
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

module.exports = { askTopic, available, generateQuestions, explainMcq, explainWritten, markWritten, monthCost, MODEL, MOCK, MONTHLY_LIMIT_USD, AIError };
