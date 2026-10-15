# WrapGo architecture and delivery review

15 October 2026 · GitHub-based assessment · Owner roles require team confirmation

**Decision:** prepare a capped private pilot after trusted activation, measurement and money gates pass. The code supports substantial workflows, but inspected sources do not establish safe real-money operation.

## Read in this order

1. [Evidence and findings](evidence.md) — source snapshots, confirmed behavior and limits.
2. [MAVI maturity and impact matrix](mavi.md) — capability maturity, business value and priorities.
3. [SWOT and strategic responses](swot.md).
4. [Fishbone diagram](fishbone.svg) — causes of unproven reliable campaign settlement.
5. [Architecture and workflow diagrams](diagrams.md) — current and proposed systems, data and lifecycles.
6. [Risk, FMEA and threat model](risk.md).
7. [Delivery, RACI and release gates](delivery.md).
8. [Full baseline review](baseline-review.md) — 48 detailed draft work items; use live Jira mapping for actual keys.
9. [Jira traceability](jira-map.md) and [machine-readable backlog](backlog.json).

MAVI means **maturity and impact**, confirmed by the user for this review; it is a project-specific rubric, not a claimed industry-standard acronym. Strategic market opportunities below are hypotheses requiring validation. Diagrams labelled proposed must not be mistaken for deployed behavior.

Code changes are isolated in a mobile bugfix PR; this branch holds the shared architecture/PM documentation. No production deployment or schema mutation is performed. Review status does not mean a feature is operationally accepted.
