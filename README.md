# Amer Tutor

A personal IB MYP Grade 9 tutor for Math (Extended), Physics, Chemistry and English, following the Uptown International School Term 1 2026-27 outline.

## What it does

- **Weekly plan**: seven sessions a week (Sun–Thu Math/Physics/Chemistry, Friday mistakes day, Saturday English), matched to the school's assessment calendar, with mock tests the day before each summative.
- **Learn topics**: 31 lessons covering every Math (Extended), Physics, Chemistry and English topic in the outline: the school's learning outcomes, explanations, SVG diagrams, step-by-step worked examples, common mistakes, "Ask Claude about this topic", and "Give me a quiz on this topic" (10 quiz + 5 written, mistakes go into the memory bank).
- **Every session = 10 quiz + 5 written questions**, assembled per student:
  1. up to 4 *review* items (earlier mistakes that are due),
  2. unseen questions from the hand-checked bank (265 MCQ + 99 written across 31 topic sets, `src/question-bank.js`),
  3. the rest written on the spot by Claude for that exact topic.
- **Spaced repetition** (Leitner): wrong → back next day; right → +3 days → +7 days → learned after three right in a row.
- **Claude features** (Opus 5.5 by default): new questions, "Explain this question" for any answer, and "Mark it with Claude" for written answers against the mark scheme. Monthly spending cap.
- **Accounts**: admin creates student logins (username + display name only). Each student's data is separate.
- **Admin dashboard**: per-subject and per-topic accuracy (weakest first), weekly activity, recent mistakes, sessions, memory-bank status, reported questions, Claude cost this month.

## Stack

Node.js ≥ 20.6 · Express · SQLite (better-sqlite3, WAL) · vanilla JS front end · Anthropic SDK. No build step.

```
src/server.js         HTTP routes, security headers, CSRF check
src/tutor.js          session builder, spaced repetition, answers, reports
src/ai.js             Claude calls (questions, explanations, marking), cost log, budget cap
src/auth.js           bcrypt passwords, hashed session tokens, login throttle
src/db.js             schema + bank seeding
src/plan.js           term plan, tests, topics
src/question-bank.js  hand-written questions
public/               student page (/), admin page (/admin), lesson content (learn.js)
scripts/              create-admin, backup, smoke-test
deploy/               systemd unit, nginx site
```

## Run locally

```bash
npm ci
cp .env.example .env        # add ANTHROPIC_API_KEY, or leave empty for bank-only mode
npm run create-admin -- ahmad "Ahmad"
npm start                   # http://127.0.0.1:3100  (admin: /admin)
npm test                    # end-to-end smoke test with fake Claude answers
```

## Security notes

- Passwords: bcrypt (cost 12). Sessions: 32-byte random token in an `HttpOnly; SameSite=Lax; Secure` cookie, only its SHA-256 stored.
- State-changing API calls require `X-Requested-With: fetch` (CSRF), JSON body limit 64 KB, login throttle 10/15 min per IP.
- Strict CSP, no inline scripts or styles. Answers are never sent to the browser before the student answers.
- The app listens on 127.0.0.1 only; nginx terminates HTTPS in front of it.
- Stores no email or personal data beyond a username and display name.

## Deployment

See **INSTALL-fa.md** (Persian, step by step) for Ubuntu 24 + nginx + Let's Encrypt + systemd + nightly backups.
