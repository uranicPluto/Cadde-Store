# Project: Cadde Store Marketplace Platform

## Architecture
Cadde Store is an enterprise-grade Turkish multi-vendor e-commerce marketplace built on Next.js 14 App Router, Prisma ORM, Tailwind CSS, and TypeScript.
- **Frontend / Client Layer**: React 18 with Next.js App Router (73+ static routes, dynamic product/seller/category/order routes), Tailwind CSS, Lucide Icons, bilingual TR/EN translation context (`lib/i18n/*`), TRY/USD currency toggles, PWA manifest (`public/manifest.json`).
- **Data & ORM Layer**: Prisma ORM with 20 schema models (`User`, `Seller`, `Category`, `Brand`, `Product`, `Order`, `OrderGroup`, `OrderItem`, `OrderStatusHistory`, `Address`, `Favorite`, `Coupon`, `CouponRedemption`, `Review`, `PlatformSettings`, `HomepageSection`, `Banner`, `ReturnRequest`, `Notification`, `AuditLog`) supporting SQLite (`dev.db`) and PostgreSQL via `scripts/prepare-db.js`.
- **API & Domain Engine Layer**: Next.js Route Handlers (`app/api/*`) executing server-authoritative logic:
  - Product Catalog & Search (`app/api/products/*`, `lib/catalog/*`)
  - Multi-Vendor Cart & Atomic Checkout (`app/api/orders/*`, `app/api/coupons/*`, `app/api/auth/sync/*`)
  - Order Fulfillment & Turkish Carrier Logistics (`app/api/orders/seller/*`, `lib/logistics/*`)
  - Returns & Refunds Moderation Lifecycle (`app/api/returns/*`)
  - Admin Merchandising CMS & Homepage Sections (`app/api/cms/*`)
  - Dedicated Brand Directory & CRUD (`app/api/brands/*`)
  - Seller Operations & Inventory (`app/api/sellers/*`, `app/api/reviews/*`)
  - Admin Governance & Security Audit Trail (`app/api/admin/*`)

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---|---|---|---|
| 1 | Database & Prisma Dual Provider | SQLite & PostgreSQL schema sync, seed script, 20 models | M1 | DONE |
| 2 | Turkish & English Localization | 742-line TR primary, EN secondary, language context, KVKK policy, PWA manifest | M1 | DONE |
| 3 | Product Catalog & Search Filtering | Multi-faceted filtering by brand, price, rating, seller with zero mock fallback when DB data exists | M2 | DONE |
| 4 | Product Detail & Variant Experience | Multi-angle gallery, interactive zoom, installment matrix, volume discounts, review stats | M2 | DONE |
| 5 | Multi-Vendor Cart & Coupon Validation | Seller-grouped cart, guest-to-auth sync, server-authoritative coupon validation API | M2 | DONE |
| 6 | Server-Authoritative Multi-Vendor Checkout | Atomic stock decrement, two-tier Order and OrderGroup creation, address snapshots | M2 | DONE |
| 7 | Turkish Carrier Logistics Engine | Tracking code validation & URL generation for Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet | M3 | DONE |
| 8 | Order Status Transitions & Notifications | Confirmed -> Processing -> Shipped -> Delivered transitions with customer in-app notifications | M3 | DONE |
| 9 | Customer Order Tracking & History | Live order detail page with multi-vendor carrier tracking links and order items breakdown | M3 | DONE |
| 10 | Returns & Refunds Lifecycle Engine | Customer return request modal with reason & evidence upload, automatic refund calculation | M4 | DONE |
| 11 | Seller & Admin Return Moderation Panels | Seller and admin approval/rejection moderation panels, status progression, notification triggers | M4 | DONE |
| 12 | Admin Merchandising CMS Studio | Dynamic creation, reordering, editing, scheduling, preview of homepage sections & banners | M5 | DONE |
| 13 | Dedicated Brand Management System | Public brand directory (/brands), admin panel (/admin/brands), logos, banners, product counts | M5 | DONE |
| 14 | Seller Portal Catalog & Inventory Operations | Multi-variant product catalog CRUD, stock level alerts, order fulfillment with carrier tracking | M6 | DONE |
| 15 | Seller Review Replies & Customizer | Review reply API integration, seller storefront customizer (/seller/[slug]), onboarding flow | M6 | DONE |
| 16 | Admin Governance & Security Audit Trail | Immutable audit log (/admin/audit), RBAC role protection, audit trail on all platform mutations | M7 | DONE |
| 17 | Category & Review Admin API Backing | DB-backed category CRUD (/admin/categories) and review moderation (/admin/reviews) | M7 | DONE |
| 18 | Opaque-Box E2E Testing Suite | Comprehensive test suite (Tiers 1-4) verifying all user journeys and edge cases | E2E_TRACK | DONE |
| 19 | 100% E2E Pass & Adversarial Hardening | Tier 1-4 pass verification and Tier 5 white-box adversarial coverage hardening | M8_FINAL | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | DB Schema, Seeds & Localization Foundation | Verify Prisma sync, seed script with rich entities, TR/EN i18n dictionaries, KVKK, and PWA manifest | none | DONE |
| M2 | Commerce Discovery, Cart, Coupon & Checkout | Live DB product search/filtering, product detail, server coupon validation, guest-auth sync, multi-vendor split checkout | M1 | DONE |
| M3 | Multi-Vendor Logistics & Carrier Tracking | Turkish carrier utility (6 carriers), seller fulfillment API tracking persistence, customer order detail tracking UI, notifications | M2 | DONE |
| M4 | Returns & Refunds Lifecycle Management | Customer return request modal & API, seller return review panel, admin return moderation panel, audit logging | M3 | DONE |
| M5 | Admin Merchandising CMS & Brand Management | Homepage CMS sections/banners API & admin studio, public brand directory (/brands), admin brand management (/admin/brands) | M1 | DONE |
| M6 | Seller Portal & Inventory Operations | Product catalog CRUD (PUT/DELETE), stock alerts, order fulfillment, review replies, seller storefront (/seller/[slug]) | M2, M3 | DONE |
| M7 | Admin Governance & Security Audit Trail | Complete AuditLog instrumentation across all admin mutations, category & review DB APIs, admin audit viewer & RBAC | M4, M5, M6 | DONE |
| E2E_TRACK | Opaque-Box E2E Test Suite | E2E test runner, harness, and comprehensive test suites covering Tiers 1-4, publishing TEST_READY.md | none | DONE |
| M8_FINAL | E2E Verification & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1-4) followed by Tier 5 adversarial stress testing and production build verification | M7, E2E_TRACK | DONE |

## Interface Contracts
### Commerce ↔ Checkout (`/api/orders`, `/api/coupons/validate`)
- `POST /api/coupons/validate`: `{ code: string, subtotal: number }` -> `{ valid: boolean, discountAmount: number, coupon: CouponDto, message: string }`
- `POST /api/orders`: `{ items: { productId: string, quantity: number, variantId?: string }[], shippingAddress: AddressDto, couponCode?: string, paymentMethod: string }` -> `{ order: OrderDto, orderGroups: OrderGroupDto[] }`

### Logistics ↔ Seller Fulfillment (`/api/orders/seller`, `lib/logistics/carrier-utils.ts`)
- `PUT /api/orders/seller`: `{ orderGroupId: string, status: OrderStatus, carrierName: TurkishCarrier, trackingNumber: string, note?: string }` -> `{ orderGroup: OrderGroupDto, trackingUrl: string }`
- `getCarrierTrackingUrl(carrier: TurkishCarrier, trackingNumber: string)` -> `string`

### Returns ↔ Moderation (`/api/returns`, `/api/returns/[id]`)
- `POST /api/returns`: `{ orderId: string, orderItemId: string, reason: string, evidenceImages?: string[], note?: string }` -> `{ returnRequest: ReturnRequestDto }`
- `PUT /api/returns/[id]`: `{ status: ReturnStatus, sellerNote?: string, adminNote?: string }` -> `{ returnRequest: ReturnRequestDto }` (and triggers `AuditLog`)

### Brand & CMS ↔ Homepage (`/api/brands`, `/api/cms/sections`)
- `GET /api/brands?featured=true`: returns list of brand objects with `_count.products`.
- `GET /api/cms/sections`: returns active sections with nested banners sorted by `sortOrder`.

## Code Layout
- `app/` — Next.js 14 App Router routes (Customer, Seller, Admin, API routes)
- `components/` — Modular React UI components (Marketplace, Cart, Checkout, Seller, Admin, Layout, Common)
- `lib/` — Domain services, repositories, DB client, i18n translations, logistics helpers
- `prisma/` — `schema.prisma`, migrations, SQLite `dev.db`
- `scripts/` — `prepare-db.js`, seed runners
- `tests/` — Automated E2E and unit test specifications
- `public/` — Static assets, `manifest.json`, brand icons
