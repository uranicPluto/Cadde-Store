## 2026-08-23T04:34:00Z
You are the Worker for Milestones M6 & M7: Seller Portal, Inventory Operations, Admin Governance & Security Audit Trail.
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_worker_m6_m7
Authoritative request: e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md
Project specification: e:\Antigravity\Cadde Store\PROJECT.md
Survey handoffs: e:\Antigravity\Cadde Store\.agents\teamwork_preview_explorer_survey_2\handoff.md and e:\Antigravity\Cadde Store\.agents\teamwork_preview_explorer_survey_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write ownership:
- app/api/products/route.ts
- app/api/products/[id]/route.ts
- app/api/categories/route.ts
- app/api/admin/sellers/route.ts
- app/api/admin/products/route.ts
- app/api/admin/settings/route.ts
- app/seller/dashboard/products/page.tsx
- app/seller/dashboard/products/new/page.tsx
- app/seller/dashboard/products/[id]/edit/page.tsx
- app/seller/dashboard/reviews/page.tsx
- app/seller/dashboard/settings/page.tsx
- app/seller/[slug]/page.tsx
- app/seller/page.tsx
- app/admin/categories/page.tsx
- app/admin/reviews/page.tsx

Your task:
1. Enhance `app/api/products/route.ts` & `app/api/products/[id]/route.ts`:
   - Support GET (filtering by sellerId, categoryId, brandId, query), POST (create product with variants/stock), PUT (update product, stock levels, price), DELETE (soft delete or status INACTIVE).
   - Log `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED` to `AuditLog`.
2. Connect Seller Dashboard product pages (`app/seller/dashboard/products/*`):
   - Product list fetches `/api/products?sellerId=...` and displays stock alert indicators when stock < 5.
   - Product creation (`new/page.tsx`) and editing (`[id]/edit/page.tsx`) submits directly to `/api/products` and `/api/products/[id]`.
3. Connect Seller Review Replies (`app/seller/dashboard/reviews/page.tsx`):
   - Fetch real reviews for seller's products via `/api/reviews?sellerId=...`.
   - Submit seller replies via `PUT /api/reviews` (updating `sellerReply` and `sellerRepliedAt`).
4. Connect Seller Storefront & Settings (`app/seller/[slug]/page.tsx` & `app/seller/dashboard/settings/page.tsx`):
   - Storefront customizer: display real seller info, active products, reviews, and trust metrics.
   - Store settings: update store name, logo, banner, bio, return address with persistence to `/api/sellers` or `/api/sellers/[id]`.
5. Implement Seller Onboarding (`app/seller/page.tsx`):
   - Interactive onboarding application for new sellers (business name, tax number, category selection, contact info).
6. Create `app/api/categories/route.ts`:
   - GET: return categories with product counts.
   - POST, PUT, DELETE: admin category CRUD with `AuditLog` logging (`CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED`).
7. Update `app/admin/categories/page.tsx`:
   - Connect category management to `/api/categories` with hierarchy view, slug generator, and status toggles.
8. Update `app/admin/reviews/page.tsx`:
   - Connect review moderation to `/api/reviews` with status toggles (APPROVED, REJECTED) and `AuditLog` logging.
9. Instrument Audit Logging on all Admin routes:
   - `app/api/admin/sellers/route.ts`: create `AuditLog` on seller status approval/suspension (`SELLER_STATUS_CHANGED`).
   - `app/api/admin/products/route.ts`: create `AuditLog` on product approval/rejection (`PRODUCT_MODERATED`).
   - `app/api/admin/settings/route.ts`: create `AuditLog` on commission or platform setting changes (`SETTINGS_UPDATED`).
10. Verification:
   - Run `npx tsc --noEmit` (0 errors).
   - Run `npm run build` (0 errors).
   - Run `node tests/e2e/runner.js` (174/174 passed).
11. Write completion report to `e:\Antigravity\Cadde Store\.agents\teamwork_preview_worker_m6_m7\handoff.md` and send completion message.
