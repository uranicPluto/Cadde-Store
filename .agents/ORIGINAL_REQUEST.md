# Original User Request

## Initial Request — 2026-08-24T06:04:43Z

Upgrade the existing Cadde Store platform into an enterprise Marketplace Control Center & Visual Website Builder Platform providing complete non-developer administrative control over the entire storefront (Homepage Studio, Multi-Page Builder, Product Page Builder, Category Page Builder, Visual Navigation, Global Appearance Studio, Media Asset Manager with Usage Tracking, SEO Control Center, Admin RBAC, Analytics Dashboard, AI Assistant, and Website Health Center) while preserving all existing routes, business logic, repositories, authentication, and 273 automated tests.

Working directory: e:\Antigravity\Cadde Store
Integrity mode: development

---

## 1. System Architecture & Baseline Preservation

- Repository: uranicPluto/Cadde-Store (Branch: main)
- Working Directory: e:\Antigravity\Cadde Store
- Current Baseline: 80 routes compiling, 273 automated E2E tests passing (100%), 15 complete admin modules, full seller hub (/seller/*), customer account suite (/account/*), bilingual TR/EN engine, and Prisma SQLite database.
- Golden Rule: Non-destructive enhancement. Preserve all existing storefront routes, customer flows, admin modules, APIs, authentication, repositories, and UI styling. Enhance and layer on top of what is built; do not rewrite or delete working components.
- End-to-End Principle: Every feature must be end-to-end connected: UI → Validation → API → Database Transaction → Version Snapshot → Audit Log → Storefront Rendering → Tests.

---

## 2. Requirements

### R1. Full Website Page Builder & Multi-Page CMS
Implement a unified multi-page builder (Admin → Website → Pages) enabling admins to create, edit, duplicate, preview, schedule, publish, and archive:
- Landing pages (Category landing, Brand landing, Campaign pages, Flash-sale pages, Search landing pages)
- Static & Policy pages (About, Contact, FAQ, Help Center, Terms of Service, Privacy Policy, KVKK, Shipping, Returns)
- Custom promotional campaign pages with modular section composition and slug routing.

### R2. Global Appearance & Design Studio
Provide a centralized design customizer (Admin → Website → Global Appearance) controlling:
- Branding & Tokens: Logo, Favicon, Marketplace Name, Tagline, Brand & Accent Colors, Border Radius, Typography scales, and Button variants.
- Header & Navigation Customizer: Logo position, Search bar style, Category dropdowns, Announcement bar toggle/message, Account/Cart/Seller navigation shortcuts.
- Footer Customizer: Multi-column link menus, Social media handles, Payment provider icons, Trust badges, Newsletter subscription box, and Copyright notice.

### R3. Visual Navigation & Mega-Menu Builder
Upgrade /admin/navigation into a visual drag-and-drop hierarchy builder:
- Multi-level nested menus (Header, Mega-Menu, Mobile Drawer, Footer).
- Insertion of category links, brand collections, campaign badges, promotional image cards inside mega-menus.
- Device visibility (Show/Hide on Desktop or Mobile) and time-scheduled menu items.

### R4. Product Page & Category Page Layout Builders
- Product Page Builder: Drag-and-drop reordering, toggling, and configuration of product detail blocks (Gallery, Title/Brand, Rating/Reviews, Price/Discounts, Variants, Seller Card, Shipping Estimator, Buy/Add to Cart, Trust Badges, Description, Specs, Reviews, and Related/Recommended Products).
- Category Page Builder: Configurable layout blocks (Category Hero, Subcategory Pills, Brand Carousel, Promo Banners, Filter Bar, Product Grid, and Recommendation Rows).

### R5. Enhanced Media Asset Manager with Usage Tracking & Protection
Upgrade /admin/media with:
- Drag-and-drop multi-file upload, image cropping, compression, alt text (TR/EN), tags, and folder categorization.
- Usage Tracking & Delete Protection: Inspect where each asset is currently referenced (e.g. Used in: Homepage Hero, Summer Campaign, Women's Category) to prevent accidental deletion of live assets.

### R6. Advanced Preview Center, Autosave & Safe Publishing Checklist
- Multi-Persona Preview Center: Preview draft layouts as Guest, Logged-in Customer, Seller, in Turkish/English, TRY/USD, across Desktop, Tablet, and Mobile.
- Autosave & Draft Recovery: Continuous draft persistence with unsaved change indicators, last saved timestamps, and browser crash recovery.
- Pre-Publishing Quality Checklist: Automated validation gate prior to publishing (checks for broken links, missing translations, invalid dates, unconfigured CTAs, out-of-stock items, and displays a summary diff of detected changes).

### R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions
Extend admin permissions beyond simple global admin:
- Specific role profiles: Super Admin (Full access), Content Manager (Pages, Homepage, Media, Navigation), Merchandising Manager (Catalog, Bestsellers, Deals, Campaigns), Marketing Manager (Ads, Coupons, Analytics), Operations Manager (Orders, Returns, Sellers).
- Mandatory audit logging for every role action in /admin/audit.

### R8. SEO Control Center & Website Health Monitor
- SEO Studio: Granular control over Meta Titles, Descriptions, Keywords, Canonical URLs, OpenGraph social preview cards, and XML Sitemap inclusion per page/product/category.
- Website Health Center: Real-time system diagnostic dashboard tracking system status, database health, broken links, missing translations, out-of-stock items, expired campaigns, and scheduled activations with direct one-click remediation links.

### R9. Merchandising Intelligence & AI Website Assistant
- Section Analytics: Impression, click, CTR, add-to-cart, and revenue attribution per storefront block.
- AI Merchandising Assistant: Natural language prompt-to-layout generator (e.g.  Create a Summer Fashion campaign with 6 trending products Zara/Mango brands and a 20% discount badge) outputting draft section configurations for review.
- Market Research Bridge: Direct action triggers from /admin/research insights into draft merchandising blocks.

---

## 3. Acceptance Criteria

### Storefront & Multi-Page Control
- [ ] Non-developer administrator can create, edit, reorder, preview, and publish new pages and edit existing static/policy pages without touching code.
- [ ] Global Appearance Studio updates branding, colors, announcement bar, and footer links across the live storefront.
- [ ] Visual Navigation builder supports nested multi-level items, mega-menu banners, and drag-and-drop reordering.
- [ ] Product page and Category page block configurators allow reordering and toggling detail blocks.

### Media & Asset Integrity
- [ ] Media Manager displays active usage references for each image and prevents deletion of assets in active use.
- [ ] Image uploads support cropping, compression, alt text (TR/EN), and responsive mobile/desktop variants.

### Preview, Publishing & Safety
- [ ] Preview Center supports switching viewports (Desktop/Tablet/Mobile), user personas (Guest/Customer/Seller), language (TR/EN), and currency (TRY/USD).
- [ ] Pre-publishing checklist validates all required fields, translations, and links before enabling the publish button.
- [ ] Autosave saves draft state continuously with last-saved timestamp and recovery prompts on reload.
- [ ] Version history supports snapshotting every publish and rolling back with one click.

### System, Security & Quality Gate
- [ ] Granular RBAC enforces permissions across Super Admin, Content Manager, Merchandising, Marketing, and Operations.
- [ ] Every sensitive action generates a detailed event record in /admin/audit.
- [ ] Website Health dashboard displays live status for database, APIs, missing translations, and out-of-stock items.
- [ ] npx tsc --noEmit passes with 0 errors across all routes.
- [ ] Full E2E test suite passes with 100% success rate (npm test).
- [ ] Production build succeeds cleanly (npm run build).
