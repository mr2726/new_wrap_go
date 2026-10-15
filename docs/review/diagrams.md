# Architecture and delivery diagrams

Each diagram has a single purpose. “Observed” is source behavior at pinned snapshots; runtime configuration is unverified. “Proposed” requires implementation and review. Fishbone is rendered separately as [SVG](fishbone.svg).

## 1. System context — product scope

```mermaid
flowchart TB
  A[Advertiser] --> W[Advertiser web]
  F[Fleet owner] --> V[Fleet web]
  D[Driver] --> M[Mobile app]
  W --> P[WrapGo platform]
  V --> P
  M --> P
  O[Operations] --> P
  P --> B[Bank partner]
  P --> I[Wrap installer]
```

## 2. Observed application containers and trust boundaries

```mermaid
flowchart TB
  subgraph Untrusted_clients[Client boundary]
    W[React web]
    M[Expo mobile]
  end
  subgraph Backend[Supabase boundary]
    A[Auth and MFA]
    DB[Database and Realtime]
    S[Object storage]
    E[Edge functions]
  end
  W --> A
  M --> A
  W --> DB
  M --> DB
  W --> S
  M --> S
  W --> E
  M --> E
  E --> DB
  E --> N[Email and messaging providers]
  M -. client Telegram path .-> N
```

Authorization inside DB/storage and deployed function config remain unknown. Bank processing is not shown as an observed connected container because it was not verified.

## 3. Proposed authoritative backend

```mermaid
flowchart TB
  C[Authorized clients] --> Q[Validated server commands]
  Q --> T[Transactional domain state]
  T --> J[Outbox and jobs]
  J --> B[Bank and messaging adapters]
  B --> R[Verified callbacks and reconciliation]
  R --> T
  C --> L[Telemetry ingestion]
  L --> E[Immutable events]
  E --> G[Versioned zone aggregation]
  G --> T
  T --> P[Scoped read projections]
  P --> C
```

## 4. Proposed logical assignment model

```mermaid
erDiagram
  FLEET ||--o{ VEHICLE : owns
  VEHICLE ||--o{ ASSIGNMENT : has_history
  DRIVER ||--o{ ASSIGNMENT : participates
  CONTRACT ||--o{ ASSIGNMENT : governs
  CAMPAIGN ||--o{ CONTRACT : offers
  ASSIGNMENT ||--o{ CONSENT : records
  ASSIGNMENT ||--o{ EVIDENCE : submits
```

Stable UUID relationships replace using a temporary invite code as vehicle identity. Uniqueness constraints prevent prohibited overlapping assignments. Tenant memberships and authorization tables are omitted from this focused view.

## 5. Proposed measurement and settlement lineage

```mermaid
erDiagram
  ASSIGNMENT ||--o{ LOCATION_EVENT : receives
  ZONE_VERSION ||--o{ PERIOD_AGGREGATE : defines
  ASSIGNMENT ||--o{ PERIOD_AGGREGATE : measures
  PERIOD_AGGREGATE ||--o{ EARNING_LINE : supports
  EARNING_LINE ||--o{ LEDGER_POSTING : posts
  PAYOUT_BATCH ||--o{ PAYOUT_LINE : contains
  EARNING_LINE ||--o{ PAYOUT_LINE : allocated_to
  PAYOUT_LINE ||--o{ BANK_TRANSFER : settles
```

Allocation and retry cardinalities need schema review; business keys prevent paying an earning twice. Raw events plus aggregation rule/version must reproduce each earning line.

## 6. Proposed assignment lifecycle

```mermaid
stateDiagram-v2
  [*] --> Reserved
  Reserved --> AwaitingDriver
  Reserved --> Expired
  AwaitingDriver --> PrerequisitesPending
  AwaitingDriver --> Cancelled
  PrerequisitesPending --> EvidenceReview
  EvidenceReview --> CorrectionRequired
  CorrectionRequired --> EvidenceReview
  EvidenceReview --> Active: all gates pass
  Active --> Paused
  Paused --> Active: revalidated
  Active --> Completed
  Completed --> [*]
```

Driver consent, identity check, installation and funding are separate prerequisite records. The diagram does not imply photo submission is consent or that a fleet owner can approve for a driver.

## 7. Proposed redemption sequence and race handling

```mermaid
sequenceDiagram
  participant D as Driver app
  participant API as Command API
  participant DB as Database
  participant O as Outbox
  D->>API: Redeem code with idempotency key
  API->>API: Authenticate and rate limit
  API->>DB: Begin transaction; lock invitation
  DB-->>API: Invitation and assignment eligibility
  alt Valid unused invitation
    API->>DB: Bind stable IDs; consume code; write event
    API->>O: Persist notification in same transaction
    DB-->>API: Commit
    API-->>D: Pending verification and consent
  else Expired, used or conflicting
    API-->>D: Safe rejection; no partial binding
  end
```

Outbox write is part of the same database transaction; O is a logical table/queue, not a separate transaction coordinator.

## 8. Proposed payout uncertainty handling

```mermaid
stateDiagram-v2
  [*] --> Calculated
  Calculated --> Approved
  Approved --> Submitted
  Submitted --> Processing
  Submitted --> Unknown: timeout
  Processing --> Settled
  Processing --> Failed
  Unknown --> Settled: bank reconciliation
  Unknown --> Failed: confirmed failure
  Failed --> Approved: authorized retry
  Settled --> [*]
```

Never retry an unknown bank result as a new payment without reconciliation. A settled payment correction is a linked reversal/adjustment, not history mutation.

## 9. Proposed release and environment separation

```mermaid
flowchart TB
  BR[Task branch] --> PR[Reviewed pull request]
  PR --> CI[Required checks]
  CI --> ST[Isolated staging]
  ST --> U[QA and finance evidence]
  U --> G{Release gate passed}
  G -->|yes| P[Controlled production release]
  G -->|no| BR
  P --> M[Monitor and reconcile]
  M --> RB[Rollback or forward recovery]
```

This is a target, not a claim that required branch checks or automated deployment exist. A public audience change remains a separate explicit product/user decision.

## 10. Delivery dependency gates

```mermaid
flowchart TB
  D[Scope and funds-flow decisions] --> A[Atomic activation]
  D --> L[Ledger and bank adapter]
  S[Isolation and private evidence] --> A
  S --> T[Trusted telemetry]
  T --> E[Validated period earnings]
  E --> L
  A --> P[Private pilot gate]
  L --> P
  R[Restore and operational proof] --> P
  P --> G[Launch decision]
```

## 11. Driver journey with recovery branches

```mermaid
flowchart TB
  J[Account and fleet code] --> V[Verification and consent]
  V --> I[Installation appointment]
  I --> P[Photo review]
  P -->|approved| A[Active campaign]
  P -->|rejected with reason| C[Correct evidence]
  C --> P
  A --> D[Deliver eligible activity]
  D --> S[Period statement]
  S -->|disputed| Q[Operational review]
  Q --> S
```

## 12. Financial exception sequence — proposed

```mermaid
sequenceDiagram
  participant Bank
  participant Adapter
  participant Ledger
  participant Ops
  Bank->>Adapter: Settlement callback
  Adapter->>Adapter: Authenticate; deduplicate provider event
  Adapter->>Ledger: Post balanced settlement once
  alt Reconciliation mismatch
    Adapter->>Ops: Create owned exception with references
    Ops->>Ledger: Approve linked adjustment with reason
  else Match
    Ledger-->>Adapter: Reconciled
  end
```
