# API & Event Contracts — Proposed Command Boundary

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner.

## Contract status
Design contract for refinement in WEB-60; routes below are proposed logical operations, not claims of deployed HTTP endpoints. Current clients call Supabase directly. Keep executable OpenAPI/schema definitions in GitHub when implementation begins; review version compatibility before rollout.

## Common command envelope
Authenticated user session; server derives actor and authorized organization. Mutations include idempotency key, expected entity revision when relevant and correlation ID. Persist command request/result identity so retries return the original result. Reject attempts to supply another user's actor or override money/approval state. A logical error body contains code, safe message, retryable, correlation_id and optional field_errors; never expose internal credentials/query details.

| Logical operation | Inputs | Authorized actor | Atomic result / errors |
| --- | --- | --- | --- |
| ReserveContract | campaign/contract version, vehicle_id | Fleet membership | Capacity hold + reservation; ineligible, full, stale_revision |
| IssueActivationCode | reservation_id | Owning fleet | Bounded single-use invitation, delivery job; expired_hold, forbidden |
| RedeemActivationCode | code, device/session context | Authenticated driver | Stable assignment and consumed code; invalid_or_expired, conflict, rate_limited |
| AcceptContract | assignment_id, terms_version/hash | Assigned driver | Append-only consent; stale_terms, wrong_actor |
| SubmitEvidence | assignment_id, authorized object references/checksums | Assigned driver | New evidence review version; invalid_file, ownership_mismatch |
| ReviewEvidence | evidence_version, decision, reason | Authorized reviewer | Decision/event and guarded activation if all prerequisites hold |
| IngestLocationBatch | batch_id, event IDs, observed times, coordinates/accuracy/source | Assigned driver | Per-event accepted/duplicate/quarantined/rejected acknowledgment |
| CloseEarningsPeriod | period, calculation version | Restricted job/operator | Versioned earning lines and balanced postings; inputs_not_final |
| RequestOrSchedulePayout | beneficiary, eligible earning IDs | Finance/job per approved model | Atomic reservation/transfer submission; insufficient_available, method_unverified |
| ProcessBankEvent | provider event/ref and authenticated payload | Bank adapter | Deduplicated state transition + postings; invalid_signature, unknown_reference |
| DeleteDriverAccount | authenticated identity, reauthentication proof | Account owner | Audited resumable job; retained-record disclosure and safe detachment |

## Telemetry example (synthetic)
```json
{"batch_id":"synthetic-batch-1","events":[{"event_id":"synthetic-event-1","observed_at":"2026-10-15T10:00:00Z","latitude":40.18,"longitude":44.51,"accuracy_m":10,"mocked":false}]}
```
The server binds assignment/driver identity; it does not trust client-supplied totals or eligibility. Response acknowledges specific IDs and reasons. Queue deletes only acknowledged IDs. Decide identifier formats and payload bounds in executable schema; examples are not production values.

## Events and asynchronous work
Event names proposed: ReservationCreated/Expired, InvitationConsumed, DriverAccepted, EvidenceSubmitted/Reviewed, AssignmentActivated/Paused, TelemetryAccepted/Quarantined, PeriodClosed, EarningsAdjusted, PayoutSubmitted/Settled/Failed/Unknown and AccountDeletionCompleted. Event envelope: unique event_id, schema_version, actor, tenant, aggregate ID/revision, occurred_at, correlation_id and safe payload. Outbox event and state mutation commit together. Consumers deduplicate and report retry/dead-letter state; no exactly-once network delivery claim.

## Verification
Contract tests cover invalid identity, stale revision, duplicate key with same/different payload, concurrency, expired invitation, malformed events, partial batch retry, bank timeout/callback ordering and backward compatibility. Authentication and bank proof formats depend on confirmed provider specs; do not invent signature algorithms or production secrets.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

