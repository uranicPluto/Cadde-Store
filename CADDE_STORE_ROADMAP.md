# CADDE STORE — STRATEGIC PRODUCTION ROADMAP
**Platform:** Cadde Store (Turkish Multi-Vendor E-Commerce Platform)  
**Execution Mode:** Fully Autonomous & Incremental Hardening  
**Target Standard:** Enterprise Grade (Trendyol / Hepsiburada benchmark)  

---

## 1. Milestone Roadmap Structure

```mermaid
gantt
    title Cadde Store Autonomous Platform Milestones
    dateFormat  YYYY-MM-DD
    section Foundation & Audit
    Milestone 00: Full Audit & Master Map          :done, 2026-08-01, 2026-08-03
    Milestone 01: Design System & Tokens           :done, 2026-08-03, 2026-08-05
    Milestone 02: Global Header & Mega Menu        :done, 2026-08-05, 2026-08-08
    section Commerce Core
    Milestone 03: Discovery & Homepage             :done, 2026-08-08, 2026-08-11
    Milestone 04: Search & Filters                 :done, 2026-08-11, 2026-08-14
    Milestone 05: Product Detail & Taksit          :done, 2026-08-14, 2026-08-16
    Milestone 06: Cart & Multi-Step Checkout       :done, 2026-08-16, 2026-08-18
    Milestone 07: Orders & Multi-Seller Split      :done, 2026-08-18, 2026-08-20
    section Portals & Operations
    Milestone 08: Customer Account & Assistant     :done, 2026-08-20, 2026-08-22
    Milestone 09: Seller Platform & Fulfillment    :done, 2026-08-22, 2026-08-23
    Milestone 10: Platform Admin & Governance      :done, 2026-08-23, 2026-08-23
    section Production Hardening
    Milestone 11: Brand Model & Admin Brands Hub   :active, 2026-08-23, 2026-08-24
    Milestone 12: Admin Homepage CMS Builder       :2026-08-24, 2026-08-25
    Milestone 13: Turkish Logistics & Tracking     :2026-08-25, 2026-08-26
    Milestone 14: Returns & Refunds Lifecycle      :2026-08-26, 2026-08-27
    Milestone 15: In-App Notifications & Audit     :2026-08-27, 2026-08-28
    Milestone 16: PWA & Installable Admin          :2026-08-28, 2026-08-29
    Milestone 17: Production Readiness & Final QA  :2026-08-29, 2026-08-30
```

---

## 2. Detailed Milestone Specifications

### Milestone 11: Dedicated Brand System & Admin Brand Manager `[NEXT]`
- **Objective:** Upgrade brand from a loose string field on products to a first-class database entity with rich metadata.
- **Database Model:**
  - `Brand`: `id`, `name`, `slug`, `logoUrl`, `bannerUrl`, `descriptionTR`, `descriptionEN`, `isFeatured`, `status`, `createdAt`, `updatedAt`.
  - Relation to `Product` (`brandId` optional/foreign key + string fallback for legacy data).
- **Admin UI (`/admin/brands`):**
  - Brand search, creation modal, logo uploader/URL, featured badge toggle, product count indicator.
- **Public Brand Integration:**
  - Dynamic brand filters linked to brand slugs; featured brand quick strips on homepage.

### Milestone 12: Admin Homepage CMS & Merchandising Engine `[HIGH PRIORITY]`
- **Objective:** Give marketplace administrators full visual control over homepage layout, campaign strips, hero carousels, and flash sales without developer code deployments.
- **Database Models:**
  - `HomepageSection`: `id`, `titleTR`, `titleEN`, `type` (HERO | BANNER_STRIP | FLASH_DEAL | PRODUCT_CAROUSEL | CATEGORY_GRID | BRAND_STRIP), `orderIndex`, `active`, `configJson`, `startDate`, `endDate`.
  - `Banner`: `id`, `sectionId`, `imageUrlDesktop`, `imageUrlMobile`, `targetType` (CATEGORY | PRODUCT | BRAND | SELLER | URL), `targetValue`, `orderIndex`, `active`.
- **Admin UI (`/admin/cms`):**
  - Section reordering (drag/drop or position selector), create banner campaigns, schedule active date windows, live preview modal.
- **Public Homepage Integration:**
  - Fallback from dynamic CMS database sections to static defaults if none configured.

### Milestone 13: Turkish Logistics & Carrier Integration
- **Objective:** Implement full Turkish cargo tracking infrastructure.
- **Features:**
  - Support for major carriers: Yurtiçi Kargo, MNG Kargo, Aras Kargo, Sürat Kargo, Hepsijet, PTT Kargo.
  - Auto-generation of tracking URLs based on carrier selection.
  - Seller order fulfillment popup with carrier dropdown and tracking code validator.
  - Customer order tracking direct link and timeline step synchronization.

### Milestone 14: Return & Refund Request Lifecycle
- **Objective:** Build end-to-end customer return initiation and seller/admin approval workflow.
- **Database Models:**
  - `ReturnRequest`: `id`, `orderId`, `orderItemId`, `userId`, `sellerId`, `reason`, `status` (PENDING | APPROVED | REJECTED | CARGO_RECEIVED | REFUNDED), `refundAmount`, `evidenceImages`, `sellerNote`, `createdAt`.
- **User Flows:**
  - Customer requests return from `/account/orders/[id]`.
  - Seller reviews and approves return in `/seller/dashboard/orders`.
  - Admin handles disputes or triggers financial refund balance adjustments.

### Milestone 15: In-App Notifications & Administrative Audit Trail
- **Objective:** Real-time user notifications and tamper-evident administrative action logging.
- **Database Models:**
  - `Notification`: `id`, `userId`, `titleTR`, `titleEN`, `messageTR`, `messageEN`, `type` (ORDER | PROMOTION | SYSTEM | SELLER), `linkUrl`, `isRead`, `createdAt`.
  - `AuditLog`: `id`, `actorId`, `actorEmail`, `actorRole`, `action`, `entityType`, `entityId`, `metadataJson`, `ipAddress`, `createdAt`.
- **Features:**
  - Header notification bell dropdown with unread badge counter.
  - `/admin/audit` portal logging sensitive status changes (e.g. seller approval, product rejection, setting adjustments).

### Milestone 16: PWA & Installable Admin Experience
- **Objective:** Provide a fast, offline-resilient, installable desktop/mobile experience for customers and marketplace operators.
- **Features:**
  - `manifest.json` configured with Turkish marketplace branding, shortcuts (Search, Cart, Orders, Admin).
  - App icons (192x192, 512x512, maskable).
  - Service worker caching static assets with network-first strategy for dynamic API calls.

### Milestone 17: Production Readiness & Final Verification
- **Objective:** Zero-error production build, comprehensive end-to-end testing, security lockdown, and Vercel live verification.
- **Deliverables:** `CADDE_STORE_PRODUCTION_READINESS.md`, `CADDE_STORE_FINAL_AUDIT.md`.
