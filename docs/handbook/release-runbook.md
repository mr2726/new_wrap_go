# Deployment, Rollback & Disaster Recovery Runbook

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner; product approves release.

## Scope and current limits
Web repo is mr2726/new_wrap_go; mobile repo reviewed is mr2726/new_wrapgo_app. Web uses CRA/react-scripts and Vercel config; mobile uses Expo SDK54/dev-client. Actual hosting/database environments, deployed commits, build profiles and protection checks are unverified. WEB-57 establishes inventory; WEB-74 versions full schema; WEB-75 proves restore.

## Environment register to complete before release
For local/staging/production record non-secret URL/project identity, source branch/commit, database project/region, migration version, object buckets, build artifact/version, integration sandbox/live mode, operator and rollback artifact. Use separate synthetic staging data and credentials. Never infer production readiness from a local .env or config filename; never publish secret values.

## Release checklist
1. Confirm scope, Jira acceptance and approved business decisions; capture current deployed commit/schema and baseline metrics.
2. Review task PR, run relevant regression/build/static/contract checks and confirm compatible installed mobile versions.
3. Apply migrations to isolated staging, backfill/reconcile and verify RLS/storage policies plus old/new-client behavior.
4. Exercise UAT and bank sandbox/restore cases relevant to change; attach evidence and product/finance approvals.
5. Back up database plus required evidence objects; verify restorable checkpoint and roll-forward/rollback procedure.
6. Deploy controlled version using the confirmed environment workflow. Record source commit, migration, artifact and release ID.
7. Smoke test sign-in/roles, booking/consent, uploads, location freshness and financial exceptions; reconcile pilot transactions.
8. Observe approved monitoring window; keep release open until product acceptance. Public access change requires explicit approval.

## Rollback triggers and actions
| Trigger | Immediate response | Recovery constraint |
| --- | --- | --- |
| Unauthorized access or sensitive leak | Restrict offending path and escalate security owner | Preserve evidence safely; do not circulate credentials/data |
| Duplicate/mismatched money state | Pause affected payout jobs; reconcile unknown provider results | Never reverse history by editing paid balances |
| Client/server incompatibility | Stop rollout; restore compatible application artifact | Database may require forward compatibility rather than destructive downgrade |
| Telemetry loss/quality regression | Flag impacted periods; preserve raw events and queue | Recompute via versioned correction; do not fabricate routes |

## Disaster recovery drill
Select approved backup point → restore DB into isolated project → restore private objects and policy/config dependencies → verify object references, consent/ledger lineage and authorization → reconcile provider state without re-sending payments → measure recovery point/time → record gaps, owner and next drill. RPO/RTO are open decisions until approved and measured. A database backup alone is not proof that identity/photo objects can be recovered.

## Commands and secrets
Use repository-defined commands only after dependencies/runtime are confirmed. Web scripts: npm run build and npm test. Mobile regression command in fix PR: npm run test:regressions; native build/device validation remains separate. Production migration/deploy commands belong in verified CI/environment configuration after inventory; this runbook intentionally does not invent a production shell command or include tokens.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

