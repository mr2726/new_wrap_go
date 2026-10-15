# WrapGo — Senior Architecture and IT Project Management Review

Date: 15 October 2026 · Version 1.0 · Assessment and proposed delivery baseline

## Executive assessment

WrapGo has a clear marketplace proposition and an implemented mobile foundation. The reviewed mobile source includes authentication, verification-related data updates, contract lookup, photo capture, background location synchronization and Supabase integration. The fleet web direction is coherent and simple. Production readiness is **not established**: authoritative assignment, performance, financial and operational controls need evidence and several inspected code paths require correction.

Recommendation: move toward a capped, privately operated pilot after the P0 gates below. Do not commit a public launch date or mark backend capabilities complete based on mockups. Keep the fleet prototype private until explicit approval to change its audience.

This is a broad product/architecture/PM review with a focused static mobile-code audit and isolated calculation probes. It is not a full penetration test, deployed database audit, device QA, bank certification or review of unlocated web/backend repositories. Proposed work must be reconciled with existing implementation and Jira issues before creation. This historical baseline predates Jira synchronization. See jira-map.md for the current issue mapping and evidence.md for the later web-code findings.

## Evidence and confidence

| Evidence | What was examined | Limits |
| --- | --- | --- |
| Current conversation and prior WrapGo requirements | Advertiser, driver, fleet workflows; weekly payouts; 6-digit activation; photo check; driver final approval; IDBank direction; EN/RU/AM; visual constraints | Requirements, not implementation proof |
| WrapGo fleet contract loadboard.png, 23 Sep 2026 | Current extracted image content, including reservation and activation explanation | Design concept and sample content |
| WrapGo billing and payouts dashboard.png, 23 Sep 2026 | Current extracted content: withdrawal request UX, grouped payout history | Explicit concept/sample data |
| WrapGo profile and security workspace.png, 23 Sep 2026 | Current extracted content: MFA, password, sessions | Design preview, not functioning security evidence |
| mr2726/new_wrapgo_app | main snapshot `802469d74cb2221ecb82d9bcc752c4d5962cf1ba`; full file tree and selected critical files | No installed app or production-state verification; not every file read |
| mr2726/wrapgo_app | File tree at `b0513f36ad6b68ff14fc404fb5ef6c5b552cbb83` | Repository role/retirement status unconfirmed |
| Isolated Node probes | Exact retrieved weeklyStats.js executed for rollover and movement counting | Pure calculation only; no production writes or database calls |

Source repository: https://github.com/mr2726/new_wrapgo_app/tree/802469d74cb2221ecb82d9bcc752c4d5962cf1ba

Read source files: AGENTS.md, README.md, BUGS.md, package.json, service.js, supabase.js, location/weeklyStats.js, location/sync.js, Contracts.js, Payment.js, Content.js, ContractItem.jsx, OTPScreen.js, both tracked SQL scripts and delete_account/index.ts. README contains stale-looking flow descriptions; conclusions use source behavior where available. No repository files were changed.

## Product scope and ownership

| Surface | Required outcome | Evidence status |
| --- | --- | --- |
| Advertiser web | Create/fund campaign, approve creative, see delivery, invoices and remaining budget | Requirements known; source not located in this review |
| Driver mobile | Account, code redemption, verification, contract approval, install visit, photo rechecks, tracking and earnings clarity | Mobile implementation partially inspected |
| Fleet web | Dashboard, contract loadboard/My Contracts, billing; vehicle/driver operations via simple top navigation | Mockup requirements inspected; deployed behavior unknown |
| Operations/admin | Evidence review, campaign approval, disputes, assignments, bank reconciliation and support | Required operating capability; implementation unknown |
| Public pages | Audience-specific conversion and EN/RU/AM content | Requirements known; live pages not inspected |
| Physical operations | Wrap design/production, appointments, installation proof, maintenance and removal | Must be included in delivery planning; implementation unknown |

Fleet UI constraints remain: Dashboard/Contracts/Billing top navbar, no sidebar, no separate Drivers page; All Drivers widget; Total Vehicles/Drivers/Earnings/KM KPIs; Vehicle/Contract/Current Driver/Status/Weekly KM/Zone Hours/Action table; #39FF14 sole accent, dark premium styling and agreed Lufga typography. Do not reintroduce daily budget, spend or Active Zones KPIs. Showing zone hours in performance remains required.

## Findings requiring action

“Confirmed code behavior” means observed in source, not exploit reproduced in production. P0 means blocks a real-money pilot until fixed or disproven by evidence, not that a production incident has occurred.

| Finding | Classification | Impact | Jira draft |
| --- | --- | --- | --- |
| Fleet-code binding performs separate driver and vehicle writes | Confirmed code behavior | Partial assignment and concurrent-claim risk | R11 |
| Photo submission updates several records and resets counters | Confirmed code behavior | Partial state and loss of historical performance | R14 |
| Mobile calculates and writes performance totals | Confirmed code behavior | Billing-grade integrity and replayability not established | R22 |
| Location store is latest-per-email, with destructive history deduplication SQL | Confirmed design in source | Route evidence cannot be reconstructed from that table alone | R22, R42 |
| Ordinary movement feeds zonehourse without campaign polygon check in inspected path | Confirmed calculation path | Outside-zone activity may be credited as zone time | R24 |
| Week shift overwrites completed-week history; latest event week receives whole batch | Confirmed source and isolated probe | Incorrect weekly reporting/settlement inputs | R25 |
| Snapshot queue rewrite can overwrite concurrently enqueued points | Static concurrency risk | Lost route evidence | R23 |
| Password update failure is logged but resolves | Confirmed code behavior | UI can falsely report successful reset | R18 |
| Missing-cache Contracts branch calls undefined setUserData | Confirmed static defect | ReferenceError caught as misleading contracts error | R17 |
| Delete-account function deletes matching vehicle rows | Confirmed code behavior | Potential deletion of fleet-owned assets | R08 |
| Delete-account storage namespace accepts request fields and lists only first 1000 items per folder | Confirmed code behavior | Overbroad configuration and incomplete cleanup risk; no cross-user exploit claimed | R08 |
| Document helper generates public URLs | Confirmed design; exposure unverified | Private-document access model needs proof | R07 |
| Telegram client function takes bot credentials | Confirmed client pattern; deployed tokens unverified | Credential exposure risk if live service rows supply tokens | R09 |
| Location SQL has no RLS declaration | Repository evidence gap | Live access-control posture unknown | R06 |
| package.json lacks test/lint/build scripts; tree has no CI workflow | Repository evidence gap | Repeatable release assurance unproven; external CI may exist | R43 |
| Weekly payouts vs withdrawal UX vs fleet-managed driver payments | Requirements conflict | Beneficiary, liability, finance and UI ambiguity | R02 |
| 2-day campaign invoice expiry overlaps 24–48h transfer expectation | Requirements edge case | Late settlement and accidental campaign cancellation | R29 |

Probe details: prior week 10 km / 1 h, with a Sunday 23:59 UTC → Monday 00:01 UTC segment, returned current 1.7036 km / 0.0333 h with previous values absent from history. A normal one-minute segment returned 0.0167 h with no polygon input. service.js adds this batchHours value to zonehourse. These probes establish calculation behavior, not payout impact in a deployed environment.

## Recommended architecture — proposal, not current-state claim

Keep a modular backend around the existing Expo/React Native and Supabase foundation unless discovery finds a strong reason to migrate. Avoid an early distributed-microservice rewrite. Separate identity, campaign, assignment, evidence, telemetry, finance and operations modules through explicit commands and ownership.

- Clients may read authorized views and submit commands. Database policies protect each tenant. Client-side filters do not authorize access.
- A server transaction owns reservation, code redemption, reassignment and lifecycle transitions. Use stable UUID relationships; codes are temporary credentials, never vehicle IDs.
- Private object storage holds identity, registration and wrap evidence with versioned review metadata. Access derives from server-authorized relationships.
- Telemetry ingestion accepts immutable uniquely identified observations, validates identity and quality, and retains enough raw evidence to replay calculations. Latest-location views are separate from history.
- Versioned server calculations produce campaign-zone and period aggregates. Timezone and late-data rules are explicit. Mobile charts are projections, not authoritative billing records.
- An immutable balanced ledger owns monetary truth. Payment adapters authenticate callbacks, deduplicate events and reconcile bank settlement. Background jobs retry safely through an outbox/job table with unique business keys.
- Operations/admin exposes review and reconciliation queues with least-privilege roles. Audit events, monitoring, restore capability and incident ownership are part of the pilot.

### Domain boundaries and invariants

| Domain | Primary records | Invariant |
| --- | --- | --- |
| Identity | User, organization, membership, role | User-supplied email never grants access to another identity |
| Supply | Vehicle, driver, assignment history | Only approved concurrent assignments; old access ends on reassignment |
| Delivery | Campaign, contract version, reservation, acceptance | Capacity is never oversold; no activation before required approvals/funding |
| Evidence | File object, evidence version, review decision | Submission does not equal acceptance; reviewers are attributable |
| Measurement | Location event, quality decision, zone version, period aggregate | Same input and rule version produce same result; retry adds no activity |
| Finance | Ledger account/entry, earning line, invoice, payout transfer | All postings balance; payout cannot consume an earning twice |
| Operations | Appointment, dispute, audit event, job | Every exception has an owner and recoverable status |

Recommended contract progression: available → reserved → awaiting_driver → verification_pending → awaiting_approval → installation_pending → evidence_review → active → completed. Expired, rejected, cancelled and paused are explicit branches; their allowed origins and financial consequences must be approved in R04. Verification and driver acceptance may be separate parallel prerequisites rather than a forced linear order. Avoid a single overloaded status field for all of these.

Invoice progression: draft → issued → pending_confirmation → paid OR expired/cancelled; reversal is an additional financial event. Whether pending_confirmation extends the two-day deadline is an open decision. Payout progression: calculated → approved → submitted → processing → settled/failed/unknown; unknown requires reconciliation before retry.

## Open decisions and risk register

| Risk / decision | Likelihood / impact (assessment) | Owner role | Required mitigation |
| --- | --- | --- | --- |
| Authoritative repository and deployment unknown | High / High | Architect | R01 deployment-to-commit inventory |
| Real beneficiary: fleet owner vs driver | High / Critical | Product + Finance | R02 written funds-flow decision |
| Driver acceptance and evidence review conflated | High / High | Product + Backend | R04/R13 distinct events and timestamps |
| Client-writable activity affects financial inputs | High / Critical | Backend + Data | R22/R26 server authority and fraud checks |
| Bank commercial/API capabilities unconfirmed | Medium / High | Bank partnership owner | R30 sandbox, settlement and failure contract |
| Physical wrap supply/appointments delay activation | Medium / High | Operations | R15 provider capacity and evidence workflow |
| Legal/privacy and bank obligations unvalidated | Unknown / High | Counsel + Bank | R47 qualified review; no compliance claim yet |
| All surfaces expanded before pilot proof | High / High | PM | R03 scope cap and stage gates |
| Missing full DB migrations and restore evidence | High / High | Backend + DevOps | R42/R44 reproducibility and restore drill |

Additional decisions: code TTL and reservation hold; whether installation precedes driver approval; campaign/contract start-date source; week cutoff and timezone; outside-zone or stationary eligibility; earnings formula/caps/deductions; driver score behavior and appeal; invoice/refund accounting; unbinding/cancellation; telemetry/document retention. Proposed defaults require decision records, not silent implementation.

## Jira configuration and working rules

Suggested hierarchy: nine Epics below → Stories/Bugs/Tasks → optional implementation subtasks. Draft E/R IDs in this file are reference IDs, **not real Jira keys**. Before writing: identify the actual WrapGo project, inspect issue types/fields/permissions, search existing issues and map duplicates. Do not create a parallel board or change a shared workflow without checking current configuration.

Suggested components: Architecture, Mobile, Fleet Web, Advertiser Web, Backend, Finance, Operations, Security, QA/DevOps. Suggested versions: Discovery baseline, Controlled pilot, Launch candidate. P0 maps to the project's highest/blocker priority; P1 to high; retain native names after inspecting metadata. All tasks start as Proposed/Backlog unless implementation evidence supports another state. Assignees remain unassigned until actual team members are resolved; role below is accountability guidance, not an assigned person.

Workflow proposal: Backlog → Ready → In Progress → Review → QA/UAT → Done. Blocked is a flag with blocker link and owner. Definition of Ready: approved outcome, acceptance criteria, dependencies, role owner, evidence category and size. Definition of Done: reviewed implementation, necessary automated/regression checks, permission-negative tests for sensitive flows, staging evidence, relevant monitoring/documentation and product acceptance. A mockup, merged PR or deployment alone does not close end-to-end financial stories.

Cadence: weekly backlog/risk review and stakeholder demo; short daily blocker check during build; finance reconciliation every operating day and before each payout; gate reviews at milestone completion. Track cycle time and age of blocked work; do not use number of closed tickets as the primary success metric.

## Sequencing, capacity and release gates

Effort ranges below are rough active person-days per item, low confidence, excluding partner, counsel, procurement and app-store waiting. They are not commitments and should not be added into a calendar date. Validate after R01 and a short refinement workshop. Team assumption for planning discussions: one accountable PM/product lead, one backend/architect lead, mobile and web engineers, QA, and part-time design/DevOps plus finance/operations. Actual capacity is unknown.

| Milestone | Exit evidence | Planning guidance |
| --- | --- | --- |
| M0 — Baseline and decisions | R01–R04; critical access-control triage; ownership, scope, funds flow and lifecycle approved | First planning increment; do not wait to triage data exposure |
| M1 — Trusted activation | Tenant isolation, private evidence, atomic booking/binding, driver acceptance and non-destructive review demonstrated | Backend rules before client integration completion |
| M2 — Trusted measurement and money | Replayable telemetry, approved earnings, ledger and bank sandbox reconciliation pass | Critical path likely runs through bank integration and verified measurement |
| M3 — Controlled pilot | Complete private journey, actual supported-device evidence, operating queues, restore drill and reconciled capped payouts | Real-money use only after mandatory P0 gates pass |
| M4 — Launch candidate | Pilot metrics met, incidents resolved, business/engineering/finance approval and explicit public-access decision | Public launch date follows evidence, not UI completion |

Critical dependency chains: R04/R06 → R11/R12 → R13/R14 → pilot; R22 → R24/R26 → R33/R34 → R35 → pilot; R02/R29/R32 → R30 → R35 → pilot. Bank, counsel and installation capacity are external dependencies and need named owners and expected response dates in Jira.

Proposed pilot gates: no unresolved P0; all access-isolation tests pass; all pilot financial entries and bank settlements reconcile; duplicate/retry cases cause zero duplicate credits/payouts; all activated drivers have auditable acceptance and approved evidence; agreed device route-completeness/battery targets met; restore RPO/RTO measured; every pilot exception has an operational owner. Numeric tracking/latency/scale targets must be agreed in R03/R27 rather than invented here.

## Epic register

### E01 — Product governance and architecture

Goal: Agree the operating model, source of truth, lifecycle and measurable pilot scope.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Task | P0 | Establish canonical repositories and environment inventory | PM / Architect | 2–4 | — |
| R02 | Task | P0 | Resolve payout beneficiary and schedule | Product / Finance | 2–3 | — |
| R03 | Task | P0 | Approve pilot scope and success criteria | PM / Product | 2–3 | R01, R02 |
| R04 | Task | P0 | Publish domain model and state-transition matrix | Architect / Backend | 3–5 | R01, R02 |
| R05 | Task | P1 | Configure Jira delivery governance | PM | 1–2 | R03, R04 |

### E02 — Identity, access and private documents

Goal: Prove tenant isolation, restrict privileged operations and protect driver evidence.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R06 | Task | P0 | Audit live RLS, grants and storage policies | Backend / Security | 3–6 | R01, R04 |
| R07 | Task | P0 | Replace public document URL design with private evidence access | Backend / Security | 3–5 | R06 |
| R08 | Bug | P0 | Protect fleet assets during driver account deletion | Backend | 3–5 | R04, R06 |
| R09 | Task | P0 | Move Telegram delivery and credentials to backend | Backend / Security | 2–4 | R06 |
| R10 | Task | P1 | Harden sessions, privileged access and local data | Security / Mobile | 3–5 | R06 |

### E03 — Fleet, contracts and activation

Goal: Bind a vehicle, driver and contract atomically and activate only with all required approvals.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R11 | Task | P0 | Implement atomic invitation redemption and assignment | Backend | 4–7 | R04, R06 |
| R12 | Story | P0 | Reserve contract capacity without overselling | Backend / Web | 4–7 | R04, R06 |
| R13 | Story | P0 | Record driver approval and guarded activation | Backend / Mobile | 4–6 | R11, R12 |
| R14 | Bug | P0 | Make photo review submission atomic and non-destructive | Backend / Mobile | 3–5 | R13 |
| R15 | Story | P1 | Deliver wrap installation and recheck workflow | Operations / Backend | 3–5 | R13 |
| R16 | Story | P1 | Support controlled vehicle and driver reassignment | Backend / Web | 3–5 | R11, R13 |

### E04 — Mobile reliability and verification

Goal: Deliver resumable verified onboarding and accurate mobile states.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R17 | Bug | P1 | Fix Contracts missing-cache branch | Mobile | 0.5–1 | — |
| R18 | Bug | P1 | Propagate password-reset failures | Mobile | 1–2 | — |
| R19 | Bug | P1 | Use actual contract dates and resume evidence state | Mobile / Backend | 1–3 | R04 |
| R20 | Story | P1 | Make verification resumable with actionable review feedback | Mobile / Backend | 4–7 | R07, R11 |
| R21 | Task | P1 | Reproduce and fix documented iOS navigation and layout issues | Mobile / QA | 2–4 | R01 |

### E05 — Location, performance and fraud controls

Goal: Produce replayable, server-validated campaign activity and trustworthy zone metrics.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R22 | Task | P0 | Store immutable telemetry and compute authoritative aggregates | Backend / Data | 5–8 | R04, R06 |
| R23 | Bug | P0 | Prevent lost queued locations and replay inconsistencies | Mobile / Backend | 3–5 | R22 |
| R24 | Bug | P0 | Calculate zone hours using campaign boundaries | Backend / Data | 3–5 | R22 |
| R25 | Bug | P1 | Fix week rollover and timestamp attribution | Backend / Data | 2–4 | R22 |
| R26 | Task | P0 | Validate telemetry quality before earnings | Data / Security | 3–6 | R22, R24 |
| R27 | Task | P1 | Validate tracking on physical iOS and Android devices | Mobile / QA | 4–6 | R22, R23 |

### E06 — Advertiser funding and campaign operations

Goal: Fund campaigns, manage invoice expiry and prevent unfunded delivery.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R28 | Story | P0 | Implement advertiser campaign lifecycle and funding rules | Product / Backend / Web | 4–7 | R04 |
| R29 | Task | P0 | Resolve 2-day invoice expiry against bank transfer latency | Finance / Backend | 2–4 | R02, R28 |
| R30 | Story | P0 | Integrate verified funding and bank reconciliation | Backend / Bank partner | 5–10 | R29, R32 |
| R31 | Story | P1 | Expose defensible advertiser performance reporting | Web / Data | 3–5 | R24, R28 |

### E07 — Ledger, earnings and payouts

Goal: Reconcile every unit of money to campaign, vehicle, driver and beneficiary.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R32 | Task | P0 | Implement balanced immutable money ledger | Backend / Finance | 5–8 | R02, R04 |
| R33 | Task | P0 | Approve earnings formula and exceptions | Product / Finance / Data | 3–5 | R03, R24 |
| R34 | Story | P0 | Close performance periods and accrue earnings | Backend / Finance | 4–7 | R26, R32, R33 |
| R35 | Story | P0 | Execute weekly payouts with safe retry and reconciliation | Backend / Bank partner | 5–8 | R30, R34 |
| R36 | Story | P1 | Produce invoice and payout detail with driver mapping | Backend / Web / Finance | 3–5 | R35 |
| R37 | Story | P0 | Implement disputes, reversals and reconciliation exception queue | Operations / Finance | 3–5 | R32, R34 |

### E08 — Fleet web, localization and experience

Goal: Implement the agreed simple fleet workspace with trustworthy data.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R38 | Story | P1 | Build agreed fleet dashboard against real data | Web / Design | 4–7 | R04, R11 |
| R39 | Story | P1 | Deliver contract loadboard and My Contracts | Web / Design | 3–5 | R12, R13 |
| R40 | Story | P1 | Deliver billing and account-security workspace | Web / Design | 3–5 | R02, R36 |
| R41 | Task | P1 | Complete EN/RU/AM localization and accessibility | Web / Mobile / Design | 3–5 | R38 |

### E09 — Operations, security and release readiness

Goal: Make releases repeatable, incidents recoverable and the pilot auditable.

| Draft | Type | Priority | Summary | Role | Person-days | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| R42 | Task | P0 | Version complete database schema and migration workflow | DevOps / Backend | 3–6 | R01 |
| R43 | Task | P1 | Create automated CI and critical regression coverage | Engineering / QA | 3–5 | R01 |
| R44 | Task | P0 | Prove backups, restoration and sensitive-data retention | DevOps / Security | 3–5 | R42 |
| R45 | Task | P1 | Deploy operational approval, support and audit tools | Backend / Operations | 3–5 | R04 |
| R46 | Task | P1 | Instrument reliability and production response | DevOps / Operations | 2–4 | R22, R32 |
| R47 | Task | P0 | Validate Armenia operating and data obligations | PM / Counsel / Bank | 2–4 | R02, R03 |
| R48 | Task | P0 | Run controlled end-to-end pilot and release gate | QA / PM / Operations | 5–8 | R07, R08, R09, R13, R14, R23, R24, R25, R26, R27, R29, R30, R35, R37, R41, R43, R44, R45, R46, R47 |

## Jira issue descriptions and acceptance criteria

Copy each entry into its mapped existing or new issue. Dependencies mean “blocked by” unless refinement identifies a different relation. Investigation may close a proposed item as already implemented only with attached evidence.

### R01 — Establish canonical repositories and environment inventory

**Epic:** E01 · **Type:** Task · **Priority:** P0 · **Owner role:** PM / Architect · **Estimate:** 2–4 person-days

**Blocked by:** None identified

**Problem/outcome:** Two mobile repositories exist; ownership and deployed version are unconfirmed. Locate advertiser, fleet, admin and backend sources.

**Evidence:** GitHub repository discovery: mr2726/wrapgo_app and mr2726/new_wrapgo_app

**Acceptance criteria:**

- Record repo, branch, commit, owner and runtime for each surface
- Map environments and database projects without copying credentials
- Match installed app and deployed web builds to commits

### R02 — Resolve payout beneficiary and schedule

**Epic:** E01 · **Type:** Task · **Priority:** P0 · **Owner role:** Product / Finance · **Estimate:** 2–3 person-days

**Blocked by:** None identified

**Problem/outcome:** Weekly payout requirement conflicts with withdrawal mockup; mobile Payment says earnings are managed by fleet owner.

**Evidence:** Billing mockup; src/Pages/Content/Payment.js

**Acceptance criteria:**

- Approve who receives funds and who owes driver compensation
- Define weekly day, cutoff, fees, failures and holidays
- Choose scheduled payouts or explicit withdrawal request model and align all surfaces

### R03 — Approve pilot scope and success criteria

**Epic:** E01 · **Type:** Task · **Priority:** P0 · **Owner role:** PM / Product · **Estimate:** 2–3 person-days

**Blocked by:** R01, R02

**Problem/outcome:** Avoid implementing all platform surfaces without a measurable end-to-end pilot.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Set advertiser/fleet/vehicle caps and campaign duration
- Define activation, tracking completeness, reconciliation and support success measures
- Name business owner and explicit exclusions

### R04 — Publish domain model and state-transition matrix

**Epic:** E01 · **Type:** Task · **Priority:** P0 · **Owner role:** Architect / Backend · **Estimate:** 3–5 person-days

**Blocked by:** R01, R02

**Problem/outcome:** Status labels, invitation codes and stable entity IDs must have separate meanings.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Define IDs and relationships for tenant, vehicle, driver, campaign, reservation, assignment and contract
- Define transition actor, preconditions, timestamps, failure and compensation
- Specify versioned API commands and concurrency rules

### R05 — Configure Jira delivery governance

**Epic:** E01 · **Type:** Task · **Priority:** P1 · **Owner role:** PM · **Estimate:** 1–2 person-days

**Blocked by:** R03, R04

**Problem/outcome:** Track outcomes and evidence instead of treating UI completion as feature completion.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Map draft IDs to real issues after duplicate search
- Set components, versions, workflow, owners and dependency links
- Publish weekly risk, dependency, throughput and gate dashboard

### R06 — Audit live RLS, grants and storage policies

**Epic:** E02 · **Type:** Task · **Priority:** P0 · **Owner role:** Backend / Security · **Estimate:** 3–6 person-days

**Blocked by:** R01, R04

**Problem/outcome:** Location SQL does not declare RLS; live security cannot be inferred from the repository.

**Evidence:** supabase/sql/20260717_driver_location_updates.sql; service.js direct writes; live policies unknown

**Acceptance criteria:**

- Export deployed policies, grants, functions and bucket settings
- Test anonymous, driver A/B, fleet A/B, advertiser and admin access
- Deny cross-tenant reads/writes and client changes to financial or approval fields

### R07 — Replace public document URL design with private evidence access

**Epic:** E02 · **Type:** Task · **Priority:** P0 · **Owner role:** Backend / Security · **Estimate:** 3–5 person-days

**Blocked by:** R06

**Problem/outcome:** Upload helper returns getPublicUrl for documents; actual public exposure depends on bucket configuration.

**Evidence:** service.js uploadImageToStorage; ContractItem.jsx

**Acceptance criteria:**

- Use private buckets and short-lived authorized access
- Separate profile avatar from verification and registration evidence
- Negative-test another user and expired links; restrict upload type and size

### R08 — Protect fleet assets during driver account deletion

**Epic:** E02 · **Type:** Bug · **Priority:** P0 · **Owner role:** Backend · **Estimate:** 3–5 person-days

**Blocked by:** R04, R06

**Problem/outcome:** Authenticated deletion deletes vehicles where signeddriveremail matches user; this can remove fleet-owned assets.

**Evidence:** supabase/functions/delete_account/index.ts

**Acceptance criteria:**

- Deletion detaches driver and preserves fleet vehicle/contract and required financial history
- Derive allowed storage bucket/prefix on server, ignoring caller overrides
- Use resumable deletion job with pagination, failure audit and retention policy

### R09 — Move Telegram delivery and credentials to backend

**Epic:** E02 · **Type:** Task · **Priority:** P0 · **Owner role:** Backend / Security · **Estimate:** 2–4 person-days

**Blocked by:** R06

**Problem/outcome:** Mobile service accepts botToken and posts directly to Telegram; service lookup selects all columns.

**Evidence:** service.js getServiceLocation and sendServiceVisitTelegramMessage; live token presence unverified

**Acceptance criteria:**

- Client never receives bot credential
- Server authorizes booking and queues notification
- If live tokens were delivered to clients, rotate them and verify logs redact secrets

### R10 — Harden sessions, privileged access and local data

**Epic:** E02 · **Type:** Task · **Priority:** P1 · **Owner role:** Security / Mobile · **Estimate:** 3–5 person-days

**Blocked by:** R06

**Problem/outcome:** User data and auth persistence use AsyncStorage; choose storage controls based on threat model.

**Evidence:** src/components/service/supabase.js; service.js cacheUserData

**Acceptance criteria:**

- Require MFA for privileged roles and step-up for payout method changes
- Validate revocation, logout, account switching and local data cleanup
- Document secure session storage and recovery strategy

### R11 — Implement atomic invitation redemption and assignment

**Epic:** E03 · **Type:** Task · **Priority:** P0 · **Owner role:** Backend · **Estimate:** 4–7 person-days

**Blocked by:** R04, R06

**Problem/outcome:** Fleet code update writes driver then vehicle in separate requests and uses code as carid.

**Evidence:** service.js getVehicleDataByOTP, updateDriverFleetCode, updateVehicleData

**Acceptance criteria:**

- Single server transaction validates authenticated driver, fleet, vehicle and contract eligibility
- One-time expiring code is rate limited and safely stored; replay and simultaneous claims fail
- Use stable vehicle ID; failed claim leaves no partial binding

### R12 — Reserve contract capacity without overselling

**Epic:** E03 · **Type:** Story · **Priority:** P0 · **Owner role:** Backend / Web · **Estimate:** 4–7 person-days

**Blocked by:** R04, R06

**Problem/outcome:** Loadboard booking needs atomic capacity control, eligibility checks and expiry.

**Evidence:** Contract loadboard mockup; backend not inspected

**Acceptance criteria:**

- Concurrent requests for last slot yield one reservation
- Expired or cancelled hold releases capacity once
- Vehicle and funding eligibility checked server-side at booking and activation

### R13 — Record driver approval and guarded activation

**Epic:** E03 · **Type:** Story · **Priority:** P0 · **Owner role:** Backend / Mobile · **Estimate:** 4–6 person-days

**Blocked by:** R11, R12

**Problem/outcome:** Photo submission and signed timestamps must not substitute for explicit contract acceptance.

**Evidence:** service.js updateVehicleWrapPhotos writes signed_at on photo submission

**Acceptance criteria:**

- Record actor, versioned terms, consent time and contract snapshot
- Activation requires driver approval, accepted verification, installation evidence and funded campaign
- Fleet owner cannot approve on behalf of driver; invalid transitions fail

### R14 — Make photo review submission atomic and non-destructive

**Epic:** E03 · **Type:** Bug · **Priority:** P0 · **Owner role:** Backend / Mobile · **Estimate:** 3–5 person-days

**Blocked by:** R13

**Problem/outcome:** Photo update, contract status and driver counters are separate writes; resubmission resets performance totals.

**Evidence:** service.js updateVehicleWrapPhotos resets totaldistance, zonehourse and weeklyStat

**Acceptance criteria:**

- Submitting evidence never resets lifetime or historical totals
- Store evidence versions and explicit review state in one authorized command
- Retry is idempotent; partial failures preserve previous valid state

### R15 — Deliver wrap installation and recheck workflow

**Epic:** E03 · **Type:** Story · **Priority:** P1 · **Owner role:** Operations / Backend · **Estimate:** 3–5 person-days

**Blocked by:** R13

**Problem/outcome:** Physical installation is part of delivery, not just a calendar entry.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Persist provider, appointment, timezone, cancellation and completion evidence
- Define rejection, correction, periodic photo check and wrap removal flows
- Only authorized reviewer can approve; every decision has reason and history

### R16 — Support controlled vehicle and driver reassignment

**Epic:** E03 · **Type:** Story · **Priority:** P1 · **Owner role:** Backend / Web · **Estimate:** 3–5 person-days

**Blocked by:** R11, R13

**Problem/outcome:** Replacing a driver must not transfer old earnings or keep old access.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- End-date old assignment and create new one
- Preserve historical driver/vehicle/contract attribution
- Revoke old access and require new approval before activation

### R17 — Fix Contracts missing-cache branch

**Epic:** E04 · **Type:** Bug · **Priority:** P1 · **Owner role:** Mobile · **Estimate:** 0.5–1 person-days

**Blocked by:** None identified

**Problem/outcome:** loadDriverContracts calls setUserData(null) although that setter is not defined.

**Evidence:** src/Pages/Content/Contracts.js loadDriverContracts

**Acceptance criteria:**

- Missing userData produces valid empty or sign-in state
- No ReferenceError or misleading backend failure
- Test absent and malformed cache

### R18 — Propagate password-reset failures

**Epic:** E04 · **Type:** Bug · **Priority:** P1 · **Owner role:** Mobile · **Estimate:** 1–2 person-days

**Blocked by:** None identified

**Problem/outcome:** changePassword logs provider error and resolves; screen then displays success.

**Evidence:** service.js changePassword; OTPScreen.js reset .then

**Acceptance criteria:**

- Rejected update throws or returns explicit failure
- Screen stays on reset form and shows recoverable error
- Success only after confirmed provider result

### R19 — Use actual contract dates and resume evidence state

**Epic:** E04 · **Type:** Bug · **Priority:** P1 · **Owner role:** Mobile / Backend · **Estimate:** 1–3 person-days

**Blocked by:** R04

**Problem/outcome:** Contract end is calculated from campaign created_at; uploaded photo state is initially local-only.

**Evidence:** ContractItem.jsx contractEndDate and photo state

**Acceptance criteria:**

- Use approved campaign/assignment start and end fields
- Restore both photo sides and review status after restart
- Validate month-end dates and prevent repeated acceptance timestamps

### R20 — Make verification resumable with actionable review feedback

**Epic:** E04 · **Type:** Story · **Priority:** P1 · **Owner role:** Mobile / Backend · **Estimate:** 4–7 person-days

**Blocked by:** R07, R11

**Problem/outcome:** Complete identity, vehicle and photo checks while keeping server state authoritative.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Draft persists across restart and interrupted upload
- Rejected evidence has reason and resubmit flow
- Verification status stays distinct from assignment and contract status

### R21 — Reproduce and fix documented iOS navigation and layout issues

**Epic:** E04 · **Type:** Task · **Priority:** P1 · **Owner role:** Mobile / QA · **Estimate:** 2–4 person-days

**Blocked by:** R01

**Problem/outcome:** Existing BUGS.md lists five issues but does not show resolution evidence.

**Evidence:** BUGS.md; historical reports, not runtime-reproduced

**Acceptance criteria:**

- Reproduce splash/safe area, top control, keyboard dismissal, back navigation and birthdate layout
- Create separate child bugs only for reproduced issues
- Verify supported small and large iOS devices

### R22 — Store immutable telemetry and compute authoritative aggregates

**Epic:** E05 · **Type:** Task · **Priority:** P0 · **Owner role:** Backend / Data · **Estimate:** 5–8 person-days

**Blocked by:** R04, R06

**Problem/outcome:** Current client overwrites latest point and writes totals; paid activity needs replayable evidence.

**Evidence:** service.js uploadDriverLocationUpdates; location SQL unique driver_email

**Acceptance criteria:**

- Authenticated immutable event IDs deduplicate retries
- Server derives driver identity and assignment validity
- Append-only raw events and versioned aggregation support replay; clients cannot write authoritative totals

### R23 — Prevent lost queued locations and replay inconsistencies

**Epic:** E05 · **Type:** Bug · **Priority:** P0 · **Owner role:** Mobile / Backend · **Estimate:** 3–5 person-days

**Blocked by:** R22

**Problem/outcome:** Flush rewrites a snapshot of pending points; concurrent enqueue can be overwritten. Location and totals writes are separate.

**Evidence:** location/sync.js enqueueLocationUpdates and flushLocationQueue; service.js

**Acceptance criteria:**

- Enqueue during flush never loses new points
- Server acknowledgment removes only acknowledged event IDs
- Test crash after event write, aggregate failure, duplicate delivery and account switch

### R24 — Calculate zone hours using campaign boundaries

**Epic:** E05 · **Type:** Bug · **Priority:** P0 · **Owner role:** Backend / Data · **Estimate:** 3–5 person-days

**Blocked by:** R22

**Problem/outcome:** Existing calculation counts qualifying moving time; no polygon input is used before incrementing zonehourse.

**Evidence:** location/weeklyStats.js; service.js nextZoneHours; isolated Node probe

**Acceptance criteria:**

- Approved versioned campaign polygon and schedule determine eligible zone time
- Outside-zone movement never increases zone hours
- Test boundary crossings, gaps, parked vehicle and invalid location

### R25 — Fix week rollover and timestamp attribution

**Epic:** E05 · **Type:** Bug · **Priority:** P1 · **Owner role:** Backend / Data · **Estimate:** 2–4 person-days

**Blocked by:** R22

**Problem/outcome:** Rollover shifts history then overwrites index 0; whole batch uses latest timestamp week.

**Evidence:** location/weeklyStats.js buildWeeklyStatsUpdate; Node probe lost previous 10 km / 1 h

**Acceptance criteria:**

- Closed week remains in history and cannot be replaced by current week
- Split segments and late events across approved business timezone periods
- Test Sunday/Monday, multi-week offline batch and out-of-order events

### R26 — Validate telemetry quality before earnings

**Epic:** E05 · **Type:** Task · **Priority:** P0 · **Owner role:** Data / Security · **Estimate:** 3–6 person-days

**Blocked by:** R22, R24

**Problem/outcome:** Mocked flag is captured but inspected stats do not reject it; no upper plausible speed check is present there.

**Evidence:** location/sync.js normalizeLocationUpdate; weeklyStats.js shouldCountDrivingSegment

**Acceptance criteria:**

- Reject or quarantine impossible travel, poor accuracy and suspicious samples
- Define explainable thresholds and manual appeal
- Compare measured routes to reference journeys and record rule version

### R27 — Validate tracking on physical iOS and Android devices

**Epic:** E05 · **Type:** Task · **Priority:** P1 · **Owner role:** Mobile / QA · **Estimate:** 4–6 person-days

**Blocked by:** R22, R23

**Problem/outcome:** Background tracking code does not prove behavior under OS power restrictions.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Test permission denial/revocation, background, screen-off, restart and low power
- Measure route completeness, upload lag and battery impact against approved targets
- Stop or clearly disclose tracking outside eligible sessions

### R28 — Implement advertiser campaign lifecycle and funding rules

**Epic:** E06 · **Type:** Story · **Priority:** P0 · **Owner role:** Product / Backend / Web · **Estimate:** 4–7 person-days

**Blocked by:** R04

**Problem/outcome:** Campaign creation, approval, pause, cancellation and funding must match contract delivery.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Define targeting, monthly budget, slots, creative and dates
- Only approved funded campaigns can activate assignments
- Budget reservation, pause and termination have explicit effects on contracts

### R29 — Resolve 2-day invoice expiry against bank transfer latency

**Epic:** E06 · **Type:** Task · **Priority:** P0 · **Owner role:** Finance / Backend · **Estimate:** 2–4 person-days

**Blocked by:** R02, R28

**Problem/outcome:** 24–48 hour transfers can arrive at invoice expiry; balance top-up and campaign invoices are different records.

**Evidence:** Prior confirmed advertiser funding and 2-day expiry requirements

**Acceptance criteria:**

- Define exact deadline/timezone and pending-bank-transfer treatment
- Approve late/partial/overpayment and refund or balance-credit behavior
- Concurrent bank confirmation and expiry cannot both finalize campaign

### R30 — Integrate verified funding and bank reconciliation

**Epic:** E06 · **Type:** Story · **Priority:** P0 · **Owner role:** Backend / Bank partner · **Estimate:** 5–10 person-days

**Blocked by:** R29, R32

**Problem/outcome:** IDBank partnership is a direction; production API and settlement contract are unverified.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Obtain bank integration specification and sandbox credentials through secure channel
- Authenticate and deduplicate callbacks; reconcile settlement to ledger
- Exercise declined, timed-out, delayed, reversed and duplicate payment cases

### R31 — Expose defensible advertiser performance reporting

**Epic:** E06 · **Type:** Story · **Priority:** P1 · **Owner role:** Web / Data · **Estimate:** 3–5 person-days

**Blocked by:** R24, R28

**Problem/outcome:** Distance, zone time and estimated impressions must be clearly differentiated.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Show data freshness, eligible vehicles and measurement period
- Label estimates and document methodology without claiming verified impressions
- Export consistent totals with contract and campaign attribution

### R32 — Implement balanced immutable money ledger

**Epic:** E07 · **Type:** Task · **Priority:** P0 · **Owner role:** Backend / Finance · **Estimate:** 5–8 person-days

**Blocked by:** R02, R04

**Problem/outcome:** UI balances cannot be the financial source of truth.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Use integer minor units, currency and balanced entries
- Separate available, reserved, earned, payable and paid states
- Every posting is idempotent; corrections use linked reversals and reconciled balances

### R33 — Approve earnings formula and exceptions

**Epic:** E07 · **Type:** Task · **Priority:** P0 · **Owner role:** Product / Finance / Data · **Estimate:** 3–5 person-days

**Blocked by:** R03, R24

**Problem/outcome:** Monthly contract estimate needs an explicit weekly earning calculation.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Define required distance and zone hours, partial periods, caps and missed checks
- Version formula and store calculation inputs
- Approve worked examples for partial activation, pause, replacement and disputed telemetry

### R34 — Close performance periods and accrue earnings

**Epic:** E07 · **Type:** Story · **Priority:** P0 · **Owner role:** Backend / Finance · **Estimate:** 4–7 person-days

**Blocked by:** R26, R32, R33

**Problem/outcome:** Convert validated activity to payable earnings reproducibly.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Freeze or version period inputs and calculation
- Allocate line items to campaign, contract, vehicle, driver and beneficiary
- Late corrections produce audited adjustments and cannot silently rewrite paid periods

### R35 — Execute weekly payouts with safe retry and reconciliation

**Epic:** E07 · **Type:** Story · **Priority:** P0 · **Owner role:** Backend / Bank partner · **Estimate:** 5–8 person-days

**Blocked by:** R30, R34

**Problem/outcome:** Grouped payment can cover several drivers; uncertain bank result must not cause double payment.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Batch has beneficiary and covered line-item breakdown
- Unknown result triggers bank lookup/reconciliation before retry
- Partial failures retry only failed transfers; ledger agrees with bank confirmation

### R36 — Produce invoice and payout detail with driver mapping

**Epic:** E07 · **Type:** Story · **Priority:** P1 · **Owner role:** Backend / Web / Finance · **Estimate:** 3–5 person-days

**Blocked by:** R35

**Problem/outcome:** Billing history must explain precisely what each payment covers.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Detail shows period, contract, vehicle, driver, gross, deductions and net
- Access is scoped to entitled tenant and beneficiary
- Downloads reconcile to ledger and use approved invoice terminology

### R37 — Implement disputes, reversals and reconciliation exception queue

**Epic:** E07 · **Type:** Story · **Priority:** P0 · **Owner role:** Operations / Finance · **Estimate:** 3–5 person-days

**Blocked by:** R32, R34

**Problem/outcome:** Fraud, underdelivery, chargebacks and failed payouts need assigned operational resolution.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Record reason, evidence, owner and monetary impact
- Require independent approval for sensitive adjustments
- Daily exception report resolves every bank/ledger mismatch before payout close

### R38 — Build agreed fleet dashboard against real data

**Epic:** E08 · **Type:** Story · **Priority:** P1 · **Owner role:** Web / Design · **Estimate:** 4–7 person-days

**Blocked by:** R04, R11

**Problem/outcome:** Preserve simple navigation and vehicle-level operational clarity.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Top nav Dashboard/Contracts/Billing; no sidebar or separate Drivers page
- KPIs Total Vehicles, Total Drivers, Total Earnings and Total KM
- Required vehicle table and All Drivers widget show scoped fresh data with empty/loading/error states

### R39 — Deliver contract loadboard and My Contracts

**Epic:** E08 · **Type:** Story · **Priority:** P1 · **Owner role:** Web / Design · **Estimate:** 3–5 person-days

**Blocked by:** R12, R13

**Problem/outcome:** Fleet owner must understand eligibility, availability and next action.

**Evidence:** WrapGo fleet contract loadboard.png

**Acceptance criteria:**

- Search/filter available contracts and display campaign name, requirements and estimated earnings
- Book eligible vehicle, show hold expiry and generate code through authorized command
- My Contracts filters and actions reflect backend lifecycle

### R40 — Deliver billing and account-security workspace

**Epic:** E08 · **Type:** Story · **Priority:** P1 · **Owner role:** Web / Design · **Estimate:** 3–5 person-days

**Blocked by:** R02, R36

**Problem/outcome:** Strong visual security design must correspond to functioning controls.

**Evidence:** WrapGo billing and payouts dashboard.png; WrapGo profile and security workspace.png

**Acceptance criteria:**

- Billing shows approved payout schedule/model, methods and history
- Method changes require verification and expose pending/completed states
- Security page shows actual MFA, recovery and session capabilities; no decorative security claims

### R41 — Complete EN/RU/AM localization and accessibility

**Epic:** E08 · **Type:** Task · **Priority:** P1 · **Owner role:** Web / Mobile / Design · **Estimate:** 3–5 person-days

**Blocked by:** R38

**Problem/outcome:** Brand direction includes dark UI, #39FF14 and Lufga; verify font language coverage.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Audit all pilot copy and date/currency formats in three languages
- Use #39FF14 as sole accent and agreed 18–20px fleet card radius
- Test keyboard navigation, contrast, long translations and Armenian font fallback

### R42 — Version complete database schema and migration workflow

**Epic:** E09 · **Type:** Task · **Priority:** P0 · **Owner role:** DevOps / Backend · **Estimate:** 3–6 person-days

**Blocked by:** R01

**Problem/outcome:** Inspected repository includes two SQL scripts, not a complete reproducible domain schema.

**Evidence:** Repository tree; location SQL includes destructive deduplication DELETE statements

**Acceptance criteria:**

- Capture schema, RLS, indexes, triggers and storage policies as versioned migrations
- Apply to clean staging and reconcile with deployed schema
- Add migration review and backup/roll-forward plan; never run cleanup deletes blindly

### R43 — Create automated CI and critical regression coverage

**Epic:** E09 · **Type:** Task · **Priority:** P1 · **Owner role:** Engineering / QA · **Estimate:** 3–5 person-days

**Blocked by:** R01

**Problem/outcome:** No test/lint/build scripts appear in inspected package.json; tree has no workflow files.

**Evidence:** package.json and main repository tree; externally configured CI unknown

**Acceptance criteria:**

- Required CI covers static checks and reproducible build
- Add meaningful tests for binding, access control, telemetry, ledger and failure branches
- Record supported app build profiles and environment separation

### R44 — Prove backups, restoration and sensitive-data retention

**Epic:** E09 · **Type:** Task · **Priority:** P0 · **Owner role:** DevOps / Security · **Estimate:** 3–5 person-days

**Blocked by:** R42

**Problem/outcome:** Database-only recovery does not prove restoration of photo/document evidence.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Restore database plus required object evidence into isolated environment
- Measure agreed RPO/RTO and document restore owner
- Approve retention/deletion rules for raw location, identity evidence and finance records

### R45 — Deploy operational approval, support and audit tools

**Epic:** E09 · **Type:** Task · **Priority:** P1 · **Owner role:** Backend / Operations · **Estimate:** 3–5 person-days

**Blocked by:** R04

**Problem/outcome:** Marketplace operations need a real control surface beyond mobile and fleet screens.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Reviewer can verify evidence, reject with reason and inspect assignments
- Finance role can investigate payment exceptions without editing ledger history
- Append-only audit records actor, action, entity, reason and correlation ID

### R46 — Instrument reliability and production response

**Epic:** E09 · **Type:** Task · **Priority:** P1 · **Owner role:** DevOps / Operations · **Estimate:** 2–4 person-days

**Blocked by:** R22, R32

**Problem/outcome:** Measure stalled workflows and financial exceptions as well as application crashes.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Alerts cover tracking lag, stuck review, expired holds, callback failures and reconciliation differences
- Dashboards include release and correlation IDs without sensitive data
- Named on-call and incident runbooks are exercised

### R47 — Validate Armenia operating and data obligations

**Epic:** E09 · **Type:** Task · **Priority:** P0 · **Owner role:** PM / Counsel / Bank · **Estimate:** 2–4 person-days

**Blocked by:** R02, R03

**Problem/outcome:** This review makes no legal-compliance determination; final contracts and obligations need qualified verification.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Obtain Armenia counsel and bank confirmation of marketplace fund flow, advertiser/driver/fleet contracts and consent
- Approve location privacy, retention, photo evidence, invoices and payout beneficiary obligations
- Record required changes with accountable owner before real-money pilot

### R48 — Run controlled end-to-end pilot and release gate

**Epic:** E09 · **Type:** Task · **Priority:** P0 · **Owner role:** QA / PM / Operations · **Estimate:** 5–8 person-days

**Blocked by:** R07, R08, R09, R13, R14, R23, R24, R25, R26, R27, R29, R30, R35, R37, R41, R43, R44, R45, R46, R47

**Problem/outcome:** A working screen is insufficient evidence for safely operating paid campaigns.

**Evidence:** Proposed requirement; implementation not verified

**Acceptance criteria:**

- Exercise funded campaign through booking, driver approval, install, valid telemetry, period close and payout
- Run rejection, expiry, permission loss, duplicate callback, deletion, refund and restore cases
- No unresolved P0; reconcile all pilot money; product, engineering and finance sign off; keep prototype private unless user approves public release

## Immediate next actions

1. Inspect actual Jira project and deduplicate this proposed backlog; preserve existing work and owners.
2. Confirm canonical repository and deployed commit; locate fleet, advertiser and admin code and inspect deployed Supabase policies.
3. Triage R06–R09, R11, R14 and R22 before adding real drivers or money.
4. Resolve beneficiary/schedule, earnings and invoice-expiry decisions with Product/Finance.
5. Refine and estimate the first increment; attach reproducible code evidence and isolated probe results to relevant issues.

No percentage-complete score or promised launch date is assigned because implementation and production evidence are incomplete.
