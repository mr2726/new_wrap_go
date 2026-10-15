# Delivery, governance and acceptance

## Reconcile Jira with GitHub

WEB and WRAP already have usable product epics; do not replace them with another nine epics. Preserve assignees, statuses and unrelated requirements. Existing overlaps include WEB-38 (RLS), WEB-47 (dates), WEB-20 (background tracking), WEB-53 (reporting), WEB-34 (font/localization). Expand those with evidence rather than create duplicates. Keep new work under existing relevant epics. Existing “Done” is historical Jira status, not a production verification result; file a concrete regression or attach missing evidence instead of automatically reopening everything.

Use actual issue keys in GitHub PR titles for code fixes. Each issue description carries pinned source snapshot, evidence category, acceptance criteria, dependency draft references and responsible role. Final map translates every draft ID to the existing/new Jira issue. Business-owner/engineer identities remain unassigned unless confirmed; no guessed assignees or delivery dates.

## Responsibility matrix (proposed RACI)

Exactly one accountable role per decision; actual people must be assigned during planning. A = accountable, R = responsible, C = consulted, I = informed.

| Outcome | Product/PM | Architect/Backend | Mobile/Web | QA | Finance | Operations | Security/Counsel |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pilot scope and success | A/R | C | C | C | C | C | I |
| Domain/API and tenant isolation | C | A/R | R | R | I | I | C |
| Driver approval and wrap review | A | R | R | R | I | R | C |
| Measurement rules | A | R | R | R | C | C | C |
| Ledger and payout policy | C | R | C | R | A | C | C |
| Installation / dispute handling | C | C | I | C | C | A/R | C |
| Privacy and operating obligations review | A | C | I | I | C | C | R |
| Release engineering and restoration | C | A/R | R | R | I | C | C |
| Pilot business go/no-go | A | C | I | C | C | C | C |

## WBS and acceptance gates

| Gate | Deliverables | Required acceptance | Can proceed independently |
| --- | --- | --- | --- |
| G0 — Baseline | Repo/deployment inventory, policy export, beneficiary/date/earnings decisions | Named owners, exact source/deployment map and approved pilot cap | UX review and local bug fixes |
| G1 — Trust | RLS/private storage, authorized atomic booking/binding, consent, non-destructive review | Cross-tenant negative tests and concurrent-claim tests pass | Card provider sandbox design, operations runbooks |
| G2 — Measure and settle | Raw events, server zone stats, formula, ledger and verified bank adapter | Replay determinism, no duplicate credits, full bank reconciliation | Localization and support preparation |
| G3 — Private pilot | End-to-end capped campaign, supported-device QA, restore drill, support queue | No unresolved P0, signed product/engineering/finance evidence | Future geography research only |
| G4 — Release decision | Pilot performance/cash/dispute review and remediation | Explicit audience/public-release approval; supported operating model | Scale only after measurable proof |

No calendar launch date is committed. Estimates in backlog are low-confidence active person-days excluding external waiting; validate staffing and current implementation before forecasting. Bank responses, installation capacity and qualified review need dependency owners/dates. Forecast a range after actual throughput is observed.

## Service blueprint

| Stage | User action | Backstage / physical action | Failure and recovery | Evidence |
| --- | --- | --- | --- | --- |
| Fund | Advertiser approves campaign and pays | Verify settlement; reserve budget | Pending/late/partial transfer queue | Invoice and ledger references |
| Reserve | Fleet chooses eligible vehicle/contract | Atomic hold and code generation | Capacity conflict or hold expiry | Reservation/assignment IDs |
| Accept | Driver redeems code and agrees terms | Validate ownership and identity | Rejected/replayed code; correction flow | Consent version/time/actor |
| Install | Driver attends provider | Wrap and inspect | Reschedule, defect correction, failed photo review | Appointment and evidence version |
| Deliver | Driver drives eligible routes | Validate events, zone/schedule, periodic evidence | Offline replay, permissions, suspicious activity review | Raw event/rule/aggregate versions |
| Settle | Fleet/driver sees period statement | Close, approve, payout and reconcile | Unknown bank result, dispute/adjustment | Earning line, transfer and settlement IDs |

## Test and quality plan

| Layer | Required scenarios | What this review actually ran |
| --- | --- | --- |
| Function regression | Auth failure, missing cache, stats boundaries | Five mobile loader/password cases; two isolated stats probes |
| Backend integration | Claim races, capacity, RLS, late callback, period replay, ledger reversals | Not run; deployed schema unavailable |
| Device UAT | Background, offline/restart, permissions, low power, camera interruption | Not run |
| Web UAT | Both roles, EN/RU/AM, responsive tables, error/empty states | Static source only |
| Financial/operational | Sandbox settlement, duplicate/unknown transfer, restore, dispute drill | Not run |

Definition of Ready: approved outcome and business rule, owner role/person, dependency links, testable acceptance and evidence classification. Definition of Done: code review, relevant tests, staging evidence, operational visibility, product acceptance; financial closure additionally needs reconciliation. Never label a PR fix as deployed until the deployed commit is verified.

## Pilot dashboard specification

Track funded campaigns, reserved/bound/approved/installed/active vehicles, activation lead time, route completeness, eligible zone hours, suspicious sample rate, review queue age, ledger exceptions, unknown payouts, bank/ledger variance, disputes, support load and contribution/cash exposure. Segment by release, campaign and period without revealing home locations. Thresholds are decided in G0, not invented here.
