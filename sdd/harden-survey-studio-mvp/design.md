# Technical Design: Harden Survey Studio MVP

## Authentication and authorization

Add `next-auth` and configure `auth.ts` at the repository root with the Auth.js Credentials provider only. `authorize` accepts an email and password only when the normalized email exactly matches `ADMIN_EMAIL`; it verifies the password against `ADMIN_PASSWORD_HASH` and returns the fixed `{ id: "bootstrap-admin", email, role: "admin" }` identity. Auth callbacks copy only this role and email into the JWT/session. No database adapter, user table, registration, OAuth provider, password reset, or second administrator is introduced.

Create a server-only password helper. Prefer a recognized encoded Argon2id hash when the optional runtime dependency is present; support bcrypt only when its verifier is installed for platform compatibility. Otherwise require a versioned Node `crypto.scrypt` hash (`scrypt$N$r$p$salt$derivedKey`) and compare derived bytes with `timingSafeEqual`. Invalid/missing environment settings, unsupported hash formats, and verifier errors fail closed without logging credentials or hashes. A generation script/documented command produces the selected hash outside application runtime.

Configure Auth.js with a strong `AUTH_SECRET`, JWT sessions, explicit `maxAge`, and secure cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production). Add `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`, and a minimal credentials form. `lib/auth/admin.ts` exports `requireAdmin()` for Server Components (redirects to `/login?callbackUrl=...`) and `requireAdminApi()` for route handlers (returns a 401 response). Both inspect the Auth.js session and exact admin role. Admin pages call the former; every `/api/admin/**` handler calls the latter before parsing, reading, or mutating data. Middleware may redirect `/admin/:path*` early, but is not an authorization boundary.

## Survey lifecycle and preview

Replace `blankFlow()` with a fixed valid starter: one trigger, a connected survey with one required `text` field, and a connected terminal action. The server retains `validateFlow` as the persistence/publish gate. POST returns the created row; PATCH already returns the updated row. The Studio must replace its local graph, name, and lifecycle from that response. Omitting `status` retains its persisted lifecycle; explicit publish/pause actions send the requested status. Thus an edit cannot silently turn a published or paused flow into draft.

Remove `?surveyPreview=<id>` public lookup. The Studio's preview control opens the landing route only after admin authentication and passes no public flow ID. The active-survey endpoint uses the current Auth.js session to accept an admin-only `preview` identifier, loads only that flow, validates its graph, and marks the result `preview: true`. Response submission rejects all preview-mode requests (the client does not post while previewing); normal delivery continues to return only published, valid flows. This avoids an externally shareable token and prevents drafts from accepting responses.

## Response admission

In `POST /api/surveys/[id]/responses`, validate UUID and body shape, fetch the flow, require `status === "published"`, and run `validateFlow` on stored graph. Find reachable survey nodes and build an allow-list from non-CTA fields. Reject if no answerable field exists, any answer key is unknown, a required value is absent/blank, or the value violates its field: text is a bounded nonempty string when supplied; single choice is one configured option; rating is an integer 1 through 5. CTA fields never require or persist an answer. Insert only the validated, normalized answers; return 400 for malformed input, 404 for unknown flow, and 409 for unpublished/invalid/unanswerable flow.

## Tests and configuration

Add unit tests for scrypt verification/hash-format rejection and the starter flow. Add route tests with mocked Auth.js/DB for anonymous admin page/API rejection, matching/nonmatching credentials, lifecycle preservation, preview visibility only to an admin, and every response-validator rejection plus valid insertion. Expand Vitest includes to cover `app/**/*.test.ts` if route tests live adjacent to handlers. Add `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH` placeholders plus hash-generation guidance to `.env.example`; add the same local-only bootstrap variables to Docker environment/documentation. No Drizzle schema or migration is required.
