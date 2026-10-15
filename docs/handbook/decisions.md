# Architecture Decisions, Assumptions & Open Questions

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product and technical decision owners.

## Decision lifecycle
Proposed → reviewed → accepted/rejected → superseded. A published proposal is not accepted. Each record includes context, options, decision, evidence, consequences, accountable approver, contributors, date and affected requirements/Jira. No invented approver names or signatures.

| ID | Decision / current state | Options and required evidence | Owner / work |
| --- | --- | --- | --- |
| ADR-01 | Proposed: server command authority around existing Supabase foundation | Keep controlled modular backend vs client privileged writes vs service split; inspect live schema and ownership first | Technical; WEB-60/38/74 |
| ADR-02 | Proposed: immutable telemetry and versioned aggregate | Latest row only cannot replay disputed activity; prove cost, retention and quality pipeline | Technical/Product; WRAP-29…33 |
| ADR-03 | Proposed: balanced immutable ledger and provider-tokenized methods | Client balance mutation/raw CVV path must be removed; bank sandbox and chart-of-accounts approval required | Finance/Technical; WRAP-34, WEB-80/81 |
| ADR-04 | Existing requirement: explicit driver final consent | Fleet action/photo upload is not driver signature; decide terms version/evidence and activation gating | Product; WRAP-24/25 |
| ADR-05 | Existing business rule: booked+7 / approved early-wrap override | WEB-47 governs; reconcile assignment vs global campaign dates and mobile representation | Product/Technical; WEB-47 |
| ADR-06 | Existing delivery model: Kanban, WIP≤2, developer ~12 h/week | Verify availability before dates; do not assume staffed multi-team delivery | Product; WEB-59/61 |

## Open decisions
| ID | Question | Required output | Jira |
| --- | --- | --- | --- |
| D01 | Which mobile repo and commits are deployed? | Canonical repo/environment inventory; old repo disposition | WEB-57 |
| D02 | Who receives money and on what schedule? | Beneficiary, obligations, weekly cutoff/day, fees, withdrawal decision | WEB-58 |
| D04 | Code and capacity hold policy? | Six-digit format, TTL, attempt quota, expiry, rebind | WRAP-23/WEB-64 |
| D05 | What activity earns and when? | Polygon/schedule, stationary/motion rules, timezone/week, late-data and formula examples | WRAP-31/35 |
| D06 | Bank transfer at invoice deadline? | Pending/late/partial/overpayment and refund/credit rules | WEB-67 |
| D07 | Retention and operating obligations? | Qualified review, final data class policy and implementation evidence | WEB-78/75 |
| D08 | Pilot bounds and targets? | Counts, zones, load, route/battery/freshness targets, support hours, RPO/RTO and cash cap | WEB-59/WEB-20 |

## Change-impact checklist
Identify affected PRD/NFR IDs, API/event versions, DB constraints/backfill, supported mobile versions, UI/localization, operational/legal text, test cases, data retention, finance corrections and rollback. Link accepted decision to implementation tickets and update GitHub/Confluence together. Keep superseded reasoning available; remove no historical decisions without preserving version history.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

