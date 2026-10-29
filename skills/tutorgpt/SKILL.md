---
name: tutorgpt
description: >
  Project-specific senior frontend, full-stack and UI/UX engineering skill for
  AMER TUTOR (almaredt/amer-tutor), covering the agreed tutoring-platform vision,
  role workflows, points system, neo-brutalist design, tutor discovery,
  lesson scheduling, learning analytics, demo data, GitHub workflow and VPS safety.
  Invoke when continuing any AMER TUTOR work.
---

# TutorGPT — AMER TUTOR Project Skill

> This is a **comprehensive working record**, assembled from the AMER TUTOR conversation
> through 29 October 2026. It is **not a byte-for-byte export of all chat messages**.
> The user's actual screenshots, images, messages, and complete chat transcript remain
> in the original ChatGPT conversation. Do not claim a screenshot or UI has been
> verified simply because it is described here.

## 1. Fundamental instructions / guardrails

- Project: **AMER TUTOR**; private GitHub repository: **`almaredt/amer-tutor`**.
- **Always work on branch `chatgptv1`**, never modify `main` without explicit approval.
- Do not deploy to VPS, publish, alter server, or activate paid services without explicit approval.
- User expects an expert **senior frontend engineer, UI/UX designer, graphic designer and full-stack developer**. Build genuinely usable and refined components, not bare forms or demos pretending to be complete.
- The word **minimalist refers to design, not reduced functionality**. Keep visual restraint and neo-brutalist brand, but strive for complete platform workflows.
- Prefer responding in the user's chosen language (English or Persian), including Persian script when they type Persian in Latin characters.
- Match the actual reference screenshots in responsive layout, spacing, border, shadow and information architecture—not merely by making generic black-outlined cards.
- Do not fabricate ratings, reviews, teachers, availability, completed lessons, user growth, or payment transactions; explicitly mark illustrative demo content as demo.
- Verify actual GitHub Actions results after code changes. A previous successful run does not establish that later commits pass.
- Be explicit when browser/mobile visual testing or production/security acceptance has not been performed.

## 2. User goals and major decisions

The website is an online tutoring platform called **AMER TUTOR**, with **Admin, Teacher, Parent, Student** roles:

- **Admin**: create/approve users; maintain accounts and teacher listings; link children/parents/teachers; manage booking requests, points and settlements/refunds; oversee curriculum, content, student progress and operational reporting.
- **Teacher**: approved profile with subjects, grade levels, curricula, languages, bio and 45/60-minute point rates; weekly calendar for availability; manage lesson requests, students, assignments, messages, progress, teaching resources, quiz/exam results and earned points.
- **Parent**: find/search/compare teachers before registration; see complete teacher profiles and available calendar times; sign in only when booking; manage linked children, points, bookings, messages and progress reports.
- **Student**: structured learning plans, quizzes/written answers, spaced repetition, AI self-study, teacher material, a visual analytics dashboard and weakness/focus recommendations.

### Demo points instead of cash

Cash payments are **not required until the overall platform is functional**. All values are demo points, **not AED**:
- Example: a 45-minute lesson costs **100 points**.
- Parent sends **100 points to admin**.
- After the completed lesson admin retains **15 points commission** and sends **85 points to teacher** (15%/85%).
- Teacher payout must be prevented until booking completed/paid, and duplicate transfers must be rejected.
- No Stripe Checkout or live payment gateway enabled in current points workflow.
- Some legacy SQLite columns retain `_aed` names for compatibility; in current UI/workflows they represent points. Do not silently change DB names in unrelated work.
- Parent requests refund of paid **future** lesson; admin approves/rejects; approved refund returns full points to parent, cancels booking, and blocks duplicates.
- Granting demo points is an explicit admin action and must not be mistaken for cash.
- Real-money conversion, reversals for completed lessons, multi-admin settlement edge cases, concurrency hardening, audits and disputes require further engineering.

## 3. Technology and project commands

- Server: Node.js (>=20.6, prefer recent LTS), Express, SQLite (`better-sqlite3`), `bcryptjs`.
- Frontend: **plain HTML/CSS/JavaScript** (existing stack)—do not introduce React/Tailwind without a compelling explicit request.
- OpenAI native fetch adapter; legacy Claude integration replaced with environment variables `OPENAI_API_KEY`, `OPENAI_MODEL`, etc. Mock AI can be used in tests.
- CI: `.github/workflows/branch-tests.yml`; `npm ci`, JS syntax checks, `npm test` smoke tests, `node scripts/migration-test.js`, demo seed idempotency test.
- Local PowerShell:
  ```powershell
  cd C:\amer-tutor   # replace with actual clone path
  git switch chatgptv1
  git pull origin chatgptv1
  npm ci
  npm start
  ```
- Routes:
  - `/`: public landing page.
  - `/tutors`: publicly accessible tutor directory; no login needed.
  - `/tutor/:id`: publicly accessible tutor detail profile.
  - `/login`: dedicated login.
  - `/study`: student workspace.
  - `/portal`: teacher / parent workspace.
  - `/admin`: admin operations workspace.
- Running website local port is configured by environment; do not assume 3000 if server reports another port.
- Admin creation/reset:
  ```powershell
  npm run create-admin -- admin "Administrator"
  ```
  Password is prompted interactively; minimum 8 characters. Re-running for an existing username resets that user's password and makes account admin. **Only on the configured database**.
- Demo data (opt-in, not automatic):
  ```powershell
  npm run seed-demo
  ```
  Seeds 6 teachers, 3 parents, 6 students, linked relationships, weekly teaching hours and points. New user passwords are randomly generated, shown once in console. Does not alter existing passwords.
- VPS is separate, at `/opt/amer-tutor` for main production. Existing `scripts/update.sh` tracks `origin/main` and **MUST NOT** be used to deploy `chatgptv1`; use a separate staging directory and database after approval.
- Staging docs: `docs/VPS-STAGING-HANDOFF.md`, `docs/PRE-VPS-ACCEPTANCE.md`.

## 4. Brand and Neo-Brutalism visual system

Visual direction was repeatedly refined using screenshots provided by the user:
- Clean white/off-white background with subtle small grid.
- Primary BIC-style blue **`#2F5FB8`**, with related vibrant blue accents **`#2563eb`** / **`#1a6bf0`** for selected and CTA states.
- Consistent **2–3px black borders**, **square corners**, and crisp unblurred **3–5px offset black shadows**.
- Bold Sora or similar clean sans-serif headings; Atkinson Hyperlegible for text; JetBrains Mono for small metadata.
- Pastel chips with strong outlines; green availability status; yellow star ratings.
- Buttons/cards translate about 2px on hover, with matching hard-shadow behavior. Keyboard focus must be clearly visible.
- Dark mode must be intentionally designed **everywhere**, not inherited inconsistently from old CSS. Shared `theme-dark.css` and `theme-control.js` support Auto / Light / Dark; ensure quiz states and disabled answers are readable.
- Mobile: 4-column desktop tutor cards, 3 or 2 columns on mid widths, 1 column on narrow mobile; avoid broken admin panel widths or horizontally clipped forms.
- Existing styles: `public/brutalist.css`, `public/theme-dark.css`, `public/portal.css`, `public/admin-console.css`, `public/marketplace.css`, `public/tutor-explore.css`.
- **Do not sacrifice functional controls for aesthetic minimalism**.

## 5. Latest requested tutor listing / detail specification (29 October 2026)

User explicitly requested an implementation matching reference images, separate pages and functional booking. Native HTML/CSS/JS chosen and committed:

### Public "Find Your Tutor" (`/tutors`)
- Big heading **Find Your Tutor**, subtitle **"Expert tutors for every subject. Flexible times. Online. Simple."**
- Live tutor/subject/keyword search.
- Subject, Grade Level, Curriculum dropdowns.
- Price Range slider in **points**; subject/category chips with counts; sort dropdown, including Highest Rated for marked demo records.
- **4-column responsive grid** with a large illustrated tutor avatar, wishlist heart, green availability/status pill, tutor name, subject/curriculum, demo rating and reviews (clearly marked illustrative), lesson point price and full-width blue **View Profile** CTA.
- Demo references:
  - Aisyah Rahman — 4.9, 112 **demo** reviews, Mathematics / IGCSE, female hijab illustrated avatar.
  - Daniel Tan — 4.8, 85 **demo** reviews, Science / A Level, illustrated male glasses avatar.
  - Kavitha Nair — 4.9, 130 **demo** reviews, English / IELTS, illustrated long-hair avatar.
  - Jason Lim — 4.7, 98 **demo** reviews, Bahasa Melayu / SPM, illustrated male avatar.
- These demo ratings are a **UI preview only**, not verified review records or legitimate production reputation scores.
- Local self-hosted vector illustrations via `src/demo-avatars.js` and `/demo-avatar/:name.svg`, rather than external headshot photo APIs.

### Public Tutor Detail (`/tutor/:id`)
- **← Back to tutors** breadcrumb.
- Two columns: large portrait, thumbnails, tutor biography/details on left; live booking calendar on right.
- Details: name, demo-star/reviews label when relevant, subject role, levels, languages, demo experience, bio and tabs **About / Subjects / Availability / Reviews**.
- Badge chips for subjects/levels, teaching-style checklist (for demo records clearly presented as illustrative).
- Booking card: **Book a Lesson**, Dubai timezone, horizontal 5-day date rail with arrows, 45/60-minute toggle, live time slot grid (4 columns), available/booked/selected legend, selection summary, blue Continue to Login CTA.
- The specific illustrative October 2026 dates/time examples from screenshots are NOT hardcoded to live booking: query **actual** next 14-day free slots from `GET /api/public/teachers/:id/calendar?duration=45|60`.
- Visitors can explore details and real free slots without login; booking requires authenticated parent.
- Selected teacher/date/time/duration carried into parent login flow via validated local return path and sessionStorage pending booking.
- Listing/profile JS: `public/tutor-explore.js`; CSS: `public/tutor-explore.css`; pages `public/tutors.html`, `public/tutor-profile.html`.
- `src/server.js` routes `/tutors`, `/tutor/:id` and public approved teacher endpoints.
- Existing alternate parent portal marketplace modules: `public/tutor-marketplace.js`, `public/parent-calendar.js`, `public/public-tutors.js`. Avoid leaving contradictory UI when integrating future changes.

## 6. Teacher and Parent workspace

- `public/portal.html`, `portal.js`, `portal.css`.
- `public/portal-workspace.js` provides task-focused tabs and role-specific metrics.
- Teacher editing availability uses `public/availability-calendar.js` interactive 7-day calendar with 30-minute cells, drag-to-select, quick weekdays and clear, Dubai-local times.
- Parent booking uses selectable 14-day teacher free slots; existing bookings reserved/confirmed are excluded. Booking API checks time conflicts and teacher approval.
- Parent sees linked children, lesson agenda/statuses, points wallet/refund requests and graphical progress. Teacher sees students, messages/material, booking requests, lesson completion actions, wallet history and availability.
- `public/progress-insights.js` + `public/progress-insights.css` visualize honest actual marked answers: overall accuracy, subject performance, focus topics, strong topics, recent practice, review items. At least three marked answers per topic needed before displaying strength/weakness classification; do not create fictional grades.

## 7. Admin expectations and existing implementation

User strongly objected to an ugly Admin page with inconsistent widths and weak functionality. Requirements:
- **Same neo-brutalist look as Student** with actual sidebar menu: strong borders, square icon tiles, hard shadows and selected-blue item.
- **Every admin tab/section must use the SAME responsive content canvas and width**, no 400px forms amid full-screen pages.
- Core sections: Overview, Students, Teachers & Parents, Bookings, Points & Settlements, Refunds, Schools, Platform Settings.
- Overview should provide actionable KPI cards, graph views for actual registration history, lessons by subject, point movement and latest users, plus real bookings and task queues.
- Avoid fake business growth, total users, reviews or cash revenues. Points are demo only.
- Real existing admin APIs must remain wired and authorization enforced.
- Existing files: `public/admin.html`, `public/admin.js`, `public/admin-marketplace.js`, `public/admin-console.js`, `public/admin-console.css`, `public/admin-theme.css`.
- Public admin analytics: `/api/admin/analytics` admin-only, DB-backed. Do not expose privately identifiable student data publicly.
- An older dynamic admin DOM wrapper/observer is used; watch for duplicate forms, lost event handlers, report navigation problems, and large/small layout inconsistencies; test in a browser.

## 8. Demo accounts and teacher portraits

`scripts/seed-demo.js` creates opt-in demo accounts:
- 6 tutors: demo.teacher.aisyah, .daniel, .kavitha, .jason, .farah, .amir.
- 3 parents: demo.parent.sara, .omar, .lina.
- 6 students: demo.student.amer, .ali, .noor, .adam, .maya, .leo.
- Parents/children linked; tutor/students linked; teachers have subjects, grades, curricula, languages, rates, weekly availability; demo parents have starter points.
- No shared hardcoded demo passwords; random credentials shown on first seed.
- The user rejected realistic stock headshots as inappropriate and requested **illustrated graphical avatars**. Serve local `/demo-avatar/:name.svg` from `src/demo-avatars.js`, not external images.
- Do not pretend generated portraits depict real instructors.
- Demo records should be marked, particularly review ratings and online status (a green badge need not imply realtime online presence).

## 9. Security, accuracy, and incomplete items

- Account, role and linked-student checks on backend. Parent must only see linked children; teacher only linked students; Admin operational routes require Admin.
- Never expose passwords, hashes, or private usernames in public teacher listing. Teacher catalogue displays approved+active accounts only.
- Public availability is a point-in-time view and does not guarantee a slot until booking is accepted; no real payment.
- Normalize timezone at boundaries to Asia/Dubai. Existing date/time validation has previously caused CI failures; check carefully.
- Booking conflict checking and concurrency hardening require DB-level transactional review for production traffic.
- Restore/refund after class start, disputes, credential verification, robust security, data-retention and safeguarding need further review before real customers.
- Assess `npm audit` output: prior CI reported vulnerabilities in dependencies; do not blindly run `npm audit fix --force`.
- Check accessibility of dark/light contrast, input labels, disabled quiz answer visibility, keyboard focus, mobile.
- A previous UI was criticised for generic cards, mismatched admin width, missing functional affordances and user-visible dark-mode problems; proactively guard against regressions.
- Some UI is implemented via independent scripts; verify DOM load order and Content Security Policy (avoid unsafe inline JS/CSS).
- A passing GitHub Actions workflow validates syntax and smoke tests, **not pixel perfection or browser interaction**.

## 10. GitHub work workflow

Connected GitHub plugin supports file reads and writes. Use specific branch every time:

1. Fetch exact file content and SHA using `mcp__GitHub__fetch_file({repository_full_name:"almaredt/amer-tutor",path,ref:"chatgptv1"})`.
2. Carefully edit full content and `mcp__GitHub__update_file({repository_full_name:"almaredt/amer-tutor",path,sha,content,message,branch:"chatgptv1"})`; use create_file for genuinely new files.
3. Read/verify nearby CSS/JS and check all imports/scripts linked correctly.
4. Check workflow runs for the exact final commit; retrieve failed job logs; fix failures before claiming tests pass.
5. Keep changes on `chatgptv1` and **do not deploy automatically**.
6. Link actual file/code URLs, e.g. `https://github.com/almaredt/amer-tutor/tree/chatgptv1`.

## 11. Notable development history (chronological digest)

- **Phase 1:** role migrations; user/profile and parent–student / teacher–student links; admin approve teacher; teacher/parent portals; student materials/messages; design tokens.
- **Phase 2:** booking records, parent request flow, teacher profile and rates; OpenAI adapter and learning plans; optional payments prototype.
- **Phase 3:** legacy role migration, CI, availability, booking conflict validation, teacher completion, Stripe Checkout prototype and tests.
- **Points decision:** no real money; point_wallets and point_movements with transactional parent-admin-teacher transfers; 15% commission; refunds and admin approval; cash routes retired.
- **Teacher availability:** weekly interactive calendar, not text fields.
- **Parent booking:** visual 14-day free-times picker, duration, Dubai timezone, booking steps.
- **Student analytics:** evidence-based performance graphs, strengths, learning weaknesses and recommended practice.
- **Public landing:** homepage on `/`, dedicated login, student on `/study`, admin on `/admin`.
- **Neo-brutalist styling and dark mode:** unified styling for student, parent, teacher, admin and public pages; contrast fixes for MCQ answer feedback.
- **Tutor marketplace:** search, curriculum/grade/subject/point filters, favorites, full profiles, demo illustrations.
- **Admin overhaul:** full sidebar with consistent width, KPIs, real analytics and functional operations sections.
- **Demo seed:** 15 sample users with graphical avatars and opt-in account generation.
- **Latest public tutor UI:** dedicated /tutors and /tutor/:id pages with a reference-oriented responsive four-column listing, detailed profile, and live public free-slot booking calendar. Last reported GitHub Actions run passed on the relevant UI updates, but always verify current HEAD after additional work.

## 12. Definition of done for future work

Do not report a page or feature as production-ready until:
1. Correct authorized routes, data validation and backend actions exist.
2. All interactive controls work with real data; error, loading and empty states are helpful.
3. Visual structure matches the supplied reference and the AMER TUTOR neo-brutalist brand.
4. Light, Dark and Auto themes retain readable contrast.
5. Desktop and mobile layout tested; fixed sidebars and grids do not overflow.
6. Accessibility and keyboard use checked.
7. GitHub CI for the latest commit passes, and manual browser verification is clearly distinguished.
8. No real money or real customer information is exposed accidentally.
9. `main` and VPS unchanged unless user explicitly authorizes.
