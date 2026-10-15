# SRS — Non-functional Requirements & Quality Attributes

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner.

## Status and testability
Proposed engineering acceptance baseline. Existing source evidence is not operational certification. Each target needs a recorded owner, test environment, load/route model and measured result before approval. Related WEB-38, WEB-74…79, WRAP-29…38.

| ID | Attribute | Requirement / verification |
| --- | --- | --- |
| NFR-SEC-01 | Authorization | Anonymous, driver A/B, fleet A/B, advertiser and admin matrix denies every unauthorized row, object and command access; privileged fields cannot be set by ordinary clients |
| NFR-DATA-01 | Integrity | Reservation, redemption and financial mutation are atomic; retrying identical command creates one effect; conflicting concurrent requests preserve capacity/balance invariants |
| NFR-REL-01 | Recovery | Durable telemetry/job IDs survive retry/restart; unknown bank outcomes are reconciled before retry; agreed RPO/RTO verified by isolated restoration |
| NFR-PRIV-01 | Privacy | Private identity/registration/photos; scoped expiring access; advertiser views omit residential start points and unnecessary precise driver data |
| NFR-PERF-01 | Interactive latency | Candidate target: p95 first-party command response ≤2 s under approved pilot load, excluding bank/provider completion; load and network assumptions must be approved before enforcement |
| NFR-OBS-01 | Observability | Correlation/release IDs connect client error, command, job, event and financial exception without logging credentials, codes, raw card details or documents |
| NFR-ACC-01 | Accessibility | Keyboard/focus/error handling on web; readable contrast and labels; screen-reader critical flows; EN/RU/AM and large text/small-screen checks |
| NFR-MOB-01 | Mobile reliability | Supported-device route tests cover background, screen-off, restart, offline, denied/revoked permission and low power; compare reference distance, coverage and battery delta against approved targets |
| NFR-MAINT-01 | Maintainability | Reviewed task branches; reproducible installs/builds; complete schema/policy migrations; contract/version compatibility and documented failure ownership |
| NFR-FIN-01 | Auditability | All monetary postings balance by currency; earning inputs/rules reproduce statements; all bank/ledger differences have assigned exceptions |

## Load and measurement protocol
WEB-59 approves pilot concurrency, active vehicles, event sampling/batch rate, payload/image limits and retention volumes. Capture p50/p95 latency, error rate, upload lag, job age and query/storage cost at expected and burst load. Do not extrapolate to city-wide scale from a small pilot. Lower targets or scope only through a recorded decision with affected users and compensating operation.

## Failure budgets and recovery
Expected handled failures are visible states, not successes: rejected OTP, invalid invite, exhausted slots, evidence rejection, offline queue, expired invoice and failed payout. Candidate production availability and freshness SLOs remain unapproved until monitoring/deployment inventory exists. Escalate any unauthorized disclosure, duplicate payment or lost financial evidence immediately; routine UI defects follow normal priority.

## Evidence package
Attach test case ID, source/deployed commit, schema version, environment, synthetic dataset, device/OS, network condition, expected/actual result, reviewer and date. Unknown controls stay unverified; do not mark NFR met by an unchecked checklist.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

