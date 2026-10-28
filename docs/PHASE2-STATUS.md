# Phase 2 rollout notes

## OpenAI
The tutor now uses the OpenAI-compatible adapter in `src/openai-adapter.js`. Set `OPENAI_API_KEY` in the server environment. The existing `src/ai.js` model environment variable names still begin with `CLAUDE_MODEL` in this interim revision; defaults are OpenAI model IDs. Do not set old Claude model values. Use `AI_MOCK=1` for tests. The original Anthropic dependency is not used by the adapter, but package cleanup is pending.

## Bookings
Parent requests can be submitted from the portal. The rate is captured from the approved teacher profile. Teacher, parent and admin have role-scoped booking listing endpoints. The booking ledger and payout table exist, but teacher acceptance, payments, refunds, commission, payouts, and provider webhook verification are **not implemented**. All new bookings are unpaid and requested. Do not take payment or represent a request as a confirmed class.

## Release gate
This branch is not deployment-ready. Before any production rollout: run `npm ci`, `npm test`, start against a backup copy of the production database, verify role migration and FK integrity, test access control for all four roles, verify OpenAI calls and cost limits, and perform browser/mobile accessibility checks. Do not merge into main or deploy without explicit owner approval.
