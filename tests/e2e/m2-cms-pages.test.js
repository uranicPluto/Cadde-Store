const { spawn } = require("child_process");
const path = require("path");
const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertContains,
  ensureServerReady,
  TEST_PORT,
  BASE_URL,
} = require("./harness");

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
    return { process: null, wasSpawned: false };
  }

  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npx.cmd" : "npx";
  const serverProcess = spawn(cmd, ["next", "dev", "-p", String(TEST_PORT)], {
    cwd: path.join(__dirname, "..", ".."),
    stdio: "ignore",
    shell: true,
  });

  await ensureServerReady(60000);
  return { process: serverProcess, wasSpawned: true };
}

async function runM2CmsPagesTests() {
  const serverInfo = await startServerIfNeeded();
  const results = [];

  async function test(name, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({ name, status: "PASSED", duration: Date.now() - start });
      console.log(`  ✓ [PASSED] ${name}`);
    } catch (err) {
      results.push({ name, status: "FAILED", error: err.message, duration: Date.now() - start });
      console.error(`  ✗ [FAILED] ${name}: ${err.message}`);
    }
  }

  console.log("\n=======================================================");
  console.log("  M2: FULL WEBSITE PAGE BUILDER & MULTI-PAGE CMS (R1)  ");
  console.log("=======================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const testSlug = `test-campaign-${Date.now()}`;
  let createdPageId = null;
  let publishedVersionId = null;

  // 1. Query all pages
  await test("Admin lists all CMS pages via GET /api/pages", async () => {
    const res = await request("/api/pages", {
      method: "GET",
      headers: adminHeaders,
    });
    assertEqual(res.status, 200, "Expected 200 OK");
    assert(res.data.success, "Expected success: true");
    assert(Array.isArray(res.data.pages), "Expected pages array");
    assert(res.data.pages.length > 0, "Pages list should contain default static pages");
  });

  // 2. Create new page
  await test("Admin creates a multi-section campaign page via POST /api/pages", async () => {
    const sections = [
      {
        id: "sec-hero-1",
        type: "HERO",
        titleTR: "Yaz Fırsatları",
        titleEN: "Summer Deals",
        orderIndex: 0,
        active: true,
        configJson: {
          subtitleTR: "Seçili kategorilerde %40'a varan indirimler",
          subtitleEN: "Up to 40% discount on selected categories",
          bgGradient: "from-slate-900 via-indigo-950 to-slate-900",
          primaryCtaTextTR: "Alışverişe Başla",
          primaryCtaTextEN: "Start Shopping",
          primaryCtaLink: "/category/kadin",
          badgeTR: "FIRSAT",
          badgeEN: "HOT DEAL",
        },
      },
      {
        id: "sec-grid-1",
        type: "PRODUCT_GRID",
        titleTR: "Çok Satanlar",
        titleEN: "Bestselling Products",
        orderIndex: 1,
        active: true,
        configJson: {
          limit: 4,
          columns: 4,
          source: "BESTSELLER",
        },
      },
      {
        id: "sec-faq-1",
        type: "FAQ_ACCORDION",
        titleTR: "Sıkça Sorulan Sorular",
        titleEN: "Frequently Asked Questions",
        orderIndex: 2,
        active: true,
        configJson: {
          items: [
            {
              questionTR: "Teslimat ne zaman yapılır?",
              questionEN: "When is delivery made?",
              answerTR: "24 saat içinde kargolanır.",
              answerEN: "Shipped within 24 hours.",
            },
          ],
        },
      },
    ];

    const payload = {
      slug: testSlug,
      titleTr: "Yaz Kampanyası Özel Vitrin",
      titleEn: "Summer Campaign Special Showcase",
      type: "CAMPAIGN",
      status: "DRAFT",
      sectionsJson: JSON.stringify(sections),
      metaTitleTr: "Yaz Kampanyası | Cadde Store",
      metaTitleEn: "Summer Campaign | Cadde Store",
      metaDescriptionTr: "En iyi yaz kampanyası fırsatları Cadde Store'da.",
      metaDescriptionEn: "Best summer campaign deals at Cadde Store.",
    };

    const res = await request("/api/pages", {
      method: "POST",
      headers: adminHeaders,
      body: payload,
    });

    assertEqual(res.status, 201, "Expected 201 Created");
    assert(res.data.success, "Expected success: true");
    assert(res.data.page?.id, "Expected created page id");
    assertEqual(res.data.page.slug, testSlug);
    assertEqual(res.data.page.status, "DRAFT");
    createdPageId = res.data.page.id;

    // Verify AuditLog for PAGE_CREATED
    const audit = await prisma.auditLog.findFirst({
      where: { action: "PAGE_CREATED", entityId: createdPageId },
      orderBy: { createdAt: "desc" },
    });
    assert(audit, "AuditLog for PAGE_CREATED should exist");
  });

  // 3. Prevent duplicate slug
  await test("System rejects duplicate page slug with 409 Conflict", async () => {
    const res = await request("/api/pages", {
      method: "POST",
      headers: adminHeaders,
      body: {
        slug: testSlug,
        titleTr: "Aynı Slug Test",
        titleEn: "Duplicate Slug Test",
      },
    });
    assertEqual(res.status, 409, "Expected 409 Conflict for duplicate slug");
  });

  // 4. Retrieve page by ID
  await test("Admin retrieves page details via GET /api/pages/:id", async () => {
    assert(createdPageId, "createdPageId should exist");
    const res = await request(`/api/pages/${createdPageId}`, {
      method: "GET",
      headers: adminHeaders,
    });
    assertEqual(res.status, 200, "Expected 200 OK");
    assert(res.data.success, "Expected success: true");
    assertEqual(res.data.page.id, createdPageId);
  });

  // 5. Update page
  await test("Admin updates page title and sections via PUT /api/pages/:id", async () => {
    assert(createdPageId, "createdPageId should exist");
    const updatedTitleTr = "Yaz Kampanyası Vitrin (Güncellendi)";
    const res = await request(`/api/pages/${createdPageId}`, {
      method: "PUT",
      headers: adminHeaders,
      body: {
        titleTr: updatedTitleTr,
      },
    });
    assertEqual(res.status, 200, "Expected 200 OK");
    assertEqual(res.data.page.titleTr, updatedTitleTr);

    // Verify AuditLog for PAGE_UPDATED
    const audit = await prisma.auditLog.findFirst({
      where: { action: "PAGE_UPDATED", entityId: createdPageId },
      orderBy: { createdAt: "desc" },
    });
    assert(audit, "AuditLog for PAGE_UPDATED should exist");
  });

  // 6. Publish page with version snapshot
  await test("Admin publishes page and creates snapshot via POST /api/pages/:id/publish", async () => {
    assert(createdPageId, "createdPageId should exist");
    const res = await request(`/api/pages/${createdPageId}/publish`, {
      method: "POST",
      headers: adminHeaders,
      body: {
        action: "publish",
        changeSummary: "İlk sürüm yayına alındı",
      },
    });
    assertEqual(res.status, 200, "Expected 200 OK");
    assert(res.data.success, "Expected success: true");
    assertEqual(res.data.page.status, "PUBLISHED");
    assert(res.data.version?.id, "Expected version snapshot id");
    publishedVersionId = res.data.version.id;

    // Verify AuditLog for PAGE_PUBLISHED
    const audit = await prisma.auditLog.findFirst({
      where: { action: "PAGE_PUBLISHED", entityId: createdPageId },
      orderBy: { createdAt: "desc" },
    });
    assert(audit, "AuditLog for PAGE_PUBLISHED should exist");
  });

  // 7. Storefront dynamic route access
  await test("Public storefront renders published page at /p/:slug", async () => {
    const res = await request(`/p/${testSlug}`, {
      method: "GET",
    });
    assertEqual(res.status, 200, "Expected 200 OK for /p/:slug");
  });

  // 8. Duplicate page
  let duplicatedPageId = null;
  await test("Admin duplicates page via POST /api/pages/:id/duplicate", async () => {
    assert(createdPageId, "createdPageId should exist");
    const res = await request(`/api/pages/${createdPageId}/duplicate`, {
      method: "POST",
      headers: adminHeaders,
      body: {},
    });
    assertEqual(res.status, 201, "Expected 201 Created");
    assert(res.data.page?.id, "Expected duplicated page id");
    assert(res.data.page.slug.includes("-copy-"), "Duplicated slug should contain copy suffix");
    duplicatedPageId = res.data.page.id;

    // Verify AuditLog for PAGE_DUPLICATED
    const audit = await prisma.auditLog.findFirst({
      where: { action: "PAGE_DUPLICATED", entityId: duplicatedPageId },
      orderBy: { createdAt: "desc" },
    });
    assert(audit, "AuditLog for PAGE_DUPLICATED should exist");
  });

  // 9. Inspect version history
  await test("Admin inspects version history via GET /api/pages/:id/versions", async () => {
    assert(createdPageId, "createdPageId should exist");
    const res = await request(`/api/pages/${createdPageId}/versions`, {
      method: "GET",
      headers: adminHeaders,
    });
    assertEqual(res.status, 200, "Expected 200 OK");
    assert(Array.isArray(res.data.versions), "Expected versions array");
    assert(res.data.versions.length >= 1, "Should have at least 1 version snapshot");
  });

  // 10. Rollback to version
  await test("Admin rolls back to version snapshot via POST /api/pages/:id/versions", async () => {
    assert(createdPageId && publishedVersionId, "IDs must exist");
    const res = await request(`/api/pages/${createdPageId}/versions`, {
      method: "POST",
      headers: adminHeaders,
      body: { versionId: publishedVersionId },
    });
    assertEqual(res.status, 200, "Expected 200 OK");
    assert(res.data.success, "Expected success: true");

    // Verify AuditLog for PAGE_ROLLED_BACK
    const audit = await prisma.auditLog.findFirst({
      where: { action: "PAGE_ROLLED_BACK", entityId: createdPageId },
      orderBy: { createdAt: "desc" },
    });
    assert(audit, "AuditLog for PAGE_ROLLED_BACK should exist");
  });

  // 11. Delete page
  await test("Admin deletes page via DELETE /api/pages/:id", async () => {
    if (duplicatedPageId) {
      await request(`/api/pages/${duplicatedPageId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
    }
    if (createdPageId) {
      const res = await request(`/api/pages/${createdPageId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.deleted, "Expected deleted: true");

      // Verify AuditLog for PAGE_DELETED
      const audit = await prisma.auditLog.findFirst({
        where: { action: "PAGE_DELETED", entityId: createdPageId },
        orderBy: { createdAt: "desc" },
      });
      assert(audit, "AuditLog for PAGE_DELETED should exist");
    }
  });

  const passed = results.filter((r) => r.status === "PASSED").length;
  console.log(`\n=======================================================`);
  console.log(`  M2 CMS PAGES SUITE SUMMARY: ${passed}/${results.length} PASSED`);
  console.log(`=======================================================\n`);

  if (serverInfo.wasSpawned && serverInfo.process) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(serverInfo.process.pid), "/f", "/t"]);
      } else {
        serverInfo.process.kill();
      }
    } catch (e) {}
  }

  return results;
}

if (require.main === module) {
  runM2CmsPagesTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Test Suite Run Error:", err);
      process.exit(1);
    });
}

module.exports = { runM2CmsPagesTests };
