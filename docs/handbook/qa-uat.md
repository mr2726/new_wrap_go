# QA Strategy, Test Catalog & UAT Acceptance

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner accepts; technical owner implements tests.

## Test levels and release evidence
Function tests validate local behavior; contract/integration tests validate server authority and policies; physical-device/browser UAT validates actual flows; reconciliation/restore drills validate operations. A passing isolated test is not a deployed feature approval. Jira Done retains the existing product-owner acceptance requirement.

| Test ID | Scenario and expected result | Requirement / Jira |
| --- | --- | --- |
| QA-AUTH-01 | Provider rejects password update; screen does not show success | PRD-09; WRAP-20 |
| QA-CACHE-01 | Missing cached user gives clean contracts empty/sign-in state | WRAP-19 |
| QA-ISO-01 | Anonymous/A/B tenants cannot read/write each other's rows, objects or privileged fields | PRD-09; WEB-38 |
| QA-BIND-01 | Two drivers redeem same code concurrently; one valid atomic result, no split assignment | PRD-03; WRAP-23 |
| QA-BOOK-01 | Final campaign slot booked concurrently; capacity never negative/oversold | PRD-02; WEB-64 |
| QA-CONSENT-01 | Fleet cannot submit driver consent; stale terms rejected; actor/version auditable | PRD-04; WRAP-24 |
| QA-PHOTO-01 | Interrupted upload/restart/rejection/resubmit preserves prior totals and evidence history | PRD-05; WRAP-25/27 |
| QA-DATES-01 | Booked+7, early wrap, month end, paused/live and mobile/web consistency | WEB-47 |
| QA-GEO-01 | Outside/boundary/stationary/poor-accuracy points obey approved eligibility rules | PRD-06; WRAP-31/33 |
| QA-QUEUE-01 | Enqueue during flush, crash/partial failure and retry lose no accepted event and duplicate no credit | WRAP-30 |
| QA-PERIOD-01 | Sunday/Monday, out-of-order and multi-week offline events preserve closed history | WRAP-32 |
| QA-DEVICE-01 | Background, screen-off, permission revocation, restart/low power on real devices meet approved route/battery targets | WEB-20 |
| QA-MONEY-01 | Duplicate/late/unknown bank result and parallel withdrawal cannot pay twice or corrupt balance | PRD-08; WEB-81/WRAP-37 |
| QA-CARD-01 | App write/log paths reject raw CVV/card-number storage | WEB-80 |
| QA-EMAIL-01 | Ordinary session without required operation-bound proof cannot bypass email verification | WEB-82 |
| QA-RESTORE-01 | Database and evidence restore into isolated environment; measured RPO/RTO | WEB-75 |
| QA-UX-01 | EN/RU/AM, keyboard/focus, small/large screen, long strings, error/empty states | WEB-34, WEB-71…73 |
| QA-E2E-01 | Fund → reserve → bind/consent → install/review → eligible route → period → reconciled payout | WEB-79 |

## UAT record template
Record requirement/test ID, Jira key, source and deployed commit, environment/schema, synthetic dataset, device/browser/OS/network, steps, expected/actual result, safe evidence reference, pass/fail, tester and product acceptance date. No production card/document exports in test attachments. Rejected acceptance includes reason and returns to actionable state.

## Known verification today
Mobile PR #2 has five passing function-level regressions; two target regressions failed on baseline source. Stats probes establish rollover/zone calculation behavior. Full app build/device, live RLS, bank and restore tests have not run in this review. The analysis PR is documentation; Mermaid rendering is not locally validated, while fishbone SVG was rendered/visually checked.

## Release gate
All relevant acceptance passed in staging; no unresolved P0 pilot blocker; money reconciled; role-isolation negative tests pass; recovery and operating owners confirmed. New code still requires review, merge/deployment and product-owner test before Done; documentation publication alone never closes implementation bugs.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

