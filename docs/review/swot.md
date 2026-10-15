# SWOT and TOWS strategy

Strengths/weaknesses are grounded in project/code evidence. Opportunities/threats are explicit business hypotheses; no market-size, competitor-share or legal conclusion is asserted.

| Strengths | Weaknesses |
| --- | --- |
| One marketplace model spans advertiser, fleet and mobile driver operations | Invitation, assignment, approval and finance authority is spread through clients |
| Existing web/mobile code, Supabase Auth/data integration, live maps and localization assets | Financial/card-data boundary and tracking aggregates require redesign |
| Clear fleet simplicity and brand constraints reduce UI ambiguity | Payout beneficiary and schedule conflict across requirements and implementation |
| Concrete Jira backlog and contract date business rules already exist | Repository status and Jira completion lack deployed acceptance evidence |

| Opportunities — hypotheses to test | Threats — scenarios to prepare for |
| --- | --- |
| A small Yerevan fleet pilot may validate reliable delivery and repeat advertiser demand | Spoofed or missing GPS can undermine advertiser trust and earnings fairness |
| Fleet partnerships may lower vehicle acquisition/installation coordination cost | Driver churn, vehicle reassignment or wrap damage can interrupt campaigns |
| Credible zone delivery reports may differentiate the service | Misleading impression estimates may create disputes |
| EN/RU/AM flows may improve onboarding for launch audiences | Bank latency, chargebacks and reconciliation errors may block payouts |
| Grouped payouts and operational tooling may reduce manual workload | Privacy/security incidents or unresolved operating obligations may delay release |

## TOWS: convert analysis into experiments

| Strategy | Concrete action | Measure / evidence | Owner role |
| --- | --- | --- | --- |
| Strength + Opportunity | Run capped Yerevan campaign with existing fleet/mobile surfaces | Activation completion, verified eligible hours, advertiser repeat intent | Product + Operations |
| Weakness + Opportunity | Use pilot to validate one beneficiary model and one earnings formula | Fully reconciled period close and payout; explainable driver statement | Finance + Backend |
| Strength + Threat | Show measured distance/zone coverage with quality and freshness indicators | Disputes resolved using replayable evidence; no unlabeled impression claim | Data + Product |
| Weakness + Threat | Close card/identity/control gaps before accepting live money/evidence | Authorization tests, tokenization and restore drill | Security + Engineering |

## Demand and unit-economics evidence plan

Do not assume software completion proves commercial viability. Interview pilot advertisers/fleets about campaign fit, installation burden, statement clarity and willingness to repeat. Track actual signed pilot intent separately from interest.

Per-campaign contribution = collected campaign revenue − driver/fleet earnings − printing/installation/removal allocation − bank/processing cost − incremental support/fraud/refund cost. Track tax treatment only after qualified confirmation; no assumed rates. Measure cash timing separately from margin: advertiser settlement, reserved earnings and payout dates can create a funding gap even for a profitable campaign.

Sensitivity scenarios: underfilled vehicle slots; delayed installation; lower eligible zone hours; one failed payout; disputed delivery; higher support time. Use actual pilot inputs and report ranges, not invented market figures. Go/no-go requires a named business owner to approve contribution and maximum cash exposure.
