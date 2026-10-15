# Data Model, Dictionary & Migration Design

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner.

## Observed schema references
Source-defined queries reference profiles, fleets, drivers, vehicles, campaigns, fleet_signed_contracts, driver_location_updates, invoices, transfers, bankdata, analitics, active_zone, tasks and wrap_services. This inventory describes code references, not a verified full deployed schema. Complete DDL/FKs/RLS/grants/triggers are required in WEB-74 and WEB-38.

| Existing record | Observed identifiers / fields | Risk / proposed migration |
| --- | --- | --- |
| profiles / fleets | userid, email, company data; fleet balance | Stable auth/organization links; balance becomes ledger projection |
| drivers | userid, email, carid, contractid, active_contract_id, totals/weeklyStat | carid currently holds invite code; separate stable vehicle/assignment identity; aggregate fields server-owned |
| vehicles | id, fleetownerid, invite_code, signeddriveremail, evidence URLs | Temporary code is not vehicle identity; preserve vehicle on driver deletion |
| campaigns | id, ownerid, duration, original/effective/actual-wrap timestamps | Version booked terms and explicit date-change events; avoid global campaign date changing unrelated assignments |
| fleet_signed_contracts | contract_id, fleet_id, driver_email, signed_at, status | Distinguish reservation, assignment, driver consent and review timestamps |
| driver_location_updates | latest row per driver_email, coordinates/payload | Separate latest view from immutable raw event history |
| invoices / transfers | owner, amount, status, references | Unique business/provider IDs; balanced immutable postings |
| bankdata | application card fields in current writes | Replace raw PAN/CVV with provider token and display-safe metadata |

## Proposed logical dictionary
| Entity | Key fields | Invariants |
| --- | --- | --- |
| organization / membership | organization_id, user_id, role, active | Tenant ownership derives from authenticated membership |
| assignment | assignment_id, vehicle_id, driver_id, contract_version_id, valid_from/to | No prohibited overlap; historic attribution survives replacement |
| invitation / reservation | id, code_verifier, expires_at, consumed_at, vehicle/contract IDs | Single-use, bounded lifetime, atomic capacity and redemption |
| consent | id, assignment_id, actor_user_id, terms_version/hash, accepted_at | Driver is actual actor; append-only audit |
| evidence / review | id, assignment_id, object_key, checksum, submitted_at, reviewer, decision/reason | Versioned private objects; submission cannot imply approval |
| location_event | event_id, user/assignment IDs, observed_at, received_at, coordinates, accuracy, source | Unique event; authenticated identity; accepted/quarantined reason retained |
| period_aggregate | assignment_id, period, zone_version, algorithm_version, revision | Replayable validated inputs; closed period corrected by revision |
| earning_line | id, beneficiary_id, assignment_id, period, formula_version, amount_minor, currency | Explainable input lineage; no double allocation |
| ledger_posting | entry_id, account_id, amount_minor, currency, business_key, reversal_of | Sum zero per balanced entry/currency; no mutable paid history |
| payout / bank_event | transfer_id, earning allocation, provider_ref, status, idempotency_key | Unknown result cannot be retried as a new payment blindly |

## Constraints and compatibility
Use stable UUID relationships and explicit foreign keys after schema confirmation. Store instants in UTC, plus approved business timezone/period semantics. Store money as integer minor units with currency, never float totals from browsers. Validate coordinate ranges, timestamps, payload sizes, state enum and transition ownership. Preserve legacy typo fields (e.g. zonehourse) through a controlled compatibility mapping rather than a breaking rename without migration.

## Migration and restore procedure
Inventory deployed schema → capture versioned migrations/policies → test clean staging → backfill stable IDs with reconciled counts → dual-read compatibility if needed → restrict privileged client writes → verify old supported mobile versions → staged rollout. Take database/object evidence backups first; test restore. Destructive location deduplication SQL must not be reapplied to an event-history table. Rollback/forward recovery must preserve financial and consent audit history.

ER diagrams and source lineage: GitHub docs/review/diagrams.md. Live ERD must be regenerated from deployed DDL after WEB-74; this logical model is proposed.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

