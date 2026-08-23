# Project: Cadde Store Marketplace Platform

## Architecture
Cadde Store is an enterprise-grade Turkish multi-vendor e-commerce marketplace built on Next.js 14 App Router, Prisma ORM, Tailwind CSS, and TypeScript.
- **Core Architectural Principle**: "Anything that can be safely configured from the website must be manageable by Admin without editing code."
- **Frontend / Client Layer**: React 18 with Next.js App Router (74+ static and dynamic routes across Customer, Seller, and Admin planes), Tailwind CSS, Lucide Icons, bilingual TR/EN translation context (`lib/i18n/*`), TRY/USD currency toggles, PWA manifest (`public/manifest.json`), service worker (`public/sw.js`), responsive layout across 320px–1920px viewports.
- **Data & ORM Layer**: Prisma ORM with 23 schema models (`User`, `Seller`, `Category`, `Brand`, `Product`, `Order`, `OrderGroup`, `OrderItem`, `OrderStatusHistory`, `Address`, `Favorite`, `Coupon`, `CouponRedemption`, `Review`, `PlatformSettings`, `HomepageSection`, `Banner`, `ReturnRequest`, `Notification`, `AuditLog`, `Campaign`, `NavigationItem`, `MediaAsset`) supporting SQLite (`dev.db`) and PostgreSQL via `scripts/prepare-db.js`.
- **API & Domain Engine Layer**: Next.js Route Handlers (`app/api/*`) executing server-authoritative logic:
  - Product Catalog & Search (`app/api/products/*`, `lib/catalog/*`)
  - Multi-Vendor Cart & Atomic Checkout (`app/api/orders/*`, `app/api/coupons/*`, `app/api/auth/sync/*`)
  - Order Fulfillment & Turkish Carrier Logistics (`app/api/orders/seller/*`, `app/api/orders/[id]/*`, `lib/logistics/*`)
  - Returns & Refunds Moderation Lifecycle (`app/api/returns/*`)
  - Admin Merchandising CMS & Homepage Sections (`app/api/cms/*`)
  - Marketing & Sponsored Advertising Studio (`app/api/marketing/*`)
  - Category Tree & Navigation Menu Governance (`app/api/categories/*`, `app/api/navigation/*`)
  - Dedicated Brand Directory & Curation (`app/api/brands/*`)
  - Customer CRM & Merchant Governance (`app/api/admin/customers/*`, `app/api/admin/sellers/*`)
  - Centralized Media Asset Library (`app/api/media/*`)
  - Review Moderation & Market Research (`app/api/reviews/*`, `app/api/research/*`)
  - Global Platform Settings, RBAC & Security Audit Trail (`app/api/admin/settings/*`, `app/api/admin/audit/*`)

## Feature Inventory
| # | Feature | Description | Milestone | Status | Source |
|---|---|---|---|---|---|
| 1 | Database & Prisma Dual Provider | SQLite & PostgreSQL schema sync, seed script, 23 models including Campaign, Navigation, Media | M1_SCHEMA_DB | DONE | survey |
| 2 | Turkish & English Localization | 100% symmetric TR primary, EN secondary, language context, KVKK policy, PWA manifest | M1_SCHEMA_DB | DONE | survey |
| 3 | Product Catalog & Search Filtering | Multi-faceted filtering by brand, price, rating, seller with zero mock fallback when DB data exists | M4_STOREFRONT | DONE | survey |
| 4 | Product Detail & Variant Experience | Multi-angle gallery, interactive zoom, installment matrix, volume discounts, review stats | M4_STOREFRONT | DONE | survey |
| 5 | Multi-Vendor Cart & Coupon Validation | Seller-grouped cart, guest-to-auth sync, server-authoritative coupon validation API | M4_STOREFRONT | DONE | survey |
| 6 | Server-Authoritative Multi-Vendor Checkout | Atomic stock decrement, two-tier Order and OrderGroup creation, address snapshots | M4_STOREFRONT | DONE | survey |
| 7 | Turkish Carrier Logistics Engine | Tracking code validation & URL generation for 7 carriers (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet, Trendyol Express) | M1_SCHEMA_DB | DONE | survey |
| 8 | Order Status Transitions & Notifications | Confirmed -> Processing -> Shipped -> Delivered transitions with customer in-app notifications | M2_ADMIN_APIS | DONE | survey |
| 9 | Customer Order Tracking & History | Live order detail page with multi-vendor carrier tracking links and order items breakdown | M4_STOREFRONT | DONE | survey |
| 10 | Returns & Refunds Lifecycle Engine | Customer return request modal with reason & evidence upload, automatic refund calculation | M4_STOREFRONT | DONE | survey |
| 11 | Seller & Admin Return Moderation Panels | Seller and admin approval/rejection moderation panels, status progression, notification triggers | M3_ADMIN_PAGES | DONE | survey |
| 12 | Admin Merchandising CMS Studio | Dynamic creation, reordering, editing, scheduling, preview of homepage sections & banners via /admin/cms | M3_ADMIN_PAGES | DONE | survey |
| 13 | Storefront Dynamic Reflection | Homepage dynamically consumes /api/cms/sections and renders sections by orderIndex | M4_STOREFRONT | DONE | survey |
| 14 | Marketing & Sponsored Advertising Studio | Create campaigns for Sponsored Products, Brands, Sellers, search placements, budget & analytics | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 15 | Category Tree & Navigation Menu Governance | Parent/child categories, dynamic mega menu and footer links builder via /admin/navigation | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 16 | Dedicated Brand Management System | Public brand directory (/brands), admin panel (/admin/brands), logos, banners, product counts | M3_ADMIN_PAGES | DONE | survey |
| 17 | Product Management Studio & Audit Diffs | Admin product CRUD, price/stock edits, badges, status moderation, and before/after diffs in AuditLog | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 18 | Admin Order Fulfillment & Logistics Management | Admin order management, carrier assignment, tracking numbers, status transitions via /admin/orders/[id] | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 19 | Coupon & Promotion Engine | Percentage/Fixed/FreeShip coupons, cart minimums, usage caps, active toggles, audit logs | M3_ADMIN_PAGES | DONE | survey |
| 20 | Customer CRM & Merchant Governance | Customer insights, spend, orders, status controls; seller onboarding, commissions, suspensions | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 21 | Centralized Media Library | Asset search, upload, copy URLs, reference tracking across products/brands/banners | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 22 | Market Research Center | Search keyword trends and product opportunities dashboard | M3_ADMIN_PAGES | DONE | survey |
| 23 | Review Moderation & Seller Replies | Review approval/hiding, rating inspection, seller replies | M3_ADMIN_PAGES | DONE | survey |
| 24 | Global Platform Settings & RBAC | Marketplace name, contacts, commissions, thresholds, KVKK text, maintenance mode, RBAC | M2_ADMIN_APIS / M3_ADMIN_PAGES | DONE | survey |
| 25 | Immutable Security Audit Trail | Comprehensive audit log viewer (/admin/audit) querying all platform administrative mutations | M3_ADMIN_PAGES | DONE | survey |
| 26 | Turkish Marketplace Compliance & PWA | KVKK consent, Cookie banner, PWA manifest, service worker, responsive 320px–1920px | M4_STOREFRONT | DONE | survey |
| 27 | Opaque-Box E2E Testing Track | Comprehensive test suite covering Tiers 1-4 for all 15 acceptance criteria (266/266 pass) | E2E_TRACK | DONE | survey |
| 28 | Final E2E Pass & Adversarial Hardening | 100% E2E test pass rate, adversarial stress testing (156/156 passed), and production build verification (0 errors) | M5_FINAL_GATE | DONE | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1_SCHEMA_DB | Prisma Schema, Seeds & Logistics Foundation | Add Campaign, NavigationItem, MediaAsset models, seller commissionRate, product badges, Trendyol Express logistics, seed script | none | DONE |
| M2_ADMIN_APIS | Admin Backend APIs & Audit Diffs | Marketing API, Navigation API, Media API, PUT /api/orders/[id], Product PUT before/after diffs in AuditLog, Admin Sellers commission API | M1_SCHEMA_DB | DONE |
| M3_ADMIN_PAGES | Admin Control Plane Studio Pages | /admin/marketing, /admin/navigation, /admin/media, /admin/research, wire products, orders, sellers, customers, settings to DB APIs | M2_ADMIN_APIS | DONE |
| M4_STOREFRONT | Storefront Dynamic Reflection & Compliance | Homepage dynamic CMS section rendering from /api/cms/sections, dynamic MegaMenu/Footer, Cookie consent banner, PWA icons & sw.js | M1_SCHEMA_DB, M2_ADMIN_APIS | DONE |
| E2E_TRACK | Comprehensive E2E Test Suite | 4-Tier requirement-driven E2E tests covering all 15 ACs (Tiers 1-4: 266/266 pass), publishing TEST_READY.md | M1_SCHEMA_DB, M2_ADMIN_APIS | DONE |
| M5_FINAL_GATE | Gate, Adversarial Hardening & Build Pass | Reviewer approvals, Challenger stress suites, Forensic Auditor CLEAN verdict, npm run build (0 errors) & npm test (100% pass) | M3_ADMIN_PAGES, M4_STOREFRONT, E2E_TRACK | DONE |

## Interface Contracts
### Marketing Campaigns (`/api/marketing`, `/api/marketing/[id]`)
- `GET /api/marketing?type=SPONSORED_PRODUCT&placement=HOMEPAGE`: returns active campaigns with budget and analytics.
- `POST /api/marketing`: `{ name, type, targetId, placement, budget, startDate, endDate, priority }` -> `{ campaign: CampaignDto }`
- `PUT /api/marketing/[id]`: `{ status, budget, endDate, impressions, clicks, orders, revenue }` -> `{ campaign: CampaignDto }`

### Navigation Governance (`/api/navigation`, `/api/navigation/[id]`)
- `GET /api/navigation?section=HEADER`: returns ordered navigation items with submenus and badges.
- `POST /api/navigation`: `{ titleTr, titleEn, url, section, parentId, sortOrder, badgeTr, badgeEn, isActive }` -> `{ item: NavigationItemDto }`
- `PUT /api/navigation/[id]`: update fields or reorder.

### Centralized Media (`/api/media`, `/api/media/[id]`)
- `GET /api/media?q=query&mimeType=image`: returns list of media assets with `referenceCount`.
- `POST /api/media`: `{ filename, url, mimeType, sizeBytes, width, height, altText, tags }` -> `{ asset: MediaAssetDto }`
- `DELETE /api/media/[id]`: delete asset and record in AuditLog.

### Product Audit Diff Contract (`/api/products/[id]`, `prisma.auditLog`)
- `PUT /api/products/[id]` or `PUT /api/products`: Computes exact delta and records:
  ```json
  {
    "productId": "...",
    "name": "...",
    "diff": {
      "price": { "before": 1299.99, "after": 1099.99 },
      "stock": { "before": 45, "after": 30 },
      "status": { "before": "APPROVED", "after": "APPROVED" }
    },
    "modifiedAt": "2026-08-23T..."
  }
  ```

### Admin Order Logistics (`/api/orders/[id]`)
- `PUT /api/orders/[id]`: `{ status?: OrderStatus, carrierName?: TurkishCarrier, trackingNumber?: string, note?: string }` -> updates order and child order groups, appends to `OrderStatusHistory`, generates `AuditLog`.

## Code Layout
- `app/` — Next.js 14 App Router routes (Customer, Seller, Admin, API routes)
- `components/` — Modular React UI components (Marketplace, Cart, Checkout, Seller, Admin, Layout, Common)
- `lib/` — Domain services, repositories, DB client, i18n translations, logistics helpers
- `prisma/` — `schema.prisma`, migrations, SQLite `dev.db`
- `scripts/` — `prepare-db.js`, seed runners
- `tests/` — Automated E2E and unit test specifications
- `public/` — Static assets, `manifest.json`, PWA icons, `sw.js`
