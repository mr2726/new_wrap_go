# Telemetry, Geofencing & Anti-fraud Specification

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner with product measurement decisions.

## Objective and evidence
Trustworthy delivery requires replayable observations, approved eligibility and quality rules. Current mobile uploads latest-per-email points and writes client-computed totals; batchHours is added to zonehourse without polygon input; weekly history probe loses a prior closed week. Work: WRAP-29…33, WEB-20, WEB-55.

## Pipeline contract
Collect only under disclosed eligible session → durable queue → authenticated bounded batch ingest → immutable raw event store → per-event quality decision → assignment/zone/schedule evaluation → versioned period aggregate → explainable earning input and privacy-safe reporting projection. Latest-location cache is separate from history and is not settlement evidence.

| Stage | Required rules | Failure behavior |
| --- | --- | --- |
| Collect | Timestamp, coordinate range, accuracy, source/mock indicator and event ID; explicit permission/session state | Visible permission/offline state, no fabricated points |
| Queue | Persist unique events; account/session isolation; retain during transient failure | Delete only acknowledged IDs; concurrent enqueue cannot be overwritten |
| Ingest | Auth-derived driver and assignment; bounds, quotas, duplicate handling, received_at | Per-event reason; avoid whole-batch blind replay |
| Validate | Accuracy, impossible jumps/speed, mocked signals, timestamp skew/gaps | Quarantine for explainable review; no automatic fraud accusation from one weak signal |
| Geofence | Versioned polygon and campaign schedule; defined boundary and stationary-time rules | Outside-zone activity never counts as zone hours |
| Aggregate | Split crossings/periods; approved timezone; late data and corrections | Reproduce by algorithm/input revision; no paid-history overwrite |

## Measurement decisions required
WEB-59/WRAP-35 approve sampling, coverage/accuracy thresholds, eligible stationary/driving time, segment gap cutoff, boundary interpolation, week cutoff and late-data window. Do not assume current UTC-Monday or 10 km/h client rule is approved. Store observed time and received time separately. GPS signal quality is uncertain; report missing/estimated coverage explicitly.

## Anti-fraud and disputes
Use multiple signals and audit rule version, raw reference and reviewer reason. Hold disputed earning line rather than rewrite history; permit correction/appeal. Server rejects authoritative client totals even if client code appears correct. Any manual override records actor, reason, affected period and linked adjustment.

## Device and data verification
Reference-route tests on supported physical iOS/Android devices: background/screen-off, low power, restart, permissions, offline queue, multi-device/concurrent upload and account switching. Data tests: same ID duplicate, replay after partial failure, Sunday/Monday, multiple missed weeks, out-of-order/future points, polygon crossings, poor accuracy and spoof/jump scenarios. Compare completeness, distance error, freshness and incremental battery impact to targets approved before pilot. Raw location access is restricted; advertiser projections exclude residential starts.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

