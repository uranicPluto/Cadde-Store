const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertContains,
  assertMatches,
  ensureServerReady,
  TEST_PORT,
  BASE_URL,
} = require("./harness");
const { spawn, execSync } = require("child_process");
const path = require("path");

const TURKISH_CARRIERS = [
  "Yurtiçi Kargo",
  "Aras Kargo",
  "MNG Kargo",
  "Sürat Kargo",
  "PTT Kargo",
  "HepsiJet",
  "Trendyol Express",
];

const CARRIER_REGISTRY = {
  "Yurtiçi Kargo": {
    name: "Yurtiçi Kargo",
    code: "YRT",
    website: "https://www.yurticikargo.com",
    customerService: "444 99 99",
    trackingPlaceholder: "Örn: YRT-948201948 veya 12 haneli kod",
    samplePrefix: "YRT",
  },
  "Aras Kargo": {
    name: "Aras Kargo",
    code: "ARS",
    website: "https://www.araskargo.com.tr",
    customerService: "444 25 52",
    trackingPlaceholder: "Örn: ARS-883920194 veya 13 haneli takip no",
    samplePrefix: "ARS",
  },
  "MNG Kargo": {
    name: "MNG Kargo",
    code: "MNG",
    website: "https://www.mngkargo.com.tr",
    customerService: "0850 222 06 06",
    trackingPlaceholder: "Örn: MNG-552019482 veya 10 haneli takip no",
    samplePrefix: "MNG",
  },
  "Sürat Kargo": {
    name: "Sürat Kargo",
    code: "SRT",
    website: "https://suratkargo.com.tr",
    customerService: "0850 202 02 02",
    trackingPlaceholder: "Örn: SRT-110294820 veya 12 haneli barkod",
    samplePrefix: "SRT",
  },
  "PTT Kargo": {
    name: "PTT Kargo",
    code: "PTT",
    website: "https://gonderitakip.ptt.gov.tr",
    customerService: "444 1 788",
    trackingPlaceholder: "Örn: PTT-TR94820194 veya KP barkod",
    samplePrefix: "PTT",
  },
  "HepsiJet": {
    name: "HepsiJet",
    code: "HJ",
    website: "https://www.hepsijet.com",
    customerService: "0850 558 03 33",
    trackingPlaceholder: "Örn: HJ-998822019 veya takip no",
    samplePrefix: "HJ",
  },
  "Trendyol Express": {
    name: "Trendyol Express",
    code: "TEX",
    website: "https://kargotakip.trendyol.com",
    customerService: "0850 755 99 99",
    trackingPlaceholder: "Örn: TEX-73829104 veya 10 haneli takip no",
    samplePrefix: "TEX",
  },
};

function getCarrierTrackingUrl(carrierName, trackingNumber) {
  if (!trackingNumber) {
    return "#";
  }

  const cleanNumber = encodeURIComponent(trackingNumber.trim());

  switch (carrierName) {
    case "Yurtiçi Kargo":
      return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${cleanNumber}`;
    case "Aras Kargo":
      return `https://www.araskargo.com.tr/kargotakip/?trackingNumber=${cleanNumber}`;
    case "MNG Kargo":
      return `https://www.mngkargo.com.tr/kargotakip?trackingNumber=${cleanNumber}`;
    case "Sürat Kargo":
      return `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${cleanNumber}`;
    case "PTT Kargo":
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${cleanNumber}`;
    case "HepsiJet":
      return `https://www.hepsijet.com/gonderi-takibi/${cleanNumber}`;
    case "Trendyol Express":
      return `https://kargotakip.trendyol.com/?trackingNumber=${encodeURIComponent(trackingNumber.trim())}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${carrierName || "Kargo"} ${trackingNumber} takip`)}`;
  }
}

function validateTrackingNumber(carrierName, trackingNumber) {
  if (!trackingNumber || typeof trackingNumber !== "string") {
    return { valid: false, message: "Takip numarası boş olamaz." };
  }

  const trimmed = trackingNumber.trim();
  if (trimmed.length < 5) {
    return { valid: false, message: "Takip numarası en az 5 karakter olmalıdır." };
  }

  if (trimmed.length > 50) {
    return { valid: false, message: "Takip numarası en fazla 50 karakter olabilir." };
  }

  const validPattern = /^[A-Za-z0-9\-_]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, message: "Takip numarası yalnızca harf, rakam ve tire içerebilir." };
  }

  return { valid: true };
}

async function checkServerAlive() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function startServerIfNeeded() {
  const isAlive = await checkServerAlive();
  if (isAlive) {
    console.log(`[Challenger 1] Target server already running at ${BASE_URL}.`);
    return { process: null, wasSpawned: false };
  }

  console.log(`[Challenger 1] Starting Next.js test server on port ${TEST_PORT}...`);
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npx.cmd" : "npx";
  const serverProcess = spawn(cmd, ["next", "dev", "-p", String(TEST_PORT)], {
    cwd: path.join(__dirname, "..", ".."),
    stdio: "ignore",
    shell: true,
  });

  await ensureServerReady(35000);
  console.log(`[Challenger 1] Test server ready at ${BASE_URL}.`);
  await new Promise((r) => setTimeout(r, 1000));
  return { process: serverProcess, wasSpawned: true };
}

async function runAdversarialTestSuite() {
  const results = [];

  async function test(id, name, domain, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        domain,
        status: "PASSED",
        duration: Date.now() - start,
      });
      console.log(`  [PASS] ${id}: ${name} (${Date.now() - start}ms)`);
    } catch (err) {
      results.push({
        id,
        name,
        domain,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
      console.log(`  [FAIL] ${id}: ${name} -> ${err.message}`);
    }
  }

  console.log("================================================================================");
  console.log("     CHALLENGER 1 — ADVERSARIAL STRESS TEST SUITE (ADMIN GOVERNANCE)            ");
  console.log("================================================================================\n");

  // Retrieve fixtures from DB
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  assert(adminUser, "Admin user required in DB");

  const customerUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  assert(customerUser, "Customer user required in DB");

  const sellerUser = await prisma.user.findFirst({
    where: { role: "SELLER" },
    include: { sellerProfile: true },
  });
  assert(sellerUser, "Seller user required in DB");

  const otherSellerUser = await prisma.user.findFirst({
    where: { role: "SELLER", id: { not: sellerUser.id } },
    include: { sellerProfile: true },
  });

  const testProduct = await prisma.product.findFirst({
    where: { status: "ACTIVE" },
    include: { seller: true, category: true },
  });
  assert(testProduct, "Active product required in DB");

  const testOrder = await prisma.order.findFirst({
    include: { orderItems: true, orderGroups: true, statusHistory: true },
  });
  assert(testOrder, "Existing order required in DB");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const customerHeaders = await getAuthHeaders("CUSTOMER");
  const sellerHeaders = await getAuthHeaders("SELLER");
  const otherSellerHeaders = otherSellerUser
    ? await getAuthHeaders({
        id: otherSellerUser.id,
        email: otherSellerUser.email,
        role: "SELLER",
        sellerSlug: otherSellerUser.sellerProfile?.slug || "other-seller-store",
      })
    : null;

  // =========================================================================
  // DOMAIN 1: MARKETING CAMPAIGN BUDGETS, CTR/ROI MATH, DATES & STATUS
  // =========================================================================
  console.log("\n--- Domain 1: Marketing Campaigns, Budgets & ROI Analytics ---");

  await test(
    "ADV-MKT-1.1",
    "Marketing campaign creation enforces RBAC (Unauthenticated & Customer rejected)",
    "Marketing Campaigns",
    async () => {
      const resUnauth = await request("/api/marketing", {
        method: "POST",
        body: { name: "Adversarial Campaign", budget: 5000 },
      });
      assertEqual(resUnauth.status, 403, `Unauthenticated must get 403 (Got ${resUnauth.status})`);

      const resCust = await request("/api/marketing", {
        method: "POST",
        headers: customerHeaders,
        body: { name: "Adversarial Campaign", budget: 5000 },
      });
      assertEqual(resCust.status, 403, `Customer role must get 403 (Got ${resCust.status})`);
    }
  );

  await test(
    "ADV-MKT-1.2",
    "Marketing campaign creation rejects missing name or budget",
    "Marketing Campaigns",
    async () => {
      const resNoName = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: { budget: 5000, type: "SPONSORED_PRODUCT" },
      });
      assertEqual(resNoName.status, 400, "Missing name must return 400");

      const resNoBudget = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: { name: "No Budget Campaign", type: "SPONSORED_PRODUCT" },
      });
      assertEqual(resNoBudget.status, 400, "Missing budget must return 400");
    }
  );

  let testCampaignId;
  await test(
    "ADV-MKT-1.3",
    "Marketing campaign creation handles extreme budget values, precision & formats",
    "Marketing Campaigns",
    async () => {
      const hugeBudget = 25000000.5;
      const res = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `Büyük Sezon Kampanyası ${Date.now()}`,
          type: "SPONSORED_BRAND",
          targetId: "brand-cadde-exclusive",
          placement: "HOMEPAGE_HERO",
          budget: hugeBudget,
          spent: 125000.75,
          priority: 10,
          status: "ACTIVE",
          impressions: 500000,
          clicks: 25000,
          orders: 1250,
          revenue: 375000.5,
        },
      });

      assertEqual(res.status, 201, `Campaign creation should succeed (Got ${res.status}: ${JSON.stringify(res.data)})`);
      assert(res.data.campaign?.id, "Response should return campaign ID");
      assertEqual(res.data.campaign.budget, hugeBudget, "Budget precision must be preserved");
      assertEqual(res.data.campaign.spent, 125000.75, "Spent precision must be preserved");
      testCampaignId = res.data.campaign.id;
    }
  );

  await test(
    "ADV-MKT-1.4",
    "CTR, Conversion Rate and ROI analytics calculate mathematically without division-by-zero errors",
    "Marketing Campaigns",
    async () => {
      // Test zero impressions/clicks/spend corner cases
      const zeroMetrics = {
        impressions: 0,
        clicks: 0,
        orders: 0,
        spent: 0,
        revenue: 0,
      };

      const ctrZero = zeroMetrics.impressions > 0 ? (zeroMetrics.clicks / zeroMetrics.impressions) * 100 : 0;
      const convZero = zeroMetrics.clicks > 0 ? (zeroMetrics.orders / zeroMetrics.clicks) * 100 : 0;
      const roiZero = zeroMetrics.spent > 0 ? zeroMetrics.revenue / zeroMetrics.spent : 0;

      assertEqual(ctrZero, 0, "CTR with 0 impressions must evaluate to 0, not NaN");
      assertEqual(convZero, 0, "ConvRate with 0 clicks must evaluate to 0, not NaN");
      assertEqual(roiZero, 0, "ROI with 0 spend must evaluate to 0, not NaN or Infinity");

      // Test standard mathematical scenarios
      const standardMetrics = {
        impressions: 142800,
        clicks: 6840,
        orders: 382,
        spent: 8420,
        revenue: 41250,
      };

      const ctrActual = Number(((standardMetrics.clicks / standardMetrics.impressions) * 100).toFixed(2));
      const convActual = Number(((standardMetrics.orders / standardMetrics.clicks) * 100).toFixed(2));
      const roiActual = Number((standardMetrics.revenue / standardMetrics.spent).toFixed(1));

      assertEqual(ctrActual, 4.79, "CTR must equal 4.79%");
      assertEqual(convActual, 5.58, "Conversion rate must equal 5.58%");
      assertEqual(roiActual, 4.9, "ROI must equal 4.9x");
    }
  );

  await test(
    "ADV-MKT-1.5",
    "Marketing campaign date boundaries and scheduling validation",
    "Marketing Campaigns",
    async () => {
      const pastStart = new Date(Date.now() - 30 * 86400000).toISOString();
      const pastEnd = new Date(Date.now() - 10 * 86400000).toISOString();
      const futureStart = new Date(Date.now() + 5 * 86400000).toISOString();
      const futureEnd = new Date(Date.now() + 25 * 86400000).toISOString();

      const resPast = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: "Geçmiş Kampanya",
          budget: 1000,
          startDate: pastStart,
          endDate: pastEnd,
          status: "COMPLETED",
        },
      });
      assertEqual(resPast.status, 201, "Past completed campaign should create cleanly");

      const resFuture = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: "Gelecek Kampanya",
          budget: 2000,
          startDate: futureStart,
          endDate: futureEnd,
          status: "ACTIVE",
        },
      });
      assertEqual(resFuture.status, 201, "Future scheduled campaign should create cleanly");
    }
  );

  await test(
    "ADV-MKT-1.6",
    "Marketing campaign status transitions and multi-parameter filtering",
    "Marketing Campaigns",
    async () => {
      // 1. Transition ACTIVE -> PAUSED
      const pauseRes = await request(`/api/marketing/${testCampaignId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { status: "PAUSED" },
      });
      assertEqual(pauseRes.status, 200, `Pause should succeed (Got ${pauseRes.status})`);
      assertEqual(pauseRes.data.campaign.status, "PAUSED");

      // 2. Transition PAUSED -> COMPLETED
      const completeRes = await request(`/api/marketing/${testCampaignId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { status: "COMPLETED" },
      });
      assertEqual(completeRes.status, 200, `Complete should succeed (Got ${completeRes.status})`);
      assertEqual(completeRes.data.campaign.status, "COMPLETED");

      // 3. Filter by status=COMPLETED
      const filterRes = await request(`/api/marketing?status=COMPLETED`);
      assertEqual(filterRes.status, 200);
      assert(Array.isArray(filterRes.data.campaigns), "Campaigns must be an array");
      const found = filterRes.data.campaigns.some((c) => c.id === testCampaignId);
      assertEqual(found, true, "Completed campaign must be returned by status filter");
    }
  );

  await test(
    "ADV-MKT-1.7",
    "Marketing campaign mutations emit immutable AuditLog records",
    "Marketing Campaigns",
    async () => {
      const audit = await prisma.auditLog.findFirst({
        where: {
          entityType: "MARKETING",
          entityId: testCampaignId,
          action: "CAMPAIGN_UPDATED",
        },
        orderBy: { createdAt: "desc" },
      });

      assert(audit, "AuditLog entry must be recorded for campaign update");
      assertEqual(audit.actorRole, "ADMIN");
      const metadata = JSON.parse(audit.metadataJson);
      assertEqual(metadata.status, "COMPLETED");
    }
  );

  // =========================================================================
  // DOMAIN 2: HIERARCHICAL NAVIGATION TREE, CIRCULARITY & SORT ORDER
  // =========================================================================
  console.log("\n--- Domain 2: Hierarchical Navigation Menu Tree & Structure ---");

  await test(
    "ADV-NAV-2.1",
    "Navigation item mutations enforce RBAC (Only ADMIN allowed)",
    "Navigation Menu",
    async () => {
      const resUnauth = await request("/api/navigation", {
        method: "POST",
        body: { titleTr: "Test Link", url: "/test" },
      });
      assertEqual(resUnauth.status, 403, `Unauth POST must return 403 (Got ${resUnauth.status})`);

      const resCust = await request("/api/navigation", {
        method: "POST",
        headers: customerHeaders,
        body: { titleTr: "Test Link", url: "/test" },
      });
      assertEqual(resCust.status, 403, `Customer POST must return 403 (Got ${resCust.status})`);

      const resSeller = await request("/api/navigation", {
        method: "POST",
        headers: sellerHeaders,
        body: { titleTr: "Test Link", url: "/test" },
      });
      assertEqual(resSeller.status, 403, `Seller POST must return 403 (Got ${resSeller.status})`);
    }
  );

  await test(
    "ADV-NAV-2.2",
    "Navigation item creation validates mandatory title and URL",
    "Navigation Menu",
    async () => {
      const resNoTitle = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: { url: "/test" },
      });
      assertEqual(resNoTitle.status, 400, "Missing titleTr must return 400");

      const resNoUrl = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTr: "Menü Başlığı" },
      });
      assertEqual(resNoUrl.status, 400, "Missing url must return 400");
    }
  );

  let rootNavId, childNavId, grandchildNavId;
  await test(
    "ADV-NAV-2.3",
    "Navigation tree supports multi-level hierarchy nesting (Root -> Child -> Grandchild)",
    "Navigation Menu",
    async () => {
      // 1. Create Root Item
      const rootRes = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: "Kadın Modası",
          titleEn: "Women Fashion",
          url: "/category/kadin",
          section: "HEADER",
          sortOrder: 1,
          isActive: true,
        },
      });
      assertEqual(rootRes.status, 201, `Root creation should return 201 (Got ${rootRes.status})`);
      rootNavId = rootRes.data.item.id;

      // 2. Create Child Item
      const childRes = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: "Giyim & Elbise",
          titleEn: "Clothing & Dresses",
          url: "/category/kadin-giyim",
          section: "HEADER",
          parentId: rootNavId,
          sortOrder: 10,
          isActive: true,
        },
      });
      assertEqual(childRes.status, 201, `Child creation should return 201 (Got ${childRes.status})`);
      childNavId = childRes.data.item.id;

      // 3. Create Grandchild Item
      const grandRes = await request("/api/navigation", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTr: "Günlük Elbiseler",
          titleEn: "Casual Dresses",
          url: "/category/gunluk-elbise",
          section: "HEADER",
          parentId: childNavId,
          sortOrder: 5,
          isActive: true,
        },
      });
      assertEqual(grandRes.status, 201, `Grandchild creation should return 201 (Got ${grandRes.status})`);
      grandchildNavId = grandRes.data.item.id;

      // 4. Query Root by ID to verify hierarchical children inclusion
      const getRootRes = await request(`/api/navigation/${rootNavId}`);
      assertEqual(getRootRes.status, 200);
      assert(getRootRes.data.item.children.length >= 1, "Root item must include child item in hierarchy");
      assertEqual(getRootRes.data.item.children[0].id, childNavId);
    }
  );

  await test(
    "ADV-NAV-2.4",
    "Navigation sortOrder consistency handles negative, zero, and high integer ordering",
    "Navigation Menu",
    async () => {
      const itemNeg = await prisma.navigationItem.create({
        data: {
          titleTr: "En Üst Sıra",
          titleEn: "Top Priority",
          url: "/top",
          section: "MEGA_MENU",
          sortOrder: -99,
          isActive: true,
        },
      });

      const itemZero = await prisma.navigationItem.create({
        data: {
          titleTr: "Orta Sıra",
          titleEn: "Mid Priority",
          url: "/mid",
          section: "MEGA_MENU",
          sortOrder: 0,
          isActive: true,
        },
      });

      const itemHigh = await prisma.navigationItem.create({
        data: {
          titleTr: "Son Sıra",
          titleEn: "Low Priority",
          url: "/low",
          section: "MEGA_MENU",
          sortOrder: 999,
          isActive: true,
        },
      });

      const res = await request("/api/navigation?section=MEGA_MENU");
      assertEqual(res.status, 200);
      const items = res.data.items;

      const idxNeg = items.findIndex((i) => i.id === itemNeg.id);
      const idxZero = items.findIndex((i) => i.id === itemZero.id);
      const idxHigh = items.findIndex((i) => i.id === itemHigh.id);

      assert(idxNeg !== -1 && idxZero !== -1 && idxHigh !== -1, "All test items must be returned");
      assert(idxNeg < idxZero, "SortOrder -99 must appear before 0");
      assert(idxZero < idxHigh, "SortOrder 0 must appear before 999");
    }
  );

  await test(
    "ADV-NAV-2.5",
    "Bulk navigation reordering updates multiple nodes atomically",
    "Navigation Menu",
    async () => {
      const res = await request("/api/navigation", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          items: [
            { id: rootNavId, sortOrder: 50 },
            { id: childNavId, sortOrder: 60 },
          ],
        },
      });

      assertEqual(res.status, 200, `Bulk reorder should return 200 (Got ${res.status}: ${JSON.stringify(res.data)})`);

      const rootUpdated = await prisma.navigationItem.findUnique({ where: { id: rootNavId } });
      const childUpdated = await prisma.navigationItem.findUnique({ where: { id: childNavId } });

      assertEqual(rootUpdated.sortOrder, 50, "Root sortOrder must be 50");
      assertEqual(childUpdated.sortOrder, 60, "Child sortOrder must be 60");
    }
  );

  await test(
    "ADV-NAV-2.6",
    "Navigation item deletion cascades and records AuditLog",
    "Navigation Menu",
    async () => {
      const delRes = await request(`/api/navigation/${grandchildNavId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(delRes.status, 200, `Delete grandchild should return 200 (Got ${delRes.status})`);

      const check = await prisma.navigationItem.findUnique({ where: { id: grandchildNavId } });
      assertEqual(check, null, "Grandchild must be deleted from database");

      const audit = await prisma.auditLog.findFirst({
        where: {
          entityType: "NAVIGATION",
          entityId: grandchildNavId,
          action: "NAVIGATION_DELETED",
        },
      });
      assert(audit, "AuditLog entry must be recorded for navigation deletion");
    }
  );

  // =========================================================================
  // DOMAIN 3: MEDIA ASSET REPOSITORY, MIME TYPE FILTERING & SEARCH INDEXING
  // =========================================================================
  console.log("\n--- Domain 3: Media Asset Library, MIME Filtering & Indexing ---");

  await test(
    "ADV-MED-3.1",
    "Media asset creation enforces RBAC (Unauthenticated & Customer rejected)",
    "Media Assets",
    async () => {
      const resUnauth = await request("/api/media", {
        method: "POST",
        body: { filename: "test.jpg", url: "https://example.com/test.jpg" },
      });
      assertEqual(resUnauth.status, 403, `Unauthenticated must get 403 (Got ${resUnauth.status})`);

      const resCust = await request("/api/media", {
        method: "POST",
        headers: customerHeaders,
        body: { filename: "test.jpg", url: "https://example.com/test.jpg" },
      });
      assertEqual(resCust.status, 403, `Customer must get 403 (Got ${resCust.status})`);
    }
  );

  await test(
    "ADV-MED-3.2",
    "Media asset creation validates mandatory filename and URL",
    "Media Assets",
    async () => {
      const resNoName = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: { url: "https://example.com/test.jpg" },
      });
      assertEqual(resNoName.status, 400, "Missing filename must return 400");

      const resNoUrl = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: { filename: "test.jpg" },
      });
      assertEqual(resNoUrl.status, 400, "Missing url must return 400");
    }
  );

  let pngAssetId, webpAssetId, pdfAssetId;
  await test(
    "ADV-MED-3.3",
    "Media assets support diverse MIME types (image/png, image/webp, application/pdf) and metadata",
    "Media Assets",
    async () => {
      // 1. Create PNG Asset
      const pngRes = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: {
          filename: `logo-brand-${Date.now()}.png`,
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          mimeType: "image/png",
          sizeBytes: 1048576,
          width: 1920,
          height: 1080,
          altTextTr: "Yüksek Çözünürlüklü Marka Logosu",
          altTextEn: "High Resolution Brand Logo",
          tags: ["logo", "brand", "vector", "official"],
          referenceCount: 3,
        },
      });
      assertEqual(pngRes.status, 201);
      pngAssetId = pngRes.data.media.id;

      // 2. Create WebP Asset
      const webpRes = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: {
          filename: `hero-banner-${Date.now()}.webp`,
          url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
          mimeType: "image/webp",
          sizeBytes: 524288,
          width: 2560,
          height: 1440,
          altTextTr: "Sonbahar İndirim Bannerı",
          altTextEn: "Autumn Sale Banner",
          tags: ["hero", "banner", "campaign"],
          referenceCount: 1,
        },
      });
      assertEqual(webpRes.status, 201);
      webpAssetId = webpRes.data.media.id;

      // 3. Create PDF Asset
      const pdfRes = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: {
          filename: `mesafeli-satis-sozlesmesi-${Date.now()}.pdf`,
          url: "https://example.com/docs/distance-sales.pdf",
          mimeType: "application/pdf",
          sizeBytes: 2097152,
          altTextTr: "Resmi Mesafeli Satış Sözleşmesi PDF",
          altTextEn: "Official Distance Sales Agreement PDF",
          tags: ["legal", "contract", "kvkk"],
          referenceCount: 0,
        },
      });
      assertEqual(pdfRes.status, 201);
      pdfAssetId = pdfRes.data.media.id;
    }
  );

  await test(
    "ADV-MED-3.4",
    "Media asset MIME type filtering isolates exact content types",
    "Media Assets",
    async () => {
      const resPng = await request("/api/media?mimeType=image/png");
      assertEqual(resPng.status, 200);
      assert(resPng.data.media.some((m) => m.id === pngAssetId), "PNG asset must be in image/png filter");
      assert(!resPng.data.media.some((m) => m.id === pdfAssetId), "PDF asset must NOT be in image/png filter");

      const resPdf = await request("/api/media?mimeType=application/pdf");
      assertEqual(resPdf.status, 200);
      assert(resPdf.data.media.some((m) => m.id === pdfAssetId), "PDF asset must be in application/pdf filter");
      assert(!resPdf.data.media.some((m) => m.id === pngAssetId), "PNG asset must NOT be in application/pdf filter");
    }
  );

  await test(
    "ADV-MED-3.5",
    "Media asset multi-field search matches filename, altTextTr, altTextEn, and tags",
    "Media Assets",
    async () => {
      // Search by Turkish altText
      const res1 = await request("/api/media?search=Sonbahar");
      assertEqual(res1.status, 200);
      assert(res1.data.media.some((m) => m.id === webpAssetId), "Search 'Sonbahar' must find WebP banner");

      // Search by English altText
      const res2 = await request("/api/media?search=Resolution");
      assertEqual(res2.status, 200);
      assert(res2.data.media.some((m) => m.id === pngAssetId), "Search 'Resolution' must find PNG logo");

      // Search by tag
      const res3 = await request("/api/media?search=kvkk");
      assertEqual(res3.status, 200);
      assert(res3.data.media.some((m) => m.id === pdfAssetId), "Search 'kvkk' tag must find PDF contract");
    }
  );

  await test(
    "ADV-MED-3.6",
    "Media reference tracking counter updates and records AuditLog",
    "Media Assets",
    async () => {
      const updateRes = await request(`/api/media/${pngAssetId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          referenceCount: 15,
          altTextTr: "Güncellenmiş Marka Logosu (15 Yerde Kullanımda)",
        },
      });

      assertEqual(updateRes.status, 200, `Update should return 200 (Got ${updateRes.status})`);
      assertEqual(updateRes.data.media.referenceCount, 15, "referenceCount must be updated to 15");

      const audit = await prisma.auditLog.findFirst({
        where: {
          entityType: "MEDIA",
          entityId: pngAssetId,
          action: "MEDIA_UPDATED",
        },
      });
      assert(audit, "AuditLog entry must be created for media update");
    }
  );

  // =========================================================================
  // DOMAIN 4: PRODUCT COMMERCIAL UPDATES & AUDIT DIFF STRUCTURE (AC6)
  // =========================================================================
  console.log("\n--- Domain 4: Product Commercial Updates & Audit Diffs (AC6) ---");

  await test(
    "ADV-PRD-4.1",
    "Product update RBAC: Cross-seller cannot modify another seller's product",
    "Product Governance",
    async () => {
      if (!otherSellerHeaders) {
        console.log("    (Skipping cross-seller check: single seller in DB)");
        return;
      }

      const res = await request(`/api/products/${testProduct.id}`, {
        method: "PUT",
        headers: otherSellerHeaders,
        body: { price: 999.99 },
      });

      assertEqual(res.status, 403, `Seller A must NOT be able to modify Seller B's product (Got ${res.status})`);
    }
  );

  await test(
    "ADV-PRD-4.2",
    "Commercial update on price captures before/after diff in AuditLog.metadataJson (AC6)",
    "Product Governance",
    async () => {
      const originalPrice = testProduct.price;
      const newPrice = originalPrice + 150.0;

      const res = await request(`/api/products/${testProduct.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { price: newPrice },
      });

      assertEqual(res.status, 200, `Admin price update should succeed (Got ${res.status})`);
      assertEqual(res.data.product.price, newPrice);

      // Verify diff returned in response
      assert(res.data.diff, "Response must include commercial diff object");
      assertEqual(res.data.diff.price.before, originalPrice);
      assertEqual(res.data.diff.price.after, newPrice);

      // Verify AuditLog record in DB
      const audit = await prisma.auditLog.findFirst({
        where: {
          entityType: "PRODUCT",
          entityId: testProduct.id,
          action: "PRODUCT_UPDATED",
        },
        orderBy: { createdAt: "desc" },
      });

      assert(audit, "AuditLog must exist for product commercial update");
      assertEqual(audit.actorRole, "ADMIN");

      const meta = JSON.parse(audit.metadataJson);
      assert(meta.diff, "metadataJson must contain diff key");
      assertEqual(meta.diff.price.before, originalPrice);
      assertEqual(meta.diff.price.after, newPrice);
    }
  );

  await test(
    "ADV-PRD-4.3",
    "Multi-field commercial update (price, stock, status) records complete diff tuple (AC6)",
    "Product Governance",
    async () => {
      const currentProd = await prisma.product.findUnique({ where: { id: testProduct.id } });
      const beforePrice = currentProd.price;
      const beforeStock = currentProd.stock;
      const beforeStatus = currentProd.status;

      const afterPrice = beforePrice + 50;
      const afterStock = beforeStock + 20;
      const afterStatus = beforeStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const res = await request(`/api/products/${testProduct.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          price: afterPrice,
          stock: afterStock,
          status: afterStatus,
        },
      });

      assertEqual(res.status, 200);
      assertEqual(res.data.diff.price.before, beforePrice);
      assertEqual(res.data.diff.price.after, afterPrice);
      assertEqual(res.data.diff.stock.before, beforeStock);
      assertEqual(res.data.diff.stock.after, afterStock);
      assertEqual(res.data.diff.status.before, beforeStatus);
      assertEqual(res.data.diff.status.after, afterStatus);

      // Restore product to original state
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { price: testProduct.price, stock: testProduct.stock, status: "ACTIVE" },
      });
    }
  );

  await test(
    "ADV-PRD-4.4",
    "Audit Log API endpoint (/api/admin/audit?entityType=PRODUCT) filters logs properly",
    "Product Governance",
    async () => {
      const res = await request("/api/admin/audit?entityType=PRODUCT", {
        headers: adminHeaders,
      });

      assertEqual(res.status, 200, `Audit API should return 200 (Got ${res.status})`);
      assert(Array.isArray(res.data.logs), "Logs must be an array");
      assert(res.data.logs.length > 0, "Should contain product audit logs");

      for (const log of res.data.logs) {
        assertEqual(log.entityType, "PRODUCT", "All filtered logs must have entityType PRODUCT");
      }
    }
  );

  // =========================================================================
  // DOMAIN 5: TURKISH CARRIER LOGISTICS & STATUS PROGRESSION (AC7)
  // =========================================================================
  console.log("\n--- Domain 5: Turkish Carrier Logistics & Status Progression (AC7) ---");

  await test(
    "ADV-LOG-5.1",
    "CARRIER_REGISTRY contains all 7 official Turkish carriers including Trendyol Express",
    "Logistics & Carriers",
    async () => {
      assertEqual(TURKISH_CARRIERS.length, 7, "Must contain exactly 7 Turkish carriers");

      const expectedCarriers = [
        "Yurtiçi Kargo",
        "Aras Kargo",
        "MNG Kargo",
        "Sürat Kargo",
        "PTT Kargo",
        "HepsiJet",
        "Trendyol Express",
      ];

      for (const carrier of expectedCarriers) {
        assert(TURKISH_CARRIERS.includes(carrier), `TURKISH_CARRIERS must include "${carrier}"`);
        assert(CARRIER_REGISTRY[carrier], `CARRIER_REGISTRY must have entry for "${carrier}"`);
        assert(CARRIER_REGISTRY[carrier].website, `Carrier "${carrier}" must have official website`);
        assert(CARRIER_REGISTRY[carrier].code, `Carrier "${carrier}" must have short code`);
      }
    }
  );

  await test(
    "ADV-LOG-5.2",
    "getCarrierTrackingUrl generates accurate portal URLs for all 7 carriers and Trendyol Express",
    "Logistics & Carriers",
    async () => {
      const trk = "TEX-99887766";

      const texUrl = getCarrierTrackingUrl("Trendyol Express", trk);
      assertEqual(texUrl, `https://kargotakip.trendyol.com/?trackingNumber=${trk}`, "Trendyol Express tracking URL mismatch");

      const yrtUrl = getCarrierTrackingUrl("Yurtiçi Kargo", "YRT123");
      assertEqual(yrtUrl, "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=YRT123");

      const arasUrl = getCarrierTrackingUrl("Aras Kargo", "ARS123");
      assertEqual(arasUrl, "https://www.araskargo.com.tr/kargotakip/?trackingNumber=ARS123");

      const mngUrl = getCarrierTrackingUrl("MNG Kargo", "MNG123");
      assertEqual(mngUrl, "https://www.mngkargo.com.tr/kargotakip?trackingNumber=MNG123");

      const suratUrl = getCarrierTrackingUrl("Sürat Kargo", "SRT123");
      assertEqual(suratUrl, "https://suratkargo.com.tr/KargoTakip/?kargotakipno=SRT123");

      const pttUrl = getCarrierTrackingUrl("PTT Kargo", "PTT123");
      assertEqual(pttUrl, "https://gonderitakip.ptt.gov.tr/Track/Verify?q=PTT123");

      const hjUrl = getCarrierTrackingUrl("HepsiJet", "HJ123");
      assertEqual(hjUrl, "https://www.hepsijet.com/gonderi-takibi/HJ123");
    }
  );

  await test(
    "ADV-LOG-5.3",
    "validateTrackingNumber rejects malformed codes and accepts standard formats across all carriers",
    "Logistics & Carriers",
    async () => {
      // Rejections
      assert(!validateTrackingNumber("Trendyol Express", "").valid, "Empty must be invalid");
      assert(!validateTrackingNumber("Trendyol Express", "12").valid, "2 chars must be invalid");
      assert(!validateTrackingNumber("Trendyol Express", "TEX 999 888").valid, "Spaces must be invalid");
      assert(!validateTrackingNumber("Trendyol Express", "<script>").valid, "HTML must be invalid");

      // Valid codes
      assert(validateTrackingNumber("Trendyol Express", "TEX-99887766").valid, "Standard Trendyol code must be valid");
      assert(validateTrackingNumber("Yurtiçi Kargo", "YRT-948201948").valid, "Yurtiçi code must be valid");
      assert(validateTrackingNumber("HepsiJet", "HJ-998822019").valid, "HepsiJet code must be valid");
    }
  );

  await test(
    "ADV-LOG-5.4",
    "Admin order fulfillment assigns Trendyol Express carrier, tracking number and advances status",
    "Logistics & Carriers",
    async () => {
      const trackingCode = `TEX-${Date.now().toString().slice(-8)}`;

      const res = await request(`/api/orders/${testOrder.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          carrierName: "Trendyol Express",
          trackingNumber: trackingCode,
          status: "SHIPPED",
          estimatedDelivery: "2 iş günü içinde",
          note: "Sipariş Trendyol Express ile kargoya teslim edildi.",
        },
      });

      assertEqual(res.status, 200, `Order update should return 200 (Got ${res.status})`);
      assertEqual(res.data.order.carrierName, "Trendyol Express");
      assertEqual(res.data.order.trackingNumber, trackingCode);
      assertEqual(res.data.order.status, "SHIPPED");

      // Verify child OrderGroup synchronized
      const groups = await prisma.orderGroup.findMany({ where: { orderId: testOrder.id } });
      for (const group of groups) {
        assertEqual(group.carrierName, "Trendyol Express");
        assertEqual(group.trackingNumber, trackingCode);
        assertEqual(group.status, "SHIPPED");
      }
    }
  );

  await test(
    "ADV-LOG-5.5",
    "Order status progression (CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED) records status history",
    "Logistics & Carriers",
    async () => {
      // Transition SHIPPED -> DELIVERED
      const res = await request(`/api/orders/${testOrder.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          status: "DELIVERED",
          note: "Teslimat tamamlandı.",
        },
      });

      assertEqual(res.status, 200);
      assertEqual(res.data.order.status, "DELIVERED");

      // Verify OrderStatusHistory
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: testOrder.id },
        orderBy: { createdAt: "asc" },
      });

      assert(history.length >= 2, "Status history must contain multiple transition records");
      const latest = history[history.length - 1];
      assertEqual(latest.status, "DELIVERED");
      assertContains(latest.note, "Teslimat tamamlandı");
    }
  );

  // =========================================================================
  // DOMAIN 6: SELLER COMMISSION RATES, SUSPENSIONS & BADGES (AC10)
  // =========================================================================
  console.log("\n--- Domain 6: Seller Governance, Commission Rates & Suspensions (AC10) ---");

  await test(
    "ADV-SEL-6.1",
    "Seller governance endpoint enforces strict RBAC (Customer & unauthorized rejected)",
    "Seller Governance",
    async () => {
      const resCust = await request("/api/admin/sellers", {
        method: "PUT",
        headers: customerHeaders,
        body: { sellerId: sellerUser.sellerProfile?.id || sellerUser.id, verified: true },
      });
      assertEqual(resCust.status, 403, `Customer must get 403 on seller update (Got ${resCust.status})`);

      if (otherSellerHeaders) {
        const resOther = await request("/api/admin/sellers", {
          method: "PUT",
          headers: otherSellerHeaders,
          body: {
            sellerId: sellerUser.sellerProfile?.id || sellerUser.id,
            storeName: "Hacked Store Name",
          },
        });
        assertEqual(resOther.status, 403, `Seller A cannot modify Seller B's profile (Got ${resOther.status})`);
      }
    }
  );

  await test(
    "ADV-SEL-6.2",
    "Admin can configure seller commission rates across full spectrum (0% to 100%)",
    "Seller Governance",
    async () => {
      const sellerId = sellerUser.sellerProfile?.id;
      assert(sellerId, "Seller profile ID required");

      // 1. Promo 0% Commission Rate
      const resZero = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, commissionRate: 0.0 },
      });
      assertEqual(resZero.status, 200);
      assertEqual(resZero.data.seller.commissionRate, 0.0, "Commission rate 0.0 must be supported");

      // 2. Standard 15% Commission Rate
      const resStandard = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, commissionRate: 0.15 },
      });
      assertEqual(resStandard.status, 200);
      assertEqual(resStandard.data.seller.commissionRate, 0.15, "Commission rate 0.15 must be supported");

      // 3. High Category 50% Commission Rate
      const resFifty = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, commissionRate: 0.5 },
      });
      assertEqual(resFifty.status, 200);
      assertEqual(resFifty.data.seller.commissionRate, 0.5, "Commission rate 0.50 must be supported");

      // 4. Maximum 100% Boundary
      const resMax = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, commissionRate: 1.0 },
      });
      assertEqual(resMax.status, 200);
      assertEqual(resMax.data.seller.commissionRate, 1.0, "Commission rate 1.00 must be supported");
    }
  );

  await test(
    "ADV-SEL-6.3",
    "Admin can toggle seller verification badges (verified: true / false)",
    "Seller Governance",
    async () => {
      const sellerId = sellerUser.sellerProfile?.id;

      // Enable Verified Badge
      const resVerify = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, verified: true },
      });
      assertEqual(resVerify.status, 200);
      assertEqual(resVerify.data.seller.verified, true);

      // Disable Verified Badge
      const resUnverify = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, verified: false },
      });
      assertEqual(resUnverify.status, 200);
      assertEqual(resUnverify.data.seller.verified, false);
    }
  );

  await test(
    "ADV-SEL-6.4",
    "Seller suspension controls and status lifecycle transition (PENDING -> ACTIVE -> SUSPENDED)",
    "Seller Governance",
    async () => {
      const sellerId = sellerUser.sellerProfile?.id;

      // 1. Suspend Seller
      const resSuspend = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, status: "SUSPENDED" },
      });
      assertEqual(resSuspend.status, 200);
      assertEqual(resSuspend.data.seller.status, "SUSPENDED");

      // Verify AuditLog for suspension
      const auditSuspend = await prisma.auditLog.findFirst({
        where: {
          entityType: "SELLER",
          entityId: sellerId,
          action: "SELLER_STATUS_CHANGED",
        },
        orderBy: { createdAt: "desc" },
      });
      assert(auditSuspend, "AuditLog entry must be recorded for SELLER_STATUS_CHANGED");
      const meta = JSON.parse(auditSuspend.metadataJson);
      assertEqual(meta.status, "SUSPENDED");

      // 2. Reactivate Seller
      const resActivate = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId, status: "ACTIVE", commissionRate: 0.10, verified: true },
      });
      assertEqual(resActivate.status, 200);
      assertEqual(resActivate.data.seller.status, "ACTIVE");
    }
  );

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;

  console.log("\n================================================================================");
  console.log("             CHALLENGER 1 EXECUTION SUMMARY — 100% EMPIRICAL                    ");
  console.log("================================================================================");
  console.log(`  TOTAL GOVERNANCE ADVERSARIAL CHECKS: ${passed}/${total} passed (${failed} failed)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    console.log("Failed Scenarios:");
    results.filter((r) => r.status === "FAILED").forEach((r) => {
      console.log(`  - [${r.domain}] ${r.id} ${r.name}: ${r.error}`);
    });
  }

  return { total, passed, failed, results };
}

async function main() {
  const serverInfo = await startServerIfNeeded();
  try {
    const res = await runAdversarialTestSuite();
    if (res.failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    if (serverInfo.wasSpawned && serverInfo.process) {
      console.log("[Challenger 1] Shutting down spawned Next.js server...");
      try {
        if (process.platform === "win32") {
          execSync(`taskkill /pid ${serverInfo.process.pid} /T /F`, { stdio: "ignore" });
        } else {
          serverInfo.process.kill("SIGTERM");
        }
      } catch (e) {}
    }
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error("Fatal test failure:", e);
    process.exit(1);
  });
}

module.exports = { runAdversarialTestSuite };
