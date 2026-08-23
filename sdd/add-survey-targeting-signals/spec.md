# Specification: First-Party Survey Targeting Signals

## Requirements

### R1: Anonymous first-party signals
The client SHALL maintain a versioned, browser-local `VisitorSignals` record containing only: visit count, current pathname, stable catalog service ID, stable branch ID, and WhatsApp booking-intent boolean/timestamp. Signal state SHALL be anonymous, first-party, TTL-bound, and clearable locally. Booking intent expires within 24 hours; selections and per-flow suppression state expire within bounded 30/90-day retention windows.

The system SHALL NOT collect, persist, transmit, or use for eligibility: names, account IDs, email addresses, phone numbers, WhatsApp message text, survey answers, full URLs/query strings, IP/device fingerprints, cookies or ad tokens (including `fbp`/`fbc`), analytics IDs, third-party events, cross-device identifiers, or inferred sensitive attributes. Signals SHALL NOT be added to API payloads, database tables, server logs, Meta, GA4, CAPI, or other third-party tracking.

### R2: Typed flow conditions and graphs
Flows SHALL support backwards-compatible legacy visit-count and path conditions plus typed v2 conditions for service selection, branch selection, current WhatsApp booking intent, and per-flow cooldown/suppression. Condition configuration SHALL be discriminated and strictly validated by schema/API validation; invalid operators, values, node configurations, duplicate/ambiguous default edges, cycles, and unreachable nodes SHALL be rejected. Each conditional branch SHALL have an explicit default/else route.

### R3: Eligibility and parity
One pure evaluator SHALL accept a flow, signals, and evaluation time; deterministically traverse validated conditions; and return eligibility plus diagnostic decision reasons. Runtime delivery and Studio preview SHALL use this evaluator. Preview SHALL evaluate only editor-provided simulated signals and time, without reading/writing browser persistence or submitting responses.

### R4: Capture and suppression
Service selection and confirmed branch selection SHALL record their stable IDs before tracking calls, navigation, or other asynchronous work. A WhatsApp booking action SHALL record only the boolean/time intent before its existing external action. Per-flow shown and dismissed state SHALL be persisted immediately; completed state SHALL be persisted only after a successful response submission. An active cooldown or terminal suppression state SHALL prevent display until policy expiry; expiry SHALL restore eligibility if other conditions match. Session deduplication SHALL remain in session storage.

### R5: Failure and compatibility
Unavailable, malformed, expired, or unreadable local storage SHALL fail closed for conditions requiring unavailable signals, use safe empty/default signals otherwise, and never block the page, booking action, or legacy survey delivery. Legacy flow behavior SHALL remain unchanged when no v2 conditions are configured.

## Scenarios

### Anonymous capture
Given a visitor selects catalog service `svc-1`
When the reservation handler runs
Then local signal state records `svc-1` before analytics/tracking and stores no service title or identity data.

### Service, branch, and WhatsApp targeting
Given valid signals include service `svc-1`, branch `br-2`, and unexpired WhatsApp intent
When a flow requires all three typed conditions
Then the evaluator follows their matching branches and returns the configured survey.

Given WhatsApp intent is older than its TTL
When that condition is evaluated
Then it does not match.

### Cooldown and terminal state
Given a flow was dismissed within its cooldown
When it is evaluated
Then it is suppressed with a cooldown diagnostic reason.

Given its cooldown has expired and all other conditions match
When it is evaluated
Then it is eligible again.

Given a response submission fails
When completion handling runs
Then completed state is not persisted.

### Preview/runtime parity
Given a valid flow, identical signals, and identical evaluation time
When preview and runtime evaluate it
Then both produce the same eligibility, branch path, and diagnostics.

### Storage failure and legacy flows
Given browser storage throws or contains invalid data
When a targeted flow is evaluated
Then evaluation uses safe defaults, does not display a survey requiring missing signals, and does not interrupt the page.

Given a legacy visit/path flow with no v2 conditions
When it is evaluated
Then its prior trigger semantics and delivery outcome are preserved.
