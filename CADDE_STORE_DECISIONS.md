# CADDE STORE — ARCHITECTURAL & TECHNICAL DECISION LOG (ADR)
**Platform:** Cadde Store  
**Scope:** Architectural Integrity, Standards, & Technical Governance  

---

## 1. Architectural Principles

1. **Preserve Working Code (Rule 1 Override):**
   - Never rebuild modules from scratch when an existing implementation is solid.
   - Refactor surgically to satisfy typed interfaces, security, and database connectivity.
2. **Server-Side Commerce Authority:**
   - Client applications never dictate prices, discounts, commissions, or stock deductions.
   - All financial and inventory calculations are performed in transaction-safe server functions (`lib/orders/order-calculator.ts`, Prisma `$transaction`).
3. **Multi-Vendor Isolation:**
   - Sellers have zero read/write access to other merchants' products, orders, or analytics.
   - Orders are split cleanly into `OrderGroup` records per vendor.
4. **Dual-Layer Language & Currency Independence:**
   - Language (TR/EN) and Currency (TRY/USD) are decoupled. A user can browse in English while paying in Turkish Lira, or vice versa.
   - Default currency is always `TRY` (Turkish Lira `₺`) as the primary target market is Turkey.

---

## 2. Decision Log (ADRs)

### ADR-01: SQLite for Local Development, PostgreSQL for Production
- **Status:** `ACCEPTED`
- **Context:** Local rapid iteration requires zero external Docker/cloud dependencies, whereas Vercel/cloud production requires durable managed PostgreSQL (Supabase/Neon).
- **Decision:** Use `scripts/prepare-db.js` to automatically toggle `prisma/schema.prisma` provider between `sqlite` and `postgresql` based on `DATABASE_URL`.
- **Consequences:** Local dev works with `file:./dev.db`, while production builds on Vercel automatically use `postgresql`.

### ADR-02: Jose-Based JWT Session in HttpOnly Cookies
- **Status:** `ACCEPTED`
- **Context:** Next.js 14 App Router Middleware runs on Edge/Node runtime, requiring lightweight stateless token verification.
- **Decision:** Issue JWT signed with `AUTH_SECRET` via `jose` library in `cadde_store_session` HttpOnly cookie. Middleware inspects `role` and `sellerSlug` to protect `/admin`, `/seller/dashboard`, and `/account`.
- **Consequences:** Fast edge evaluation, zero DB lookup per static asset request, secure against XSS token theft.

### ADR-03: Multi-Seller Order Splitting via `OrderGroup`
- **Status:** `ACCEPTED`
- **Context:** A customer checkout cart may contain items from 3 different merchants. Each merchant needs independent fulfillment and cargo tracking.
- **Decision:** Maintain single top-level `Order` for customer payment, but generate child `OrderGroup` records for each distinct `sellerId` with foreign keys to `OrderItem`.
- **Consequences:** Clean seller isolation in `/seller/dashboard/orders`, while customer sees one unified invoice.

### ADR-04: Hybrid Mock & Database Fallback for High Availability
- **Status:** `ACCEPTED`
- **Context:** In demonstration, offline dev, or cold start environments before seed data is populated, public discovery pages must never crash or display blank screens.
- **Decision:** API routes and repository functions attempt Prisma DB queries first; if the database is unseeded or returns empty sets, they seamlessly fall back to structured Turkish mock fixtures (`lib/mock-data.ts`).
- **Consequences:** Resilient UX, zero downtime during migrations, rich visual layout at all times.

### ADR-05: Non-Destructive Schema Evolution
- **Status:** `ACCEPTED`
- **Context:** As new features are added (Brands, CMS, Notifications), existing database rows must not be lost or broken.
- **Decision:** All new model fields use sensible defaults or optional relations (`brandId String?`, `String @default("ACTIVE")`), ensuring backwards compatibility with existing seed data.
