# E2E Test Infra: Cadde Store

## Test Philosophy
- Opaque-box, requirement-driven testing based strictly on `ORIGINAL_REQUEST.md`.
- No dependency on internal implementation details; tests interact with HTTP API routes, database state, and end-to-end user workflows.
- Systematic 4-tier methodology: Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Real-World Marketplace Workload Testing.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workload) |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | Product Catalog & Multi-Faceted Filters | R1, ORIGINAL_REQUEST §12-14 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 2 | Product Detail, Variants & Installment Matrix | R1, ORIGINAL_REQUEST §12-14 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 3 | Cart Management & Guest-to-Auth Sync | R1, ORIGINAL_REQUEST §12-14 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 4 | Coupon Validation & Calculation Engine | R1, ORIGINAL_REQUEST §12-14 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 5 | Server-Authoritative Multi-Vendor Checkout | R1, R2, ORIGINAL_REQUEST §12-16 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 6 | Two-Tier Order Hierarchy & Carrier Tracking | R2, ORIGINAL_REQUEST §15-16 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 7 | Order Status Transitions & Notifications | R2, ORIGINAL_REQUEST §15-16 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 8 | Customer Return Request & Evidence Upload | R3, ORIGINAL_REQUEST §18-20 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 9 | Seller & Admin Return Moderation & Refunds | R3, ORIGINAL_REQUEST §18-20 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 10 | Admin Homepage CMS Sections & Banners | R4, ORIGINAL_REQUEST §21-23 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 11 | Dedicated Brand Directory & Admin Panel | R5, ORIGINAL_REQUEST §24-26 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 12 | Seller Product Management & Stock Alerts | R6, ORIGINAL_REQUEST §27-29 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 13 | Seller Review Replies & Custom Storefront | R6, ORIGINAL_REQUEST §27-29 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 14 | Admin Governance, Audit Trail & RBAC | R7, ORIGINAL_REQUEST §30-32 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 15 | Turkish/English Localization & PWA Manifest | R8, ORIGINAL_REQUEST §33-35 | ≥5 tests | ≥5 tests | ✓ | ✓ |

## Test Architecture
- **Runner**: Node.js / Vitest / Ts-node automated test execution scripts in `tests/e2e/`.
- **Command**: `npm test` or `node tests/e2e/runner.js`
- **Output Format**: Detailed console output and `TEST_REPORT.json` documenting pass/fail per tier and feature.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|---|---|---|
| 1 | Multi-vendor customer purchase with coupon | F1, F3, F4, F5, F6, F7 | Split OrderGroups created, stock decremented, coupon redeemed, tracking created |
| 2 | Defective item return & seller refund flow | F6, F8, F9, F14 | Customer initiates return, seller approves, refund calculated, AuditLog created |
| 3 | Admin seasonal campaign launch & merchandising | F10, F11, F14 | Hero banner created, brand marked featured, homepage reflects live CMS |
| 4 | Seller onboarding, catalog listing & review reply | F12, F13, F14 | Seller lists multi-variant product, customer reviews, seller replies |
| 5 | Turkish compliance & bilingual locale switching | F1, F15 | KVKK policy accessible, TR/EN translations correct, PWA manifest valid |

## Minimum Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥75 tests (5 × 15 features)
- **Tier 2 (Boundary & Corner)**: ≥75 tests (5 × 15 features)
- **Tier 3 (Cross-Feature Pairwise)**: ≥15 tests
- **Tier 4 (Real-World Scenarios)**: ≥8 complex multi-step scenarios
- **Total Minimum Test Count**: ≥173 test cases
