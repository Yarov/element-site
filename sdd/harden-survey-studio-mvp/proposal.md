# Proposal: Harden Survey Studio MVP

## Intent

Make Survey Studio safe and operable for a single bootstrap administrator while preserving the current survey lifecycle and enforcing public-response integrity.

## Scope

- Add Auth.js with the Credentials provider only. Authentication permits the configured `ADMIN_EMAIL` and verifies its password against `ADMIN_PASSWORD_HASH`; there is no public registration, user management, or Google OAuth.
- Require a production-grade adaptive password hash (Argon2id preferred; bcrypt only where platform support requires it). Hashes remain environment-only and are never logged, exposed to the client, or stored in application data.
- Issue signed, HttpOnly, Secure-in-production, SameSite session cookies with explicit expiry and server-side expiration enforcement. Sign-in failures reveal no account details.
- Apply one server-side admin authorization guard to every admin page and every `/api/admin/*` route. Browser redirects are convenience only; route handlers must independently reject unauthenticated requests.
- Replace the blank survey creation flow with a valid starter graph: one trigger, one reachable survey containing a response field, and a terminal action. Save responses must retain the lifecycle status returned by the API, so editing a published or paused survey never silently changes it to draft.
- Accept public responses only for published surveys with a valid persisted flow. The response API will derive allowed field IDs and expected value shapes from that flow, reject unknown or malformed answers, enforce required fields, and reject flows with no answerable questions before insertion.
- Remove unauthenticated arbitrary-ID preview access. Preview is limited to authenticated admins or a short-lived, signed token bound to the specific flow and lifecycle state; previews must not make drafts publicly answerable.

## Exclusions

- Public sign-up, Google OAuth, multi-admin provisioning, role management, password reset, MFA, rate limiting infrastructure, and external shareable previews.
- Changes to survey targeting, analytics, delivery, or published-survey editing policy beyond preserving existing status on save.

## Success Criteria

Only the bootstrap administrator can access administration; new surveys are immediately valid; saves preserve lifecycle; invalid, non-published, and malformed responses are rejected server-side; and preview cannot expose drafts to the public.
