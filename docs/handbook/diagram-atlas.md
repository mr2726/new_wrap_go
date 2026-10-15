# Architecture & Workflow Diagram Atlas

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner.

## Diagram inventory and status
Current/source-derived and proposed architecture are distinct. Canonical Mermaid and rendered fishbone live in GitHub review; they are linked here rather than stored as unsupported Confluence macro text. Logical ERD is not deployed DDL. Read accompanying evidence before using a diagram for implementation.

| Diagram | Purpose | Status |
| --- | --- | --- |
| System context | Advertiser/fleet/driver/operations/bank/install roles | Product scope |
| Application containers | React web/Expo mobile → Supabase auth/data/storage/functions and messaging paths | Source-derived; runtime policies unknown |
| Authoritative backend | Commands, transaction/outbox, bank adapters, immutable telemetry and projections | Proposed |
| Assignment ER model | Fleet/vehicle/driver/contract/consent/evidence relationships | Proposed logical |
| Settlement lineage ER model | Event → period → earning → ledger → payout allocation | Proposed logical |
| Assignment states | Reservation, driver prerequisites, evidence review, active/pause/completion | Proposed, date rules preserved |
| Redemption sequence | Authorized atomic claim and conflict handling | Proposed |
| Payout uncertainty states | Failed vs unknown vs settled, reconciliation before retry | Proposed |
| Release/environment flow | Branch/checks/staging/evidence/gate/controlled release | Target, not existing CI claim |
| Dependency gates | Decisions/trust/measurement/money/recovery to private pilot | Planning |
| Driver journey | Bind/check/consent/install/photo/activity/statement/dispute | Product requirement |
| Financial exception sequence | Verified callback, deduplicated posting, owned mismatch | Proposed |
| Fishbone | Six cause families of unproven settlement trust | Evidence-linked risk analysis |

Mermaid source and descriptions: https://github.com/mr2726/new_wrap_go/blob/feature/architecture-pm-review/docs/review/diagrams.md

Fishbone source: https://github.com/mr2726/new_wrap_go/blob/feature/architecture-pm-review/docs/review/fishbone.svg

Current-state evidence: https://github.com/mr2726/new_wrap_go/blob/feature/architecture-pm-review/docs/review/evidence.md

Use precise dataflow/state/sequence diagrams for engineering decisions; SWOT/MAVI and fishbone explain prioritization rather than deployed behavior. Add a new diagram only when it resolves a specific reader question and reflects approved/observed facts.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

