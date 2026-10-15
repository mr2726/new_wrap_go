# Marketplace Operations & Support Runbooks

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner / operations role.

## Operating queues
Operate through role-scoped tools and audited commands, not ad-hoc database edits. Queue entries need entity/reference, reason, severity, owner, next action, deadline and correlation/evidence IDs. Review/support/finance may be performed by the same small team but sensitive approvals require a recorded review arrangement.

| Queue | Operator procedure | Escalation / Jira |
| --- | --- | --- |
| Driver/vehicle verification | Confirm permitted evidence; approve or reject specific version with actionable reason | Identity uncertainty → technical/product; WEB-76 |
| Wrap installation | Confirm provider, slot, vehicle, creative and scheduled/actual dates; collect completion evidence | Reschedule/defect and removal plan; WRAP-26 |
| Photo recheck | Compare required sides, recency and campaign identity; request correction without erasing history | Suspected fraud → owned review; WRAP-25 |
| Tracking gap | Check consent/permission, device/network and last accepted event; contact driver with safe recovery guidance | Do not award invented mileage; WEB-20/WRAP-30 |
| Suspicious activity | Preserve event/rule references; quarantine/hold affected lines; review and allow appeal | No automatic permanent conclusion from weak signal; WRAP-33 |
| Funding/invoice exception | Reconcile provider/bank reference, pending/late/partial amount and expiry decision | No activation on unverified payment; WEB-67/68 |
| Payout unknown/failed | Query bank/reconcile before retry; retry only confirmed failed lines | Finance owner; WEB-70/WRAP-37 |
| Dispute/refund | Record claim, contract/evidence/period, proposed resolution and approval | Linked ledger adjustment; no editable history; WEB-70 |
| Account deletion | Verify requester; detach fleet assignment; apply approved retention/hold; audit job completion | Preserve fleet assets and required records; WRAP-21 |

## Standard operating record
Case ID; category; affected tenant/campaign/assignment; requester verification; safe evidence references; current status; assigned owner; next action/time; decision/approval and monetary effect; communication summary; linked Jira incident/problem. Do not paste raw identity documents, card details, tokens or precise residential routes into general tickets.

## Incident severity and escalation
Critical operational incident means confirmed/suspected unauthorized access, duplicate money movement, widespread lost activity or inability to reconcile required records. Restrict the affected action and alert accountable owners immediately. Routine blockers use severity/priority per Jira guide; P0 label means paid-pilot gate and does not alone prove an ongoing incident. External communication follows the approved incident/notification procedure.

## Operating cadence
During pilot: check evidence/booking queues, event/job freshness and provider exceptions every operating day; reconcile before payout close. Weekly: review complaints, activation delays, vendor defects, repeated tracking failures, support time and contribution/cash exposure. Support hours and numeric response SLAs require product approval in WEB-59; do not promise 24/7 coverage with one part-time developer.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

