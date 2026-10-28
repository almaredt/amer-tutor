# Amer Tutor — Demo points mode

## Purpose
Until all tutoring workflows are validated, use **non-redeemable demo points**, not AED or live payments. The teacher chooses a whole-number rate for 45-minute and 60-minute lessons (the existing database column names still end in `_aed` for compatibility, but their **meaning in this branch is points**).

## Flow
1. Admin grants demo points to a parent account.
2. Parent requests a class; teacher confirms.
3. Parent transfers the full point price to the primary admin account.
4. Teacher completes the lesson after its scheduled end.
5. Admin transfers **85%** of the lesson points to the teacher; the admin retains the remaining **15%**. Rounding is down for teacher points.
6. All wallet movements are recorded; each booking can only be paid and settled once.

## APIs
- `GET /api/points/me`: current user's wallet and history.
- `POST /api/admin/points/grant`: admin grants a parent demo points.
- `POST /api/parent/bookings/:id/points`: parent pays confirmed lesson using demo points.
- `POST /api/admin/bookings/:id/settle-points`: admin settles completed lesson.
- Stripe Checkout and webhook endpoints are disabled on this branch.

## Limitations
- This is **not a real-money system**. Do not represent points as cash, enable cash-out, or promise automatic AED conversion.
- Admin can create demo points; no monetary deposit occurs.
- Points are held in the admin wallet until settlement; cancelled paid bookings and disputes still need explicit reversal/refund rules.
- The original AED-named columns remain for backwards compatibility and should be renamed through a deliberate migration before any real-currency release.
- The primary active admin is used as the recipient; future multi-admin deployments need an explicit platform treasury wallet.
- All changes remain on `chatgptv1`; no production deployment is implied.
