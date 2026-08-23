# Cadde Store — Exploration & Survey Analysis Report

**Investigator:** Survey Explorer 1 (`teamwork_preview_explorer_survey_1`)  
**Scope:** R1 (Customer Commerce & Discovery Lifecycle), Database/Prisma Models & Seeds, R8 (Turkish Marketplace Compliance & Localization)  
**Date:** 2026-08-23  

---

## 1. Executive Summary

Cadde Store is an enterprise-grade Turkish multi-vendor e-commerce marketplace benchmarking UX patterns from Trendyol and Hepsiburada. The core architecture uses Next.js 14 App Router, Prisma ORM, TypeScript, and Tailwind CSS.

This investigation conducted a systematic code-level survey of:
1. **Prisma Schema & Database Layer**: 18 Prisma models spanning users, sellers, categories, brands, products, orders (two-tier Order and OrderGroup), addresses, coupons, reviews, homepage CMS sections, banners, returns, and audit logging.
2. **R1 Customer Commerce & Discovery**: Product catalog, multi-faceted filter sidebar with category-specific taxonomy, search route, product detail page (interactive lens zoom, star rating popover, variant galleries, bank installments), cart management (seller-grouped multi-vendor layout, slide-out drawer), server-authoritative checkout (`POST /api/orders`), coupon validation, and guest sync (`POST /api/auth/sync`).
3. **R8 Compliance & Localization**: Full Turkish (TR) primary and English (EN) bilingual translation system (742 lines per dictionary), TRY/USD currency toggling, statutory KVKK data privacy disclosures, and installable PWA web app manifest (`/manifest.json`).

---

## 2. Prisma Database Schema & Seed Data Analysis

### 2.1 Schema Definition (`prisma/schema.prisma`)
The schema cleanly supports multi-vendor marketplace operations with both SQLite (`dev.db`) and PostgreSQL via `scripts/prepare-db.js`.

| Model | Key Fields & Attributes | Relationships & Purpose |
|---|---|---|
| `User` | `id`, `email`, `passwordHash`, `firstName`, `lastName`, `phone`, `role` (`CUSTOMER` \| `SELLER` \| `ADMIN`), `status` | 1:1 `Seller`, 1:N `Order`, `Address`, `Favorite`, `Review`, `CouponRedemption`, `ReturnRequest`, `Notification` |
| `Seller` | `id`, `userId` (unique), `storeName`, `slug` (unique), `description`, `logo`, `banner`, `rating` (4.8), `verified` (true), `followers`, `status` | 1:N `Product`, `OrderGroup`, `ReturnRequest` |
| `Category` | `id`, `slug` (unique), `nameTR`, `nameEN`, `descriptionTR`, `descriptionEN`, `imageUrl`, `parentId`, `status` | 1:N `Product` |
| `Brand` | `id`, `name`, `slug` (unique), `logoUrl`, `bannerUrl`, `descriptionTR`, `descriptionEN`, `isFeatured`, `status` | 1:N `Product` |
| `Product` | `id`, `sellerId`, `categoryId`, `brandId`, `name`, `slug` (unique), `brand`, `sku` (unique), `price`, `originalPrice`, `stock`, `rating`, `reviewCount`, `imageUrl`, `colors` (JSON), `sizes` (JSON), `images` (JSON), `status` | Belongs to `Seller`, `Category`, `Brand`; 1:N `OrderItem`, `Favorite`, `Review` |
| `Order` | `id`, `orderNumber` (unique), `customerId`, `status` (`CONFIRMED` .. `DELIVERED`), `subtotal`, `productDiscount`, `couponDiscount`, `shippingFee`, `grandTotal`, `currency`, `shippingAddressSnapshot` (JSON) | 1:N `OrderItem`, `OrderGroup`, `OrderStatusHistory`, `CouponRedemption`, `ReturnRequest` |
| `OrderGroup` | `id`, `orderId`, `sellerId`, `status`, `subtotal`, `carrierName`, `trackingNumber` | Two-tier split sub-order per vendor; 1:N `OrderItem` |
| `OrderItem` | `id`, `orderId`, `orderGroupId`, `productId`, `quantity`, `price`, `selectedColor`, `selectedSize` | Links individual items to `Order`, `OrderGroup`, `Product` |
| `OrderStatusHistory`| `id`, `orderId`, `status`, `note`, `createdAt` | Timeline tracking for orders |
| `Address` | `id`, `userId`, `title`, `firstName`, `lastName`, `phone`, `city`, `district`, `addressLine`, `country`, `isDefault` | Customer delivery addresses |
| `Coupon` | `id`, `code` (unique), `type` (`PERCENTAGE` \| `FIXED` \| `FREE_SHIPPING`), `value`, `minimumOrder`, `maximumDiscount`, `expiresAt`, `active`, `usageLimit`, `usageCount` | 1:N `CouponRedemption` |
| `CouponRedemption` | `id`, `couponId`, `userId`, `orderId`, `createdAt` | Unique compound index `[couponId, userId]` enforcing single redemption per customer |
| `Review` | `id`, `productId`, `userId`, `rating`, `comment`, `status`, `sellerReply` | Product reviews and seller reply thread |
| `PlatformSettings` | `id` ("default"), `marketplaceName`, `supportEmail`, `defaultCommissionRate`, `orderCancellationWindowDays`, `returnWindowDays`, `defaultShippingFee`, `freeShippingThreshold` | Platform-wide defaults for shipping thresholds and return windows |
| `HomepageSection` | `id`, `titleTR`, `titleEN`, `type`, `orderIndex`, `active`, `configJson` | Dynamic CMS sections; 1:N `Banner` |
| `Banner` | `id`, `sectionId`, `titleTR`, `titleEN`, `imageUrlDesktop`, `imageUrlMobile`, `targetType`, `targetValue`, `badgeTextTR`, `orderIndex`, `active` | CMS banners |
| `ReturnRequest` | `id`, `orderId`, `orderItemId`, `userId`, `sellerId`, `reason`, `status`, `refundAmount`, `evidenceImages` (JSON), `sellerNote`, `adminNote` | Post-delivery refund/return management |
| `Notification` | `id`, `userId`, `titleTR`, `titleEN`, `messageTR`, `messageEN`, `type`, `linkUrl`, `isRead` | In-app alerts |
| `AuditLog` | `id`, `actorId`, `actorEmail`, `actorRole`, `action`, `entityType`, `entityId`, `metadataJson`, `ipAddress` | Administrative governance security trail |

### 2.2 Seed Verification (`lib/db/seed.ts`)
- Admin user: `admin@cadde-store.com` (Password: `Password123!`)
- Seller 1: `seller@cadde-store.com` (`Trend Fashion Mağazası`, slug: `trend-fashion-magazasi`)
- Seller 2: `tech@cadde-store.com` (`Cadde Teknoloji & Aksesuar`, slug: `cadde-teknoloji`)
- Customer user: `customer@cadde-store.com`
- Categories: `men` (Erkek Giyim), `women` (Kadın Giyim), `electronics` (Elektronik)
- Brands: `Nike`, `Zara`, `Apple`, `Samsung`, `Karaca`
- Coupons: `CADDE10` (10%), `WELCOME150` (150 TL), `FREESHIP` (Free shipping)
- PlatformSettings seeded with `defaultShippingFee: 34.9`, `freeShippingThreshold: 200.0`.

---

## 3. R1: Customer Commerce & Discovery Lifecycle Analysis

### 3.1 Product Search & Multi-Faceted Filtering
- **Components & Files**:
  - `app/search/page.tsx`: Search query parser, breadcrumb navigation, integration with `FilterSidebar` and sort dropdown.
  - `app/category/[slug]/page.tsx`: Category banner, subcategory chips, responsive 3-column filter layout.
  - `components/marketplace/filter-sidebar.tsx`: Category-researched filters for 8 domains (`women`, `men`, `electronics`, `shoes-bags`, `home-living`, `beauty-care`, `sports-outdoor`, `supermarket`). Supports subcategories, brands, price range inputs, size buttons, color swatches, technical specs/materials, and delivery switches (Fast Delivery, Free Shipping, 4.5+ Rating).
  - `lib/catalog/filters.ts`: Implementation of `filterProducts(products, criteria)`.
  - `lib/catalog/sorting.ts`: Sorting engine supporting `recommended`, `bestselling` (by reviewCount), `price_asc`, `price_desc`, `rating`, and `newest`.

### 3.2 Product Detail Experience
- **File**: `app/product/[slug]/page.tsx` (1732 lines)
- **Features Implemented**:
  - Interactive square zoom lens with high-resolution flyout panel (lines 556–642).
  - Dynamic color variant selection with dedicated multi-angle galleries (lines 186–252).
  - Star rating breakdown popover with 1★ to 5★ percentage bars (lines 683–746).
  - Size selection with out-of-stock slash and restock notifications (lines 253–261).
  - "Buy More, Pay Less" volume discounts (lines 781–800).
  - Bank installment matrix across 5 Turkish financial institutions: Garanti BBVA Bonus, Yapı Kredi World, İş Bankası Maximum, Akbank Axess, Ziraat Bankkart (lines 308–358).
  - Delivery address picker modal with CRUD support (lines 117–168).
  - "Ask Seller a Question" modal (lines 173–177).
  - Review filters with photo-only toggles, height/weight specs, and helpfulness voting (`handleVoteReview`).

### 3.3 Cart Management & Multi-Vendor Split
- **Components & Files**:
  - `lib/cart/cart-context.tsx`: Client-side cart provider with automatic drawer opening (`isOpen`), quantity modification, item removal, and localStorage persistence.
  - `app/cart/page.tsx`: Multi-vendor cart page.
  - `components/cart/cart-seller-group.tsx`: Groups items by seller storeName with independent free shipping thresholds and store badges.
  - `components/cart/coupon-box.tsx`: Promo code submission UI with suggested coupon chips.
  - `components/cart/cart-summary.tsx`: Subtotal, shipping breakdown, coupon discount, and checkout CTA.
  - `lib/orders/order-calculator.ts`: Groups items by vendor and calculates tiered shipping fees.

### 3.4 Checkout & Server-Authoritative Order Creation
- **Components & Files**:
  - `app/checkout/page.tsx`: Multi-step checkout flow (`delivery` → `payment` → `confirmation`).
  - `components/checkout/customer-form.tsx`: Contact information validation.
  - `components/checkout/address-selector.tsx`: Turkish shipping address selection and modal editor.
  - `components/checkout/shipping-selector.tsx`: Turkish carrier selection (Yurtiçi Kargo, Aras Kargo, MNG Kargo).
  - `components/checkout/payment-method.tsx`: Credit Card (with masked input) and Cash-on-Delivery options.
  - `POST /api/orders` (`app/api/orders/route.ts`):
    1. Quantity validation: ensures integer quantities between 1 and 99.
    2. Customer resolution: authenticated session or guest user record generation.
    3. Server-side price & stock verification against DB `Product`.
    4. Server-side coupon verification: checks active status, expiration, minimum subtotal, usage limit, and customer redemption uniqueness.
    5. Platform settings shipping fee calculation (`PlatformSettings` table).
    6. Atomic Prisma Transaction (`prisma.$transaction`):
       - Conditional atomic stock decrement (`updateMany where stock >= qty`).
       - `Order` root record creation.
       - Grouping items by `sellerId` and creating two-tier `OrderGroup` and `OrderItem` records.
       - `CouponRedemption` creation and incrementing `Coupon.usageCount`.

### 3.5 Guest-to-Auth Sync
- **File**: `app/api/auth/sync/route.ts`
- **Behavior**: Merges guest favorites (`prisma.favorite.upsert`) and guest delivery addresses into the user's permanent account upon login.

---

## 4. R8: Turkish Marketplace Compliance & Localization Analysis

### 4.1 Bilingual Translation Architecture
- **Files**: `lib/i18n/config.ts`, `lib/i18n/language-context.tsx`, `lib/i18n/translations/tr.ts`, `lib/i18n/translations/en.ts`
- **Verification**:
  - Turkish (`tr`) is the primary default dictionary with 742 lines of comprehensive translation keys covering common, header, cart, checkout, shipping, filters, categories, search, account, seller, admin, and returns.
  - English (`en`) is the secondary dictionary matching all 742 lines with exact parity.
  - Fallback logic in `language-context.tsx` (lines 65–75): if a key is absent in English, it gracefully falls back to Turkish.
  - Language is stored in `localStorage` (`cadde-store-language`) and synced with `document.documentElement.lang`.

### 4.2 Multi-Currency Handling
- Currencies: `TRY` (₺ / TL) primary and `USD` ($).
- Persists via `CURRENCY_STORAGE_KEY` (`cadde-store-currency`).
- Formatter: `formatCurrency(amount, currency)` in `lib/utils.ts`.

### 4.3 Legal Compliance (KVKK & Policies)
- `app/kvkk/page.tsx`: Detailed statutory disclosure for Turkish Personal Data Protection Law No. 6698 (KVKK), specifying data controller obligations, data subject rights, and contact channels (`kvkk@cadde.store`).
- `app/privacy/page.tsx`: Privacy Policy.
- `app/terms/page.tsx`: Terms of Service.
- `app/shipping/page.tsx`: Shipping and Logistics Policy.
- `app/returns/page.tsx`: 14-day statutory consumer return policy according to Turkish Consumer Protection Law.

### 4.4 PWA Installable Web App Manifest
- `public/manifest.json`:
  - `name`: "Cadde Store — Türkiye'nin Pazaryeri"
  - `short_name`: "Cadde Store"
  - `theme_color`: "#ea580c"
  - `background_color`: "#0f172a"
  - `display`: "standalone"
  - `icons`: 192x192 and 512x512 maskable icons.
  - `shortcuts`: Quick mobile navigation for Siparişlerim (`/account/orders`), Sepetim (`/cart`), Satıcı Paneli (`/seller/dashboard`), and Yönetim Paneli (`/admin`).
- `app/layout.tsx`: Configured with `manifest: "/manifest.json"` and `themeColor: "#ea580c"`.

---

## 5. Identified Gaps & Discrepancies

1. **Category & Search Page Direct Database Fallback**:
   - `app/category/[slug]/page.tsx` and `app/search/page.tsx` currently load products synchronously from `getFullCatalog(language)` instead of asynchronously fetching from `/api/products` (or `fetchDbProducts`). When new products are added via the seller portal or database seeds, they should be seamlessly integrated into the category/search view.
2. **Client-Side Coupon Validation in Cart**:
   - `components/cart/coupon-box.tsx` validates against `MOCK_COUPONS` locally instead of calling the authoritative server endpoint `POST /api/coupons/validate`.
3. **Coupon Forwarding in Checkout**:
   - In `app/checkout/page.tsx`, `appliedCoupon` is set to `null` and not forwarded in the payload to `POST /api/orders`, preventing server-side coupon discount calculation during checkout completion.
4. **Order Detail Page DB Fetch**:
   - `app/account/orders/[id]/page.tsx` only searches local storage `getSavedOrders()`. If a user refreshes on another device or logs in, it should fetch order details by ID from `/api/orders`.

---

## 6. Recommendations for Implementation Phase

1. Update `app/category/[slug]/page.tsx` and `app/search/page.tsx` to use `fetchDbProducts` (with fallback to `getFullCatalog`) so that live database products are displayed with zero mock friction.
2. Update `components/cart/coupon-box.tsx` to call `POST /api/coupons/validate` for live server validation.
3. Update `app/checkout/page.tsx` to accept the cart's applied coupon and pass `couponCode` to `POST /api/orders`.
4. Ensure `app/account/orders/[id]/page.tsx` queries `/api/orders` for live order records.
