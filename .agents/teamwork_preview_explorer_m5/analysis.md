# Milestone M5 Investigation & Implementation Blueprint: Admin Merchandising CMS & Brand Management

## 1. Executive Summary & Scope Overview

Milestone M5 delivers the complete **Admin Merchandising CMS & Brand Management** capability for the Cadde Store marketplace platform. It empowers business administrators to control homepage merchandising layouts, campaign banners, and brand curation in real time without developer code changes, while providing customers with a rich, interactive brand discovery directory.

### Core Capabilities within Scope
1. **Dynamic Homepage Merchandising Layer**:
   - `components/homepage/hero-section.tsx`: Live fetching of `HERO` sections & banners from `/api/cms/sections` with locale-aware TR/EN text, active slide navigation, custom badges, and graceful fallback fixtures.
   - `components/homepage/campaign-banner-strips.tsx`: Live fetching of `BANNER_STRIP` / `CAMPAIGN_STRIP` sections from `/api/cms/sections`, multi-card visual rendering with badges and target links, and fallback to default campaign strips.
   - `components/homepage/brand-quick-strip.tsx`: Dynamic fetching of featured brands from `/api/brands?featured=true` with logo display, search redirection, horizontal scroll carousel, and responsive 3D action buttons.
   - `components/homepage/featured-brands-section.tsx`: Live fetching of featured brands with product count badges, search links, and header navigation linking to the public brand directory (`/brands`).
2. **Admin Merchandising CMS Studio (`/admin/cms`) & Route Handlers**:
   - `app/api/cms/sections/route.ts`: Full CRUD (`GET`, `POST`, `PUT`, `DELETE`), supporting admin preview (`?all=true`), sorting by `orderIndex`, and `AuditLog` emission on all mutations.
   - `app/api/cms/banners/route.ts`: Full CRUD (`POST`, `PUT`, `DELETE`), order indexing, target destination resolution (`CATEGORY`, `BRAND`, `SELLER`, `PRODUCT`, `URL`), and `AuditLog` emission on all mutations.
   - `app/admin/cms/page.tsx`: Interactive studio with Section creation/editing/reordering/deletion, Banner creation/editing/reordering/deletion, active toggles, and live full-screen preview modals.
3. **Brand Management System (`/brands` & `/admin/brands`) & Route Handlers**:
   - `app/api/brands/route.ts`: `GET` (with `?featured=true`, `?all=true`, `?search=...`, sorting by featured then name, product count aggregations) and `POST` (with Turkish slug generation and `AuditLog`).
   - `app/api/brands/[id]/route.ts`: `GET` (by ID/slug), `PUT` (with `AuditLog`), and `DELETE` (with relational safety and `AuditLog`).
   - `app/brands/page.tsx`: Public brand catalog with Hero header, Featured brand highlights, Turkish A-Z letter filter ("ALL", "A", "B", "C", "Ç", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z"), live search, product counts, and empty states.
   - `app/admin/brands/page.tsx`: Admin management interface with logo/banner previews, search, Turkish auto-slug generation, featured toggles, status badges, and deletion safeguards.
4. **Administrative Audit Trail**:
   - Ensuring `AuditLog` records are reliably created for every CMS and Brand mutation: `CMS_SECTION_CREATED`, `CMS_SECTION_UPDATED`, `CMS_SECTION_DELETED`, `BANNER_CREATED`, `BANNER_UPDATED`, `BANNER_DELETED`, `BRAND_CREATED`, `BRAND_UPDATED`, `BRAND_DELETED`.

---

## 2. Current Codebase Audit & Gap Analysis

### 2.1 CMS API Routes (`app/api/cms/*`)
| Route / File | Method | Current Implementation | Gaps Identified | Required Fix |
|---|---|---|---|---|
| `app/api/cms/sections/route.ts` | `GET` | Fetches `active: true` sections only | Cannot fetch inactive sections for Admin Studio editing | Add `?all=true` query parameter support for admin requests |
| `app/api/cms/sections/route.ts` | `POST` | Creates section, emits `CMS_SECTION_CREATED` | Working, but ensure robust error handling | Keep & verify payload types |
| `app/api/cms/sections/route.ts` | `PUT` | Updates section | **MISSING AuditLog creation** | Add `AuditLog` write with `action: "CMS_SECTION_UPDATED"` and update metadata |
| `app/api/cms/sections/route.ts` | `DELETE` | **MISSING ENTIRELY** | Admins cannot delete sections via API | Implement `DELETE` handler accepting `?id=...`, deleting section + cascading banners, emitting `CMS_SECTION_DELETED` |
| `app/api/cms/banners/route.ts` | `POST` | Creates banner, emits `BANNER_CREATED` | Working | Keep & verify |
| `app/api/cms/banners/route.ts` | `PUT` | Updates banner | **MISSING AuditLog creation** | Add `AuditLog` write with `action: "BANNER_UPDATED"` |
| `app/api/cms/banners/route.ts` | `DELETE` | Deletes banner | **MISSING AuditLog creation** | Add `AuditLog` write with `action: "BANNER_DELETED"` |

### 2.2 Brand API Routes (`app/api/brands/*`)
| Route / File | Method | Current Implementation | Gaps Identified | Required Fix |
|---|---|---|---|---|
| `app/api/brands/route.ts` | `GET` | Returns active brands, supports `?featured=true` | Does not support `?all=true` for admin management or `?search=` filter | Add `?all=true` and search query support |
| `app/api/brands/route.ts` | `POST` | Creates brand, emits `BRAND_CREATED` | Working with `P2002` duplicate check | Keep & verify |
| `app/api/brands/[id]/route.ts` | `GET` | Returns brand with products | Working | Keep & verify |
| `app/api/brands/[id]/route.ts` | `PUT` | Updates brand, emits `BRAND_UPDATED` | Working | Keep & verify |
| `app/api/brands/[id]/route.ts` | `DELETE` | Deletes brand, emits `BRAND_DELETED` | Should safely decouple products before deleting | Set product `brandId: null` if needed, then delete brand, emit `BRAND_DELETED` |

### 2.3 Homepage Merchandising Components (`components/homepage/*`)
| Component | Current State | Missing Functionality | Proposed Implementation |
|---|---|---|---|
| `components/homepage/hero-section.tsx` | Fetches `/api/cms/sections` and finds `HERO` section | Category strip below has `href="#"`; needs clean fallback handling and robust interval cleanup | Ensure category strip links to search/categories (`/search?q=...` or `/category/...`); guarantee fallback to `getMockBanners(language)` if API is unavailable |
| `components/homepage/campaign-banner-strips.tsx` | Completely hardcoded 6 campaigns | **Does NOT fetch from `/api/cms/sections`** | Add `useEffect` to fetch `/api/cms/sections`, match `type === "BANNER_STRIP"` or `type === "CAMPAIGN_STRIP"`, map banners dynamically to visual cards with fallback to default campaigns |
| `components/homepage/brand-quick-strip.tsx` | Completely hardcoded brand array | **Does NOT fetch from `/api/brands?featured=true`** | Add `useEffect` to fetch `/api/brands?featured=true`, dynamically display live brand logos/text, fallback to default brands list |
| `components/homepage/featured-brands-section.tsx` | Calls `getMockBrands(language)` only; header "Tümünü Gör" has `href="#"` | **Does NOT fetch live brands; broken link** | Fetch `/api/brands?featured=true` with fallback; fix "Tümünü Gör" to link to `/brands` |

### 2.4 Admin CMS Studio (`app/admin/cms/page.tsx`)
- **Missing Controls in UI**:
  - Section Header: Currently only has "Add Banner" button. Missing "Edit Section" button, "Delete Section" button, and Section Reorder (Move Up / Down) buttons.
  - Section Reorder: Needs to trigger `PUT /api/cms/sections` with adjusted `orderIndex`.
  - Banner Reorder: Needs to trigger `PUT /api/cms/banners` with adjusted `orderIndex`.
  - API query: Should call `/api/cms/sections?all=true` so that drafts/inactive sections can be viewed and activated.

### 2.5 Public Brand Catalog & Admin Brand Management
- `app/brands/page.tsx`:
  - Verify complete Turkish alphabet filter (including Ç, Ğ, İ, Ö, Ş, Ü).
  - Ensure links point to `/search?brand=${encodeURIComponent(brand.name)}`.
  - Verify bilingual texts (TR/EN) and responsive layout (mobile 2-col, tablet 4-col, desktop 6-col).
- `app/admin/brands/page.tsx`:
  - Fetch `/api/brands?all=true` to manage inactive brands.
  - Implement Turkish character-safe auto-slugification (`ş`->`s`, `ç`->`c`, `ğ`->`g`, `ü`->`u`, `ö`->`o`, `ı`->`i`).
  - Add image error fallback handlers and visual logo/banner previews.

---

## 3. Step-by-Step Implementation Strategy for Worker

### Step 1: Upgrade CMS Route Handlers (`app/api/cms/*`)
1. **Edit `app/api/cms/sections/route.ts`**:
   - In `GET`: Inspect `searchParams.get("all")`. If `"true"`, query `prisma.homepageSection.findMany({ orderBy: { orderIndex: "asc" }, include: { banners: { orderBy: { orderIndex: "asc" } } } })`. Otherwise query `where: { active: true }`.
   - In `PUT`: Include `prisma.auditLog.create` for `CMS_SECTION_UPDATED` with updated attributes.
   - In `DELETE`: Add `export async function DELETE(request: Request)`:
     - Verify admin session (`user.role === "ADMIN"`).
     - Extract `id` from URL search params.
     - Execute `prisma.homepageSection.delete({ where: { id } })`.
     - Record `AuditLog` with `action: "CMS_SECTION_DELETED"`, `entityType: "CMS"`, `entityId: id`.
     - Return `{ success: true }`.
2. **Edit `app/api/cms/banners/route.ts`**:
   - In `PUT`: Add `AuditLog` creation with `action: "BANNER_UPDATED"`, `entityType: "CMS"`.
   - In `DELETE`: Add `AuditLog` creation with `action: "BANNER_DELETED"`, `entityType: "CMS"`.

### Step 2: Upgrade Brand Route Handlers (`app/api/brands/*`)
1. **Edit `app/api/brands/route.ts`**:
   - In `GET`: Support `?all=true` (for admin view), `?featured=true`, and `?search=` filtering. Include `_count: { select: { products: true } }`. Sort by `[{ isFeatured: "desc" }, { name: "asc" }]`.
   - In `POST`: Validate required fields (`name`, `slug`, `logoUrl`), sanitize slug, handle duplicate slug errors (`P2002`), create brand, record `AuditLog` (`action: "BRAND_CREATED"`).
2. **Edit `app/api/brands/[id]/route.ts`**:
   - In `PUT`: Update brand attributes, record `AuditLog` (`action: "BRAND_UPDATED"`).
   - In `DELETE`: First update any associated products to disconnect `brandId` (`prisma.product.updateMany({ where: { brandId: params.id }, data: { brandId: null } })`), then delete brand, record `AuditLog` (`action: "BRAND_DELETED"`).

### Step 3: Integrate Homepage Merchandising Components
1. **Edit `components/homepage/hero-section.tsx`**:
   - Fetch `/api/cms/sections` on mount and locale change.
   - Extract `HERO` section banners; map title, subtitle, badge, cta, bgGradient, imageUrl, targetUrl based on active language (`language`).
   - Fix category quick link strip below hero to route to `/search?q=${encodeURIComponent(cat.name)}` or `/category/${cat.id}` instead of `href="#"`.
   - Ensure fallback to `getMockBanners(language)` if DB has no banners or network fails.
2. **Edit `components/homepage/campaign-banner-strips.tsx`**:
   - Add state `campaigns` initialized with fallback campaign list.
   - Fetch `/api/cms/sections` in `useEffect`. Look for section with `type === "BANNER_STRIP"` or `type === "CAMPAIGN_STRIP"`.
   - If banners exist in the section, transform them into dynamic campaign cards with bilingual titles/subtitles, date badges, target URLs, and background gradients.
   - If no section exists, maintain graceful fallback to default campaign strips.
3. **Edit `components/homepage/brand-quick-strip.tsx`**:
   - Add state `brands` initialized with default brand items.
   - Fetch `/api/brands?featured=true` in `useEffect`.
   - If API returns brands, display their names and logos in the horizontal scroll strip, linking to `/search?brand=${encodeURIComponent(brand.name)}`.
   - Fall back to default brand items if API returns empty or fails.
4. **Edit `components/homepage/featured-brands-section.tsx`**:
   - Fetch `/api/brands?featured=true` in `useEffect`.
   - Render `BrandCard` for each brand, with fallback to `getMockBrands(language)`.
   - Update header link "Tümünü Gör / View All" from `href="#"` to `href="/brands"`.

### Step 4: Refine Admin CMS Studio (`app/admin/cms/page.tsx`)
1. In `AdminCmsPage`:
   - Fetch `/api/cms/sections?all=true` to load all sections.
   - Add section actions to each section header:
     - **Edit Section**: Opens Section modal pre-filled with section data.
     - **Delete Section**: Confirmation alert -> calls `DELETE /api/cms/sections?id=${section.id}` -> refreshes list.
     - **Move Up / Move Down**: Swaps `orderIndex` with adjacent section and calls `PUT /api/cms/sections` for persistence.
     - **Active Status Toggle**: Quick toggle calling `PUT /api/cms/sections` with `{ id: section.id, active: !section.active }`.
   - Add banner actions to each banner card:
     - **Edit Banner**: Pre-fills and opens banner modal.
     - **Delete Banner**: Confirmation alert -> calls `DELETE /api/cms/banners?id=${banner.id}` -> refreshes list.
     - **Move Up / Move Down**: Swaps `orderIndex` within section and calls `PUT /api/cms/banners`.
     - **Active Status Toggle**: Toggles banner active status via `PUT /api/cms/banners`.
     - **Live Full Preview Modal**: Renders desktop/mobile visual preview with target URL badge.

### Step 5: Refine Brand Management Pages (`app/brands/page.tsx` & `app/admin/brands/page.tsx`)
1. **Edit `app/brands/page.tsx` (Public Directory)**:
   - Fetch `/api/brands` on mount.
   - Full Turkish alphabet filter array: `["ALL", "A", "B", "C", "Ç", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M", "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z"]`.
   - Case-insensitive filtering matching Turkish characters (`toLocaleUpperCase("tr-TR")`).
   - Links navigate to `/search?brand=${encodeURIComponent(brand.name)}`.
   - Display product counts (`brand._count?.products || 0`).
   - Clean empty state when search returns 0 results.
2. **Edit `app/admin/brands/page.tsx` (Admin Management)**:
   - Fetch `/api/brands?all=true`.
   - Auto-slug generator replacing Turkish characters properly (`ş`->`s`, `ç`->`c`, `ğ`->`g`, `ü`->`u`, `ö`->`o`, `ı`->`i`).
   - Add / Edit modals with inputs for: `name`, `slug`, `logoUrl`, `bannerUrl`, `descriptionTR`, `descriptionEN`, `isFeatured`, `status`.
   - Instant delete with confirmation and error handling.
   - Live logo preview and product count badge.

---

## 4. Audit Log Schema & Mutation Verification Matrix

| Mutation Event | Triggering Route / Action | `entityType` | `action` | Sample `metadataJson` |
|---|---|---|---|---|
| Create CMS Section | `POST /api/cms/sections` | `CMS` | `CMS_SECTION_CREATED` | `{"sectionTitle":"Yaz Fırsatları","type":"HERO"}` |
| Update CMS Section | `PUT /api/cms/sections` | `CMS` | `CMS_SECTION_UPDATED` | `{"sectionTitle":"Yaz Fırsatları","active":false}` |
| Delete CMS Section | `DELETE /api/cms/sections` | `CMS` | `CMS_SECTION_DELETED` | `{"sectionId":"sec-123"}` |
| Create CMS Banner | `POST /api/cms/banners` | `CMS` | `BANNER_CREATED` | `{"bannerTitle":"Sonbahar İndirimi","target":"/category/women"}` |
| Update CMS Banner | `PUT /api/cms/banners` | `CMS` | `BANNER_UPDATED` | `{"bannerTitle":"Sonbahar İndirimi","orderIndex":2}` |
| Delete CMS Banner | `DELETE /api/cms/banners` | `CMS` | `BANNER_DELETED` | `{"bannerId":"ban-456"}` |
| Create Brand | `POST /api/brands` | `BRAND` | `BRAND_CREATED` | `{"brandName":"Puma","slug":"puma"}` |
| Update Brand | `PUT /api/brands/[id]` | `BRAND` | `BRAND_UPDATED` | `{"brandName":"Puma","isFeatured":true}` |
| Delete Brand | `DELETE /api/brands/[id]` | `BRAND` | `BRAND_DELETED` | `{"brandName":"Puma"}` |

---

## 5. Verification & Testing Protocol

### 5.1 Verification Commands
1. **Schema and Database Consistency**:
   ```bash
   npx prisma generate
   ```
2. **Compile and Build Verification**:
   ```bash
   npm run build
   ```
   Must compile all routes including `/brands`, `/admin/cms`, `/admin/brands`, `/api/cms/*`, and `/api/brands/*` with 0 errors.

### 5.2 API Handshake Tests
- `GET /api/cms/sections`: Returns HTTP 200 with JSON array of active sections and nested banners.
- `GET /api/brands?featured=true`: Returns HTTP 200 with JSON array of featured brands including `_count.products`.
- `GET /api/brands`: Returns HTTP 200 with all active brands.
- `GET /api/admin/audit`: Returns HTTP 200 with logged audit records after mutations.

### 5.3 UI Functional Checklist
- [ ] **Homepage (`/`)**:
  - Hero slider rotates banners fetched from `/api/cms/sections`.
  - Campaign strips render banners or fallback strips without layout shifts.
  - Brand quick strip displays featured brands with smooth scrolling.
  - Featured brands grid displays brands and links "Tümünü Gör" to `/brands`.
- [ ] **Public Brands Directory (`/brands`)**:
  - Hero banner and featured brands strip visible.
  - A-Z Turkish letter filter filters brands accurately.
  - Search input filters brands by name or slug.
  - Brand cards click through to filtered product search.
- [ ] **Admin CMS Studio (`/admin/cms`)**:
  - Sections can be created, edited, reordered up/down, toggled active/draft, and deleted.
  - Banners can be added to sections, edited, reordered up/down, previewed in modal, and deleted.
- [ ] **Admin Brands Management (`/admin/brands`)**:
  - Brands can be created with Turkish auto-slugs, edited, and deleted.
  - Featured and status toggles update immediately.
- [ ] **Admin Audit Trail (`/admin/audit`)**:
  - Filter by `CMS` shows all section/banner actions.
  - Filter by `BRAND` shows all brand creation/update/delete actions.
