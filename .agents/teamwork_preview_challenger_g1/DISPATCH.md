## 2026-08-23T14:12:39Z

You are Challenger 1 (Adversarial Stress Testing: Admin Governance, Campaigns, Audit Diffs & Concurrency).
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_challenger_g1

Read the authoritative user request at:
e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md

Your task:
1. Write and execute an empirical adversarial stress test suite in `tests/e2e/challenger1-governance-adversarial.test.js` targeting:
   - Marketing campaign budget boundary checks, CTR & ROI calculations, date validation, and status transitions.
   - Navigation item hierarchy nesting, circular parent avoidance, and sortOrder consistency.
   - Media asset MIME type filtering, search indexing, and reference tracking counters.
   - Product commercial update before/after diff structure verification in `AuditLog.metadataJson` (AC6).
   - Admin order carrier assignment (all 7 carriers including Trendyol Express), tracking code URLs, and status history progression (AC7).
   - Seller commission rate updates (%0 to %100 limits), suspensions, and verification badges (AC10).
2. Execute your adversarial test suite: `node tests/e2e/challenger1-governance-adversarial.test.js`.
3. Report pass/fail metrics, edge case evaluations, and deliver `handoff.md` with explicit verdict: `APPROVE` or `REQUEST_CHANGES`.
4. Send a message to the caller with your verdict and summary.
