# Security, Access Control & Privacy Engineering

Status: In review — proposed/requirements baseline, not production approval. Updated: 15 October 2026. Accountable role: Technical owner; product accountable for policy.

## Classification and current gaps
Restricted: identity/registration/selfies, precise location, session credentials and payment-provider secrets. Confidential: contracts, tenant operational data and financial statements. Public: approved marketing assets. Existing source generates public document URLs and writes raw card/CVV fields; live bucket/data state is not inspected. Block paid/sensitive-data pilot until WEB-38, WEB-62 and WEB-80…83 are resolved or disproven with evidence.

## Authorization matrix — required behavior
| Actor | Allowed | Denied |
| --- | --- | --- |
| Anonymous | Approved marketing, auth entry points; bounded public contact form | Tenant tables, documents, invites, financial/location data |
| Driver | Own profile, own assigned contract/evidence, permitted tracking and consent | Other driver/fleet data, reviewer decision, authoritative totals, ledger |
| Fleet owner | Own vehicles, eligible booking, authorized drivers and settlement detail | Other fleet assets; approving as driver; raw identity evidence beyond verified need; balance mutation |
| Advertiser | Own campaigns/invoices and approved aggregate delivery views | Driver identity documents, home coordinates, other advertiser data |
| Reviewer/support | Assigned operational queues within role | Unrestricted finance changes or bulk sensitive-data export |
| Finance | Beneficiary/method review, approved postings/transfers, reconciliation | Editing immutable ledger history or reading unnecessary identity/location data |
| Service/job | Minimum tables/commands needed for task | General-purpose client access using privileged credentials |

## Mandatory controls
RLS and grants on every exposed table; storage ownership policies; private evidence and expiring access; role/tenant checks in every privileged command. Verify both read and write and metadata/list access. Client filters do not authorize. Require MFA for privileged operations and suitable step-up for payout-method/email changes; server verifies proof bound to operation and intended address. Keep service keys/bot/bank secrets only in server-managed secret stores; rotate based on observed exposure, without printing them.

Raw card/CVV must not enter app database/log/analytics paths; use bank/provider-hosted tokenization and safe token metadata. Review historical data safely under security ownership. Invite delivery must derive code/recipient from an authorized record, rate-limit abuse and escape template input. Validate file size/type/content, avoid executable upload rendering and use evidence checksums/versioning.

## Privacy implementation and deletion
Existing project privacy text references location up to 24 months, analytics up to 36 months, financial data up to seven years and non-financial deletion within 30 days. These are recorded project commitments, not verified legal minima or implemented controls. WEB-78 must reconcile applicability and final policy; WEB-75 must demonstrate retention/deletion/backup behavior. Maintain retention by data class, legal hold, deletion status and audit evidence. Driver deletion detaches fleet assets; it does not erase fleet vehicles or needed finance/consent history. Stop tracking on eligible-session end or permission revocation; advertiser views mask home start points.

## Abuse and incident response
Use STRIDE scenarios from GitHub review: identity spoofing, client tampering, repudiated consent, document/card disclosure, invite spam and privileged email bypass. Add server-enforced quotas, suspicious-event quarantine, security audit and owned exception queue. For suspected exposure: restrict offending path, preserve evidence safely, rotate proven-exposed credentials, notify responsible owner and follow approved incident/notification procedure; do not publish unverified incident claims.

Evidence: synthetic cross-tenant test matrix, policy export, private-link expiry test, direct function-invocation checks, forbidden-field rejection, log redaction and restore/deletion drill. No compliance certification is made by this document.

Documentation hub: https://wrapgo.atlassian.net/wiki/spaces/W/pages/27951108

