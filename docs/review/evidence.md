# Evidence and findings

## Baseline and boundaries

| Repository / source | Snapshot | Reviewed scope |
| --- | --- | --- |
| [Web](https://github.com/mr2726/new_wrap_go/tree/b9b8a8035b86e28500180f45908a82481286c5cf) | b9b8a8035b86e28500180f45908a82481286c5cf | Full tree; README/BUGS/package; shared service; Fleet Billing, SignContract, AddDriverForm, 2FA; advertiser Billing and CampaignBuilder sections; campaignDates; invite/update-email functions and two migrations |
| [Mobile](https://github.com/mr2726/new_wrapgo_app/tree/802469d74cb2221ecb82d9bcc752c4d5962cf1ba) | 802469d74cb2221ecb82d9bcc752c4d5962cf1ba | Full tree; repository instructions; auth/service; location stats/sync; contracts; photos; payment notice; deletion function; two SQL scripts |
| [Other mobile tree](https://github.com/mr2726/wrapgo_app/tree/b0513f36ad6b68ff14fc404fb5ef6c5b552cbb83) | b0513f36ad6b68ff14fc404fb5ef6c5b552cbb83 | Inventory only; authoritative/retirement status unknown |
| Jira WEB and WRAP | 15 October 2026 snapshot | All returned issues: WEB-1…55 and WRAP-1…18; descriptions, status, parents and labels. Status is reported, not independently validated |
| Prior product decisions and three mockups | Reviewed before code expansion | Weekly payouts; driver final approval; fleet code; top navigation; EN/RU/AM; #39FF14; sample mockups are not implementation proof |

No production credentials, card records, private identity documents or live database content were requested or read. Supabase policies, deployed function versions, bank integration and device behavior remain unverified. The web repository was found after the initial baseline review, so this supplement supersedes baseline statements that web source was not located. Actual RLS and grants cannot be inferred from client code.

## Confirmed source behavior and risk interpretation

All paths below are relative to their repository; links above pin exact snapshots. Source behavior is not a demonstrated production exploit.

| ID | Source evidence | Implication | Disposition |
| --- | --- | --- | --- |
| F01 | Web `src/Pages/Fleet/Billing.js` handleAddCard sends `card_number` and `cvv` to insertBankData; service inserts into bankdata | Sensitive card data reaches application database path; real-data presence unknown | P0: replace with provider-hosted/tokenized method; assess existing data without exporting it |
| F02 | Same handleWithdraw writes fleet balance then inserts transfer, with client rollback | Concurrent requests and partial failures can corrupt money state | P0: server transaction + ledger/idempotency |
| F03 | Web update-email function calls admin update with email_confirm true; separate OTP is only described as a client precondition | Authenticated caller is not required to prove fresh old-email step-up or new-address ownership in this function | P0: verified server challenge / secure email change, test direct invocation |
| F04 | send-invite-code accepts email/code/fleetName and sends email; body is interpolated into HTML | Function body has no caller/fleet authorization or business-rate-limit check; gateway JWT setting unknown; content injection possible | P0: ownership checks and limits; escape HTML; inspect gateway configuration |
| F05 | AddDriverForm generates six alphanumeric characters with Math.random; sets vehicle invite_code and signeddriveremail before delivery | Conflicts with required six-digit single-use activation; email failure still closes dialog | Fix via atomic server invite command; do not silently change code format client-only |
| F06 | SignContract updates driver then inserts signed contract; signed_at is set by fleet action | Partial assignment; signature timestamp does not prove driver acceptance | P0: authorized transaction and distinct acceptance event |
| F07 | Mobile updateDriverFleetCode updates driver and vehicle separately, using code as carid | Partial binding and race conditions | P0: stable entity IDs and atomic redemption |
| F08 | Mobile updateVehicleWrapPhotos writes vehicle, signed contract and driver separately and resets total/weekly counters | Evidence retries can erase prior performance and create partial states | P0: non-destructive versioned review command |
| F09 | Mobile service writes telemetry totals; latest-location SQL enforces unique email and deletes older entries | Financial measurement lacks replayable raw history in this path | P0: immutable events and server aggregation |
| F10 | weeklyStats has no zone polygon input; its batchHours increments zonehourse | Moving time and campaign zone time are conflated | P0: campaign geometry and eligibility rules |
| F11 | Weekly rollover shifts history then overwrites first slot | Prior closed-week total disappears in isolated probe | Fix + period attribution tests; business timezone remains decision |
| F12 | sync flush rewrites pending snapshot while enqueue performs read/append/write | Enqueue during flush can be overwritten | Durable event IDs and acknowledged deletion |
| F13 | Contracts missing-cache branch calls undefined setUserData | Caught ReferenceError prevents clean empty state | Fixed in separate mobile PR; regression test |
| F14 | changePassword logs error and resolves; OTP screen success is in .then | False success on password rejection | Fixed in separate mobile PR; rejection test |
| F15 | delete_account deletes vehicles by signeddriveremail and accepts bucket/prefix from caller | Driver deletion can delete fleet asset; cleanup configuration too broad | P0: detach, preserve history, server-derived namespaces, resumable deletion |
| F16 | Both service layers use public document URL generation | Private evidence access model needs validation; bucket public status unknown | P0: private buckets + authorized short-lived access |
| F17 | Mobile Telegram sender accepts botToken; wrap_services query selects all | Token exposure possible if server rows supply live credentials | Move message delivery to backend; inspect/rotate only if exposed |
| F18 | Mobile shows dates from campaign created_at; web campaignDates supports effective_start_at / actual_wrap_at | Cross-surface contract date inconsistency | Extend WEB-47; preserve booking+7 days/early wrap business rules |

## Verification performed

- Executed exact retrieved weeklyStats.js in isolation: prior week 10 km / 1 h disappeared after rollover with a Sunday/Monday segment. Whole segment was credited to new week. A one-minute ordinary driving segment produced batchHours without zone geometry.
- Two mobile regression tests failed before fixes: rejected password update resolved; missing cache did not produce clean empty contracts.
- After focused changes, five function-level regressions pass: password failure/success, missing-cache state, successful contract load and backend error handling. These are not native device or live Auth tests.
- Read mobile AGENTS.md and Expo SDK 54 versioned documentation before edits. No runtime dependency upgrade was made.

## Decisions that need reconciliation

Jira WRAP-13 promises direct weekly driver payouts while mobile says fleet owner manages payments. Fleet Billing currently implements withdrawal requests. Resolve beneficiary, schedule and accounting before introducing processing. Existing WEB-47 explicitly defines booked start = booking date + 7 days with approved early-wrap override; use this as current requirement pending product changes. Existing Jira privacy/terms entries contain retention numbers and legal claims; those are project text, not a legal opinion validated by this review.
