# Specification: Harden Survey Studio MVP

## Requirements

### Credentials-only administration
The application SHALL provide credentials-only sign-in and sign-out for administration. A sign-in succeeds only when the submitted email matches normalized `ADMIN_EMAIL` and its password verifies against `ADMIN_PASSWORD_HASH`. The principal is the bootstrap administrator; no registration, OAuth, user management, roles, password reset, or MFA is provided.

`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET` are required environment variables. No defaults are permitted. If any is absent, blank, or invalid (including an unsupported password-hash format), authentication configuration is unavailable and all protected requests fail closed: pages redirect to sign-in and APIs return `401`; no session may be issued. `ADMIN_PASSWORD_HASH` SHALL be an Argon2id hash where supported, or bcrypt only when platform support requires it. These values and submitted credentials SHALL never be logged, returned, bundled for the client, or persisted in application data.

Authentication SHALL create a signed, HttpOnly, SameSite session cookie, Secure in production, with explicit server-enforced expiry. Sign-out SHALL invalidate the session and clear its cookie. Failed sign-in responses SHALL not disclose whether email or password was incorrect.

### Server authorization and preview
Every `/admin/**` page and `/api/admin/**` handler SHALL enforce the same server-side administrator guard before protected data access. Client navigation checks are not authorization. Unauthenticated or expired pages redirect to sign-in; APIs return `401`; non-admin identities return `403` if representable.

Preview SHALL require the authenticated administrator or a short-lived signed preview token bound to the exact flow identifier and lifecycle state. Arbitrary survey IDs and `surveyPreview` query values SHALL not grant preview access. A preview token is invalid when expired, malformed, tampered with, bound to another flow, or when the flow status no longer matches. Preview access SHALL never make a draft or paused survey publicly response-eligible.

### Valid flow and lifecycle preservation
Creating a survey SHALL persist a valid starter flow containing exactly one trigger, one reachable survey with at least one answerable response field, and a reachable terminal action. Saving an existing flow SHALL render and retain the lifecycle status returned by the API; it SHALL not silently change published or paused flows to draft.

### Public response admission
The public response endpoint SHALL accept only a published survey with a valid persisted flow. Before insertion, it SHALL derive answerable field IDs, expected value shapes, and requiredness from that flow; reject unknown field IDs, malformed values, missing required answers, and flows with no answerable questions. It SHALL not trust client-supplied field definitions or status.

## Scenarios

### Authentication
Given valid required environment variables and correct bootstrap credentials, when the administrator signs in, then an expiring signed session is issued and protected administration is available.

Given any required auth variable is missing, blank, or invalid, when a protected page or API is requested, then no session is issued and access fails closed.

Given incorrect credentials or an expired session, when a protected page or API is requested, then it redirects to sign-in or returns `401` without account-detail disclosure.

Given an authenticated administrator, when sign-out completes, then the session is invalidated and subsequent protected API access returns `401`.

### Survey integrity
Given a new survey, when it is created, then its persisted graph passes graph validation and includes trigger, reachable answerable survey, and terminal action.

Given a published or paused survey, when it is saved, then the client retains the API-returned published or paused status.

Given an unauthenticated request or an arbitrary preview ID, when preview is requested, then no protected preview is returned. Given a valid admin session or matching unexpired preview token, when preview is requested, then only that flow is rendered without enabling draft or paused public responses.

Given a public submission, when its survey is unpublished, invalid, has no answerable fields, contains unknown or malformed answers, or omits a required answer, then the endpoint rejects it and stores no response. Given a published valid flow and matching valid answers, when submitted, then exactly that response is stored.
