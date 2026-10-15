# PRD — WrapGo Controlled Pilot

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner.

## Product objective and problem
WrapGo connects advertisers seeking local visibility with fleets and drivers that can display vehicle wraps. Advertisers need evidence of agreed delivery; fleet owners need simple assignment and settlement; drivers need clear consent, verification, activity and earnings. The pilot must validate the complete funded-campaign-to-reconciled-payout journey.

## Scope and users
Primary launch geography: a capped Yerevan pilot; exact zones, advertiser/fleet/vehicle limits and operating hours require product approval in WEB-59. Personas are advertiser operator, fleet owner, driver, evidence reviewer, finance operator and support/admin. These are access roles, not assumed separate hires.

Pilot scope: advertiser campaign setup/funding; fleet loadboard and reservations; six-digit activation; vehicle/driver/contract assignment; driver final approval; identity/vehicle/photo checks; installation review; reliable eligible activity; explainable earnings; grouped weekly settlement; exception handling and audit.

Deferred unless separately prioritized: automatic route-marketplace optimization, new cities, advanced cross-channel attribution, guaranteed impression claims, automated sales CRM/Make pipelines and on-demand withdrawal as a second payout model. Existing code/UI presence does not establish acceptance.

## Requirements and measurable acceptance
| ID | Requirement | Acceptance | Jira |
| --- | --- | --- | --- |
| PRD-01 | Funded campaign | Approved campaign, zones, monthly budget, capacity and immutable booked dates; no unfunded activation | WEB-66, WEB-67, WEB-68 |
| PRD-02 | Capacity-safe booking | Concurrent attempts at final slot cannot oversell; hold expiration releases once | WEB-64 |
| PRD-03 | Invite and bind | Server generates single-use six-digit code; redeem atomically binds stable vehicle, driver and contract IDs | WRAP-23, WEB-83 |
| PRD-04 | Explicit driver approval | Fleet cannot approve for driver; terms version, actor and time recorded independently of photos | WRAP-24 |
| PRD-05 | Evidence and installation | Resumable uploads, reviewer decision/reason, corrections and installation record; no counter reset | WRAP-25, WRAP-26, WRAP-27 |
| PRD-06 | Trusted delivery measurement | Authenticated replayable events; campaign polygon/schedule; quality checks; late/week-boundary cases | WRAP-29…33, WEB-20 |
| PRD-07 | Explainable earnings | Approved versioned formula; period statement maps campaign/vehicle/driver/beneficiary | WRAP-35, WRAP-36, WEB-69 |
| PRD-08 | Reconciled payout | Beneficiary/schedule decision; ledger balance; bank unknown-result reconciliation; grouped line items | WEB-58, WRAP-34, WRAP-37, WEB-81 |
| PRD-09 | Private role-scoped data | Tenant-negative tests; private documents; no raw card/CVV in app storage path | WEB-38, WEB-62, WEB-80 |
| PRD-10 | Simple fleet workspace | Dashboard/Contracts/Billing top nav; required KPIs/table; All Drivers widget | WEB-71…73 |
| PRD-11 | Accessible multilingual flow | EN/RU/AM, correct fonts/formats, long translations, keyboard and small-screen UAT | WEB-34 |
| PRD-12 | Operable private release | Restore drill, support/review queues, alerts, no unresolved pilot blockers | WEB-75…79 |

## Journey and failure behavior
Advertiser drafts and funds → fleet reserves eligible vehicle → driver redeems code and completes checks/consent → provider installs wrap → reviewer accepts evidence → server activates → valid events accumulate → period closes → finance approves → bank settles → statement reconciles. Capacity, code, photo, funding, location-permission and bank failures must show a reason and recovery action; never silently advance.

## Existing business rules preserved
Available start rolls Today+7 days; booked start locks Booking Date+7 days; confirmed early wrap may override; finish = effective start+duration; live dates change only through explicit events. Existing documented two-door plan is 109,000 AMD (WEB-16); this is source reference, not a new price approval. Weekly payouts remain the requirement; beneficiary and withdrawal conflict is open in WEB-58. Campaign invoices expire after two days; pending bank-transfer handling is open in WEB-67.

## Success measures and release decision
Measure activation completion/lead time, eligible-route completeness, data freshness, accepted evidence rate, support/dispute load, advertiser repeat intent, contribution and maximum cash exposure. Product must approve numerical targets/caps before the pilot. Hard gates: zero unauthorized access in test matrix; zero duplicate credits/payouts in retry tests; every pilot money movement reconciled; every active assignment has required acceptance/evidence; no unresolved P0 label; restore targets demonstrated.

## Assumptions and decisions
Review baseline, not approved final scope. D02 beneficiary/schedule, D04 code/hold expiry, D05 eligible-time/cutoff, D06 late funding, D07 retention/operating terms and D08 caps/targets remain open. Do not bypass these with a UI default. Capacity baseline from Jira guide: one developer ~12 h/week, one product owner, WIP≤2. No launch date committed; refine remaining work in hours after code/deployment verification.

## Approval and change control
Product approves scope/rules; technical owner approves architecture/security; finance approves calculation/settlement; qualified review resolves operating/data obligations. Record dated approval in decision log and linked Jira work; open PRs and published pages are not approval. Any rule change identifies impacted requirement IDs, tests, data migration, UI copy and rollback.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

