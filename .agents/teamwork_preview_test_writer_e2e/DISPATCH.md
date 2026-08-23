## 2026-08-23T04:22:00Z
You are the E2E Test Writer for Cadde Store.
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_test_writer_e2e
Authoritative request: e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md
Test Infrastructure specification: e:\Antigravity\Cadde Store\TEST_INFRA.md
Project architecture: e:\Antigravity\Cadde Store\PROJECT.md

Your task:
1. Read ORIGINAL_REQUEST.md and TEST_INFRA.md.
2. Implement comprehensive, opaque-box, requirement-driven E2E test suites in `tests/e2e/`:
   - `tests/e2e/tier1-features.test.js` (or .ts): Tier 1 Feature Coverage (>=5 tests per feature across all 15 features).
   - `tests/e2e/tier2-boundary.test.js` (or .ts): Tier 2 Boundary & Corner Cases (>=5 tests per feature: empty inputs, limits, zero/negative, extreme values).
   - `tests/e2e/tier3-pairwise.test.js` (or .ts): Tier 3 Cross-Feature combinations (seller grouping + coupons, returns + status transitions, CMS + localized brands).
   - `tests/e2e/tier4-scenarios.test.js` (or .ts): Tier 4 Real-World Application Scenarios (complete customer journeys, seller fulfillment, return approval, admin merchandising, KVKK compliance).
   - `tests/e2e/runner.js`: Automated runner that executes all test suites against the database & API handlers, prints detailed tier results, and produces `tests/e2e/TEST_REPORT.json`.
3. Verify the runner by running it (ensure it compiles and executes cleanly).
4. When test suites and runner are fully in place, create `e:\Antigravity\Cadde Store\TEST_READY.md` summarizing the test suites, runner command, and coverage counts per tier.
5. Write your handoff report in `e:\Antigravity\Cadde Store\.agents\teamwork_preview_test_writer_e2e\handoff.md` and notify caller when done.
