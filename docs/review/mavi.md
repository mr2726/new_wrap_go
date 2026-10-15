# MAVI — maturity and impact matrix

User-confirmed interpretation: maturity and impact. Scores describe **evidence at inspected source snapshots**, not a percentage complete or compliance certification.

Maturity M: 1 = design/fragment; 2 = implemented path with material integrity gaps; 3 = integrated and automated tests; 4 = production operational evidence; 5 = measured and continuously improved. U = insufficient evidence, not zero. Value V and impact I are ordinal 1–5 judgments: V = business benefit; I = consequence if capability fails. Confidence H/M/L describes review evidence. Priority follows critical prerequisites and failure consequences, not false precision from multiplying ordinal numbers.

| Capability | M | V | I | Confidence | Evidence / gap | Target before paid pilot | Work |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Account sign-in and recovery | 2 | 5 | 5 | H | Supabase integrated; password rejection bug | Validated failure and recovery paths | R18, R10 |
| Tenant authorization | U | 5 | 5 | L | Direct client writes; live RLS unknown | Negative tests and grants export | R06 |
| Fleet invitation and binding | 2 | 5 | 5 | H | Client code generation and split writes | Atomic single-use authorized claim | R11 |
| Booking and driver approval | 2 | 5 | 5 | H | Assignment exists; acceptance conflated | Capacity and distinct consent proof | R12–R14 |
| Wrap review / installation | 2 | 5 | 4 | M | Photo and appointment paths exist | Reviewer, evidence and correction audit | R15, R20 |
| Background collection | 2 | 5 | 5 | M | Queue exists; WEB-20 open; device reliability unknown | Device evidence + durable events | R23, R27 |
| Zone and period measurement | 1 | 5 | 5 | H | Polygon absent from inspected stats; rollover defect | Reproducible authoritative period totals | R22–R26 |
| Advertiser campaign setup | 2 | 5 | 4 | M | Builder, invoices, dates; server invariants unverified | Funded campaign eligibility and expiry | R28–R30 |
| Card data boundary | 1 | 5 | 5 | H | PAN/CVV sent into database path | Provider tokenization; verify data disposition | F01 |
| Earnings and payout ledger | 1 | 5 | 5 | H | Client balance/transfer writes; bank evidence absent | Balanced ledger and reconciled sandbox run | R32–R37 |
| Analytics credibility | 2 | 4 | 4 | M | Reporting UI, mutable aggregate inputs | Quality/freshness and estimated-method labels | R31 |
| Fleet user experience | 2 | 4 | 3 | M | Dashboard/contracts/billing code exists | Agreed navigation and real-data UAT | R38–R41 |
| Operations and support | U | 5 | 5 | L | Jira scope; admin implementation not located | Attributable review and exception queues | R45 |
| Release and recovery | 1 | 5 | 5 | M | Sparse migrations; no CI workflow in inspected trees | Repeatable staging and restore proof | R42–R46 |

## Decision quadrants

| Priority group | Capabilities | Action |
| --- | --- | --- |
| High impact / low demonstrated maturity | Card-data boundary, binding, measurement, ledger, recovery | Address before real money or sensitive production intake |
| High impact / unknown maturity | RLS, operations/admin, deployed bank integration | Inspect and prove; unknown does not mean absent |
| Strong value / partial implementation | Campaign setup, contract UI, fleet dashboard | Integrate only after backend invariant gates |
| Optimization after trusted pilot | Advanced impressions, cross-channel attribution, expanded geography | Validate demand/methodology before investment |

No aggregate average is supplied: a high visual score cannot offset a critical money or privacy control. Re-score after each milestone using test reports and live operational evidence, with date and owner.
