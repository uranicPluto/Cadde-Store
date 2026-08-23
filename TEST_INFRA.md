# E2E Test Infra: Cadde Store

## Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests strictly validate observable functional contracts, HTTP responses, database states, and end-to-end user journeys defined in `ORIGINAL_REQUEST.md`.
- **Zero Mock Dependencies**: When database data is present, tests run against live Prisma ORM instances and Next.js App Router API handlers.
- **Systematic 4-Tier Test Architecture**:
  1. **Tier 1 (Feature Coverage)**: Category-Partition methodology covering every platform capability across all 15 Acceptance Criteria (AC1–AC15) and R1–R12 with ≥5 tests per feature.
  2. **Tier 2 (Boundary & Corner Cases)**: Boundary Value Analysis (BVA), limits, zero/negative values, extreme payloads, SQL/XSS escaping, and RBAC isolation barriers with ≥5 tests per feature.
  3. **Tier 3 (Pairwise Cross-Feature Interactions)**: 2-way and multi-way combinatorial integration testing across merchandising, pricing, audit trails, checkout, logistics, and CRM.
  4. **Tier 4 (Real-World Application Scenarios)**: Complex multi-actor end-to-end marketplace management workloads.

---

## Feature Inventory & Test Coverage Mapping (23 Features / AC1–AC15)

| # | Feature Domain | Requirement / AC Reference | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workload) |
|---|---|---|:---:|:---:|:---:|:---:|
| **1** | Product Catalog & Multi-Faceted Filters | R1, ORIGINAL_REQUEST §12-14 | 5 tests | 5 tests | ✓ | ✓ |
| **2** | Product Detail, Variants & Installment Matrix | R1, ORIGINAL_REQUEST §12-14 | 5 tests | 5 tests | ✓ | ✓ |
| **3** | Cart Management & Guest-to-Auth Sync | R1, ORIGINAL_REQUEST §12-14 | 5 tests | 5 tests | ✓ | ✓ |
| **4** | Coupon Validation & Calculation Engine | R1, R8, AC9, §103-105 | 5 tests | 5 tests | ✓ | ✓ |
| **5** | Server-Authoritative Multi-Vendor Checkout | R1, R2, §12-16 | 5 tests | 5 tests | ✓ | ✓ |
| **6** | Two-Tier Order Hierarchy & Carrier Tracking | R2, R6, AC7, §96-98 | 5 tests | 5 tests | ✓ | ✓ |
| **7** | Order Status Transitions & Notifications | R2, R6, §96-98 | 5 tests | 5 tests | ✓ | ✓ |
| **8** | Customer Return Request & Evidence Upload | R3, R7, AC8, §100-102 | 5 tests | 5 tests | ✓ | ✓ |
| **9** | Seller & Admin Return Moderation & Refunds | R3, R7, AC8, §100-102 | 5 tests | 5 tests | ✓ | ✓ |
| **10** | Admin Homepage CMS Sections & Banners | R4, R1, AC1, AC2, §73-79 | 5 tests | 5 tests | ✓ | ✓ |
| **11** | Dedicated Brand Directory & Admin Panel | R5, §93-95 | 5 tests | 5 tests | ✓ | ✓ |
| **12** | Seller Product Management & Stock Alerts | R6, R2, AC5, §80-84 | 5 tests | 5 tests | ✓ | ✓ |
| **13** | Seller Review Replies & Custom Storefront | R6, R10, §110-114 | 5 tests | 5 tests | ✓ | ✓ |
| **14** | Admin Governance, Audit Trail & RBAC | R7, R11, AC6, §115-119 | 5 tests | 5 tests | ✓ | ✓ |
| **15** | Turkish/English Localization & PWA Manifest | R8, R12, AC15, §120-124 | 5 tests | 5 tests | ✓ | ✓ |
| **16** | Marketing Campaigns & Sponsored Advertising Studio | R3, AC3, §85-88 | 5 tests | 5 tests | ✓ | ✓ |
| **17** | Navigation Menu Governance & Hierarchies | R4, AC4, §89-92 | 5 tests | 5 tests | ✓ | ✓ |
| **18** | Media Asset Library & Reference Tracking | R10, AC12, §110-114 | 5 tests | 5 tests | ✓ | ✓ |
| **19** | Product Commercial Modifications & AuditLog Diffs | R2, AC6, §80-84 | 5 tests | 5 tests | ✓ | ✓ |
| **20** | Admin Order Fulfillment & Turkish Carrier Logistics | R6, AC7, §96-98 | 5 tests | 5 tests | ✓ | ✓ |
| **21** | Seller Commission Configuration & Governance | R9, AC10, §106-109 | 5 tests | 5 tests | ✓ | ✓ |
| **22** | Customer CRM Profile Analytics & Account Controls | R9, AC11, §106-109 | 5 tests | 5 tests | ✓ | ✓ |
| **23** | KVKK Compliance & Cookie Consent Management | R12, AC15, §120-124 | 5 tests | 5 tests | ✓ | ✓ |

---

## Test Architecture & Execution Engine

- **Automated Runner**: `tests/e2e/runner.js`
- **Core Test Harness**: `tests/e2e/harness.js` (Prisma ORM database connection, JWT Session Token generation via `jose`, HTTP request wrapper with automatic webpack compilation retry handling, and assertion utilities).
- **Execution Command**:
  ```bash
  npm test
  # or
  node tests/e2e/runner.js
  ```
- **Test Artifacts**:
  - `tests/e2e/tier1-features.test.js` (115 tests)
  - `tests/e2e/tier2-boundary.test.js` (115 tests)
  - `tests/e2e/tier3-pairwise.test.js` (24 tests)
  - `tests/e2e/tier4-scenarios.test.js` (12 scenarios)
  - `tests/e2e/TEST_REPORT.json` (Structured JSON output with execution timestamps and durations)

---

## Real-World Workload Scenarios (Tier 4)

| # | Scenario Identifier | Core Flow & Features Exercised |
|---|---|---|
| 1 | `SCENARIO-1` | **Multi-Vendor Customer Purchase Journey**: Search → Product Detail → Cart → Coupon Validation → Atomic Checkout → Split OrderGroups → Stock Decrement |
| 2 | `SCENARIO-2` | **Defective Item Return Lifecycle & Moderation**: Customer Return Request with Evidence → Seller In-App Alert → Seller Moderation → Admin Refund Resolution |
| 3 | `SCENARIO-3` | **Admin Seasonal Campaign Merchandising Studio**: CMS Hero Banner Creation → Dynamic Target Routing → Brand Feature Flagging → Live Homepage API Delivery |
| 4 | `SCENARIO-4` | **Seller Storefront Operations & Review Moderation**: Seller Store Profile → Multi-Variant Catalog Insertion → Verified Customer Review → Seller Reply |
| 5 | `SCENARIO-5` | **Turkish Marketplace Localization & PWA Compliance**: TR/EN Dictionary Parity → TRY/USD Storage → KVKK Policy Routes → Mobile PWA Manifest Validation |
| 6 | `SCENARIO-6` | **Customer Profile & Address Book Synchronization**: Guest State Creation → Authenticated Account Sync → Address Book CRUD → Favorite List Persistence |
| 7 | `SCENARIO-7` | **Admin Governance & Security Audit Trail**: Seller Verification → Product Catalog Moderation → Commission & Shipping Settings → Immutable Audit Trail |
| 8 | `SCENARIO-8` | **Turkish Carrier Logistics & Fulfillment Pipeline**: Order Placement → Seller Carrier Code Assignment (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet) → Tracking Progression |
| 9 | `SCENARIO-9` | **Full End-to-End Enterprise Marketplace Lifecycle**: Seller Onboarding → Multi-Variant Listing → Price Moderation & Audit Diff → Marketing Campaign → Customer Purchase → Carrier Logistics → Return Moderation → CRM Spent Aggregation |
| 10 | `SCENARIO-10` | **Admin Merchandising Studio & Storefront Governance Overhaul**: Platform Global Settings → CMS Section & Banner Creation → Media Library Ingestion → Navigation Hierarchy Restructuring → Live Storefront Verification |
| 11 | `SCENARIO-11` | **Security & Commercial Audit Trail Compliance Across All Administrative Subsystems**: Multi-Role Mutation Sweep (Products, Sellers, Categories, Coupons, CMS, Media, Navigation) → Immutable Audit Trail Verification → Strict RBAC Isolation |
| 12 | `SCENARIO-12` | **Complete Responsive Breakpoint Spectrum & Localization Walkthrough**: Viewport Spectrum (320px Mobile → 768px Tablet → 1024px Laptop → 1920px Desktop) → Turkish & English Translation Parity → PWA Manifest Integrity |

---

## Suite Summary Metrics

- **Tier 1 (Feature Coverage)**: 115 tests (23 features × 5 tests)
- **Tier 2 (Boundary & Corner)**: 115 tests (23 features × 5 tests)
- **Tier 3 (Cross-Feature Pairwise)**: 24 tests
- **Tier 4 (Real-World Workload Scenarios)**: 12 complex scenarios
- **Total Test Count**: **266 test cases**
- **Target Pass Rate**: **100.0%**
