# Risk, FMEA, threat model and decision log

## FMEA — prioritization judgments

S/O/D are ordinal 1–5: severity, occurrence plausibility from design, difficulty detecting before harm. RPN = S×O×D is a rough ordering aid, not statistical risk probability. Scores are review judgments, to recalibrate with incidents/tests. Critical privacy/money issues remain blockers regardless of rank.

| Failure mode | Effect | S | O | D | RPN | Control / test | Role |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Raw card/CVV persisted | Sensitive payment data exposure | 5 | 4 | 4 | 80 | Tokenization; review data without export; restrict existing path | Security/Finance |
| Parallel withdrawal | Balance mismatch or duplicate payout | 5 | 4 | 4 | 80 | Atomic ledger command, idempotency and race test | Backend |
| False eligible activity | Incorrect earnings/delivery | 5 | 4 | 4 | 80 | Server quality/zone validation and replay | Data |
| Fleet asset deleted with driver | Lost fleet/contract history | 5 | 3 | 4 | 60 | Detach + audit + deletion fault-injection | Backend |
| Email step-up bypass | Unverified identity change | 5 | 3 | 4 | 60 | Server-confirmed challenge/new-email verification | Security |
| Partial assignment | Driver/vehicle disagree about contract | 4 | 4 | 3 | 48 | Transactional redemption and conflict tests | Backend |
| Lost offline events | Underreported delivery/earnings | 4 | 4 | 3 | 48 | Event-ID acknowledgments and concurrent queue test | Mobile |
| Week history overwritten | Incorrect reports/period settlement | 4 | 4 | 3 | 48 | Period ledger and rollover/late-event tests | Data |
| Password error swallowed | False success and support burden | 3 | 4 | 2 | 24 | Error propagation regression; native recovery UAT | Mobile |

## STRIDE across trust boundaries

| Category | Boundary / abuse case | Required control | Evidence gap |
| --- | --- | --- | --- |
| Spoofing | Client supplies another driver email / forged coordinates | Auth-derived identity, assignment checks, quality signals | Live RLS and server telemetry rules |
| Tampering | Client writes balance, contract approval or aggregate totals | Reject privileged fields; server commands; immutable ledger/events | Actual grants and functions |
| Repudiation | Fleet action appears as driver signature | Separate actor/terms/time and signed audit event | Distinct driver acceptance proof |
| Information disclosure | Public document URL, broad location view, raw card records | Private evidence, scoped views, tokenization, coarse advertiser locations | Bucket public state and historical raw data presence |
| Denial of service | Unlimited invite emails, bulk upload, unbounded queued jobs | Per-account/resource quotas, payload bounds, backoff | Gateway and service limits |
| Elevation of privilege | Direct update-email invocation bypasses UI step-up | Server challenge validation and protected operation policy | Deployed function configuration |

## Decision register

| ID | Decision | Current evidence | Decision owner | Before |
| --- | --- | --- | --- | --- |
| D01 | Authoritative mobile repository and deployed versions | Two mobile repos; newest reviewed source is new_wrapgo_app | Architect | Next release |
| D02 | Payout beneficiary and schedule | Weekly direct-driver Jira scope vs fleet-managed mobile notice vs withdrawal web | Product + Finance | Ledger/payment build |
| D03 | Booking and effective dates | WEB-47: booking+7 days; approved early-wrap override; immutable live dates | Product + Backend | Cross-surface integration |
| D04 | Six-digit code TTL, reservation expiry and rebind rules | Requirement says numeric; web generates alphanumeric | Product + Security | Redemption build |
| D05 | Eligible zone hours and time cutoff | Current stats count moving time without polygon | Product + Data | Earnings formula |
| D06 | Bank pending transfer vs two-day expiry | Transfer expectation is 24–48 h | Finance + Bank | Funding release |
| D07 | Retention, operating contracts and data consent | Existing Jira terms/privacy text is not verified legal evidence | Counsel + Product | Real-data/money pilot |
| D08 | Pilot caps, tracking targets, RPO/RTO and support hours | Not approved in inspected materials | Product + Operations | Pilot sign-off |

Proposed architecture decision: retain a modular server authority around Supabase, with transactional commands, immutable telemetry/ledger and background jobs; validate live schema first. Alternatives: client writes (current integrity risk), distributed services (higher operating complexity before scale evidence). Status: proposed, not approved/deployed.
