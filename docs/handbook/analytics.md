# Analytics, KPI Dictionary & Measurement Plan

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner with technical measurement owner.

## Measurement boundaries
Distance and eligible zone hours are measured from accepted telemetry with known quality limitations. Impressions and CPM are estimates until methodology/input validation supports a claim. Cross-channel attribution is future/proposed unless implemented and verified. No market-size/ROI claim is inferred from code or diagrams.

| Metric | Definition / unit | Source and caveat |
| --- | --- | --- |
| Active assignment | Assignment passing funding/consent/evidence/period gates at observation time | Server lifecycle; never inferred from client status text alone |
| Verified distance | Sum eligible accepted segments, km, under versioned rules | Raw event/quality lineage; gaps explicitly flagged |
| Zone hours | Eligible time inside approved campaign polygon and schedule, hours | Boundary/stationary/timezone rules must be approved |
| Tracking freshness | Now minus last accepted observed/received time, separately | Offline/out-of-order data distinguish stale observation from upload delay |
| Activation lead time | Reserved_at to activated_at, duration | Segment by verification/install delay |
| Earned / payable / paid | Distinct ledger-derived amounts by currency/period | Never sum different financial states as one balance |
| Estimated impressions | Versioned model using approved traffic/visibility inputs | Model source/uncertainty/date shown; no fabricated live data |
| Estimated CPM | Approved cost basis ÷ estimated impressions ×1000 | Handle zero/unknown impressions as unavailable; state cost/currency basis |
| Reconciliation variance | Ledger/provider difference by reference/currency | Every nonzero variance assigned; not hidden by netting |
| Pilot contribution | Collected revenue less attributable earnings/installation/processing/support/refund cost | Finance approves inputs and cash exposure separately |

## Product analytics event catalog — proposed
CampaignDrafted, FundingConfirmed, ReservationCreated/Expired, InvitationIssued/Redeemed, VerificationSubmitted/Rejected, DriverAccepted, InstallationCompleted, EvidenceReviewed, AssignmentActivated/Paused, TrackingPermissionChanged, TelemetryBatchAcknowledged, PeriodStatementViewed, PayoutSettled, DisputeOpened/Resolved. Define schema/version and minimum fields: event ID/time, tenant/entity surrogate, release and correlation; do not include codes, documents, credentials, raw card details or residential coordinates in general analytics.

## Pilot validation
Product approves target counts, conversion/freshness/route/battery/support thresholds in WEB-59. Collect baseline by campaign/release/period; display sample size, missing data and estimate flags. Confirm advertiser repeat intent separately from clicks or survey interest. Dataset/query/model changes require decision and recomputation policy. WEB-53/55, WRAP-29…33 and WEB-77 implement this plan.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

