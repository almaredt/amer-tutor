// Plans and limits. Billing is switched off for now: everyone is on the free plan and only the
// per-student daily Claude cap applies. Switching it on later (admin page) makes the plan of each
// student count; payment collection is added when a payment provider is chosen.
const db = require('./db');

const PLANS = ['free', 'family'];
const DEFAULTS = {
  enabled: false,
  plans: {
    free: { name: 'Free', priceAed: 0, dailyUsd: 0.6 },
    family: { name: 'Family', priceAed: 79, dailyUsd: 1.5 },
  },
};

function get() {
  let saved = {};
  try { saved = JSON.parse((db.prepare("SELECT value FROM settings WHERE key='billing'").get() || {}).value || '{}'); } catch (e) { saved = {}; }
  const plans = {};
  for (const k of PLANS) plans[k] = { ...DEFAULTS.plans[k], ...((saved.plans || {})[k] || {}) };
  return { enabled: saved.enabled === true, plans };
}

function set(input) {
  const cur = get();
  if (input.enabled !== undefined) cur.enabled = input.enabled === true;
  for (const k of PLANS) {
    const p = (input.plans || {})[k];
    if (!p) continue;
    if (p.dailyUsd !== undefined) {
      const v = Number(p.dailyUsd);
      if (!(v >= 0 && v <= 20)) return { error: 'Daily Claude cap must be between $0 and $20.' };
      cur.plans[k].dailyUsd = Math.round(v * 100) / 100;
    }
    if (p.priceAed !== undefined) {
      const v = Number(p.priceAed);
      if (!(v >= 0 && v <= 2000)) return { error: 'Price must be between 0 and 2000 AED.' };
      cur.plans[k].priceAed = Math.round(v);
    }
  }
  db.prepare("INSERT INTO settings (key, value) VALUES ('billing', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(cur));
  return cur;
}

function setPlan(userId, plan) {
  if (!PLANS.includes(plan)) return { error: 'Unknown plan.' };
  db.prepare("UPDATE users SET plan=? WHERE id=? AND role='student'").run(plan, userId);
  return { ok: true };
}

// While billing is off everyone gets the free plan's cap.
function dailyLimit(userId) {
  const b = get();
  if (!b.enabled) return b.plans.free.dailyUsd;
  const u = db.prepare('SELECT plan FROM users WHERE id=?').get(userId);
  return (b.plans[(u && u.plan) || 'free'] || b.plans.free).dailyUsd;
}

module.exports = { get, set, setPlan, dailyLimit, PLANS };
