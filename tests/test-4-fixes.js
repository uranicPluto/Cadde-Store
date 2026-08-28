const http = require("http");

async function runAllFixTests() {
  console.log("=================================================");
  console.log("CADDE STORE: 4 CRITICAL FIXES VERIFICATION SUITE");
  console.log("=================================================\n");

  // Helper login
  async function login(email, password = "Password123!") {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    const cookie = (res.headers.get("set-cookie") || "").split(";")[0];
    return { user: data.user, cookie, status: res.status };
  }

  // -----------------------------------------------------------------
  // FIX 1: RBAC ENFORCEMENT & PERMISSION MATRIX
  // -----------------------------------------------------------------
  console.log("--- 1. Testing RBAC Granular Permissions ---");

  // 1.1 Super Admin has full write access
  const admin = await login("admin@cadde-store.com");
  console.log(`[Super Admin] Logged in: ${admin.user?.email} (${admin.user?.adminRole})`);

  // 1.2 Operations Manager should be FORBIDDEN (403) from mutating PAGES
  const ops = await login("operations@cadde-store.com");
  console.log(`[Operations Manager] Logged in: ${ops.user?.email} (${ops.user?.adminRole})`);

  const opsPageRes = await fetch("http://localhost:3000/api/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ops.cookie },
    body: JSON.stringify({ slug: "rbac-denied-test", titleTr: "Yetkisiz Test" }),
  });
  const opsPageData = await opsPageRes.json();
  console.log(`[RBAC Test 1] Operations creating page -> Status: ${opsPageRes.status} (Expected: 403)`);
  console.log(`              Response: ${JSON.stringify(opsPageData)}`);

  if (opsPageRes.status !== 403 || opsPageData.code !== "FORBIDDEN") {
    throw new Error("RBAC Test 1 Failed: Operations was not forbidden from mutating PAGES!");
  }

  // 1.3 Marketing Manager should be FORBIDDEN (403) from mutating CATALOG
  const marketing = await login("marketing@cadde-store.com");
  console.log(`[Marketing Manager] Logged in: ${marketing.user?.email} (${marketing.user?.adminRole})`);

  const mktCatRes = await fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: marketing.cookie },
    body: JSON.stringify({ name: "Unauthorized Item", price: 100 }),
  });
  const mktCatData = await mktCatRes.json();
  console.log(`[RBAC Test 2] Marketing creating product -> Status: ${mktCatRes.status} (Expected: 403)`);
  console.log(`              Response: ${JSON.stringify(mktCatData)}`);

  if (mktCatRes.status !== 403 || mktCatData.code !== "FORBIDDEN") {
    throw new Error("RBAC Test 2 Failed: Marketing was not forbidden from mutating CATALOG!");
  }

  // 1.4 Content Manager CAN mutate PAGES (201)
  const content = await login("content@cadde-store.com");
  console.log(`[Content Manager] Logged in: ${content.user?.email} (${content.user?.adminRole})`);

  const contentPageRes = await fetch("http://localhost:3000/api/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: content.cookie },
    body: JSON.stringify({
      slug: `content-manager-test-${Date.now()}`,
      titleTr: "İçerik Yöneticisi Sayfası",
      titleEn: "Content Manager Page",
    }),
  });
  const contentPageData = await contentPageRes.json();
  console.log(`[RBAC Test 3] Content Manager creating page -> Status: ${contentPageRes.status} (Expected: 201)`);
  console.log(`              Created Page ID: ${contentPageData.page?.id}`);

  if (contentPageRes.status !== 201 || !contentPageData.page?.id) {
    throw new Error("RBAC Test 3 Failed: Content Manager was unable to create page!");
  }

  console.log(">>> Fix 1 (RBAC Granular Enforcement) PASSED!\n");

  // -----------------------------------------------------------------
  // FIX 2: SPONSORS COMPONENT & STOREFRONT RENDERING
  // -----------------------------------------------------------------
  console.log("--- 2. Testing Sponsors Flow & Real Data Rendering ---");

  const uniqueSponsorName = `Cadde Prime Partner Global ${Date.now()}`;
  const createSponsorRes = await fetch("http://localhost:3000/api/sponsors", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({
      name: uniqueSponsorName,
      logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
      linkUrl: "https://cadde-prime-partner.example.com",
      priority: 95,
      active: true,
    }),
  });
  const createSponsorData = await createSponsorRes.json();
  console.log(`[Sponsor Created] ${createSponsorData.sponsor?.name} (ID: ${createSponsorData.sponsor?.id})`);

  // Publish a homepage section with SPONSOR_CAROUSEL
  const sponsorHomepageRes = await fetch("http://localhost:3000/api/cms/homepage/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({
      summary: "Adding Sponsor Carousel to live storefront",
      sections: [
        { id: "hero-1", type: "HERO", titleTR: "Ana Vitrin", titleEN: "Main Hero", orderIndex: 0, active: true },
        { id: "sponsors-1", type: "SPONSOR_CAROUSEL", titleTR: "Resmi Sponsorlar", titleEN: "Official Sponsors", orderIndex: 1, active: true },
      ],
    }),
  });
  const sponsorHomepageData = await sponsorHomepageRes.json();
  console.log(`[Homepage Published with SPONSOR_CAROUSEL] Version: ${sponsorHomepageData.versionNumber}`);

  // Fetch /api/sponsors?active=true and confirm our sponsor is returned
  const fetchSponsorsRes = await fetch("http://localhost:3000/api/sponsors?active=true");
  const fetchSponsorsData = await fetchSponsorsRes.json();
  const matchedSponsor = (fetchSponsorsData.sponsors || []).find((s) => s.name === uniqueSponsorName);
  console.log(`[Sponsor API Verification] Found in active sponsors list: ${matchedSponsor ? "YES" : "NO"}`);

  if (!matchedSponsor) {
    throw new Error("Fix 2 Failed: Unique sponsor not found in active sponsors list!");
  }

  console.log(">>> Fix 2 (Sponsors Data Flow) PASSED!\n");

  // -----------------------------------------------------------------
  // FIX 3: DRAG-AND-DROP REORDERING WITH @dnd-kit
  // -----------------------------------------------------------------
  console.log("--- 3. Testing Drag-and-Drop & Section Reordering Persistence ---");

  // Verify @dnd-kit packages in package.json
  const pkg = require("../package.json");
  const hasDndCore = Boolean(pkg.dependencies["@dnd-kit/core"]);
  const hasDndSortable = Boolean(pkg.dependencies["@dnd-kit/sortable"]);
  const hasDndUtils = Boolean(pkg.dependencies["@dnd-kit/utilities"]);

  console.log(`[Package Check] @dnd-kit/core: ${hasDndCore ? "INSTALLED" : "MISSING"}`);
  console.log(`[Package Check] @dnd-kit/sortable: ${hasDndSortable ? "INSTALLED" : "MISSING"}`);
  console.log(`[Package Check] @dnd-kit/utilities: ${hasDndUtils ? "INSTALLED" : "MISSING"}`);

  if (!hasDndCore || !hasDndSortable || !hasDndUtils) {
    throw new Error("Fix 3 Failed: @dnd-kit packages are missing from package.json!");
  }

  // Reorder sections via CMS sections reorder API and verify DB persistence
  const reorderRes = await fetch("http://localhost:3000/api/cms/sections/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({
      items: [
        { id: "sponsors-1", orderIndex: 0 },
        { id: "hero-1", orderIndex: 1 },
      ],
    }),
  });
  const reorderData = await reorderRes.json();
  console.log(`[Reorder API] Sections reordered successfully: ${reorderData.success}`);

  const checkReorder = await fetch("http://localhost:3000/api/cms/sections");
  const checkReorderData = await checkReorder.json();
  const firstSection = checkReorderData.sections?.[0];
  console.log(`[Reorder Verification] First section is now: ${firstSection?.type} (orderIndex: ${firstSection?.orderIndex})`);
    throw new Error("RBAC Test 3 Failed: Content Manager was not allowed to mutate PAGES!");
  }

  console.log(">>> RBAC ENFORCEMENT: ALL 3 TESTS PASSED (100% SUCCESS) <<<\n");

  // =========================================================================
  // FIX 2: VERSION HISTORY RESTORATION SNAPSHOT AUDIT
  // =========================================================================
  console.log("------------------------------------------------------------------");
  console.log("2. TESTING VERSION HISTORY SNAPSHOT CREATION & RESTORATION");
  console.log("------------------------------------------------------------------");

  // Snapshot 1
  const snap1Res = await fetch("http://localhost:3000/api/cms/homepage/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({
      summary: "Snapshot 1: Summer Campaign Launch",
      sections: [
        { id: "snap1-hero", type: "HERO", titleTR: "Yaz Vitrini", titleEN: "Summer Hero", orderIndex: 0, active: true },
        { id: "snap1-deals", type: "FLASH_DEALS", titleTR: "Flaş Fırsatlar", titleEN: "Flash Deals", orderIndex: 1, active: true },
      ],
    }),
  });
  const snap1Data = await snap1Res.json();
  console.log(`[Snapshot 1] Published Version: v${snap1Data.versionNumber}`);

  // Snapshot 2
  const snap2Res = await fetch("http://localhost:3000/api/cms/homepage/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({
      summary: "Snapshot 2: Autumn Collection Update",
      sections: [
        { id: "snap2-hero", type: "HERO", titleTR: "Sonbahar Vitrini", titleEN: "Autumn Hero", orderIndex: 0, active: true },
        { id: "snap2-cat", type: "CATEGORY_GRID", titleTR: "Kategoriler", titleEN: "Categories", orderIndex: 1, active: true },
        { id: "snap2-best", type: "BESTSELLER_GRID", titleTR: "Çok Satanlar", titleEN: "Bestsellers", orderIndex: 2, active: true },
      ],
    }),
  });
  const snap2Data = await snap2Res.json();
  console.log(`[Snapshot 2] Published Version: v${snap2Data.versionNumber}`);

  // Snapshot 3
  const snap3Res = await fetch("http://localhost:3000/api/cms/homepage/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({
      summary: "Snapshot 3: Winter Cyber Deals",
      sections: [
        { id: "snap3-hero", type: "HERO", titleTR: "Kış Fırsatları", titleEN: "Winter Hero", orderIndex: 0, active: true },
        { id: "snap3-spons", type: "SPONSOR_CAROUSEL", titleTR: "Sponsorlar", titleEN: "Sponsors", orderIndex: 1, active: true },
        { id: "snap3-brands", type: "FEATURED_BRANDS", titleTR: "Markalar", titleEN: "Brands", orderIndex: 2, active: true },
        { id: "snap3-badges", type: "TRUST_BADGES", titleTR: "Güven Rozetleri", titleEN: "Trust Badges", orderIndex: 3, active: true },
      ],
    }),
  });
  const snap3Data = await snap3Res.json();
  console.log(`[Snapshot 3] Published Version: v${snap3Data.versionNumber}`);

  // Fetch Version History List from API
  const versionsListRes = await fetch("http://localhost:3000/api/cms/homepage/versions", {
    headers: { Cookie: admin.cookie },
  });
  const versionsListData = await versionsListRes.json();
  console.log(`[Version History API] Retrieved ${versionsListData.versions?.length} snapshots from database.`);

  const v1 = versionsListData.versions.find((v) => v.versionNumber === snap1Data.versionNumber);
  const v2 = versionsListData.versions.find((v) => v.versionNumber === snap2Data.versionNumber);
  const v3 = versionsListData.versions.find((v) => v.versionNumber === snap3Data.versionNumber);

  console.log(`[Snapshot Verification] Found v${snap1Data.versionNumber}: ${Boolean(v1)}`);
  console.log(`[Snapshot Verification] Found v${snap2Data.versionNumber}: ${Boolean(v2)}`);
  console.log(`[Snapshot Verification] Found v${snap3Data.versionNumber}: ${Boolean(v3)}`);

  if (!v1 || !v2 || !v3) {
    throw new Error("Fix 4 Failed: Could not locate all 3 distinct snapshots in version history!");
  }

  // Restore Snapshot 1 (Summer Campaign) via Rollback API
  console.log(`[Rollback Test] Restoring Snapshot 1 (v${v1.versionNumber}, ID: ${v1.id})...`);
  const rollbackRes = await fetch("http://localhost:3000/api/cms/homepage/versions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: admin.cookie },
    body: JSON.stringify({ versionId: v1.id }),
  });
  const rollbackData = await rollbackRes.json();
  console.log(`[Rollback Result] Success: ${rollbackData.success}, New Rollback Version: v${rollbackData.versionNumber}`);

  // Confirm live sections now match Snapshot 1
  const liveAfterRollback = await fetch("http://localhost:3000/api/cms/sections");
  const liveData = await liveAfterRollback.json();
  const liveTypes = (liveData.sections || []).map((s) => s.type);
  console.log(`[Live Sections After Rollback] Types: [${liveTypes.join(", ")}]`);

  if (!liveTypes.includes("HERO") || !liveTypes.includes("FLASH_DEALS") || liveTypes.length !== 2) {
    throw new Error("Fix 4 Failed: Live sections after rollback do not match Snapshot 1!");
  }

  console.log(">>> Fix 4 (Version History 3-Publish & Rollback Flow) PASSED!\n");

  console.log("=================================================");
  console.log("ALL 4 FIXES VERIFIED & PASSING 100% LIVE!");
  console.log("=================================================");
}

runAllFixTests().catch((err) => {
  console.error("TEST SUITE ERROR:", err);
  process.exit(1);
});
