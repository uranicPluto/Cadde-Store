# Original User Request

## 2026-08-23T04:17:35Z

Cadde Store is an enterprise-grade Turkish multi-vendor e-commerce marketplace (benchmarking Trendyol/Hepsiburada UX patterns) built on Next.js 14 App Router, Prisma ORM, Tailwind CSS, and TypeScript, featuring full Turkish (TR) and English (EN) bilingual support, TRY currency, server-authoritative checkout, seller portals, and comprehensive administrative governance.

Working directory: e:\Antigravity\Cadde Store
Integrity mode: development

## Requirements

### R1. Customer Commerce & Discovery Lifecycle
Complete the full customer journey with zero mock fallbacks when database data is present: product search, category navigation with multi-faceted filtering (brand, price, rating, seller), variant selection, cart management with guest-to-auth sync, server-authoritative coupon validation, and multi-vendor split checkout.

### R2. Multi-Vendor Order & Logistics Engine
Maintain the two-tier order hierarchy (Order and OrderGroup by seller) with Turkish carrier tracking integration (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet), automated status transitions (Confirmed → Processing → Shipped → Delivered), and real-time customer/seller in-app notifications.

### R3. Returns & Refunds Lifecycle Management
Enable customer return requests on delivered items with reason, evidence upload, and refund calculation. Provide seller and admin approval/rejection moderation panels with audit history.

### R4. Admin Homepage CMS & Merchandising Studio
Empower platform managers to dynamically create, configure, reorder, schedule, and preview homepage sections (Hero sliders, campaign banners, brand strips, product carousels) without code changes via /admin/cms and /api/cms/*.

### R5. Dedicated Brand Management System
Provide an official brand directory (/brands) and an administrative management panel (/admin/brands) supporting brand logos, banner assets, slug management, featured flags, and product count aggregations.

### R6. Seller Portal & Inventory Operations
Enable seller onboarding, multi-variant product catalog management, stock level alerts, order fulfillment with carrier tracking numbers, customer review replies, and store profile customizer (/seller/[slug]).

### R7. Admin Governance & Security Audit Trail
Provide full administrative control over sellers, products, categories, brands, orders, customers, reviews, and platform settings, backed by an immutable security audit log (/admin/audit) and strict role-based access control (RBAC).

### R8. Turkish Marketplace Compliance & Localization
Ensure complete Turkish (TR) primary and English (EN) secondary translations across all 73+ routes, TRY/USD currency independence, KVKK data protection policies, and PWA installable web app manifest.

## Acceptance Criteria

### Commerce & Discovery
- [ ] Product catalog, search, and category pages filter dynamically by price, brand, seller rating, and stock.
- [ ] Cart updates quantity, persists for guests and authenticated users, and calculates authoritative server-side totals.
- [ ] Checkout validates shipping addresses, applies valid coupons, and creates transactional Order and OrderGroup records.

### Logistics & Returns
- [ ] Sellers can update order status and input Turkish carrier tracking codes.
- [ ] Customers can initiate return requests from their order detail view (/account/orders/[id]).
- [ ] Sellers and admins can review, approve, or reject return requests with status notifications.

### Content & Administration
- [ ] Admin can add, reorder, edit, and toggle active status of homepage CMS banners and sections via /admin/cms.
- [ ] Homepage dynamically reflects CMS sections from /api/cms/sections with graceful fallback to default fixtures.
- [ ] Admin can create and curate brands with logos and featured status via /admin/brands.
- [ ] Administrative mutations (brand creation, CMS updates, seller status changes) generate persistent AuditLog records.

### Technical & Production Quality
- [ ] npm run build compiles all 73+ static and dynamic routes with 0 errors.
- [ ] prisma generate and prisma db push sync database schemas cleanly across SQLite (dev.db) and PostgreSQL.
- [ ] PWA manifest (/manifest.json) loads valid icons, theme color, and mobile navigation shortcuts.
- [ ] Zero unhandled exceptions or broken links across the 320px–1920px responsive breakpoint spectrum.
