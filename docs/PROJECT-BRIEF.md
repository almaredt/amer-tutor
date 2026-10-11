# Amer Tutor — project brief

Read this first in every new chat about this project. It describes what exists, where it lives and how we work.

## People and goal
- **Ahmad** (owner, admin) builds and runs the app. Replies to Ahmad: **Persian script**, never romanized. He often types romanized Farsi.
- **Amer (عامر)**, his son: Grade 9, IB MYP Year 4, Uptown International School, Dubai. Math and Physics at **Extended** level. Main focus: Physics, Math, Chemistry; plus English (Language & Literature).
- Goal: a private-tutor-style study app so Amer does better in class. Classmates may be added later (separate accounts, admin sees everyone's results).

## What exists (two versions)
| | Claude artifact version | VPS version (main) |
|---|---|---|
| Where | claude.ai artifact "Amer's Study Week": https://claude.ai/artifact/LhFbnxGdg7KVUnQVTFgB5u | https://irmz.com (InterServer VPS 162.35.163.244, Ubuntu, `/opt/amer-tutor`) |
| Login | each person's Claude account (share as Contributor) | username + password created by admin at `/admin` |
| Data | artifact `db` (students/{uid}, students/{uid}/runs, questions) | SQLite `/opt/amer-tutor/data/tutor.db`, nightly backups in `/opt/amer-tutor/backups` |
| Claude | viewer's own Claude account (sample capability, Opus 5.5) | Anthropic API key in `.env`, model `claude-opus-5-5`, monthly cap `AI_MONTHLY_LIMIT_USD` |
| Code | single HTML (scratch build, not in git) | private GitHub repo **almaredt/amer-tutor** |

## Features (both versions)
- **Study plan**: Term 1 2026-27, 9 weeks from Sun 11 Oct 2026. 7 days/week: Sun–Thu Math/Physics/Chemistry (learn, practice, review, mock tests the day before summatives), **Friday mistakes day**, **Saturday English**. Built from the school's MYP Term 1 outline + assessment calendar.
- **Every session: 10 quiz + 5 written** = due review items (max 3 MCQ + 1 written) + unseen bank questions + Claude-written questions for the topic.
- **Spaced repetition** (Leitner): wrong → next day; right → +3 d → +7 d → learned after 3 right in a row.
- **Learn topics**: 31 lessons (Math 9, Physics 9, Chemistry 8, English 5) with school outcomes, explanations, SVG diagrams, step-by-step worked examples, common mistakes, "Ask Claude about this topic", "Give me a quiz on this topic" (topic quiz keys `t-<SET>-<id>`).
- **Explain this question** (Claude), written answers checked against mark-scheme points; VPS also has **Mark it with Claude** and **Report a problem**.
- **Admin dashboard**: per-student, per-subject and per-topic accuracy, recent mistakes, sessions, memory bank, Claude cost.

## Question bank
`src/question-bank.js`: 31 sets, 265 MCQ + 99 written. Set codes: M1–M9 (Math), P1–P9 (Physics), C1–C8 (Chemistry), E1–E5 (English). English extracts are original; never quote To Kill a Mockingbird or other copyrighted text.

## Repo layout (VPS version)
`src/` server (Express, better-sqlite3, auth, tutor engine, ai.js, plan.js) · `public/` student page, admin page, `learn.js` lessons · `scripts/` create-admin, backup, update.sh, smoke-test · `deploy/` systemd + nginx · `INSTALL-fa.md` Persian install/update guide.

## How we work
1. Ahmad asks for a change in chat.
2. Claude edits the code in the repo, runs `npm test` (end-to-end smoke test with mocked Claude) and pushes to `main`.
3. Ahmad updates the server with one command: `sudo bash /opt/amer-tutor/scripts/update.sh` (backs up the DB, pulls from GitHub via a read-only deploy key, `npm ci`, restarts, health-checks, prints a rollback command).
4. If the Claude artifact version should match, update and republish it too.

## Rules to keep
- Academic honesty: practice only; never write Amer's graded work (summative essays, lab reports).
- Students are minors: store only username + display name; no emails or personal data.
- Keep answers hidden from the browser until answered (VPS).
- Monthly scheduled task (1st of each month, 09:48 Dubai) reminds Ahmad to copy the latest DB backup to his PC.

## Next likely work
- Term 2 outline → new plan, lessons and question sets.
- Possibly add classmates (admin creates accounts).
