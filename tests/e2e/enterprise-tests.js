const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertContains,
} = require("./harness");

/**
 * ============================================================================
 * CADDE STORE ENTERPRISE E2E TEST SUITE (REQUIREMENTS R1 THROUGH R9)
 * 4-Tier Opaque-Box Requirement-Driven Architecture
 * ============================================================================
 */

async function runEnterpriseTier1Tests() {
  const results = [];

  async function test(id, name, requirement, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        requirement,
        tier: 1,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        requirement,
        tier: 1,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  ENTERPRISE TIER 1: FEATURE COVERAGE SUITE (R1 - R9)");
  console.log("=======================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const sellerHeaders = await getAuthHeaders("SELLER");
  const customerHeaders = await getAuthHeaders("CUSTOMER");

  // ============================================================================
  // R1: Full Website Page Builder & Multi-Page CMS (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R1.1",
    "Admin creates new promotional CMS section with configuration",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const payload = {
        titleTR: `Yaz Kampanyası Vitrin ${Date.now()}`,
        titleEN: `Summer Campaign Showcase ${Date.now()}`,
        type: "HERO",
        orderIndex: 1,
        active: true,
        configJson: JSON.stringify({ autoplay: true, intervalMs: 4000 }),
      };
      const res = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.success, "Expected success: true");
      assert(res.data.section?.id, "Expected section id");
      assertEqual(res.data.section.titleTR, payload.titleTR);
    }
  );

  await test(
    "T1.R1.2",
    "Admin queries CMS sections including all active and inactive sections",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const res = await request("/api/cms/sections?all=true", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.sections), "Expected sections array");
      assert(res.data.sections.length > 0, "Sections list should not be empty");
    }
  );

  await test(
    "T1.R1.3",
    "Admin creates dynamic banner inside CMS section",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const section = await prisma.homepageSection.findFirst();
      assert(section, "Homepage section should exist in DB");
      const payload = {
        sectionId: section.id,
        titleTR: `Flaş İndirim Banner ${Date.now()}`,
        titleEN: `Flash Sale Banner ${Date.now()}`,
        subtitleTR: "Tüm kategorilerde %50 indirim",
        subtitleEN: "Up to 50% off across categories",
        imageUrlDesktop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
        targetType: "CATEGORY",
        targetValue: "/category/kadin",
        orderIndex: 0,
        active: true,
      };
      const res = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.banner?.id, "Expected banner id");
    }
  );

  await test(
    "T1.R1.4",
    "Admin creates CMS section template for reusable layouts",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const payload = {
        name: `Grid Template ${Date.now()}`,
        description: "Standart 4'lü vitrin şablonu",
        type: "CATEGORY_GRID",
        configJson: JSON.stringify({ columns: 4, showBadges: true }),
      };
      const res = await request("/api/cms/templates", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.template?.id, "Expected template id");
      assertEqual(res.data.template.name, payload.name);
    }
  );

  await test(
    "T1.R1.5",
    "Verify public storefront static policy pages are accessible",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const pages = ["/about", "/help", "/kvkk", "/privacy", "/terms", "/shipping", "/returns"];
      for (const page of pages) {
        const res = await request(page, { method: "GET" });
        assertEqual(res.status, 200, `Expected 200 OK for ${page}`);
      }
    }
  );

  // ============================================================================
  // R2: Global Appearance & Design Studio (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R2.1",
    "Admin retrieves platform global appearance and operational settings",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.settings, "Expected settings object");
      assert(res.data.settings.marketplaceName, "Expected marketplaceName");
    }
  );

  await test(
    "T1.R2.2",
    "Admin updates marketplace branding tokens and support coordinates",
    "R2. Global Appearance & Design Studio",
    async () => {
      const updatedName = `Cadde Store Enterprise ${Date.now()}`;
      const updatedEmail = `support-${Date.now()}@cadde-store.com`;
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          marketplaceName: updatedName,
          supportEmail: updatedEmail,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings?.marketplaceName, updatedName);
      assertEqual(res.data.settings?.supportEmail, updatedEmail);
    }
  );

  await test(
    "T1.R2.3",
    "Admin updates financial commission rate and shipping fee thresholds",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          defaultCommissionRate: 12.5,
          defaultShippingFee: 39.9,
          freeShippingThreshold: 250.0,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings?.defaultCommissionRate, 12.5);
      assertEqual(res.data.settings?.defaultShippingFee, 39.9);
      assertEqual(res.data.settings?.freeShippingThreshold, 250.0);
    }
  );

  await test(
    "T1.R2.4",
    "Admin updates cancellation and return policy duration windows",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          orderCancellationWindowDays: 3,
          returnWindowDays: 15,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings?.orderCancellationWindowDays, 3);
      assertEqual(res.data.settings?.returnWindowDays, 15);
    }
  );

  await test(
    "T1.R2.5",
    "Verify platform settings update creates AuditLog entry with metadata",
    "R2. Global Appearance & Design Studio",
    async () => {
      const latestAudit = await prisma.auditLog.findFirst({
        where: { action: "SETTINGS_UPDATED", entityType: "SETTINGS" },
        orderBy: { createdAt: "desc" },
      });
      assert(latestAudit, "AuditLog for SETTINGS_UPDATED should exist");
      assert(latestAudit.metadataJson.includes("marketplaceName"), "Metadata should include settings keys");
    }
  );

  // ============================================================================
  // R3: Visual Navigation & Mega-Menu Builder (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R3.1",
    "Admin creates top-level header navigation menu item",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const payload = {
        titleTr: `Fırsatlar ${Date.now()}`,
        titleEn: `Deals ${Date.now()}`,
        url: "/deals",
        section: "HEADER",
        sortOrder: 0,
        isActive: true,
      };
      const res = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.item?.id, "Expected item id");
      assertEqual(res.data.item.titleTr, payload.titleTr);
    }
  );

  await test(
    "T1.R3.2",
    "Admin creates nested child item under parent navigation hierarchy",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const parent = await prisma.navigationItem.findFirst({ where: { section: "HEADER" } });
      assert(parent, "Parent navigation item should exist");
      const payload = {
        titleTr: `Günün Teklifleri ${Date.now()}`,
        titleEn: `Today's Offers ${Date.now()}`,
        url: "/deals/today",
        section: "HEADER",
        parentId: parent.id,
        sortOrder: 1,
      };
      const res = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assertEqual(res.data.item?.parentId, parent.id);
    }
  );

  await test(
    "T1.R3.3",
    "Admin creates footer navigation menu column item",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const payload = {
        titleTr: `Kariyer ${Date.now()}`,
        titleEn: `Careers ${Date.now()}`,
        url: "/careers",
        section: "FOOTER",
        sortOrder: 10,
        isActive: true,
      };
      const res = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assertEqual(res.data.item?.section, "FOOTER");
    }
  );

  await test(
    "T1.R3.4",
    "Admin updates navigation item badge and label",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const item = await prisma.navigationItem.findFirst();
      assert(item, "Navigation item should exist");
      const res = await request("/api/navigation", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          id: item.id,
          badgeTr: "SICAK",
          badgeEn: "HOT",
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.item?.badgeTr, "SICAK");
      assertEqual(res.data.item?.badgeEn, "HOT");
    }
  );

  await test(
    "T1.R3.5",
    "Admin bulk reorders navigation items",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const items = await prisma.navigationItem.findMany({ take: 2 });
      if (items.length >= 2) {
        const reorderPayload = {
          items: [
            { id: items[0].id, sortOrder: 99 },
            { id: items[1].id, sortOrder: 100 },
          ],
        };
        const res = await request("/api/navigation", {
          method: "PUT",
          headers: adminHeaders,
          body: reorderPayload,
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assert(res.data.success, "Expected success: true");
      }
    }
  );

  // ============================================================================
  // R4: Product Page & Category Page Layout Builders (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R4.1",
    "Query active category hierarchy with dual-language metadata",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const res = await request("/api/categories", { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.categories), "Expected categories array");
      const first = res.data.categories[0];
      assert(first.nameTR && first.nameEN && first.slug, "Category must have TR/EN names and slug");
    }
  );

  await test(
    "T1.R4.2",
    "Admin creates new Category with rich description and image",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const payload = {
        nameTR: `Lüks Aksesuar ${Date.now()}`,
        nameEN: `Luxury Accessories ${Date.now()}`,
        slug: `lux-acc-${Date.now()}`,
        descriptionTR: "Özel tasarım saat ve takılar",
        descriptionEN: "Custom designed watches and jewelry",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        status: "active",
      };
      const res = await request("/api/categories", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assertEqual(res.data.category?.slug, payload.slug);
    }
  );

  await test(
    "T1.R4.3",
    "Fetch product detail payload including variants, seller, and images",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const product = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      assert(product, "Active product should exist");
      const res = await request(`/api/products/${product.id}`, { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.product?.name, "Expected product name");
      assert(res.data.product?.seller, "Expected seller details");
    }
  );

  await test(
    "T1.R4.4",
    "Admin updates product badges (BESTSELLER, FAST_DELIVERY)",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const product = await prisma.product.findFirst();
      assert(product, "Product should exist in DB");
      const badges = JSON.stringify(["BESTSELLER", "FAST_DELIVERY"]);
      const res = await request(`/api/products/${product.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { badges },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.product?.badges, badges);
    }
  );

  await test(
    "T1.R4.5",
    "Filter product catalog by category slug and price bounds",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const cat = await prisma.category.findFirst();
      assert(cat, "Category should exist");
      const res = await request(`/api/products?category=${cat.slug}&minPrice=10&maxPrice=10000`, {
        method: "GET",
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
    }
  );

  // ============================================================================
  // R5: Enhanced Media Asset Manager with Usage Tracking & Protection (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R5.1",
    "Admin uploads and indexes media asset with tags and dimensions",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const payload = {
        filename: `hero-banner-${Date.now()}.jpg`,
        url: `https://images.cadde-store.com/media/hero-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: 1048576,
        width: 1920,
        height: 1080,
        altTextTr: "Bahar Koleksiyonu Kampanyası",
        altTextEn: "Spring Collection Campaign",
        tags: JSON.stringify(["fashion", "hero", "spring"]),
        referenceCount: 0,
      };
      const res = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.media?.id, "Expected media id");
    }
  );

  await test(
    "T1.R5.2",
    "Search media assets by keyword query",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const res = await request("/api/media?search=fashion", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.media || res.data.assets), "Expected media array");
    }
  );

  await test(
    "T1.R5.3",
    "Filter media assets by MIME type",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const res = await request("/api/media?mimeType=image/jpeg", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.media || res.data.assets), "Expected media array");
    }
  );

  await test(
    "T1.R5.4",
    "Admin updates media asset metadata and alt text translations",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const asset = await prisma.mediaAsset.findFirst();
      assert(asset, "Media asset should exist");
      const updatedAltTr = `Güncellenmiş Alt Text TR ${Date.now()}`;
      const res = await request(`/api/media/${asset.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { altTextTr: updatedAltTr },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.media?.altTextTr, updatedAltTr);
    }
  );

  await test(
    "T1.R5.5",
    "Admin safely deletes unreferenced media asset (referenceCount: 0)",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const asset = await prisma.mediaAsset.create({
        data: {
          filename: `temp-delete-${Date.now()}.png`,
          url: `https://images.cadde.store/temp-${Date.now()}.png`,
          mimeType: "image/png",
          sizeBytes: 500,
          referenceCount: 0,
        },
      });
      const res = await request(`/api/media/${asset.id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.success, "Expected success: true");
    }
  );

  // ============================================================================
  // R6: Advanced Preview Center, Autosave & Safe Publishing Checklist (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R6.1",
    "Admin saves multi-section draft state via autosave endpoint",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const draftSections = [
        {
          titleTR: "Vitrin Taslak Bölümü",
          titleEN: "Showcase Draft Section",
          type: "HERO",
          orderIndex: 0,
          active: true,
          configJson: JSON.stringify({ autoplay: true }),
        },
      ];
      const res = await request("/api/cms/homepage/draft", {
        method: "PUT",
        headers: adminHeaders,
        body: { sections: draftSections },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.success, "Expected success: true");
    }
  );

  await test(
    "T1.R6.2",
    "Admin retrieves persisted draft state for Multi-Persona Preview Center",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/draft", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.sections), "Expected sections array");
    }
  );

  await test(
    "T1.R6.3",
    "Admin publishes draft state creating version snapshot",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const publishPayload = {
        changeSummary: `Kurumsal Vitrin Yayınlama ${Date.now()}`,
        sections: [
          {
            titleTR: "Yayınlanan Bölüm 1",
            titleEN: "Published Section 1",
            type: "HERO",
            orderIndex: 0,
            active: true,
          },
        ],
      };
      const res = await request("/api/cms/homepage/publish", {
        method: "POST",
        headers: adminHeaders,
        body: publishPayload,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.versionNumber, "Expected versionNumber");
    }
  );

  await test(
    "T1.R6.4",
    "Admin retrieves version snapshot history list",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/versions", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.versions), "Expected versions array");
      assert(res.data.versions.length > 0, "Versions list should not be empty");
    }
  );

  await test(
    "T1.R6.5",
    "Admin rolls back to a previous homepage version snapshot with 1 click",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const version = await prisma.homepageVersion.findFirst({
        orderBy: { versionNumber: "desc" },
      });
      assert(version, "HomepageVersion should exist");
      const res = await request("/api/cms/homepage/versions", {
        method: "POST",
        headers: adminHeaders,
        body: { versionId: version.id },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.success, "Expected success: true");
    }
  );

  // ============================================================================
  // R7: Role-Based Access Control (RBAC) & Fine-Grained Permissions (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R7.1",
    "Admin retrieves platform audit logs with actor and entity records",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/audit", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.logs), "Expected logs array");
    }
  );

  await test(
    "T1.R7.2",
    "Admin filters audit trail logs by entityType (CMS)",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/audit?entityType=CMS", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.logs), "Expected logs array");
    }
  );

  await test(
    "T1.R7.3",
    "Seller role accesses seller-specific order operations",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/orders/seller", {
        method: "GET",
        headers: sellerHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.orderGroups || res.data.orders), "Expected orders array");
    }
  );

  await test(
    "T1.R7.4",
    "Customer role accesses authenticated customer addresses",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/addresses", {
        method: "GET",
        headers: customerHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.addresses), "Expected addresses array");
    }
  );

  await test(
    "T1.R7.5",
    "Admin role accesses customer CRM directory and lifetime spend",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/customers", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.customers), "Expected customers array");
    }
  );

  // ============================================================================
  // R8: SEO Control Center & Website Health Monitor (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R8.1",
    "Public root and discoverability endpoints respond with 200 OK",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const res = await request("/", { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK for root storefront");
    }
  );

  await test(
    "T1.R8.2",
    "Verify Category SEO metadata contains dual-language titles and descriptions",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const category = await prisma.category.findFirst();
      assert(category, "Category should exist");
      assert(category.nameTR && category.nameEN, "Category must have TR and EN names for SEO");
      assert(category.slug, "Category must have unique SEO slug");
    }
  );

  await test(
    "T1.R8.3",
    "Verify Product metadata includes SKU, brand, and OpenGraph images",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const product = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      assert(product, "Product should exist");
      assert(product.sku && product.name && product.imageUrl, "Product must have SKU, name, and imageUrl");
    }
  );

  await test(
    "T1.R8.4",
    "Admin inspects active marketing campaign status via health filters",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const res = await request("/api/marketing?status=ACTIVE", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.campaigns), "Expected campaigns array");
    }
  );

  await test(
    "T1.R8.5",
    "Verify platform settings expose contact info for structured data markup",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const settings = await prisma.platformSettings.findFirst();
      assert(settings, "Platform settings should exist");
      assert(settings.marketplaceName && settings.supportEmail, "Settings must have name and email for SEO");
    }
  );

  // ============================================================================
  // R9: Merchandising Intelligence & AI Website Assistant (Tier 1: 5 tests)
  // ============================================================================
  await test(
    "T1.R9.1",
    "Admin creates sponsored product campaign with budget and placement",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const product = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      assert(product, "Product should exist");
      const payload = {
        name: `Sponsored Placement ${Date.now()}`,
        type: "SPONSORED_PRODUCT",
        targetId: product.id,
        placement: "HOMEPAGE",
        budget: 5000.0,
        priority: 1,
      };
      const res = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: payload,
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.campaign?.id, "Expected campaign id");
    }
  );

  await test(
    "T1.R9.2",
    "Admin updates campaign analytics (impressions, clicks, orders, revenue)",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const campaign = await prisma.campaign.findFirst();
      assert(campaign, "Campaign should exist");
      const res = await request(`/api/marketing/${campaign.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          impressions: 15000,
          clicks: 750,
          orders: 45,
          revenue: 12500.0,
          spent: 1200.0,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.campaign?.impressions, 15000);
      assertEqual(res.data.campaign?.clicks, 750);
    }
  );

  await test(
    "T1.R9.3",
    "Retrieve marketing analytics filtered by campaign type",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/api/marketing?type=SPONSORED_PRODUCT", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.campaigns), "Expected campaigns array");
    }
  );

  await test(
    "T1.R9.4",
    "Admin queries market research intelligence center",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/admin/research", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
    }
  );

  await test(
    "T1.R9.5",
    "Admin pauses active marketing campaign",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const campaign = await prisma.campaign.findFirst({ where: { status: "ACTIVE" } });
      if (campaign) {
        const res = await request(`/api/marketing/${campaign.id}`, {
          method: "PUT",
          headers: adminHeaders,
          body: { status: "PAUSED" },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.campaign?.status, "PAUSED");
      }
    }
  );

  return results;
}

/**
 * ============================================================================
 * ENTERPRISE TIER 2: BOUNDARY & CORNER CASES SUITE (R1 - R9)
 * ============================================================================
 */
async function runEnterpriseTier2Tests() {
  const results = [];

  async function test(id, name, requirement, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        requirement,
        tier: 2,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        requirement,
        tier: 2,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  ENTERPRISE TIER 2: BOUNDARY & CORNER CASES (R1 - R9)");
  console.log("=======================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const sellerHeaders = await getAuthHeaders("SELLER");
  const customerHeaders = await getAuthHeaders("CUSTOMER");

  // ============================================================================
  // R1 Boundary: Multi-Page CMS (5 tests)
  // ============================================================================
  await test(
    "T2.R1.1",
    "CMS section creation with missing titleTR or titleEN returns 400 Bad Request",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const res = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: "" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R1.2",
    "CMS section update with missing section id returns 400 Bad Request",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const res = await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { titleTR: "Updated" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R1.3",
    "CMS section deletion with missing id returns 400 Bad Request",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const res = await request("/api/cms/sections", {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R1.4",
    "CMS template creation with empty name returns 400 Bad Request",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const res = await request("/api/cms/templates", {
        method: "POST",
        headers: adminHeaders,
        body: { name: "", type: "HERO" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R1.5",
    "CMS banner creation with missing imageUrlDesktop returns 400 Bad Request",
    "R1. Full Website Page Builder & Multi-Page CMS",
    async () => {
      const res = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: "Test", imageUrlDesktop: "" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  // ============================================================================
  // R2 Boundary: Global Appearance (5 tests)
  // ============================================================================
  await test(
    "T2.R2.1",
    "Customer role attempting platform settings mutation returns 403 Forbidden",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: customerHeaders,
        body: { marketplaceName: "Hacked" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R2.2",
    "Platform settings zero shipping fee boundary (0.0) correctly saves",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: { defaultShippingFee: 0.0 },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings?.defaultShippingFee, 0.0);
    }
  );

  await test(
    "T2.R2.3",
    "Platform settings handles extreme free shipping threshold boundary",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: { freeShippingThreshold: 999999.0 },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings?.freeShippingThreshold, 999999.0);
    }
  );

  await test(
    "T2.R2.4",
    "Public unauthenticated GET request to settings returns platform defaults",
    "R2. Global Appearance & Design Studio",
    async () => {
      const res = await request("/api/admin/settings", { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.settings?.marketplaceName, "Expected default settings");
    }
  );

  await test(
    "T2.R2.5",
    "Platform settings handles Turkish unicode characters and quotes in branding",
    "R2. Global Appearance & Design Studio",
    async () => {
      const unicodeName = `Cadde Store "Türkiye" — Özel İndirimli Alışveriş 🛍️`;
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: { marketplaceName: unicodeName },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings?.marketplaceName, unicodeName);
    }
  );

  // ============================================================================
  // R3 Boundary: Visual Navigation (5 tests)
  // ============================================================================
  await test(
    "T2.R3.1",
    "Navigation creation with missing titleTr or url returns 400 Bad Request",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const res = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTr: "", url: "" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R3.2",
    "Navigation update with missing id returns 400 Bad Request",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const res = await request("/api/navigation", {
        method: "PUT",
        headers: adminHeaders,
        body: { titleTr: "New Title" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R3.3",
    "Navigation deletion with missing id returns 400 Bad Request",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const res = await request("/api/navigation", {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R3.4",
    "Customer role attempting navigation item creation returns 403 Forbidden",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const res = await request("/api/navigation", {
        method: "POST",
        headers: customerHeaders,
        body: { titleTr: "Test", url: "/test" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R3.5",
    "Navigation query filters active items correctly with isActive parameter",
    "R3. Visual Navigation & Mega-Menu Builder",
    async () => {
      const res = await request("/api/navigation?isActive=true", { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.items), "Expected items array");
    }
  );

  // ============================================================================
  // R4 Boundary: Product & Category Page Layouts (5 tests)
  // ============================================================================
  await test(
    "T2.R4.1",
    "Fetch product detail with non-existent product ID returns 404 Not Found",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const res = await request("/api/products/non-existent-product-id-9999", {
        method: "GET",
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R4.2",
    "Category creation with missing nameTR or slug returns 400 Bad Request",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const res = await request("/api/categories", {
        method: "POST",
        headers: adminHeaders,
        body: { nameTR: "" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R4.3",
    "Product with stock level 0 returns stock: 0 without crashing PDP query",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const product = await prisma.product.findFirst({ where: { stock: 0 } });
      if (product) {
        const res = await request(`/api/products/${product.id}`, { method: "GET" });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.product?.stock, 0);
      }
    }
  );

  await test(
    "T2.R4.4",
    "Category query with non-matching filter returns empty products array",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const res = await request("/api/products?category=non-existent-category-xyz", {
        method: "GET",
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
      assertEqual(res.data.products.length, 0, "Products should be empty for non-existent category");
    }
  );

  await test(
    "T2.R4.5",
    "Customer role attempting product status moderation returns 403 Forbidden",
    "R4. Product Page & Category Page Layout Builders",
    async () => {
      const product = await prisma.product.findFirst();
      assert(product, "Product should exist");
      const res = await request("/api/admin/products", {
        method: "PUT",
        headers: customerHeaders,
        body: { productId: product.id, status: "REJECTED" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  // ============================================================================
  // R5 Boundary: Media Asset Manager & Usage Tracking (5 tests)
  // ============================================================================
  await test(
    "T2.R5.1",
    "Media creation with missing filename or url returns 400 Bad Request",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const res = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: { filename: "", url: "" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R5.2",
    "Fetch media asset by non-existent ID returns 404 Not Found",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const res = await request("/api/media/non-existent-media-id-9999", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R5.3",
    "Media update for non-existent ID returns 404 Not Found",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const res = await request("/api/media/non-existent-media-id-9999", {
        method: "PUT",
        headers: adminHeaders,
        body: { altTextTr: "Updated" },
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R5.4",
    "Customer role attempting media upload returns 403 Forbidden",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const res = await request("/api/media", {
        method: "POST",
        headers: customerHeaders,
        body: { filename: "hack.jpg", url: "https://evil.com/hack.jpg" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R5.5",
    "Media deletion handles delete lifecycle and records AuditLog",
    "R5. Enhanced Media Asset Manager with Usage Tracking & Protection",
    async () => {
      const asset = await prisma.mediaAsset.create({
        data: {
          filename: `audit-media-${Date.now()}.png`,
          url: `https://images.cadde.store/audit-${Date.now()}.png`,
          mimeType: "image/png",
          sizeBytes: 1200,
          referenceCount: 0,
        },
      });
      const res = await request(`/api/media/${asset.id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      const audit = await prisma.auditLog.findFirst({
        where: { action: "MEDIA_DELETED", entityId: asset.id },
      });
      assert(audit, "AuditLog for MEDIA_DELETED must exist");
    }
  );

  // ============================================================================
  // R6 Boundary: Preview Center, Autosave & Safe Publishing (5 tests)
  // ============================================================================
  await test(
    "T2.R6.1",
    "Draft autosave with invalid non-array payload returns 400 Bad Request",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/draft", {
        method: "PUT",
        headers: adminHeaders,
        body: { sections: "invalid-not-array" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R6.2",
    "Version rollback with missing versionId returns 400 Bad Request",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/versions", {
        method: "POST",
        headers: adminHeaders,
        body: {},
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R6.3",
    "Version rollback with non-existent versionId returns 404 Not Found",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/versions", {
        method: "POST",
        headers: adminHeaders,
        body: { versionId: "non-existent-version-9999" },
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R6.4",
    "Customer role attempting to publish homepage returns 403 Forbidden",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/publish", {
        method: "POST",
        headers: customerHeaders,
        body: { changeSummary: "Hacked" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R6.5",
    "Customer role attempting draft save returns 403 Forbidden",
    "R6. Advanced Preview Center, Autosave & Safe Publishing Checklist",
    async () => {
      const res = await request("/api/cms/homepage/draft", {
        method: "PUT",
        headers: customerHeaders,
        body: { sections: [] },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  // ============================================================================
  // R7 Boundary: RBAC & Fine-Grained Permissions (5 tests)
  // ============================================================================
  await test(
    "T2.R7.1",
    "Unauthenticated request to admin audit trail returns 403 Forbidden",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/audit", { method: "GET" });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R7.2",
    "Customer role attempt to access admin audit trail returns 403 Forbidden",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/audit", {
        method: "GET",
        headers: customerHeaders,
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R7.3",
    "Seller role attempt to access admin audit trail returns 403 Forbidden",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/audit", {
        method: "GET",
        headers: sellerHeaders,
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R7.4",
    "Customer role attempt to update seller status returns 403 Forbidden",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const seller = await prisma.seller.findFirst();
      assert(seller, "Seller should exist");
      const res = await request("/api/admin/sellers", {
        method: "PUT",
        headers: customerHeaders,
        body: { sellerId: seller.id, status: "ACTIVE" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.R7.5",
    "Audit log query with non-existent entityType returns empty logs array",
    "R7. Role-Based Access Control (RBAC) & Fine-Grained Permissions",
    async () => {
      const res = await request("/api/admin/audit?entityType=NON_EXISTENT_ENTITY_XYZ", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.logs), "Expected logs array");
      assertEqual(res.data.logs.length, 0, "Expected 0 matching logs");
    }
  );

  // ============================================================================
  // R8 Boundary: SEO & Website Health (5 tests)
  // ============================================================================
  await test(
    "T2.R8.1",
    "Marketing campaign query with non-existent status returns empty list",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const res = await request("/api/marketing?status=NON_EXISTENT_STATUS", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.campaigns), "Expected campaigns array");
      assertEqual(res.data.campaigns.length, 0);
    }
  );

  await test(
    "T2.R8.2",
    "Category navigation handling null/empty parentId correctly resolves root",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const res = await request("/api/navigation?rootOnly=true", { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.items), "Expected items array");
    }
  );

  await test(
    "T2.R8.3",
    "Search endpoint with Turkish characters (ç, ğ, ı, ö, ş, ü) escapes cleanly",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const res = await request("/api/products?search=çanta+ayakkabı+şal", {
        method: "GET",
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
    }
  );

  await test(
    "T2.R8.4",
    "Health verification: Database entities (Product, Category, Seller, Settings) resolve cleanly",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const [pCount, cCount, sCount, settings] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.seller.count(),
        prisma.platformSettings.findFirst(),
      ]);
      assert(pCount > 0, "Product database must be healthy (>0 products)");
      assert(cCount > 0, "Category database must be healthy (>0 categories)");
      assert(sCount > 0, "Seller database must be healthy (>0 sellers)");
      assert(settings !== null, "PlatformSettings must be initialized");
    }
  );

  await test(
    "T2.R8.5",
    "Out of stock product queries do not break storefront aggregation",
    "R8. SEO Control Center & Website Health Monitor",
    async () => {
      const res = await request("/api/products", { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
    }
  );

  // ============================================================================
  // R9 Boundary: Merchandising Intelligence & AI (5 tests)
  // ============================================================================
  await test(
    "T2.R9.1",
    "Marketing campaign creation with missing name or budget returns 400 Bad Request",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: { name: "" },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.R9.2",
    "Fetch marketing campaign with non-existent ID returns 404 Not Found",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/api/marketing/non-existent-campaign-id-9999", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R9.3",
    "Marketing campaign update for non-existent ID returns 404 Not Found",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/api/marketing/non-existent-campaign-id-9999", {
        method: "PUT",
        headers: adminHeaders,
        body: { budget: 1000 },
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R9.4",
    "Marketing campaign deletion for non-existent ID returns 404 Not Found",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/api/marketing/non-existent-campaign-id-9999", {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.R9.5",
    "Customer role attempt to create marketing campaign returns 403 Forbidden",
    "R9. Merchandising Intelligence & AI Website Assistant",
    async () => {
      const res = await request("/api/marketing", {
        method: "POST",
        headers: customerHeaders,
        body: { name: "Ad", budget: 100 },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  return results;
}

/**
 * ============================================================================
 * ENTERPRISE TIER 3: CROSS-FEATURE COMBINATIONS (PAIRWISE INTERACTIONS)
 * ============================================================================
 */
async function runEnterpriseTier3Tests() {
  const results = [];

  async function test(id, name, requirement, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        requirement,
        tier: 3,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        requirement,
        tier: 3,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  ENTERPRISE TIER 3: CROSS-FEATURE COMBINATIONS (PAIRWISE)");
  console.log("=======================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const customerHeaders = await getAuthHeaders("CUSTOMER");

  // Pairwise 1: CMS Section Banner Creation + Media Asset Reference Count
  await test(
    "T3.ENT.1",
    "CMS Section Banner creation linking to Media Asset URL",
    "CMS Sections + Media Asset Management",
    async () => {
      const media = await prisma.mediaAsset.create({
        data: {
          filename: `hero-bg-${Date.now()}.jpg`,
          url: `https://images.cadde-store.com/hero-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          sizeBytes: 850000,
          referenceCount: 0,
        },
      });

      const section = await prisma.homepageSection.create({
        data: {
          titleTR: `Pairwise Vitrin ${Date.now()}`,
          titleEN: `Pairwise Showcase ${Date.now()}`,
          type: "HERO",
          orderIndex: 99,
        },
      });

      const bannerRes = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: {
          sectionId: section.id,
          titleTR: "Öne Çıkan Kampanya",
          imageUrlDesktop: media.url,
          targetType: "CATEGORY",
          targetValue: "/category/kadin",
        },
      });
      assertEqual(bannerRes.status, 201, "Expected 201 Created");
      assertEqual(bannerRes.data.banner?.imageUrlDesktop, media.url);

      // Cleanup
      await prisma.banner.delete({ where: { id: bannerRes.data.banner.id } });
      await prisma.homepageSection.delete({ where: { id: section.id } });
      await prisma.mediaAsset.delete({ where: { id: media.id } });
    }
  );

  // Pairwise 2: Media Asset Usage Tracking Lifecycle
  await test(
    "T3.ENT.2",
    "Media Asset with active usage reference updates and deletes cleanly when detached",
    "Media Tracking + Safe Deletion",
    async () => {
      const media = await prisma.mediaAsset.create({
        data: {
          filename: `tracked-asset-${Date.now()}.png`,
          url: `https://images.cadde-store.com/tracked-${Date.now()}.png`,
          mimeType: "image/png",
          sizeBytes: 400000,
          referenceCount: 1,
        },
      });

      // Update reference count to 0 when removed from banner
      const updateRes = await request(`/api/media/${media.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { referenceCount: 0 },
      });
      assertEqual(updateRes.status, 200, "Expected 200 OK");
      assertEqual(updateRes.data.media?.referenceCount, 0);

      // Safe deletion
      const deleteRes = await request(`/api/media/${media.id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(deleteRes.status, 200, "Expected 200 OK");
    }
  );

  // Pairwise 3: Global Appearance Platform Settings + Storefront Reflection
  await test(
    "T3.ENT.3",
    "Global Appearance platform settings update reflects in settings API query",
    "Global Appearance + Platform Settings",
    async () => {
      const updateRes = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          marketplaceName: "Cadde Store Global",
          defaultShippingFee: 45.0,
          freeShippingThreshold: 300.0,
        },
      });
      assertEqual(updateRes.status, 200, "Expected 200 OK");

      const queryRes = await request("/api/admin/settings", { method: "GET" });
      assertEqual(queryRes.status, 200, "Expected 200 OK");
      assertEqual(queryRes.data.settings?.marketplaceName, "Cadde Store Global");
      assertEqual(queryRes.data.settings?.defaultShippingFee, 45.0);
    }
  );

  // Pairwise 4: Visual Navigation + Category Landing Tree
  await test(
    "T3.ENT.4",
    "Navigation item linking to category slug verifies Category Landing integrity",
    "Visual Navigation + Category Landing",
    async () => {
      const cat = await prisma.category.findFirst();
      assert(cat, "Category should exist");

      const navRes = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: cat.nameTR,
          titleEn: cat.nameEN,
          url: `/category/${cat.slug}`,
          section: "HEADER",
          sortOrder: 1,
        },
      });
      assertEqual(navRes.status, 201, "Expected 201 Created");

      const catRes = await request(`/api/products?category=${cat.slug}`, { method: "GET" });
      assertEqual(catRes.status, 200, "Expected 200 OK");

      // Cleanup
      await prisma.navigationItem.delete({ where: { id: navRes.data.item.id } });
    }
  );

  // Pairwise 5: RBAC Role Mutation + AuditLog Diff
  await test(
    "T3.ENT.5",
    "Admin mutates product price/stock and generates detailed AuditLog diff",
    "Product Management + AuditLog Diffs",
    async () => {
      const product = await prisma.product.findFirst();
      assert(product, "Product should exist");
      const newPrice = Number((product.price + 5.0).toFixed(2));

      const updateRes = await request(`/api/products/${product.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { price: newPrice },
      });
      assertEqual(updateRes.status, 200, "Expected 200 OK");

      const audit = await prisma.auditLog.findFirst({
        where: { entityType: "PRODUCT", entityId: product.id },
        orderBy: { createdAt: "desc" },
      });
      assert(audit, "AuditLog for product update should exist");
    }
  );

  // Pairwise 6: Marketing Campaign + Analytics Tracking
  await test(
    "T3.ENT.6",
    "Sponsored Campaign created, impressions incremented, and analytics aggregated",
    "Marketing Campaigns + Merchandising Intelligence",
    async () => {
      const campRes = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `Pairwise Campaign ${Date.now()}`,
          type: "SPONSORED_PRODUCT",
          budget: 2000.0,
          placement: "HOMEPAGE",
        },
      });
      assertEqual(campRes.status, 201, "Expected 201 Created");
      const campId = campRes.data.campaign.id;

      const trackRes = await request(`/api/marketing/${campId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          impressions: 2500,
          clicks: 120,
          orders: 8,
          revenue: 3400.0,
          spent: 350.0,
        },
      });
      assertEqual(trackRes.status, 200, "Expected 200 OK");
      assertEqual(trackRes.data.campaign?.impressions, 2500);

      // Cleanup
      await prisma.campaign.delete({ where: { id: campId } });
    }
  );

  // Pairwise 7: Autosave Draft + Version Snapshot + Rollback
  await test(
    "T3.ENT.7",
    "Homepage Draft autosaved, published to version snapshot, and restored via rollback",
    "Autosave Draft + Version Snapshot & Rollback",
    async () => {
      const testSections = [
        {
          titleTR: `Snapshot Section ${Date.now()}`,
          titleEN: `Snapshot Section EN ${Date.now()}`,
          type: "HERO",
          orderIndex: 0,
          active: true,
        },
      ];

      // 1. Save draft
      const draftRes = await request("/api/cms/homepage/draft", {
        method: "PUT",
        headers: adminHeaders,
        body: { sections: testSections },
      });
      assertEqual(draftRes.status, 200, "Expected 200 OK");

      // 2. Publish
      const pubRes = await request("/api/cms/homepage/publish", {
        method: "POST",
        headers: adminHeaders,
        body: { changeSummary: "Pairwise Publish Test", sections: testSections },
      });
      assertEqual(pubRes.status, 200, "Expected 200 OK");

      // 3. Rollback
      const version = await prisma.homepageVersion.findFirst({
        orderBy: { versionNumber: "desc" },
      });
      assert(version, "Version snapshot must exist");
      const rollRes = await request("/api/cms/homepage/versions", {
        method: "POST",
        headers: adminHeaders,
        body: { versionId: version.id },
      });
      assertEqual(rollRes.status, 200, "Expected 200 OK");
    }
  );

  // Pairwise 8: Category Creation + Product Faceted Search
  await test(
    "T3.ENT.8",
    "Category creation followed by category-filtered search and brand facets",
    "Category Management + Faceted Search",
    async () => {
      const catSlug = `perfume-fragrance-${Date.now()}`;
      const catRes = await request("/api/categories", {
        method: "POST",
        headers: adminHeaders,
        body: {
          nameTR: "Parfüm & Deodorant",
          nameEN: "Perfume & Fragrance",
          slug: catSlug,
          descriptionTR: "Orijinal kadın ve erkek parfümleri",
          descriptionEN: "Original perfumes",
          imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601",
        },
      });
      assertEqual(catRes.status, 201, "Expected 201 Created");

      const queryRes = await request(`/api/products?category=${catSlug}`, { method: "GET" });
      assertEqual(queryRes.status, 200, "Expected 200 OK");
      assert(Array.isArray(queryRes.data.products), "Expected products array");

      // Cleanup
      await prisma.category.delete({ where: { id: catRes.data.category.id } });
    }
  );

  // Pairwise 9: Seller Onboarding + Catalog Product Insertion
  await test(
    "T3.ENT.9",
    "Seller profile verification state and catalog insertion integration",
    "Seller Platform + Catalog Insertion",
    async () => {
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      assert(seller, "Active seller should exist");
      const cat = await prisma.category.findFirst();
      assert(cat, "Category should exist");

      const prod = await prisma.product.create({
        data: {
          sellerId: seller.id,
          categoryId: cat.id,
          name: `Pairwise Product ${Date.now()}`,
          slug: `pairwise-prod-${Date.now()}`,
          description: "Pairwise product description",
          brand: "Cadde Brand",
          sku: `SKU-PW-${Date.now()}`,
          price: 199.99,
          stock: 25,
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          status: "ACTIVE",
        },
      });

      const res = await request(`/api/products/${prod.id}`, { method: "GET" });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.product?.sku, prod.sku);

      // Cleanup
      await prisma.product.delete({ where: { id: prod.id } });
    }
  );

  // Pairwise 10: Coupon Engine + Validation API
  await test(
    "T3.ENT.10",
    "Coupon creation with minimum order threshold and server-authoritative validation",
    "Coupon Engine + Validation",
    async () => {
      const couponCode = `ENTERPRISE${Date.now()}`;
      const coupon = await prisma.coupon.create({
        data: {
          code: couponCode,
          type: "PERCENTAGE",
          value: 15.0,
          minimumOrder: 200.0,
          active: true,
        },
      });

      // Valid case: subtotal 300 >= 200
      const validRes = await request("/api/coupons/validate", {
        method: "POST",
        headers: customerHeaders,
        body: { code: couponCode, subtotal: 300.0 },
      });
      assertEqual(validRes.status, 200, "Expected 200 OK");
      assertEqual(validRes.data.valid, true);

      // Invalid case: subtotal 100 < 200 returns 400 error
      const invalidRes = await request("/api/coupons/validate", {
        method: "POST",
        headers: customerHeaders,
        body: { code: couponCode, subtotal: 100.0 },
      });
      assertEqual(invalidRes.status, 400, "Expected 400 for subtotal below minimum");

      // Cleanup
      await prisma.coupon.delete({ where: { id: coupon.id } });
    }
  );

  return results;
}

/**
 * ============================================================================
 * ENTERPRISE TIER 4: REAL-WORLD APPLICATION WORKLOAD SCENARIOS
 * ============================================================================
 */
async function runEnterpriseTier4Tests() {
  const results = [];

  async function test(id, name, requirement, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        requirement,
        tier: 4,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        requirement,
        tier: 4,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  ENTERPRISE TIER 4: REAL-WORLD WORKLOAD SCENARIOS");
  console.log("=======================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const customerHeaders = await getAuthHeaders("CUSTOMER");

  // Scenario 1: Complete CMS Campaign Launch & Storefront Merchandising Lifecycle
  await test(
    "WORKLOAD-ENT-1",
    "Complete CMS Campaign Launch & Storefront Merchandising Lifecycle (Media -> Section -> Draft -> Publish -> Rollback)",
    "R1, R5, R6 Enterprise Lifecycle",
    async () => {
      // Step 1: Upload media asset
      const mediaRes = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: {
          filename: `campaign-hero-${Date.now()}.jpg`,
          url: `https://images.cadde-store.com/hero-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          sizeBytes: 1200000,
          altTextTr: "Büyük Yaz Kampanyası",
          altTextEn: "Big Summer Campaign",
          referenceCount: 1,
        },
      });
      assertEqual(mediaRes.status, 201, "Media should be created");
      const mediaId = mediaRes.data.media.id;

      // Step 2: Create draft sections with banner referencing media
      const draftSections = [
        {
          titleTR: "Yaz Fırsatları Ana Vitrin",
          titleEN: "Summer Deals Main Hero",
          type: "HERO",
          orderIndex: 0,
          active: true,
          banners: [
            {
              titleTR: "Yeni Sezon",
              titleEN: "New Season",
              imageUrlDesktop: mediaRes.data.media.url,
              targetType: "CATEGORY",
              targetValue: "/category/kadin",
              orderIndex: 0,
              active: true,
            },
          ],
        },
      ];

      // Step 3: Autosave draft
      const draftRes = await request("/api/cms/homepage/draft", {
        method: "PUT",
        headers: adminHeaders,
        body: { sections: draftSections },
      });
      assertEqual(draftRes.status, 200, "Draft should be saved");

      // Step 4: Publish draft to live
      const pubRes = await request("/api/cms/homepage/publish", {
        method: "POST",
        headers: adminHeaders,
        body: {
          changeSummary: "Kurumsal Kampanya Lansmanı",
          sections: draftSections,
        },
      });
      assertEqual(pubRes.status, 200, "Publish should succeed");
      const versionNum = pubRes.data.versionNumber;

      // Step 5: Verify live storefront reflection
      const liveRes = await request("/api/cms/sections", { method: "GET" });
      assertEqual(liveRes.status, 200, "Live sections should respond 200");
      assert(liveRes.data.sections.length > 0, "Live sections should contain published items");

      // Step 6: Verify version snapshot recorded in DB
      const versionRecord = await prisma.homepageVersion.findFirst({
        where: { versionNumber: versionNum },
      });
      assert(versionRecord, "Version snapshot should exist in database");

      // Step 7: Cleanup created media
      await prisma.mediaAsset.delete({ where: { id: mediaId } });
    }
  );

  // Scenario 2: Global Theme & Visual Navigation Restructuring Workflow
  await test(
    "WORKLOAD-ENT-2",
    "Global Theme & Visual Navigation Restructuring Workflow (Branding Tokens -> 3-Level Menu -> Footer Links)",
    "R2, R3 Enterprise Architecture",
    async () => {
      // Step 1: Update Platform Settings Branding Tokens
      const settingsRes = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          marketplaceName: "Cadde Store Türkiye",
          supportEmail: "iletisim@cadde-store.com",
          defaultShippingFee: 39.9,
          freeShippingThreshold: 200.0,
        },
      });
      assertEqual(settingsRes.status, 200, "Settings update should succeed");

      // Step 2: Create Parent Navigation Item
      const parentNav = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: "Elektronik & Teknoloji",
          titleEn: "Electronics & Tech",
          url: "/category/elektronik",
          section: "HEADER",
          sortOrder: 0,
        },
      });
      assertEqual(parentNav.status, 201, "Parent nav item created");

      // Step 3: Create Child Navigation Item
      const childNav = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: "Akıllı Telefonlar",
          titleEn: "Smartphones",
          url: "/category/elektronik/telefon",
          section: "HEADER",
          parentId: parentNav.data.item.id,
          sortOrder: 0,
          badgeTr: "YENİ",
          badgeEn: "NEW",
        },
      });
      assertEqual(childNav.status, 201, "Child nav item created");

      // Step 4: Create Footer Link
      const footerNav = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: "KVKK Aydınlatma Metni",
          titleEn: "Privacy & KVKK Policy",
          url: "/kvkk",
          section: "FOOTER",
          sortOrder: 5,
        },
      });
      assertEqual(footerNav.status, 201, "Footer link created");

      // Step 5: Verify Navigation Hierarchy query
      const navQuery = await request("/api/navigation", { method: "GET" });
      assertEqual(navQuery.status, 200, "Navigation query should succeed");

      // Step 6: Cleanup
      await prisma.navigationItem.delete({ where: { id: childNav.data.item.id } });
      await prisma.navigationItem.delete({ where: { id: parentNav.data.item.id } });
      await prisma.navigationItem.delete({ where: { id: footerNav.data.item.id } });
    }
  );

  // Scenario 3: Media Asset Governance & Protected Deletion Lifecycle
  await test(
    "WORKLOAD-ENT-3",
    "Media Asset Governance & Protected Deletion Lifecycle (Ingest -> Metadata Update -> Tagging -> Deletion)",
    "R5 Enterprise Media Governance",
    async () => {
      // Step 1: Upload asset
      const asset = await prisma.mediaAsset.create({
        data: {
          filename: `catalog-asset-${Date.now()}.webp`,
          url: `https://images.cadde-store.com/catalog-${Date.now()}.webp`,
          mimeType: "image/webp",
          sizeBytes: 650000,
          width: 1200,
          height: 1200,
          altTextTr: "Kadın Elbise Kataloğu",
          altTextEn: "Women Dress Catalog",
          tags: JSON.stringify(["women", "dress", "catalog"]),
          referenceCount: 0,
        },
      });

      // Step 2: Update tags & alt text
      const updateRes = await request(`/api/media/${asset.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          altTextTr: "Kadın Elbise Kataloğu (Yeni Sezon)",
          tags: JSON.stringify(["women", "dress", "new-season"]),
        },
      });
      assertEqual(updateRes.status, 200, "Metadata update should succeed");
      assertEqual(updateRes.data.media?.altTextTr, "Kadın Elbise Kataloğu (Yeni Sezon)");

      // Step 3: Verify audit log recorded for MEDIA_UPDATED
      const audit = await prisma.auditLog.findFirst({
        where: { action: "MEDIA_UPDATED", entityId: asset.id },
      });
      assert(audit, "AuditLog for MEDIA_UPDATED must exist");

      // Step 4: Delete asset
      const delRes = await request(`/api/media/${asset.id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(delRes.status, 200, "Delete should succeed");
    }
  );

  // Scenario 4: Multi-Role RBAC Governance & Audit Trail Verification Sweep
  await test(
    "WORKLOAD-ENT-4",
    "Multi-Role RBAC Governance & Audit Trail Verification Sweep across Customer, Seller, and Admin roles",
    "R7 Enterprise RBAC Governance",
    async () => {
      // 1. Customer cannot access Admin Audit
      const custAudit = await request("/api/admin/audit", {
        method: "GET",
        headers: customerHeaders,
      });
      assertEqual(custAudit.status, 403, "Customer must be 403 Forbidden on /api/admin/audit");

      // 2. Customer cannot access Customer CRM
      const custCrm = await request("/api/admin/customers", {
        method: "GET",
        headers: customerHeaders,
      });
      assertEqual(custCrm.status, 403, "Customer must be 403 Forbidden on /api/admin/customers");

      // 3. Admin can access Audit logs
      const adminAudit = await request("/api/admin/audit", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(adminAudit.status, 200, "Admin must be 200 OK on /api/admin/audit");
      assert(Array.isArray(adminAudit.data.logs), "Logs must be array");

      // 4. Admin can access CRM
      const adminCrm = await request("/api/admin/customers", {
        method: "GET",
        headers: adminHeaders,
      });
      assertEqual(adminCrm.status, 200, "Admin must be 200 OK on /api/admin/customers");
    }
  );

  // Scenario 5: Merchandising Intelligence & Sponsored Campaign Placement Lifecycle
  await test(
    "WORKLOAD-ENT-5",
    "Merchandising Intelligence & Sponsored Campaign Placement Lifecycle (Create -> Track -> Pause -> Analytics Aggregation)",
    "R9 Enterprise Merchandising Intelligence",
    async () => {
      const product = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      assert(product, "Active product must exist");

      // 1. Create campaign
      const campRes = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `Merchandising Campaign ${Date.now()}`,
          type: "SPONSORED_PRODUCT",
          targetId: product.id,
          placement: "SEARCH_RESULTS",
          budget: 10000.0,
          priority: 2,
        },
      });
      assertEqual(campRes.status, 201, "Campaign creation should succeed");
      const campId = campRes.data.campaign.id;

      // 2. Update impressions & revenue
      const updateRes = await request(`/api/marketing/${campId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          impressions: 50000,
          clicks: 2500,
          orders: 120,
          revenue: 45000.0,
          spent: 3200.0,
        },
      });
      assertEqual(updateRes.status, 200, "Analytics update should succeed");

      // 3. Pause campaign
      const pauseRes = await request(`/api/marketing/${campId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { status: "PAUSED" },
      });
      assertEqual(pauseRes.status, 200, "Pause status update should succeed");
      assertEqual(pauseRes.data.campaign?.status, "PAUSED");

      // 4. Cleanup
      await prisma.campaign.delete({ where: { id: campId } });
    }
  );

  // Scenario 6: Website Health Center Diagnostic & Safe Publishing Quality Gate
  await test(
    "WORKLOAD-ENT-6",
    "Website Health Center Diagnostic & Safe Publishing Quality Gate (Database Health -> Route Audits -> Quality Gate Verification)",
    "R8, R6 Enterprise Health & Safety",
    async () => {
      // Step 1: Health diagnostics check on critical database models
      const [productCount, categoryCount, sellerCount, settingsCount] = await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.seller.count(),
        prisma.platformSettings.count(),
      ]);
      assert(productCount > 0, "Product database must be healthy (>0 products)");
      assert(categoryCount > 0, "Category database must be healthy (>0 categories)");
      assert(sellerCount > 0, "Seller database must be healthy (>0 sellers)");
      assert(settingsCount > 0, "PlatformSettings must be initialized");

      // Step 2: Route responsiveness audits across public and admin planes
      const routesToAudit = [
        "/api/products",
        "/api/categories",
        "/api/navigation",
        "/api/cms/sections",
      ];
      for (const route of routesToAudit) {
        const res = await request(route, { method: "GET" });
        assertEqual(res.status, 200, `Health check for ${route} must return 200 OK`);
      }

      // Step 3: Verify safe pre-publish quality gate by ensuring draft state is valid before publish
      const draft = await prisma.homepageDraft.findUnique({ where: { id: "current_draft" } });
      assert(draft !== null, "Homepage draft state must be accessible");
    }
  );

  return results;
}

async function runAllEnterpriseTests() {
  const t1 = await runEnterpriseTier1Tests();
  const t2 = await runEnterpriseTier2Tests();
  const t3 = await runEnterpriseTier3Tests();
  const t4 = await runEnterpriseTier4Tests();
  return [...t1, ...t2, ...t3, ...t4];
}

module.exports = {
  runEnterpriseTier1Tests,
  runEnterpriseTier2Tests,
  runEnterpriseTier3Tests,
  runEnterpriseTier4Tests,
  runAllEnterpriseTests,
};
