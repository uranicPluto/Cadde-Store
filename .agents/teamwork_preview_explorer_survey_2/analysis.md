# Codebase Investigation & Architecture Analysis: R2, R3, R6
**Author**: Survey Explorer 2
**Date**: 2026-08-23
**Scope**: 
- **R2**: Multi-Vendor Order & Logistics Engine
- **R3**: Returns & Refunds Lifecycle Management
- **R6**: Seller Portal & Inventory Operations

---

## Executive Summary
This report provides a comprehensive, verified investigation into the Cadde Store codebase across requirements **R2** (Orders & Logistics), **R3** (Returns & Refunds), and **R6** (Seller Portal & Inventory).

The codebase features a solid Prisma schema foundation with two-tier order models (Order, OrderGroup, OrderItem, OrderStatusHistory), return requests (ReturnRequest), seller profiles (Seller), and notifications (Notification). The customer checkout API (/api/orders) implements authoritative stock validation and transactional multi-vendor splitting.

However, several critical integration gaps exist:
1. **Logistics & Carrier Integration**: Turkish carrier tracking (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet) is largely cosmetic or static mock data; the seller order fulfillment API does not capture tracking numbers or carrier names.
2. **Returns UI & Lifecycle**: While /api/returns and the ReturnRequest database model exist, there is **zero customer UI** to initiate returns on delivered orders, **no seller moderation dashboard** for returns, and **no admin moderation panel** for returns.
3. **Seller Operations Client-Side Mock Isolation**: The seller product catalog (/seller/dashboard/products), review replies (/seller/dashboard/reviews), and store settings (/seller/dashboard/settings) operate via localStorage or static fixtures rather than connecting to live Prisma API endpoints (/api/products, /api/reviews, /api/sellers).
4. **Real-Time In-App Notifications**: Notifications are only generated during returns; order creation and fulfillment status changes do not trigger in-app notification records, and the header lacks an active notification bell dropdown.

---

## 1. R2: Multi-Vendor Order & Logistics Engine

### 1.1 Verified Evidence & Architecture

#### A. Database Hierarchy
- **File**: prisma/schema.prisma (lines 119–186)
- **Entities**:
  - Order (lines 119–145): Master transaction container representing the customer's overall checkout. Fields: orderNumber, customerId, status (CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED), subtotal, productDiscount, couponDiscount, shippingFee, grandTotal, currency (default "TRY"), carrierName, 	rackingNumber, estimatedDelivery, shippingAddressSnapshot.
  - OrderGroup (lines 147–160): Sub-order grouped per seller. Fields: orderId, sellerId, status, subtotal, carrierName, 	rackingNumber.
  - OrderItem (lines 162–177): Line items attached to both root orderId and parent orderGroupId. Fields: productId, quantity, price, selectedColor, selectedSize.
  - OrderStatusHistory (lines 179–186): Immutable milestone history linked to orderId. Fields: status, 
ote, createdAt.

#### B. Server-Authoritative Multi-Vendor Checkout Creation
- **File**: pp/api/orders/route.ts (lines 52–381)
- **Logic Verified**:
  - Lines 65–77: Strict item quantity validation (1 to 99 integer constraint).
  - Lines 98–148: Real-time DB product price and stock resolution. Rejects inactive or depleted products.
  - Lines 155–214: Server-side coupon verification (active flag, expiration date, minimum order threshold, global usage limit, customer single-use redemption check).
  - Lines 217–232: Dynamic shipping calculation from PlatformSettings table (reeShippingThreshold, defaultShippingFee).
  - Lines 237–339: Atomic Prisma transaction (prisma.) decrementing product stock conditionally (stock: { decrement: item.quantity }), creating root Order, grouping items by sellerId to create OrderGroup records, inserting OrderItem lines, logging initial OrderStatusHistory ("CONFIRMED"), and recording CouponRedemption.

#### C. Order History & Detail View
- **File**: pp/account/orders/page.tsx (lines 25–99)
  - Fetches /api/orders on mount; successfully maps database Order and OrderGroup objects into OrderRecord[].
- **File**: pp/account/orders/[id]/page.tsx (lines 28–32)
  - **Issue**: Only queries getSavedOrders() (localStorage) rather than calling a server API (/api/orders/[id] or /api/orders).
- **File**: components/account/order-tracking.tsx (lines 1–77)
  - Stepper visual component displaying 5 tracking stages (confirmed, processing, shipped, out_for_delivery, delivered) with dynamic status badges and carrier tracking code display.

#### D. Seller Order Status Management
- **File**: pp/api/orders/seller/route.ts (lines 5–85)
  - GET: Returns seller-specific OrderGroup records with items and customer details.
  - PUT: Allows sellers to update status on OrderGroup and adds an OrderStatusHistory record.

### 1.2 Identified Gaps in R2
1. **Lack of Carrier Tracking Fulfillment in Seller API**:
   - In pp/api/orders/seller/route.ts (lines 43–79), the PUT handler accepts { orderGroupId, status, note } but does **not** accept carrierName or 	rackingNumber, leaving OrderGroup.carrierName and OrderGroup.trackingNumber unpopulated.
2. **Missing Turkish Carrier Registry & Tracking URL Helper**:
   - Turkish carriers (Yurtiçi Kargo, Aras Kargo, MNG Kargo, Sürat Kargo, PTT Kargo, HepsiJet) are only mentioned as hardcoded text strings in components/layout/footer.tsx (lines 129–130) and components/account/order-tracking.tsx (line 25).
   - There is no central carrier registry or tracking URL generator (e.g. generating https://www.yurticikargo.com/... or https://kargotakip.araskargo.com.tr/...).
3. **No Automated Status Transitions**:
   - Order statuses only advance when manually updated. There is no automated transition engine or test simulator route to transition an order through CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED.
4. **Order Detail Page Server Sync**:
   - pp/account/orders/[id]/page.tsx does not fetch from /api/orders or /api/orders/[id], creating a disconnect between the database and order detail display.
5. **Missing In-App Notifications for Orders**:
   - Neither POST /api/orders (when order placed) nor PUT /api/orders/seller (when order shipped/delivered) invokes prisma.notification.create for the customer or seller.

---

## 2. R3: Returns & Refunds Lifecycle Management

### 2.1 Verified Evidence & Architecture

#### A. Database Schema
- **File**: prisma/schema.prisma (lines 312–330)
- **Entity**: ReturnRequest
  - Fields: id, orderId, orderItemId, userId, sellerId, eason, status (PENDING | APPROVED | REJECTED | CARGO_RECEIVED | REFUNDED), efundAmount, evidenceImages (JSON array string), sellerNote, dminNote, createdAt, updatedAt.
  - Relations: Order, OrderItem, User (Customer), Seller.

#### B. Returns API Implementation
- **File**: pp/api/returns/route.ts (lines 5–118)
  - GET: Authenticated retrieval of return requests filtered by user role (ADMIN, SELLER, CUSTOMER). Includes relations to Order, OrderItem, Product, User, and Seller.
  - POST: Validates customer order item ownership, creates ReturnRequest with status: "PENDING", calculates authoritative refund amount (orderItem.price * orderItem.quantity), stores evidenceImages, and creates a Notification for the seller (userId: seller.userId).
- **File**: pp/api/returns/[id]/route.ts (lines 5–68)
  - PUT: Checks seller ownership (eturnReq.seller.userId === user.id) or admin role, updates status (APPROVED, REJECTED, CARGO_RECEIVED, REFUNDED), saves sellerNote/dminNote, and creates a Notification for the customer.

### 2.2 Identified Gaps in R3
1. **Missing Customer Return Initiation UI**:
   - pp/account/orders/[id]/page.tsx contains action buttons for "Fatura Görüntüle" (print) and "Tekrar Sipariş Et" (reorder), but **no "İade Talebi Oluştur" (Create Return Request)** button or modal.
   - Customers have no user interface to select return reasons (e.g., "Beden Uymadı", "Kusurlu/Hasarlı Ürün", "Yanlış Ürün Gönderildi", "Vazgeçtim"), upload evidence photos, or view calculated refund amounts.
2. **Missing Seller Returns Moderation UI**:
   - There is no /seller/dashboard/returns page.
   - pp/seller/dashboard/orders/page.tsx and pp/seller/dashboard/orders/[id]/page.tsx have no section to review or moderate customer return requests.
3. **Missing Admin Returns Moderation UI**:
   - There is no /admin/returns page or moderation table for platform administrators to review disputes or override decisions.
4. **Missing AuditLog on Return Moderation**:
   - pp/api/returns/[id]/route.ts updates status but does **not** insert into AuditLog when an admin or seller approves/rejects a return or issues a refund.
5. **Return Window & Eligibility Enforcement**:
   - pp/api/returns/route.ts does not verify if the parent order status is DELIVERED and within the eturnWindowDays (14 days from PlatformSettings).

---

## 3. R6: Seller Portal & Inventory Operations

### 3.1 Verified Evidence & Architecture

#### A. Seller Onboarding Landing Page
- **File**: pp/seller/page.tsx (lines 1–144)
  - Rich promotional onboarding page highlighting seller benefits (daily visitors, 0% listing fee, fast cargo agreements), CTA buttons to /seller/dashboard and sample storefront /seller/trend-fashion-magazasi.

#### B. Multi-Variant Product Catalog Management
- **File**: components/seller/product-form.tsx (lines 1–307)
  - Comprehensive product authoring form including basic info (name, brand, category), media image preview, pricing (selling price, original price), stock quantity, variant tags (colors, sizes), and shipping badges (free shipping, fast delivery).
- **File**: components/seller/seller-product-table.tsx
  - Renders tabular view of active products with stock quantities, price, category, and action buttons (Edit, Delete).
- **File**: pp/api/products/route.ts (lines 7–104)
  - GET: Supports multi-faceted filtering by category, seller, search, and slug.
  - POST: Authenticated seller/admin product creation with slug auto-generation, price/stock parsing, and JSON serialization for colors and sizes.

#### C. Order Fulfillment & Carrier Tracking
- **File**: pp/seller/dashboard/orders/page.tsx (lines 20–105)
  - Fetches /api/orders/seller and provides status filtering tabs (ll, processing, shipped) and inline status selection dropdowns.
- **File**: pp/seller/dashboard/orders/[id]/page.tsx (lines 59–97)
  - Detailed order view showing delivery address, net earnings calculation after 10% marketplace commission, and item breakdown.

#### D. Customer Review Replies
- **File**: pp/seller/dashboard/reviews/page.tsx (lines 1–148)
  - Review feed showing product names, ratings, customer comments, and seller reply box with date stamp.
- **File**: pp/api/reviews/route.ts (lines 75–128)
  - PUT: Allows verified seller of the product to post/update sellerReply.

#### E. Store Profile Customizer & Public Storefront
- **File**: pp/seller/[slug]/page.tsx (lines 1–939)
  - Benchmark-grade Turkish storefront (Altınyıldız Classics / Trend Fashion) with brand hero banner, follower counter ("Follow To Earn"), navigation tabs (Home, All Products, Special Offers), store search, campaigns carousels, and an extensive Seller Profile Modal featuring 5 operational trust metrics (Duration, Location, Corporate Invoice, Shipping Speed: 20 hrs, Question Response Time: 30-45 mins) and separate Product vs Seller reviews.
- **File**: pp/seller/dashboard/settings/page.tsx (lines 1–144)
  - Merchant settings form for Store Name, Support Phone, Email, Free Shipping Threshold, and Handling Days.

### 3.2 Identified Gaps in R6
1. **Client-Side Mock Storage in Seller Portal**:
   - pp/seller/dashboard/products/page.tsx (lines 18–27) uses localStorage (cadde-store-seller-products) + getFullCatalog().
   - pp/seller/dashboard/products/new/page.tsx (lines 19–28) saves to localStorage instead of calling POST /api/products.
   - pp/seller/dashboard/products/[id]/edit/page.tsx (lines 35–52) edits localStorage instead of calling a product update API.
   - pp/seller/dashboard/reviews/page.tsx (lines 22–47) saves review replies to localStorage (cadde-store-seller-reviews) instead of calling PUT /api/reviews.
   - pp/seller/dashboard/settings/page.tsx (lines 21–25) triggers only a local Toast with zero persistence.
2. **Missing Product Mutation Endpoints (PUT, DELETE in /api/products)**:
   - pp/api/products/route.ts only implements GET and POST. It lacks PUT (for updating product details, price, and stock) and DELETE (for archiving/deleting products).
3. **No Carrier Code & Tracking Input during Fulfillment**:
   - pp/seller/dashboard/orders/[id]/page.tsx has buttons for status ("Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi") but lacks input fields to select a Turkish carrier (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet) and enter the tracking number.
4. **Static Stock Level Alerts**:
   - pp/seller/dashboard/page.tsx (lines 188–206) displays a hardcoded low-stock alert ("Siyah Oversize Tişört") rather than computing low-stock products (stock <= 5) dynamically.
5. **No Self-Service Seller Application Form**:
   - Customers have no application wizard (e.g. at /seller/apply or POST /api/sellers) to submit store registration data (Tax ID, Store Name, Logo, Slug) for admin review.

---

## 4. Synthesis: Cross-Cutting Architectural Needs

| Feature Area | Current State | Target State |
| :--- | :--- | :--- |
| **Turkish Carriers** | Hardcoded text badges | Formal registry with tracking URL builders (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet) |
| **Seller Fulfillment** | Status dropdown only | Carrier selection + tracking code input synced to OrderGroup & Order in DB |
| **Order Detail Route** | Reads localStorage | Fetches live authoritative order from database with live tracking timeline |
| **Return Requests UI** | No UI (APIs exist) | Customer return modal on /account/orders/[id] + seller review panel at /seller/dashboard/returns + admin panel |
| **Seller Dashboard CRUD**| Reads/writes localStorage | Full integration with /api/products (GET, POST, PUT, DELETE), /api/reviews, /api/sellers |
| **Notifications** | Partial (returns only) | Automated in-app notifications on order placement, shipping, delivery, and return transitions + header badge |
| **Audit Trail** | Brands/CMS only | Audit logging for seller status mutations, product updates, order status changes, and return resolutions |

---

## 5. Recommended Concrete Implementation Plan

1. **Logistics Engine Enhancement**:
   - Create lib/logistics/carrier-utils.ts with carrier definitions, tracking URL formatters, and regex validators for Yurtiçi, Aras, MNG, Sürat, PTT, and HepsiJet.
   - Update pp/api/orders/seller/route.ts PUT to accept carrierName and 	rackingNumber and update OrderGroup and Order.
   - Add carrier & tracking input modal to pp/seller/dashboard/orders/[id]/page.tsx and pp/seller/dashboard/orders/page.tsx.
   - Connect pp/account/orders/[id]/page.tsx to fetch order details from the database with active carrier tracking links.
2. **Returns & Refunds Complete Lifecycle UI**:
   - Build customer return initiation modal in pp/account/orders/[id]/page.tsx (reason selector, evidence upload, calculated refund amount) calling POST /api/returns.
   - Build seller moderation panel (/seller/dashboard/returns or within orders) calling PUT /api/returns/[id].
   - Build admin moderation panel (/admin/returns or in admin orders) calling PUT /api/returns/[id].
   - Record AuditLog entries upon return approval/rejection.
3. **Seller Portal Database Persistence**:
   - Add PUT and DELETE handlers to pp/api/products/route.ts (or pp/api/products/[id]/route.ts).
   - Connect pp/seller/dashboard/products/* to /api/products.
   - Add PUT /api/sellers (or /api/sellers/route.ts) to allow sellers to update store settings and connect pp/seller/dashboard/settings/page.tsx.
   - Connect pp/seller/dashboard/reviews/page.tsx to PUT /api/reviews and enable fetching reviews for a seller's products.
   - Connect pp/seller/dashboard/page.tsx low-stock alert widget to query real products with stock <= 5.
4. **Real-Time Notification & Audit Trail Triggers**:
   - Trigger prisma.notification.create on order placement, shipping status changes, and return updates.
   - Add notification bell / badge dropdown to MarketplaceHeader and SellerHeader.
