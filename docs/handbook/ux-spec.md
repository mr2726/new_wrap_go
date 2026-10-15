# UX, Interaction, Localization & Content Specification

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner / design role.

## Fleet experience requirements
Dashboard/Contracts/Billing top navbar only; no sidebar, separate Drivers page or Vehicle navbar tab. Logo left, logout right, active tab green underline. Dark premium UI, #39FF14 sole accent, Lufga (confirm licensing/glyph coverage), ~18–20px rounded fleet cards, thin borders. Armenian/Russian fallback must be chosen/tested, not claimed missing from font without verification.

Dashboard KPIs: Total Vehicles, Total Drivers, Total Earnings, Total KM. Table: Vehicle, Contract (campaign name), Current Driver, Status, Weekly KM, Zone Hours, Action. All Drivers widget and Add Vehicle action. Do not reintroduce Active Zones KPI, daily budget or spend; monthly budget belongs to advertiser flow where appropriate.

## Core screen/interaction specification
| Surface | Primary actions | Required states |
| --- | --- | --- |
| Contract board | Search/filter, view campaign requirements/estimated earnings, choose eligible vehicle, reserve | Loading, empty, ineligible explanation, full capacity, expired hold, conflict, confirmed next step |
| Invite/bind | Show bounded code/copy, delivery status, driver verification and approval | Code expired/used/rate-limited, delivery failure, verification needed; no false binding on email send |
| Driver contract | View terms/period/earnings basis; explicit approve; submit photos; schedule visit | Awaiting driver, incomplete checks, rejected evidence with reason, active/paused/completed |
| Billing | Approved weekly/withdrawal model, methods, statement and invoice history | Verified/unverified method, pending/unknown/failed/settled payout; covered drivers/vehicles/period |
| Security/profile | Real session/MFA/password/email controls | Step-up required, validation failure, expired OTP, provider error, confirmed success only |
| Tracking | Permission/session/freshness state and recovery action | Offline queue, background issue, revoked permission, quality review; no invented progress |

## Language and content rules
EN/RU/AM for pilot flows; use one source key per message and test placeholders/plurals/date/currency. Keep “estimated impressions/earnings” labelled; do not promise verified attribution or guaranteed income. Distinguish invitation from bound assignment, uploaded from approved, submitted from paid and PR-tested from deployed. Errors provide safe reason and next action, never raw provider internals.

## Accessibility and responsive acceptance
Visible focus and keyboard actions, semantic labels/errors, readable contrast, touch targets, large text, screen-reader critical path, zoom/small-screen table resilience. Test long Armenian/Russian strings and fallback fonts. No color-only status; use text/icon. Loading prevents unsafe double-submit but backend still handles concurrency. Empty/cache/session states guide recovery rather than throw.

## Design-to-code acceptance
WEB-71/72/73 and WEB-34 hold implementation acceptance. Security styling must reflect functioning controls; sample charts/balances cannot appear as live measurements. Product signs off critical flows using actual supported browser/device and language evidence.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

