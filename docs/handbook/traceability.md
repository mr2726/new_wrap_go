# Requirements Traceability & Documentation Control

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner / technical owner.

## Traceability contract
PRD requirement → functional/business rule → technical command/entity/control → Jira implementation → GitHub PR/commit → test/UAT evidence → deployed release. Any missing link stays visible. Existing review mapping covers R01…R48 plus F01…F04; do not create duplicate epics or treat review estimates as committed delivery.

| Requirement | Technical specification | Implementation work | Acceptance evidence |
| --- | --- | --- | --- |
| PRD-01/02 | Campaign lifecycle, API reserve/funding, ledger | WEB-64/66/67/68 | QA-BOOK-01 + sandbox invoice/settlement |
| PRD-03/04 | API redemption/consent, assignment model, role matrix | WRAP-23/24, WEB-83 | QA-BIND-01/CONSENT-01 |
| PRD-05 | Evidence dictionary, review/install operations | WRAP-25/26/27 | QA-PHOTO-01 + reviewer audit |
| PRD-06 | Telemetry/geofence/quality and NFR-MOB | WRAP-29…33, WEB-20 | QA-GEO/QUEUE/PERIOD/DEVICE |
| PRD-07/08 | Financial specification, ledger and bank contract | WEB-58, WRAP-34…37, WEB-69/70/80/81 | QA-MONEY/CARD + full reconciliation |
| PRD-09 | Security matrix, private objects, identity changes | WEB-38/62/82, WRAP-21 | QA-ISO/EMAIL + deletion evidence |
| PRD-10/11 | UX/localization spec and NFR-ACC | WEB-34/71…73 | QA-UX-01 |
| PRD-12 | Release/DR, operations and decision gates | WEB-74…79, WRAP-38 | QA-RESTORE/E2E and approvals |

## Source snapshots and open PRs
Web source inspected: b9b8a8035b86e28500180f45908a82481286c5cf. Mobile: 802469d74cb2221ecb82d9bcc752c4d5962cf1ba. Analysis PR: https://github.com/mr2726/new_wrap_go/pull/1. Mobile fixes: https://github.com/mr2726/new_wrapgo_app/pull/2, commit 19c863e5bd6156f58f7c4b8b965671567a3fe468, five isolated tests passing. PR status must be read live before claiming merge/deployment. Live schema and bank/device behavior remain unverified.

## Document control
Confluence owns reviewable product rules/decisions; GitHub owns executable code/tests/versioned technical definitions; Jira owns delivery/acceptance. Update linked records together through change control. This handbook is a review baseline, not a legal or production approval. Review when lifecycle/funding/measurement/role changes; record owner, date, affected requirements and superseded version. Preserve historic pages and rich content; use current supplements to correct unverified claims.

## Planning evidence
Current Jira conventions record one developer ~12 h/week, WIP≤2, product-owner acceptance. Reconcile this with remaining estimates before forecasting. Priority Highest means verified live user breakage under existing guide; p0 label separately gates a paid pilot. Capacity, retention, beneficiary, targets and approval are explicit open decisions, never silent placeholders.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

