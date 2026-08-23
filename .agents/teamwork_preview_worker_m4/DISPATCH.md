## 2026-08-23T19:30:19Z

Task Assignment for Worker 3 (Storefront Merchandising, Mega Menu, Cookie Consent & PWA Worker):

Write ownership:
- `app/page.tsx`
- `components/layout/mega-menu.tsx`
- `components/layout/header.tsx`
- `components/common/cookie-consent.tsx`
- `app/layout.tsx`
- `public/icon-192.png` & `public/icon-512.png` & `public/sw.js`
- `app/search/page.tsx`

Specific tasks:
1. Update `app/page.tsx` (AC2 / R1):
   - Replace hardcoded static layout with dynamic CMS section consumption:
     - Fetch sections from `/api/cms/sections` (with fallback to default fixtures if offline/unseeded).
     - Filter active sections (`isActive: true`), check scheduling dates (`startDate`, `endDate`), and sort by `orderIndex`.
     - Dynamically map section types (HERO, BANNER_STRIP, FLASH_DEALS, PRODUCT_CAROUSEL, CATEGORY_GRID, BRAND_STRIP, FEATURED_BRANDS) to their respective React components in `orderIndex` sequence with zero regressions.
2. Update `components/layout/mega-menu.tsx` and Header (AC4 / R4):
   - Fetch navigation hierarchy from `/api/navigation` (or `/api/categories` with subcategories) with graceful fallback to `lib/navigation-data.ts`.
   - Render dynamic categories, promotional badges (TR/EN), and highlight links.
   - In `components/layout/header.tsx`, connect cart badge and favorites badge to live `useCart()` and `useFavorites()` context hooks rather than static numbers.
3. Create `components/common/cookie-consent.tsx` and integrate into `app/layout.tsx` (R12):
   - Responsive, accessible cookie consent banner with TR/EN localized text ("Çerez Politikası" / "Cookie Policy"), "Tümünü Kabul Et" (Accept All), "Zorunlu Çerezler" (Essential Only), and links to KVKK/Privacy policy.
   - Stores preference in localStorage/cookie so it does not reappear on subsequent visits.
4. Generate PWA assets in `public/` (AC13 / R12):
   - Create valid PNG icons `public/icon-192.png` and `public/icon-512.png` (using node script or canvas buffer) matching `public/manifest.json`.
   - Create `public/sw.js` (service worker) with basic caching strategy for offline assets and PWA installation capability.
5. Update `app/search/page.tsx`:
   - Ensure `searchParams.get("brand")` is parsed alongside `q` and category filters so clicking brand links from the brand directory or homepage properly filters search results.
6. Verify responsive layout across 320px–1920px viewports.
7. Run `npx tsc --noEmit` and verify 0 compile errors.
8. Write `handoff.md` in your working directory and message caller when done.
