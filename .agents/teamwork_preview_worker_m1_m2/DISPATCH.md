## 2026-08-23T14:00:19Z

You are Worker 1 (Backend Architecture, Prisma Schema, Logistics & APIs Worker).
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_worker_m1_m2

Read the authoritative user request at:
e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md

Your write ownership:
- `prisma/schema.prisma`
- `scripts/prepare-db.js`
- `lib/db/seed.ts`
- `lib/logistics/carrier-utils.ts`
- `app/api/marketing/route.ts` & `app/api/marketing/[id]/route.ts`
- `app/api/navigation/route.ts` & `app/api/navigation/[id]/route.ts`
- `app/api/media/route.ts` & `app/api/media/[id]/route.ts`
- `app/api/products/[id]/route.ts` & `app/api/products/route.ts`
- `app/api/orders/[id]/route.ts`
- `app/api/admin/sellers/route.ts`
- `app/api/coupons/route.ts`
- `app/api/admin/customers/route.ts`
- `app/api/admin/settings/route.ts`

Your specific tasks:
1. Update `prisma/schema.prisma` to add:
   - `Campaign` model: id, name, type (SPONSORED_PRODUCT, SPONSORED_BRAND, SPONSORED_SELLER, FEATURED_SEARCH), targetId, placement, budget (Float), spent (Float @default(0)), startDate, endDate, priority (Int @default(1)), status (ACTIVE, PAUSED, COMPLETED), impressions (Int @default(0)), clicks (Int @default(0)), orders (Int @default(0)), revenue (Float @default(0)), createdAt, updatedAt.
   - `NavigationItem` model: id, titleTr, titleEn, url, section (HEADER, FOOTER, MEGA_MENU), parentId (optional self-relation), sortOrder (Int @default(0)), badgeTr (optional), badgeEn (optional), isActive (Boolean @default(true)), createdAt, updatedAt.
   - `MediaAsset` model: id, filename, url, mimeType, sizeBytes, width (optional), height (optional), altTextTr (optional), altTextEn (optional), tags (optional JSON string), referenceCount (Int @default(0)), uploadedBy (optional), createdAt, updatedAt.
   - Add `commissionRate Float @default(0.10)` to `Seller` model.
   - Add `badges String?` (or JSON array) to `Product` model.
2. Update `scripts/prepare-db.js` and `lib/db/seed.ts` to sync schema and seed initial sample records for Campaigns, NavigationItems, MediaAssets, Sellers with commissionRate, and Products with badges.
3. Run `node scripts/prepare-db.js` and `npx tsx lib/db/seed.ts` to ensure `dev.db` is completely updated with the new tables and seed data.
4. Update `lib/logistics/carrier-utils.ts`:
   - Add `Trendyol Express` (`TEX`) as the 7th Turkish carrier with tracking URL: `https://kargotakip.trendyol.com/?trackingNumber=${encodeURIComponent(trackingNumber)}`.
5. Implement `app/api/marketing/route.ts` and `app/api/marketing/[id]/route.ts` with GET (filter by type/placement/status), POST (create campaign with AuditLog `CAMPAIGN_CREATED`), PUT (update budget/status/metrics with AuditLog `CAMPAIGN_UPDATED`), DELETE (with AuditLog `CAMPAIGN_DELETED`).
6. Implement `app/api/navigation/route.ts` and `app/api/navigation/[id]/route.ts` with GET (filter by section/active), POST (create nav item with AuditLog `NAVIGATION_CREATED`), PUT (reorder/edit with AuditLog `NAVIGATION_UPDATED`), DELETE (AuditLog `NAVIGATION_DELETED`).
7. Implement `app/api/media/route.ts` and `app/api/media/[id]/route.ts` with GET (search, filter by mimeType), POST (create media record with AuditLog `MEDIA_CREATED`), DELETE (AuditLog `MEDIA_DELETED`).
8. Update `app/api/products/[id]/route.ts` and `app/api/products/route.ts` PUT handler:
   - Compute exact delta between existing product and new values:
     `diff: { price: { before: existing.price, after: updated.price }, stock: { before: existing.stock, after: updated.stock }, status: { before: existing.status, after: updated.status } }`
   - Record in `AuditLog.metadataJson` with `action: "PRODUCT_UPDATED"` and entityType `"PRODUCT"` (AC6).
9. Add `PUT` handler to `app/api/orders/[id]/route.ts`:
   - Supports updating carrier tracking numbers (`carrierName`, `trackingNumber`), status transitions (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED -> CANCELLED -> REFUNDED), updating child `OrderGroup` records, appending to `OrderStatusHistory`, and logging `action: "ORDER_UPDATED"` in `AuditLog` (AC7).
10. Update `app/api/admin/sellers/route.ts` to support updating `commissionRate`, store verification badges, and suspension with AuditLog.
11. Update `app/api/coupons/route.ts` to log AuditLog on PUT (`COUPON_UPDATED`) and DELETE (`COUPON_DELETED`).
12. Run TypeScript typecheck `npx tsc --noEmit` to verify zero compile errors.
13. Write `handoff.md` with full execution summary, files changed, and verification evidence in your working directory. Send a message to the caller when done.
