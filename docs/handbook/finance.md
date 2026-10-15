# Funding, Ledger, Earnings & Settlement Specification

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Product owner and finance decision owner.

## Operating-model decision
Weekly payouts are an existing requirement, but WRAP-13 direct-driver scope, mobile fleet-managed payment notice and web withdrawal UX conflict. WEB-58 must approve beneficiary, creditor/debtor relationship, cutoff/day, fees and schedule before processing. Do not operate weekly and on-demand payout as two uncoordinated channels.

## Funding and invoice rules
Separate advertiser balance top-up, campaign budget reservation and campaign invoice. Existing campaign invoice deadline is two days; 24–48h transfer timing can overlap it. WEB-67 defines pending settlement, exact deadline timezone, late/partial/overpayment, expiry race and refund/credit behavior. Bank completion is established by verified settlement/reconciliation, not browser success. Signed provider contract/specification and sandbox proof are required in WEB-68.

## Ledger invariants
Money is integer minor units plus currency. Balanced entries sum to zero by currency and link business command, provider/event reference and source record. Separate collected funds, available/reserved campaign budget, accrued earnings, beneficiary payable, in-flight payout, settled and adjustment states. Client balance is a read projection; it cannot mutate authority. One idempotency/business key per effect; corrections create linked reversals/adjustments. Exact chart of accounts and fund custody treatment require finance approval.

## Earnings and statements
WRAP-35 approves versioned formula for mileage/zone-time eligibility, partial periods, caps, missed checks, pause, replacement and dispute deductions. Store raw/aggregate references, period, algorithm/formula version, gross/deductions/net and beneficiary. Close period with owned review; late data changes a revision/adjustment, never silently changes paid totals. A grouped payout lists every covered campaign, contract, vehicle, driver and earning line.

## Payout lifecycle and exceptions
Calculated → approved → submitted → processing → settled/failed/unknown. Timeout means unknown until bank lookup/reconciliation, not permission to pay again. Retry only confirmed failed transfers with idempotency rules; partial batch completion leaves successful lines untouched. Payment method must be verified and tokenized; raw card/CVV storage path is blocked by WEB-80. WEB-81 replaces client balance update + insert + rollback with server transaction.

## Financial controls and acceptance
| Control | Verification | Jira |
| --- | --- | --- |
| No overspend/double payout | Parallel withdrawal and repeated callback/timeout tests | WRAP-34, WRAP-37, WEB-81 |
| Explainable allocation | Statement lines sum to ledger and beneficiary batch | WRAP-36, WEB-69 |
| Complete settlement | Daily provider/bank reconciliation; every difference assigned | WEB-68, WEB-70 |
| Safe correction | Approved linked reversal; reason and independent review of sensitive adjustment | WEB-70 |
| Funded delivery | Reservation/activation cannot exceed approved funded eligibility | WEB-64, WEB-66 |

Pilot gate: all pilot monetary entries reconcile, no unresolved unknown result or unowned variance, approved beneficiary/formula and tested reversal/dispute flow. This design does not establish bank certification or final accounting/legal treatment.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

