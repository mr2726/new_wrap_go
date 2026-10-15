# Integration Catalog & Ownership

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner.

## Observed versus proposed integrations
| Service | Source evidence / status | Responsibility / verification |
| --- | --- | --- |
| Supabase Auth/Database/Storage/Realtime | Both repositories use clients; MFA flow exists on web | Export deployed projects/schema/policies; confirm staging isolation and secrets ownership |
| Expo native services | Mobile SDK54, location/task/camera/image libraries | Supported-device build/permission and background QA |
| Mapbox | Web Mapbox GL; mobile map libraries referenced | Confirm token scope, map style, license/usage, coordinate privacy and billing owner |
| Resend | send-invite-code function | Server auth/fleet ownership, quota, HTML escaping, delivery retry; WEB-83 |
| Telegram | Server contact function and mobile service-visit sender pattern | Move all secrets/server delivery behind authorized jobs; WRAP-22 |
| Bank/IDBank direction | Partnership/funds-flow requirement; production adapter not verified | Confirm official API, auth, idempotency, settlement, reversals, payout availability and sandbox; WEB-68 |
| Vercel | Web README/vercel.json | Actual production/staging project and deployed commit unverified; inventory WEB-57 |
| HubSpot / Make | Existing Confluence describes sales/automation direction | No inspected integration proof; keep proposed/deferred until owner/use case approved |
| Crash/monitoring/push | Jira/requirements mention capability | Provider configuration/deployed behavior not established; WEB-77/WRAP-38 |

## Integration contract checklist
For each enabled integration record: accountable owner, purpose, data fields/classification, environments, least-privilege scopes, secret storage/rotation, rate limits, timeout/retry semantics, callback validation, idempotency, cost driver, outage fallback, retention/subprocessor review and test evidence. Do not store actual tokens in this page. No provider name in policy proves a live integration.

## Resilience and test scenarios
Use sandbox/synthetic events; validate success, malformed/unauthorized request, rate limit, timeout, late and duplicate callback, changed schema/version, credentials expiry and prolonged outage. Outbound jobs carry correlation and business IDs. Operator can distinguish retryable outage from permanent rejection. Queue/dead-letter age is observable; no unbounded retries or silent data drops.

## Change control
Provider schema/version change → contract tests → staging → compatibility assessment for installed mobile versions → rollout/rollback decision. Bank field/signature algorithms must come from verified partner specification. Secrets are provisioned outside Git/Confluence/Jira through approved environment tooling.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

