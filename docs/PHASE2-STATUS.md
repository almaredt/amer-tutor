# Amer Tutor — Phase 3 implementation and release gates

## Implemented on chatgptv1
- Teacher and parent account management, approval and explicit child/student linking.
- Teacher profile, AED lesson rates, weekly Dubai-time availability and student messaging/materials.
- Parent booking requests (45 or 60 minutes), teacher confirmation, overlap and schedule checks.
- Optional Stripe Checkout integration. A parent can request checkout **only after teacher confirmation**. A signed webhook marks payment paid; redirects never mark it paid.
- On verified payment, an internal teacher payout is created. Default platform commission: 15% (1500 basis points), configurable.
- Teacher can mark a paid lesson complete only after its scheduled end.
- Admin can record a **manual external bank transfer** with a reference, only for completed and paid lessons. No automatic bank transfer is performed.
- OpenAI adapter wired to the existing AI service. `OPENAI_API_KEY` and `OPENAI_MODEL*` configure access. Old provider-related UI copy may remain.

## Configuration
Set `OPENAI_API_KEY`. For payments, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_BASE_URL` to the public HTTPS origin. Register a Stripe webhook pointing to `/webhooks/stripe` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Configure merchant account, currencies, return URLs, local licensing and refund policies before collecting real funds. No live keys are stored in GitHub.

## Known gaps and release blockers
- **Automated CI passed:** GitHub Actions run 40750175915 completed the Node 22 installation, syntax checks and expanded `npm test` regression suite successfully. This is a throwaway database test, **not** a production-data migration or live payment test.
- Verify SQLite role-constraint migration and FK integrity against a **copy** of existing production data, with a tested backup/rollback procedure.
- Refunds, disputes, cancellations after payment, reconciliation of provider fees, audit logs and automated notifications are not finished. **Do not activate live payments until these are handled.**
- Weekly availability is a simple recurring calendar; exceptions/holidays/time-zone edge cases and rescheduling remain.
- Admin UI is an incremental extension, not final role-wide brutalist redesign.
- OpenAI integration must be verified end to end using real sandbox API calls and controlled budgets.
- No changes were made to `main` or the production server.

## Recommended verification
1. `npm ci && npm test` and `node --check` for modified files.
2. Validate all four role permissions, student privacy, CSRF, and forged webhook rejection.
3. Test merchant sandbox: create booking → teacher confirms → parent pays → signed webhook → lesson completes → admin bank transfer reference.
4. Test duplicate webhooks, repeated checkouts, failed payments, time conflicts and parent/teacher cross-account attempts.
5. Approve production deployment only after a backup and rollback drill.
