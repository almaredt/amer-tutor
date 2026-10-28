# Amer Tutor — Pre-VPS acceptance checklist

## Automated checks
The `chatgptv1` GitHub Actions workflow installs dependencies, checks JavaScript syntax, runs smoke tests and exercises a legacy database migration. CI covers:
- Four role authentication and student privacy.
- Teacher profiles, approvals, availability, parent booking, and time conflicts.
- Point grants, payment of a 100-point lesson, teacher settlement of 85 points, admin retention of 15 points.
- Refund requests, authorization, point restoration, and duplicate refund prevention.
- Legacy SQLite schema migration with user sessions and indexes.

## Required manual checks before VPS deployment
1. On a **separate local/staging instance**, sign in as all four roles and verify every page, form, and mobile layout.
2. Check keyboard navigation, focus, screen reader labels, and contrast.
3. Run `npm audit` and triage dependency vulnerabilities; do not blindly apply breaking upgrades.
4. Exercise AI questions, grading, image recognition and cost limits with a real OpenAI test key; the CI uses mocked AI.
5. Verify concurrent bookings, multiple admin users, time zones, refund approval after lesson start, and database backup/restore.
6. Check privacy controls, retention, parental consent and child-safety workflows before inviting real families.
7. Confirm the staging domain, HTTPS, service account, logging and rollback plan.

## Explicit boundaries
- All points are fictional test units with **no cash value**.
- No payment provider, AED conversion or bank transfer is active.
- `main` and the VPS are unchanged.
- The existing production update script tracks `origin/main` and MUST NOT be used to deploy `chatgptv1`.
- Automated CI success is not equivalent to complete manual or production acceptance.
