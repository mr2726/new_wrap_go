# Delivery Roadmap, Capacity, RACI & Jira Governance

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner.

## Capacity and method
Existing Jira conventions record one developer (Casper) about 12 hours/week and product owner WrapGo Team. Treat this as the documented planning baseline pending availability confirmation, not an assignment change. Kanban WIP≤2; next-up queue 3–5 tickets; weekly ~30-minute review. Product tests awaiting-review within three days under the existing convention; reconfirm if capacity changes.

## Priority policy reconciliation
P0 label = must resolve/prove before paid pilot, not proof of a live incident. Existing Jira policy reserves Highest for something broken for users today. Static review findings use High plus p0/security labels until live impact is verified. Broad proposed person-day ranges from earlier review are rough discovery estimates, not scheduled commitments. Refine in hours against actual capacity; never add all backlog ranges into a promised launch date.

## Milestones and sequencing
| Gate | Exit evidence | Immediate work |
| --- | --- | --- |
| G0 baseline | Deployment/schema inventory, beneficiary decision, pilot bounds and owners | WEB-57/58/59/60 and WEB-38 triage |
| G1 trust | Private role-scoped evidence, atomic booking/binding, driver acceptance and reviewed install | WEB-62/64, WRAP-23…27, WEB-80/82/83 |
| G2 measure/settle | Replayable quality/zone totals, approved formula, ledger, sandbox settlement | WRAP-29…37, WEB-67/68/81 |
| G3 private pilot | Full UAT, restore, support operation, reconciled capped money; no p0 remaining | WEB-75…79 |
| G4 launch decision | Pilot targets and cash/demand evidence accepted; explicit audience decision | Product + technical + finance review |

Candidate refinement order, not a newly assigned sprint: verify two mobile fixes; inspect deployed RLS and card-data exposure; decide payout model; inventory complete schema/deployments; refine atomic invite/binding. Product selects actual next-up after evidence review. Existing next-up labels and active work are not silently replaced.

## RACI for the small team
| Activity | Product owner | Developer/technical owner | Specialist role when needed |
| --- | --- | --- | --- |
| PRD/business rules/priority | A/R | C | Finance/Ops C |
| Architecture/API/data security | C | A/R | Security C |
| Build/tests/deploy execution | A for release | R | QA/DevOps C, not assumed staffed |
| UAT acceptance | A/R | C | Finance/Ops C for relevant flows |
| Beneficiary/formula/settlement | A business decision | R implementation | Finance R; qualified reviewer C |
| Privacy/operating terms | A | C implementation | Qualified counsel R review |
| Incident triage | A coordination | R technical response | Finance/security consulted by impact |

## Definition of Ready / Done
Ready: specific outcome, actor, approved rule or explicit decision task, acceptance/tests, source evidence, dependencies, owner and refined size. Done preserves existing guide: reviewed code, acceptance passed in required languages/devices, no new console errors, relevant RLS/migrations, merged and deployed, product owner tested, documentation updated. Open PR and passing isolated tests means ready for review, not Done. Record deployment evidence explicitly.

## Traceability and reporting
Keep existing WEB/WRAP epics. 48 new review-related issues, five existing supplemented, 103 Blocks links exist from the GitHub review. Labels architecture-review-2026-10, github-evidence and p0/p1 separate source evidence and pilot gating. Use actual issue status/links for reporting; publish capacity, aging blocked work, release acceptance and unresolved decisions without invented velocity or due dates.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

