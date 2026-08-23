## 2026-08-22T22:54:52Z
You are the Worker for Milestone M5: Admin Merchandising CMS & Brand Management.
Your working directory is: e:\Antigravity\Cadde Store\.agents\teamwork_preview_worker_m5
Authoritative request: e:\Antigravity\Cadde Store\.agents\ORIGINAL_REQUEST.md
Project specification: e:\Antigravity\Cadde Store\PROJECT.md
Explorer handoff: e:\Antigravity\Cadde Store\.agents\teamwork_preview_explorer_m5\handoff.md
Explorer analysis: e:\Antigravity\Cadde Store\.agents\teamwork_preview_explorer_m5\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your exclusive write ownership:
- app/api/cms/sections/route.ts
- app/api/cms/banners/route.ts
- app/api/brands/route.ts
- app/api/brands/[id]/route.ts
- components/homepage/hero-section.tsx
- components/homepage/campaign-banner-strips.tsx
- components/homepage/brand-quick-strip.tsx
- components/homepage/featured-brands-section.tsx
- app/admin/cms/page.tsx
- app/admin/brands/page.tsx
- app/brands/page.tsx

Your task:
1. Read the Explorer handoff and analysis reports for M5.
2. Implement all components and handlers:
   - `app/api/cms/sections/route.ts`: Support `?all=true` for admin view, implement `DELETE` method to remove sections, add `CMS_SECTION_UPDATED` & `CMS_SECTION_DELETED` records in `AuditLog`.
   - `app/api/cms/banners/route.ts`: Implement `BANNER_UPDATED` & `BANNER_DELETED` records in `AuditLog`.
   - `app/api/brands/route.ts`: Support `?all=true` for admin listing of all brands, ensure `_count.products` aggregation.
   - `app/api/brands/[id]/route.ts`: Safely disconnect products before deletion, log `BRAND_UPDATED` & `BRAND_DELETED` to `AuditLog`.
   - `components/homepage/hero-section.tsx`: Ensure fallback to mock banners when empty, wire quick category links to `/category/{slug}` or `/search?q={term}`.
   - `components/homepage/campaign-banner-strips.tsx`: Fetch `BANNER_STRIP` sections from `/api/cms/sections` with fallback to default campaigns.
   - `components/homepage/brand-quick-strip.tsx`: Fetch featured brands from `/api/brands?featured=true` with fallback to default brands.
   - `components/homepage/featured-brands-section.tsx`: Fetch featured brands from `/api/brands?featured=true` with fallback, and link header "Tümünü Gör" to `/brands`.
   - `app/admin/cms/page.tsx`: Full studio support for adding/editing sections, adding/editing banners, section reordering (Move Up / Down), banner reordering, active status toggles, 16:9 preview modal, and delete actions with live toast updates.
   - `app/admin/brands/page.tsx`: Admin management panel with auto-slug generator supporting Turkish characters (ğ, ü, ş, ı, ö, ç), logo/banner URL inputs, featured checkbox, and audit logging.
   - `app/brands/page.tsx`: Public brand catalog with Turkish A-Z alphabet filter (including Ç, Ğ, İ, Ö, Ş, Ü), search input, product count badges, and links to `/search?brand=...`.
3. Run verification:
   - `npx tsc --noEmit` (must return 0 errors)
   - `npm run build` (must compile cleanly with 0 errors)
4. Write your completion report in `e:\Antigravity\Cadde Store\.agents\teamwork_preview_worker_m5\handoff.md` including Observation, Logic Chain, Caveats, Conclusion, and Verification results.
5. Send a completion message back when done.
