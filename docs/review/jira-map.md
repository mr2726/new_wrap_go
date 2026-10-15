# Jira traceability

Review owner task: [WEB-56](https://wrapgo.atlassian.net/browse/WEB-56).

Existing epics were reused; 48 new issues were created (review task, 43 baseline children, four additional web bugs). Five existing issues were supplemented without changing statuses or assignees. “To Do” is not an implementation-complete claim. 103 native Jira Blocks links were created, including the four additional web security/finance findings blocking the pilot gate.

Mobile code PR: https://github.com/mr2726/new_wrapgo_app/pull/2 — five isolated regression tests pass; device UAT remains.

| Draft | Jira | Scope | Disposition |
| --- | --- | --- | --- |
| R01 | [WEB-57](https://wrapgo.atlassian.net/browse/WEB-57) | Establish canonical repositories and environment inventory | New child under existing epic |
| R02 | [WEB-58](https://wrapgo.atlassian.net/browse/WEB-58) | Resolve payout beneficiary and schedule | New child under existing epic |
| R03 | [WEB-59](https://wrapgo.atlassian.net/browse/WEB-59) | Approve pilot scope and success criteria | New child under existing epic |
| R04 | [WEB-60](https://wrapgo.atlassian.net/browse/WEB-60) | Publish domain model and state-transition matrix | New child under existing epic |
| R05 | [WEB-61](https://wrapgo.atlassian.net/browse/WEB-61) | Configure Jira delivery governance | New child under existing epic |
| R06 | [WEB-38](https://wrapgo.atlassian.net/browse/WEB-38) | Audit live RLS, grants and storage policies | Existing issue supplemented |
| R07 | [WEB-62](https://wrapgo.atlassian.net/browse/WEB-62) | Replace public document URL design with private evidence access | New child under existing epic |
| R08 | [WRAP-21](https://wrapgo.atlassian.net/browse/WRAP-21) | Protect fleet assets during driver account deletion | New child under existing epic |
| R09 | [WRAP-22](https://wrapgo.atlassian.net/browse/WRAP-22) | Move Telegram delivery and credentials to backend | New child under existing epic |
| R10 | [WEB-63](https://wrapgo.atlassian.net/browse/WEB-63) | Harden sessions, privileged access and local data | New child under existing epic |
| R11 | [WRAP-23](https://wrapgo.atlassian.net/browse/WRAP-23) | Implement atomic invitation redemption and assignment | New child under existing epic |
| R12 | [WEB-64](https://wrapgo.atlassian.net/browse/WEB-64) | Reserve contract capacity without overselling | New child under existing epic |
| R13 | [WRAP-24](https://wrapgo.atlassian.net/browse/WRAP-24) | Record driver approval and guarded activation | New child under existing epic |
| R14 | [WRAP-25](https://wrapgo.atlassian.net/browse/WRAP-25) | Make photo review submission atomic and non-destructive | New child under existing epic |
| R15 | [WRAP-26](https://wrapgo.atlassian.net/browse/WRAP-26) | Deliver wrap installation and recheck workflow | New child under existing epic |
| R16 | [WEB-65](https://wrapgo.atlassian.net/browse/WEB-65) | Support controlled vehicle and driver reassignment | New child under existing epic |
| R17 | [WRAP-19](https://wrapgo.atlassian.net/browse/WRAP-19) | Fix Contracts missing-cache branch | New child under existing epic |
| R18 | [WRAP-20](https://wrapgo.atlassian.net/browse/WRAP-20) | Propagate password-reset failures | New child under existing epic |
| R19 | [WEB-47](https://wrapgo.atlassian.net/browse/WEB-47) | Use actual contract dates and resume evidence state | Existing issue supplemented |
| R20 | [WRAP-27](https://wrapgo.atlassian.net/browse/WRAP-27) | Make verification resumable with actionable review feedback | New child under existing epic |
| R21 | [WRAP-28](https://wrapgo.atlassian.net/browse/WRAP-28) | Reproduce and fix documented iOS navigation and layout issues | New child under existing epic |
| R22 | [WRAP-29](https://wrapgo.atlassian.net/browse/WRAP-29) | Store immutable telemetry and compute authoritative aggregates | New child under existing epic |
| R23 | [WRAP-30](https://wrapgo.atlassian.net/browse/WRAP-30) | Prevent lost queued locations and replay inconsistencies | New child under existing epic |
| R24 | [WRAP-31](https://wrapgo.atlassian.net/browse/WRAP-31) | Calculate zone hours using campaign boundaries | New child under existing epic |
| R25 | [WRAP-32](https://wrapgo.atlassian.net/browse/WRAP-32) | Fix week rollover and timestamp attribution | New child under existing epic |
| R26 | [WRAP-33](https://wrapgo.atlassian.net/browse/WRAP-33) | Validate telemetry quality before earnings | New child under existing epic |
| R27 | [WEB-20](https://wrapgo.atlassian.net/browse/WEB-20) | Validate tracking on physical iOS and Android devices | Existing issue supplemented |
| R28 | [WEB-66](https://wrapgo.atlassian.net/browse/WEB-66) | Implement advertiser campaign lifecycle and funding rules | New child under existing epic |
| R29 | [WEB-67](https://wrapgo.atlassian.net/browse/WEB-67) | Resolve 2-day invoice expiry against bank transfer latency | New child under existing epic |
| R30 | [WEB-68](https://wrapgo.atlassian.net/browse/WEB-68) | Integrate verified funding and bank reconciliation | New child under existing epic |
| R31 | [WEB-53](https://wrapgo.atlassian.net/browse/WEB-53) | Expose defensible advertiser performance reporting | Existing issue supplemented |
| R32 | [WRAP-34](https://wrapgo.atlassian.net/browse/WRAP-34) | Implement balanced immutable money ledger | New child under existing epic |
| R33 | [WRAP-35](https://wrapgo.atlassian.net/browse/WRAP-35) | Approve earnings formula and exceptions | New child under existing epic |
| R34 | [WRAP-36](https://wrapgo.atlassian.net/browse/WRAP-36) | Close performance periods and accrue earnings | New child under existing epic |
| R35 | [WRAP-37](https://wrapgo.atlassian.net/browse/WRAP-37) | Execute weekly payouts with safe retry and reconciliation | New child under existing epic |
| R36 | [WEB-69](https://wrapgo.atlassian.net/browse/WEB-69) | Produce invoice and payout detail with driver mapping | New child under existing epic |
| R37 | [WEB-70](https://wrapgo.atlassian.net/browse/WEB-70) | Implement disputes, reversals and reconciliation exception queue | New child under existing epic |
| R38 | [WEB-71](https://wrapgo.atlassian.net/browse/WEB-71) | Build agreed fleet dashboard against real data | New child under existing epic |
| R39 | [WEB-72](https://wrapgo.atlassian.net/browse/WEB-72) | Deliver contract loadboard and My Contracts | New child under existing epic |
| R40 | [WEB-73](https://wrapgo.atlassian.net/browse/WEB-73) | Deliver billing and account-security workspace | New child under existing epic |
| R41 | [WEB-34](https://wrapgo.atlassian.net/browse/WEB-34) | Complete EN/RU/AM localization and accessibility | Existing issue supplemented |
| R42 | [WEB-74](https://wrapgo.atlassian.net/browse/WEB-74) | Version complete database schema and migration workflow | New child under existing epic |
| R43 | [WRAP-38](https://wrapgo.atlassian.net/browse/WRAP-38) | Create automated CI and critical regression coverage | New child under existing epic |
| R44 | [WEB-75](https://wrapgo.atlassian.net/browse/WEB-75) | Prove backups, restoration and sensitive-data retention | New child under existing epic |
| R45 | [WEB-76](https://wrapgo.atlassian.net/browse/WEB-76) | Deploy operational approval, support and audit tools | New child under existing epic |
| R46 | [WEB-77](https://wrapgo.atlassian.net/browse/WEB-77) | Instrument reliability and production response | New child under existing epic |
| R47 | [WEB-78](https://wrapgo.atlassian.net/browse/WEB-78) | Validate Armenia operating and data obligations | New child under existing epic |
| R48 | [WEB-79](https://wrapgo.atlassian.net/browse/WEB-79) | Run controlled end-to-end pilot and release gate | New child under existing epic |
| F01 | [WEB-80](https://wrapgo.atlassian.net/browse/WEB-80) | Replace raw card and CVV database writes with tokenized payout methods | New source-confirmed web bug |
| F02 | [WEB-81](https://wrapgo.atlassian.net/browse/WEB-81) | Replace client withdrawal balance mutation with atomic ledger command | New source-confirmed web bug |
| F03 | [WEB-82](https://wrapgo.atlassian.net/browse/WEB-82) | Enforce server-verified step-up and new-address ownership for email changes | New source-confirmed web bug |
| F04 | [WEB-83](https://wrapgo.atlassian.net/browse/WEB-83) | Authorize and rate-limit invitation delivery; escape template input | New source-confirmed web bug |

## Epic grouping

| Review topic | Existing Jira epic |
| --- | --- |
| E01 | [WEB-37](https://wrapgo.atlassian.net/browse/WEB-37) |
| E02 | [WEB-37](https://wrapgo.atlassian.net/browse/WEB-37) |
| E03 | [WEB-22](https://wrapgo.atlassian.net/browse/WEB-22) |
| E04 | [WRAP-17](https://wrapgo.atlassian.net/browse/WRAP-17) |
| E05 | [WRAP-14](https://wrapgo.atlassian.net/browse/WRAP-14) |
| E06 | [WEB-49](https://wrapgo.atlassian.net/browse/WEB-49) |
| E07 | [WRAP-13](https://wrapgo.atlassian.net/browse/WRAP-13) |
| E08 | [WEB-22](https://wrapgo.atlassian.net/browse/WEB-22) |
| E09 | [WEB-50](https://wrapgo.atlassian.net/browse/WEB-50) |

Overrides in backlog map more specific work to existing Mobile Contract/Auth/Verification/Release, Admin or Advertiser epics. No existing issue was moved or closed. See backlog.json for final dependency keys.
