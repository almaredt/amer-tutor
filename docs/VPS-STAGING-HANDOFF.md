# VPS staging handoff — Amer Tutor points branch

This is a handoff checklist, **not a deployment**. The production checkout branch is `main`. Never run the existing `scripts/update.sh` for this branch: that script explicitly resets to `origin/main`.

## Prerequisites
- Passing GitHub Actions tests on `chatgptv1`, including migration tests.
- A separate staging directory, systemd service, port and SQLite database. Never point staging at the production SQLite file.
- Node.js 22, `npm ci`, and a dedicated non-root service user.
- An HTTPS staging subdomain with a reverse proxy to a loopback-only Node port.
- Environment configuration stored outside Git, with OpenAI API key if AI features are required.
- Disable outbound payment processing: demo points have no real-world monetary value.

## Suggested safe staging sequence (manual, after owner approval)
1. Clone `chatgptv1` into a **new** staging directory, not `/opt/amer-tutor`.
2. Install dependencies with `npm ci`; run `npm test` and `node scripts/migration-test.js` before service start.
3. Create a fresh SQLite database for staging; do not copy live student data unless authorized and anonymized.
4. Configure the service to listen on a different loopback port (for example 3101).
5. Configure a separate staging hostname and HTTPS certificate.
6. Start staging service and confirm health, login, four-role permissions, points, refunds, and AI mock mode.
7. Verify database backups and restore, logs, rate limits, and browser/mobile behavior.
8. Obtain explicit owner approval before making the staging URL publicly accessible or promoting any code to `main`.

## Acceptance test
Admin creates teacher and parent → links student → teacher saves profile and availability → admin approves teacher → parent books → teacher confirms → admin grants 200 points → parent transfers 100 points → teacher completes lesson → admin transfers 85 to teacher (retains 15).

Refund alternative: on a separate future confirmed lesson, parent transfers 100 points → requests refund → admin approves → 100 points return to parent and booking is cancelled. Repeated approvals must not create additional points.

## Known pre-VPS issues
- Old variable names `rate_45_aed`, `rate_60_aed`, `amount_aed` are retained in database/API for backwards compatibility; all prices in the points workflow are demo points.
- The `src/payments.js` integration code remains in the repository but is not wired into the running server.
- The legacy admin/teacher money-ledger tables remain in SQLite but cash settlement API routes have been removed.
- Before production release, complete accessibility, privacy, security, AI and multi-user manual acceptance checks.
