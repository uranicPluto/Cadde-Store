# Comprehensive Survey Report: Admin Control Plane & Governance

**Explorer**: Explorer 1 (Admin Control Plane & Governance Explorer)  
**Date**: 2026-08-23  
**Target Platform**: Cadde Store (Turkish Multi-Vendor E-Commerce Marketplace)  
**Evaluation Scope**: `app/admin/` routes, components, and `app/api/` backend route handlers against Requirements R1–R12 and Acceptance Criteria AC1–AC12.

---

## Executive Summary

A comprehensive architectural and functional investigation of the Cadde Store administrative governance plane was conducted. Cadde Store possesses an extensive administrative surface with 13 existing administrative pages and 29 API endpoints backed by Prisma ORM and SQLite/PostgreSQL. 

### Core State Assessment:
1. **Fully Functional & API-Integrated Modules**:
   - **CMS & Merchandising Studio** (`/admin/cms`, `/api/cms/sections`, `/api/cms/banners`): Full section & banner CRUD, reordering, active status toggles, image previews, and audit logging.
   - **Brand Directory & Curation** (`/admin/brands`, `/brands`, `/api/brands`, `/api/brands/[id]`): Full brand lifecycle, vector/image logo previews, featured flags, product count aggregations, and audit logging.
   - **Returns & Refund Moderation Center** (`/admin/returns`, `/api/returns`, `/api/returns/[id]`): 7-stage return lifecycle, evidence photo preview, item refund calculation, seller/admin notes, notifications, and audit logging.
   - **Category Tree Governance** (`/admin/categories`, `/api/categories`): Parent-child taxonomy, TR/EN translations, slug generation, active toggles, and audit logging.
   - **Coupons & Promotions Engine** (`/admin/coupons`, `/api/coupons`): Percentage, Fixed TL, and Free Shipping coupon creation, cart minimums, usage caps, and active toggles.
   - **Reviews Moderation** (`/admin/reviews`, `/api/reviews`): Review inspection, rating display, hide/publish status toggles, and seller reply visibility.
   - **Security Audit Trail** (`/admin/audit`, `/api/admin/audit`): Searchable, filterable log of system-wide administrative mutations.

2. **Critical Gaps & Missing Admin Control Surfaces**:
   - **Missing Page: Marketing & Advertising Studio** (`/admin/marketing`, `/api/marketing/*`): Required by **AC3** and **R3**. No page or API exists yet for Sponsored Products, Sponsored Sellers, Sponsored Brands, campaign budgeting, scheduling, and performance analytics (CTR, impressions, revenue).
   - **Missing Page: Navigation Menu Governance** (`/admin/navigation`, `/api/navigation/*`): Required by **AC4** and **R4**. Header Mega Menu and Footer links are currently hardcoded in `lib/navigation-data.ts`.
   - **Missing Page: Centralized Media Library** (`/admin/media`, `/api/media/*`): Required by **AC12** and **R10**. No media library exists for platform visual asset management and reference tracking.
   - **Missing Page: Market Research Center** (`/admin/research`): Required by **R10** for analyzing search trends and connecting them to merchant opportunities.

3. **Critical Data-Layer Disconnections (LocalStorage Fallbacks to be Replaced with DB APIs)**:
   - **Products Management** (`/admin/products`, `/admin/products/[id]`): Currently mutates `localStorage` (`cadde-store-admin-products`) and `getFullCatalog` instead of connecting to `GET/POST/PUT/DELETE /api/products` or `GET /api/admin/products` (**AC5**).
   - **Orders & Logistics Fulfillment** (`/admin/orders/[id]`): Currently mutates `localStorage` (`cadde-store-orders`). Furthermore, `app/api/orders/[id]/route.ts` lacks a `PUT` endpoint for Admin to update tracking codes and advance order statuses directly (**AC7**).
   - **Seller Governance** (`/admin/sellers`, `/admin/sellers/[id]`): Currently uses `localStorage` (`cadde-store-admin-sellers`) rather than `GET/PUT /api/admin/sellers` (**AC10**).
   - **Customer CRM** (`/admin/customers`, `/admin/customers/[id]`): Currently uses `localStorage` (`cadde-store-admin-customers`) rather than `GET/PUT /api/admin/customers` (**AC11**).
   - **Global Settings** (`/admin/settings`): Currently writes to `localStorage` (`cadde-store-admin-settings`) despite `/api/admin/settings` existing (**R11**).
   - **AuditLog Before/After Diffs** (`/api/products`): Currently logs new product fields without explicit before/after delta snapshots (**AC6**).

---

## Detailed Requirement & Acceptance Criteria Analysis

### 1. Storefront CMS & Merchandising Studio (AC1, R1)
- **Files**: `app/admin/cms/page.tsx`, `app/api/cms/sections/route.ts`, `app/api/cms/banners/route.ts`, `components/homepage/hero-section.tsx`
- **Assessment**: **PASS WITH MINOR ENHANCEMENT**
- **Findings**:
  - `app/admin/cms/page.tsx` provides full management of homepage sections (HERO, BANNER_STRIP, FLASH_DEALS, PRODUCT_CAROUSEL, CATEGORY_GRID, BRAND_STRIP) and associated banners.
  - Supports ordering (`orderIndex` with `ChevronUp`/`ChevronDown`), immediate active/draft toggling, image previews, target types (CATEGORY, BRAND, SELLER, PRODUCT, URL), and badge text in TR/EN.
  - `app/api/cms/sections/route.ts` and `banners/route.ts` handle full CRUD, validation, and write to `AuditLog` (`CMS_SECTION_CREATED`, `CMS_SECTION_UPDATED`, `CMS_SECTION_DELETED`, `BANNER_CREATED`, `BANNER_UPDATED`, `BANNER_DELETED`).
  - Homepage (`components/homepage/hero-section.tsx`) dynamically consumes `/api/cms/sections` and renders live CMS banners.
- **Identified Gap**:
  - Prisma models `HomepageSection` and `Banner` contain `startDate` and `endDate` fields, and the API supports them, but the modal form in `app/admin/cms/page.tsx` lacks datetime pickers for start/end date scheduling.

---

### 2. Marketing & Sponsored Advertising Studio (AC3, R3)
- **Target Route**: `app/admin/marketing/page.tsx`, `app/api/marketing/route.ts`
- **Assessment**: **MISSING / NOT IMPLEMENTED**
- **Findings**:
  - Requirement R3 and AC3 specify an administrative panel where managers can create campaigns for Sponsored Products, Sponsored Sellers, Sponsored Brands, and Featured Search Placements with budget controls, date schedules, and analytics tracking (impressions, clicks, orders, CTR, conversion rate, and revenue).
  - Neither `app/admin/marketing/page.tsx` nor `app/api/marketing/*` exists in the repository.
- **Actionable Proposal**:
  - Create `app/admin/marketing/page.tsx` with campaign builder (Sponsored Product / Brand / Seller / Search Placement), budget tracker, date scheduler, and visual metrics cards (Impressions, Clicks, CTR, Ad Spend, Attributed Revenue, ROI).
  - Add `MarketingCampaign` model or API endpoint to store and serve active advertising campaigns.

---

### 3. Category Tree & Navigation Menu Governance (AC4, R4)
- **Files**: `app/admin/categories/page.tsx`, `app/api/categories/route.ts`, `lib/navigation-data.ts`
- **Assessment**: **PARTIAL (Category Tree PASS / Navigation Menu MISSING)**
- **Findings**:
  - **Category Governance**: `app/admin/categories/page.tsx` and `app/api/categories/route.ts` are fully operational with parent-child hierarchical nesting, TR/EN names and descriptions, slug auto-generation, status toggles, product counts, and `AuditLog` tracking (`CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED`).
  - **Navigation Governance**: `app/admin/navigation` is missing. The public mega menu and footer links currently read static structures from `lib/navigation-data.ts`.
- **Actionable Proposal**:
  - Implement `app/admin/navigation/page.tsx` allowing administrators to curate mega menu columns, highlight badges, promotional banners inside menus, and footer corporate policy links without code changes.

---

### 4. End-to-End Product Management Studio (AC5, R2)
- **Files**: `app/admin/products/page.tsx`, `app/admin/products/[id]/page.tsx`, `app/api/products/route.ts`, `app/api/admin/products/route.ts`, `app/api/products/[id]/route.ts`
- **Assessment**: **NEEDS API INTEGRATION**
- **Findings**:
  - `app/admin/products/page.tsx` contains complete UI for creating products, editing pricing/originalPrice, updating stock, toggling badges (bestseller, freeShipping, fastDelivery), deleting products, and filtering.
  - `app/admin/products/[id]/page.tsx` contains product moderation UI (Approve / Reject with reason).
  - `app/api/products/route.ts` and `app/api/admin/products/route.ts` are fully implemented on Prisma with status moderation and audit logging.
  - **Critical Disconnection**: `app/admin/products/page.tsx` currently loads products from `getFullCatalog()` and saves to `localStorage` (`cadde-store-admin-products`), rather than calling `GET/POST/PUT/DELETE /api/products` or `/api/admin/products`.
- **Actionable Proposal**:
  - Wire `app/admin/products/page.tsx` directly to `/api/products` (or `/api/admin/products`) for fetching, creating, editing prices/stock, and deleting products so all mutations persist to `dev.db` and generate AuditLog entries.

---

### 5. Mandatory Audit Trail with Commercial Diffs (AC6, R2, R11)
- **Files**: `app/admin/audit/page.tsx`, `app/api/admin/audit/route.ts`, `app/api/products/route.ts`, `prisma/schema.prisma`
- **Assessment**: **PASS WITH DIFF ENHANCEMENT**
- **Findings**:
  - `AuditLog` table in Prisma schema tracks `actorId`, `actorEmail`, `actorRole`, `action`, `entityType`, `entityId`, `metadataJson`, and `createdAt`.
  - `app/admin/audit/page.tsx` and `app/api/admin/audit/route.ts` allow searching and filtering audit events.
  - `app/api/products/route.ts` PUT handler logs `PRODUCT_UPDATED` to AuditLog, but `metadataJson` currently only stores the new values:
    ```typescript
    metadataJson: JSON.stringify({
      name: updated.name,
      price: updated.price,
      stock: updated.stock,
      status: updated.status,
    })
    ```
- **Actionable Proposal**:
  - Update `app/api/products/route.ts` PUT handler to compute and record exact before/after diffs:
    ```typescript
    metadataJson: JSON.stringify({
      productId: updated.id,
      name: updated.name,
      diff: {
        price: { before: existing.price, after: updated.price },
        stock: { before: existing.stock, after: updated.stock },
        status: { before: existing.status, after: updated.status },
      },
      modifiedAt: new Date().toISOString(),
    })
    ```
  - Expand entity type filters in `app/admin/audit/page.tsx` to include `ORDER`, `CATEGORY`, `COUPON`, `RETURN`, and `REVIEW`.

---

### 6. Multi-Vendor Order & Logistics Fulfillment Center (AC7, R6)
- **Files**: `app/admin/orders/page.tsx`, `app/admin/orders/[id]/page.tsx`, `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/orders/seller/route.ts`
- **Assessment**: **NEEDS API INTEGRATION & PUT HANDLER**
- **Findings**:
  - `app/admin/orders/[id]/page.tsx` contains Turkish carrier dropdowns (Yurtiçi, Aras, MNG, Sürat, HepsiJet, PTT, Trendyol Express), tracking code input, status transitions (CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED → REFUNDED), seller split breakdowns, and commission reconciliation.
  - `app/api/orders/[id]/route.ts` currently only supports `GET`.
  - `app/admin/orders/page.tsx` and `app/admin/orders/[id]/page.tsx` read/write from `localStorage` (`cadde-store-orders`) via `getSavedOrders()`.
- **Actionable Proposal**:
  - Add `PUT` handler to `app/api/orders/[id]/route.ts` allowing administrators to update tracking numbers, assign carriers, advance order status, sync child `OrderGroup` records, append to `OrderStatusHistory`, and record `ORDER_UPDATED` in `AuditLog`.
  - Wire `app/admin/orders/page.tsx` and `app/admin/orders/[id]/page.tsx` to `GET/PUT /api/orders/[id]`.

---

### 7. Returns & Refund Moderation Center (AC8, R7)
- **Files**: `app/admin/returns/page.tsx`, `app/api/returns/route.ts`, `app/api/returns/[id]/route.ts`
- **Assessment**: **FULL PASS (100% Implemented & Verified)**
- **Findings**:
  - Complete 7-stage return moderation lifecycle: PENDING, APPROVED, REJECTED, CARGO_RECEIVED, REFUNDED.
  - Evidence photo thumbnail previews with modal image inspection.
  - Exact item refund calculation (`orderItem.price * orderItem.quantity`).
  - Seller and admin notes moderation logs.
  - Generates persistent `AuditLog` records (`RETURN_REQUEST_MODERATED`) and in-app `Notification` records for customers.
  - Fully wired to Prisma DB APIs.

---

### 8. Coupon & Promotion Engine (AC9, R8)
- **Files**: `app/admin/coupons/page.tsx`, `app/api/coupons/route.ts`, `app/api/coupons/validate/route.ts`
- **Assessment**: **PASS WITH AUDIT LOGGING ENHANCEMENT**
- **Findings**:
  - `app/admin/coupons/page.tsx` supports creating Percentage (%), Fixed (TL), and Free Shipping coupon codes, min cart subtotal thresholds, usage limits, expiration dates, active/inactive toggles, and deletion.
  - Fully connected to `/api/coupons`.
- **Identified Gap**:
  - `app/api/coupons/route.ts` PUT and DELETE handlers should be updated to log `COUPON_UPDATED` and `COUPON_DELETED` to `AuditLog`.

---

### 9. Seller Governance & Merchant Moderation (AC10, R9)
- **Files**: `app/admin/sellers/page.tsx`, `app/admin/sellers/[id]/page.tsx`, `app/api/admin/sellers/route.ts`, `app/api/sellers/route.ts`
- **Assessment**: **NEEDS API INTEGRATION**
- **Findings**:
  - `app/api/admin/sellers/route.ts` provides complete backend functionality for listing merchants, verifying/approving accounts, suspending stores, updating policies, and logs `SELLER_STATUS_CHANGED` to `AuditLog`.
  - `app/admin/sellers/page.tsx` and `app/admin/sellers/[id]/page.tsx` currently load from `MOCK_SELLERS` / `localStorage`.
- **Actionable Proposal**:
  - Wire `app/admin/sellers/page.tsx` and `app/admin/sellers/[id]/page.tsx` to `GET /api/admin/sellers` and `PUT /api/admin/sellers`.

---

### 10. Customer CRM & Merchant Intelligence (AC11, R9)
- **Files**: `app/admin/customers/page.tsx`, `app/admin/customers/[id]/page.tsx`, `app/api/admin/customers/route.ts`
- **Assessment**: **NEEDS API INTEGRATION**
- **Findings**:
  - `app/api/admin/customers/route.ts` aggregates customer metrics from Prisma (`ordersCount`, `totalSpent`, `savedAddressesCount`, `lastOrderDate`, `status`).
  - `app/admin/customers/page.tsx` and `app/admin/customers/[id]/page.tsx` currently use `MOCK_ADMIN_CUSTOMERS` / `localStorage`.
- **Actionable Proposal**:
  - Wire `app/admin/customers/page.tsx` and `app/admin/customers/[id]/page.tsx` to `/api/admin/customers` for live CRM insights and account block/unblock toggles.

---

### 11. Centralized Media Library (AC12, R10)
- **Target Route**: `app/admin/media/page.tsx`, `app/api/media/route.ts`
- **Assessment**: **MISSING / NOT IMPLEMENTED**
- **Findings**:
  - AC12 specifies a media library for visual asset management and reference tracking across products, banners, and brands.
- **Actionable Proposal**:
  - Implement `app/admin/media/page.tsx` allowing platform managers to search, upload, copy URLs, and inspect usage references of images.

---

### 12. Review Moderation, Global Settings & Security Audit (R10, R11)
- **Reviews Moderation** (`/admin/reviews`, `/api/reviews`): Fully functional with status toggling (PUBLISHED / HIDDEN) and seller replies.
- **Global Settings** (`/admin/settings`, `/api/admin/settings`): Backend `/api/admin/settings` persists `PlatformSettings` and creates `SETTINGS_UPDATED` audit logs. `app/admin/settings/page.tsx` needs to be wired to the API instead of `localStorage`.
- **Security Audit** (`/admin/audit`, `/api/admin/audit`): Fully functional and querying the `AuditLog` table.
- **Role-Based Access Control (RBAC)**: Enforced via session token (`role: "ADMIN" | "SELLER" | "CUSTOMER"`).

---

## Master Inventory Matrix of Admin Pages & API Endpoints

| Area / Module | Admin Route | API Route(s) | Status | Key Features | Needs Work |
|---|---|---|---|---|---|
| **CMS Studio** | `/admin/cms` | `/api/cms/sections`<br>`/api/cms/banners` | ✅ Operational | Sections & banners CRUD, reordering, active toggle, preview, AuditLog | Add date scheduling inputs |
| **Brands** | `/admin/brands` | `/api/brands`<br>`/api/brands/[id]` | ✅ Operational | Full brand CRUD, logos, featured flag, product count, AuditLog | Complete |
| **Returns** | `/admin/returns` | `/api/returns`<br>`/api/returns/[id]` | ✅ Operational | 7-stage lifecycle, photo evidence, refund calc, notes, AuditLog | Complete |
| **Coupons** | `/admin/coupons` | `/api/coupons`<br>`/api/coupons/validate` | ✅ Operational | Percentage/Fixed/FreeShip, min order, usage caps, active toggle | Add AuditLog on PUT/DELETE |
| **Categories** | `/admin/categories` | `/api/categories` | ✅ Operational | Hierarchy (parentId), TR/EN, slug generation, active toggle, AuditLog | Complete |
| **Reviews** | `/admin/reviews` | `/api/reviews` | ✅ Operational | Review moderation, publish/hide status, seller reply display | Add top-level GET in API |
| **Audit Logs** | `/admin/audit` | `/api/admin/audit` | ✅ Operational | Search, filter by entity, actor, JSON metadata display | Add missing entity filter options |
| **Products** | `/admin/products`<br>`/admin/products/[id]` | `/api/products`<br>`/api/admin/products` | ⚠️ Disconnected | Product catalog, pricing, stock, badges, status moderation | Wire page to API, add before/after diffs in AuditLog |
| **Orders** | `/admin/orders`<br>`/admin/orders/[id]` | `/api/orders`<br>`/api/orders/[id]` | ⚠️ Disconnected | Carrier assignment, tracking codes, delivery statuses, financials | Wire page to API, add PUT endpoint to `/api/orders/[id]` |
| **Sellers** | `/admin/sellers`<br>`/admin/sellers/[id]` | `/api/admin/sellers`<br>`/api/sellers` | ⚠️ Disconnected | Approval, suspension, rating tracking, store profiles | Wire page to `/api/admin/sellers` |
| **Customers** | `/admin/customers`<br>`/admin/customers/[id]` | `/api/admin/customers` | ⚠️ Disconnected | Total spend, order count, saved addresses, block/unblock | Wire page to `/api/admin/customers` |
| **Settings** | `/admin/settings` | `/api/admin/settings` | ⚠️ Disconnected | Marketplace name, email, commission, return/cancel windows, shipping | Wire page to `/api/admin/settings` |
| **Marketing** | `/admin/marketing` | `/api/marketing` | ❌ Missing | Sponsored products/brands/sellers, budget, schedule, analytics | Create page & API (AC3, R3) |
| **Navigation** | `/admin/navigation` | `/api/navigation` | ❌ Missing | Mega menu builder, footer link management, category columns | Create page & API (AC4, R4) |
| **Media Library** | `/admin/media` | `/api/media` | ❌ Missing | Centralized asset upload, search, reference tracking | Create page & API (AC12, R10) |
| **Market Research** | `/admin/research` | `/api/research` | ❌ Missing | Search term trends, product opportunities | Create page (R10) |

---

## Actionable Next Steps & Implementation Roadmap

1. **Wire Existing Admin Pages to Backend APIs**:
   - `app/admin/products/page.tsx` & `[id]/page.tsx` ➔ Connect to `/api/products` and `/api/admin/products`.
   - `app/admin/orders/page.tsx` & `[id]/page.tsx` ➔ Add PUT handler to `app/api/orders/[id]/route.ts` and connect page.
   - `app/admin/sellers/page.tsx` & `[id]/page.tsx` ➔ Connect to `/api/admin/sellers`.
   - `app/admin/customers/page.tsx` & `[id]/page.tsx` ➔ Connect to `/api/admin/customers`.
   - `app/admin/settings/page.tsx` ➔ Connect to `/api/admin/settings`.

2. **Implement Missing Admin Surfaces**:
   - Create `app/admin/marketing/page.tsx` & `/api/marketing/route.ts` (AC3).
   - Create `app/admin/navigation/page.tsx` & `/api/navigation/route.ts` (AC4).
   - Create `app/admin/media/page.tsx` & `/api/media/route.ts` (AC12).
   - Create `app/admin/research/page.tsx` (R10).

3. **Enhance AuditLog Fidelity**:
   - In `app/api/products/route.ts` PUT handler, compute before/after diffs (`previousPrice` vs `newPrice`, `previousStock` vs `newStock`) and record structured delta in `AuditLog.metadataJson` (AC6).
   - In `app/admin/audit/page.tsx`, expand filter dropdown to include `ORDER`, `CATEGORY`, `COUPON`, `RETURN`, `REVIEW`.
