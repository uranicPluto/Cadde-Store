## 2026-08-23T14:00:19Z

You are Worker 2 (Admin Control Plane Studio UI Worker).
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_worker_m3

Read the authoritative user request at:
e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
- `app/admin/marketing/page.tsx`
- `app/admin/navigation/page.tsx`
- `app/admin/media/page.tsx`
- `app/admin/research/page.tsx`
- `app/admin/products/page.tsx` & `app/admin/products/[id]/page.tsx`
- `app/admin/orders/page.tsx` & `app/admin/orders/[id]/page.tsx`
- `app/admin/sellers/page.tsx` & `app/admin/sellers/[id]/page.tsx`
- `app/admin/customers/page.tsx` & `app/admin/customers/[id]/page.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/cms/page.tsx`
- `app/admin/audit/page.tsx`

Your specific tasks:
1. Create `app/admin/marketing/page.tsx` (AC3 / R3):
   - Rich, responsive studio for creating, editing, and managing marketing campaigns (Sponsored Products, Sponsored Brands, Sponsored Sellers, Featured Search Placements).
   - Campaign builder modal (name, type, target, placement, budget in TL, date range start/end, priority, status).
   - Analytics overview cards (Active Campaigns, Total Ad Spend, Total Impressions, Total Clicks, Average CTR, Conversion Rate, Attributed Revenue, ROI).
   - Campaign table with status badges, budget progress bars, performance metrics, pause/activate toggles, and edit/delete actions.
   - Connected directly to `/api/marketing`.
2. Create `app/admin/navigation/page.tsx` (AC4 / R4):
   - Visual governance interface for Header Mega Menu, Header Quick Links, and Footer link columns.
   - Create/edit navigation item modal (TR & EN titles, URL, section, parent category/item, sortOrder, badge text in TR/EN like "YENİ" / "NEW", active toggle).
   - Nested hierarchical reordering, drag/drop or up/down ordering controls, active status toggles.
   - Connected directly to `/api/navigation`.
3. Create `app/admin/media/page.tsx` (AC12 / R10):
   - Centralized visual asset library manager for searching, uploading, previewing, and copying image URLs.
   - Grid and table view of assets with thumbnail preview, dimensions, file size, MIME type, upload date, and reference tracking badge (used in N products/banners).
   - Filter by MIME type, search by filename/tags, copy URL button with toast feedback, delete action.
   - Connected directly to `/api/media`.
4. Create `app/admin/research/page.tsx` (R10):
   - Market research intelligence dashboard displaying trending search terms, high-demand product categories, conversion opportunities, and direct "Create Campaign" / "Promote Category" shortcuts.
5. Wire `app/admin/products/page.tsx` & `[id]/page.tsx` to backend APIs (AC5):
   - Replace all `localStorage` and `getFullCatalog` mocks with direct calls to `GET /api/products` (or `/api/admin/products`), `POST /api/products`, `PUT /api/products/[id]`, and `DELETE /api/products/[id]`.
   - Ensure editing price, originalPrice, stock, toggling badges (bestseller, freeShipping, fastDelivery, flashSale), and deleting products persists to DB and triggers audit logs.
6. Wire `app/admin/orders/page.tsx` & `[id]/page.tsx` to backend APIs (AC7):
   - Replace `localStorage` with `GET /api/orders` and `GET/PUT /api/orders/[id]`.
   - In `[id]/page.tsx`, enable Admin to assign Turkish carriers (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet, Trendyol Express), enter tracking numbers, update delivery statuses (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED -> CANCELLED -> REFUNDED), and view live carrier tracking portal links.
7. Wire `app/admin/sellers/page.tsx` & `[id]/page.tsx` to backend APIs (AC10):
   - Replace `localStorage` with `GET /api/admin/sellers` and `PUT /api/admin/sellers`.
   - Enable Admin to approve/reject merchants, suspend stores, adjust commission rates (e.g. 8%, 10%, 15%), and toggle verified badges.
8. Wire `app/admin/customers/page.tsx` & `[id]/page.tsx` to backend APIs (AC11):
   - Replace `localStorage` with `GET /api/admin/customers` and `PUT /api/admin/customers`.
   - Display customer profile insights (total spent, orders count, saved addresses, last order date, active status) with block/unblock account controls.
9. Wire `app/admin/settings/page.tsx` directly to `/api/admin/settings` (R11).
10. Update `app/admin/cms/page.tsx` (AC1):
    - Add start date and end date scheduling datetime pickers to the section/banner modals so administrators can schedule visibility.
11. Update `app/admin/audit/page.tsx` (AC6):
    - Expand entity type filter dropdown to include `PRODUCT`, `ORDER`, `SELLER`, `CUSTOMER`, `CATEGORY`, `BRAND`, `COUPON`, `RETURN`, `CMS_SECTION`, `BANNER`, `CAMPAIGN`, `NAVIGATION`, `MEDIA`.
    - Enhance JSON metadata renderer to visually highlight before/after diffs when `diff` object is present.
12. Run TypeScript typecheck `npx tsc --noEmit` and ensure 0 errors.
13. Write `handoff.md` in your working directory and message caller when done.
