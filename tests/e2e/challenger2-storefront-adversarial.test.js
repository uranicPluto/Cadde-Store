/**
 * CADDE STORE — CHALLENGER 2 EMPIRICAL ADVERSARIAL STRESS TEST SUITE
 * 
 * Target Domains:
 * 1. Homepage dynamic section rendering: active/inactive toggles, date scheduling, orderIndex inversion
 * 2. Multi-vendor split checkout stock atomic decrement under concurrency
 * 3. Coupon validation with cart minimum thresholds and usage limit exhaustion
 * 4. Return request photo evidence format handling and item refund calculation precision
 */

const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertDeepEqual,
  assertContains,
  ensureServerReady,
  TEST_PORT,
  BASE_URL,
} = require("./harness");

const { spawn } = require("child_process");
const path = require("path");

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

  console.log(`[Challenger 2] Starting Next.js test server on port ${TEST_PORT}...`);
  const isWindows = process.platform === "win32";
  const cmd = isWindows ? "npx.cmd" : "npx";
  const serverProcess = spawn(cmd, ["next", "dev", "-p", String(TEST_PORT)], {
    cwd: path.join(__dirname, "..", ".."),
    stdio: "ignore",
    shell: true,
  });

  await ensureServerReady(60000);
  console.log(`[Challenger 2] Test server ready at ${BASE_URL}.`);
  return { process: serverProcess, wasSpawned: true };
}

// Client-side scheduling simulation helper mirroring app/page.tsx
function isSectionActiveAndScheduled(s, simulatedNow = Date.now()) {
  const isActive = s.active !== false && s.isActive !== false;
  if (!isActive) return false;

  if (s.startDate) {
    const start = new Date(s.startDate).getTime();
    if (!isNaN(start) && start > simulatedNow) return false;
  }
  if (s.endDate) {
    const end = new Date(s.endDate).getTime();
    if (!isNaN(end) && end < simulatedNow) return false;
  }
  return true;
}

async function runChallenger2AdversarialTests() {
  const results = [];
  const testIds = new Set();

  async function test(id, name, domain, fn) {
    if (testIds.has(id)) {
      throw new Error(`Duplicate test ID: ${id}`);
    }
    testIds.add(id);

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
      console.log(`  [PASS] [${id}] ${name} (${Date.now() - start}ms)`);
    } catch (err) {
      results.push({
        id,
        name,
        domain,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
      console.error(`  [FAIL] [${id}] ${name}: ${err.message}`);
    }
  }

  console.log("\n================================================================================");
  console.log("  CHALLENGER 2: ADVERSARIAL STRESS TEST SUITE");
  console.log("================================================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const sellerHeaders = await getAuthHeaders("SELLER");
  const customerHeaders = await getAuthHeaders("CUSTOMER");

  // Lookup existing sellers, categories, users from DB
  const sellers = await prisma.seller.findMany({ where: { status: "ACTIVE" }, take: 3 });
  assert(sellers.length >= 1, "At least 1 active seller is required for tests");
  const category = await prisma.category.findFirst();
  assert(category, "At least 1 category is required for tests");
  const customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  assert(customer, "At least 1 customer is required for tests");

  // ============================================================================
  // DOMAIN 1: HOMEPAGE DYNAMIC SECTION RENDERING, SCHEDULING & SORTING
  // ============================================================================
  console.log("\n--- DOMAIN 1: Dynamic CMS Section Rendering, Scheduling & Sorting ---");

  let createdSectionIds = [];

  await test(
    "ADV2.CMS.1",
    "Active visibility toggle: section with active:true appears in public /api/cms/sections",
    "Homepage Dynamic CMS",
    async () => {
      const title = `Vitrin Test Active ${Date.now()}`;
      const createRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: title,
          titleEN: "Showcase Test Active",
          type: "HERO",
          orderIndex: 990,
          active: true,
        },
      });
      assertEqual(createRes.status, 201, "Expected 201 Created for CMS section");
      const sectionId = createRes.data.section.id;
      createdSectionIds.push(sectionId);

      const pubRes = await request("/api/cms/sections");
      assertEqual(pubRes.status, 200, "Public CMS sections GET should return 200");
      const found = pubRes.data.sections.find((s) => s.id === sectionId);
      assert(found, "Active section must appear in public /api/cms/sections response");
      assertEqual(found.active, true, "Section should be marked active");
    }
  );

  await test(
    "ADV2.CMS.2",
    "Inactive visibility toggle: section with active:false is excluded from public /api/cms/sections",
    "Homepage Dynamic CMS",
    async () => {
      const title = `Vitrin Test Inactive ${Date.now()}`;
      const createRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: title,
          titleEN: "Showcase Test Inactive",
          type: "BANNER_STRIP",
          orderIndex: 991,
          active: false,
        },
      });
      assertEqual(createRes.status, 201, "Expected 201 Created");
      const sectionId = createRes.data.section.id;
      createdSectionIds.push(sectionId);

      // Public endpoint without all=true
      const pubRes = await request("/api/cms/sections");
      const foundInPublic = pubRes.data.sections.find((s) => s.id === sectionId);
      assert(!foundInPublic, "Inactive section must NOT appear in public /api/cms/sections");

      // Admin endpoint with all=true
      const adminRes = await request("/api/cms/sections?all=true", { headers: adminHeaders });
      const foundInAdmin = adminRes.data.sections.find((s) => s.id === sectionId);
      assert(foundInAdmin, "Inactive section MUST appear when querying with all=true");
      assertEqual(foundInAdmin.active, false, "Section active flag should be false");
    }
  );

  await test(
    "ADV2.CMS.3",
    "Real-time toggle mutation: toggling active true->false immediately hides section from public view",
    "Homepage Dynamic CMS",
    async () => {
      const createRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: `Toggle Switch ${Date.now()}`,
          titleEN: "Toggle Switch",
          type: "FLASH_DEALS",
          orderIndex: 992,
          active: true,
        },
      });
      const sectionId = createRes.data.section.id;
      createdSectionIds.push(sectionId);

      // Toggle to false
      const putRes = await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { id: sectionId, active: false },
      });
      assertEqual(putRes.status, 200, "Update section should succeed with 200");

      // Verify immediate exclusion
      const pubRes = await request("/api/cms/sections");
      const found = pubRes.data.sections.find((s) => s.id === sectionId);
      assert(!found, "Section updated to active:false must be immediately omitted from public feed");
    }
  );

  await test(
    "ADV2.CMS.4",
    "Future date scheduling: section with startDate in the future is rejected by scheduling filter",
    "Homepage Dynamic CMS",
    async () => {
      const futureStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // +7 days
      const section = {
        id: "future-sec-test",
        active: true,
        startDate: futureStart,
        endDate: null,
      };

      const isVisible = isSectionActiveAndScheduled(section);
      assertEqual(isVisible, false, "Section with future startDate must NOT be active today");
    }
  );

  await test(
    "ADV2.CMS.5",
    "Expired date scheduling: section with endDate in the past is rejected by scheduling filter",
    "Homepage Dynamic CMS",
    async () => {
      const pastEnd = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(); // -3 days
      const section = {
        id: "expired-sec-test",
        active: true,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: pastEnd,
      };

      const isVisible = isSectionActiveAndScheduled(section);
      assertEqual(isVisible, false, "Section with past endDate must NOT be active today");
    }
  );

  await test(
    "ADV2.CMS.6",
    "Active date window: section within startDate <= now <= endDate passes scheduling filter",
    "Homepage Dynamic CMS",
    async () => {
      const pastStart = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const futureEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const section = {
        id: "active-window-sec",
        active: true,
        startDate: pastStart,
        endDate: futureEnd,
      };

      const isVisible = isSectionActiveAndScheduled(section);
      assertEqual(isVisible, true, "Section in current active time window must pass scheduling filter");
    }
  );

  await test(
    "ADV2.CMS.7",
    "OrderIndex sorting with negative and arbitrary values: sections are strictly ordered ascending",
    "Homepage Dynamic CMS",
    async () => {
      // Create 3 sections with orderIndices -50, 0, 75
      const ts = Date.now();
      const s1 = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: `Order -50 ${ts}`, titleEN: `Order -50 ${ts}`, orderIndex: -50, active: true },
      });
      const s2 = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: `Order 75 ${ts}`, titleEN: `Order 75 ${ts}`, orderIndex: 75, active: true },
      });
      createdSectionIds.push(s1.data.section.id, s2.data.section.id);

      const pubRes = await request("/api/cms/sections");
      const returnedSections = pubRes.data.sections;
      
      // Verify array is sorted monotonically ascending by orderIndex
      for (let i = 0; i < returnedSections.length - 1; i++) {
        const curOrder = returnedSections[i].orderIndex ?? 0;
        const nextOrder = returnedSections[i + 1].orderIndex ?? 0;
        assert(
          curOrder <= nextOrder,
          `Sections must be sorted by orderIndex asc. Found orderIndex ${curOrder} before ${nextOrder}`
        );
      }
    }
  );

  await test(
    "ADV2.CMS.8",
    "OrderIndex inversion update: reversing section order indices updates public feed order",
    "Homepage Dynamic CMS",
    async () => {
      const ts = Date.now();
      const secA = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: `Sec Alpha ${ts}`, titleEN: `Sec Alpha ${ts}`, orderIndex: 1001, active: true },
      });
      const secB = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: `Sec Beta ${ts}`, titleEN: `Sec Beta ${ts}`, orderIndex: 1002, active: true },
      });
      createdSectionIds.push(secA.data.section.id, secB.data.section.id);

      // Invert order: set secA to 1003, secB to 1000
      await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { id: secA.data.section.id, orderIndex: 1003 },
      });
      await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { id: secB.data.section.id, orderIndex: 1000 },
      });

      const pubRes = await request("/api/cms/sections");
      const idxA = pubRes.data.sections.findIndex((s) => s.id === secA.data.section.id);
      const idxB = pubRes.data.sections.findIndex((s) => s.id === secB.data.section.id);

      assert(idxB < idxA, "Sec Beta (order 1000) must appear before Sec Alpha (order 1003)");
    }
  );

  await test(
    "ADV2.CMS.9",
    "Complex JSON configuration payload integrity (autoplay, speed, responsive breakpoints)",
    "Homepage Dynamic CMS",
    async () => {
      const complexConfig = {
        autoplay: true,
        intervalMs: 3500,
        showArrows: true,
        breakpoints: { mobile: 1, tablet: 2, desktop: 4 },
        filters: ["featured", "discounted"],
      };

      const res = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: `Config Section ${Date.now()}`,
          titleEN: "Config Section",
          type: "PRODUCT_CAROUSEL",
          configJson: JSON.stringify(complexConfig),
          active: true,
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      createdSectionIds.push(res.data.section.id);

      const parsed = JSON.parse(res.data.section.configJson);
      assertEqual(parsed.intervalMs, 3500, "Config JSON intervalMs preserved");
      assertEqual(parsed.breakpoints.desktop, 4, "Breakpoints preserved");
    }
  );

  await test(
    "ADV2.CMS.10",
    "Audit trail: Section creation, modification, and deletion generate AuditLog records",
    "Homepage Dynamic CMS",
    async () => {
      const createRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: `Audit Section ${Date.now()}`,
          titleEN: "Audit Section",
          type: "STORE_HIGHLIGHTS",
          active: true,
        },
      });
      const sectionId = createRes.data.section.id;

      // Update
      await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { id: sectionId, titleTR: "Audit Section Renamed" },
      });

      // Delete
      await request(`/api/cms/sections?id=${sectionId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });

      const logs = await prisma.auditLog.findMany({
        where: { entityType: "CMS", entityId: sectionId },
        orderBy: { createdAt: "asc" },
      });

      assert(logs.length >= 2, "Should have created multiple AuditLog records for CMS section actions");
      const actions = logs.map((l) => l.action);
      assertContains(actions, "CMS_SECTION_CREATED", "Should contain CMS_SECTION_CREATED log");
    }
  );

  // Cleanup created CMS sections
  for (const sId of createdSectionIds) {
    try {
      await prisma.homepageSection.delete({ where: { id: sId } }).catch(() => {});
    } catch (e) {}
  }

  // ============================================================================
  // DOMAIN 2: MULTI-VENDOR SPLIT CHECKOUT & CONCURRENCY ATOMIC DECREMENT
  // ============================================================================
  console.log("\n--- DOMAIN 2: Multi-Vendor Split Checkout & Stock Concurrency ---");

  // Create two distinct test sellers and products
  const sellerA = sellers[0];
  let sellerB = sellers[1];
  if (!sellerB) {
    // Create second seller if only 1 exists
    const userB = await prisma.user.create({
      data: {
        email: `seller-b-${Date.now()}@cadde.store`,
        passwordHash: "hash",
        firstName: "İkinci",
        lastName: "Satıcı",
        role: "SELLER",
      },
    });
    sellerB = await prisma.seller.create({
      data: {
        userId: userB.id,
        storeName: `İkinci Mağaza ${Date.now()}`,
        slug: `ikinci-magaza-${Date.now()}`,
        description: "Adversarial test seller",
        logo: "/uploads/store2.png",
        status: "ACTIVE",
      },
    });
  }

  let createdProductIds = [];

  const productA = await prisma.product.create({
    data: {
      sellerId: sellerA.id,
      categoryId: category.id,
      name: `Adversarial Prod A ${Date.now()}`,
      slug: `adv-prod-a-${Date.now()}`,
      description: "Test product vendor A",
      brand: "Brand A",
      sku: `SKU-A-${Date.now()}`,
      price: 150.0,
      stock: 20,
      imageUrl: "/images/prod-a.jpg",
      status: "ACTIVE",
    },
  });
  createdProductIds.push(productA.id);

  const productB = await prisma.product.create({
    data: {
      sellerId: sellerB.id,
      categoryId: category.id,
      name: `Adversarial Prod B ${Date.now()}`,
      slug: `adv-prod-b-${Date.now()}`,
      description: "Test product vendor B",
      brand: "Brand B",
      sku: `SKU-B-${Date.now()}`,
      price: 250.0,
      stock: 20,
      imageUrl: "/images/prod-b.jpg",
      status: "ACTIVE",
    },
  });
  createdProductIds.push(productB.id);

  await test(
    "ADV2.CHK.1",
    "Multi-vendor split checkout creates 1 Order and 2 distinct OrderGroups",
    "Multi-Vendor Split Checkout",
    async () => {
      const orderPayload = {
        items: [
          { productId: productA.id, quantity: 2, price: productA.price },
          { productId: productB.id, quantity: 1, price: productB.price },
        ],
        shippingAddress: {
          title: "Ev",
          firstName: "Ahmet",
          lastName: "Test",
          phone: "05551234567",
          city: "İstanbul",
          district: "Kadıköy",
          addressLine: "Bağdat Cad. No: 12",
        },
      };

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: orderPayload,
      });

      assertEqual(res.status, 200, "Order creation should succeed with 200 OK");
      const order = res.data.order;
      assert(order.id, "Order ID must exist");
      assertEqual(order.orderGroups.length, 2, "Should create exactly 2 OrderGroups for 2 distinct sellers");

      const sellerIds = order.orderGroups.map((g) => g.sellerId);
      assertContains(sellerIds, sellerA.id, "OrderGroup for Seller A must exist");
      assertContains(sellerIds, sellerB.id, "OrderGroup for Seller B must exist");

      // Verify subtotal = 2 * 150 + 1 * 250 = 550
      assertEqual(order.subtotal, 550, "Order subtotal should be 550 TL");
    }
  );

  await test(
    "ADV2.CHK.2",
    "OrderItems are correctly linked to respective OrderGroups and orderId",
    "Multi-Vendor Split Checkout",
    async () => {
      const orderPayload = {
        items: [
          { productId: productA.id, quantity: 1, price: productA.price },
          { productId: productB.id, quantity: 2, price: productB.price },
        ],
        shippingAddress: {
          title: "İş",
          firstName: "Mehmet",
          lastName: "Test",
          phone: "05559876543",
          city: "Ankara",
          district: "Çankaya",
          addressLine: "Tunalı Hilmi No: 44",
        },
      };

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: orderPayload,
      });

      assertEqual(res.status, 200, "Order should succeed");
      const order = res.data.order;

      for (const group of order.orderGroups) {
        assertEqual(group.orderId, order.id, "OrderGroup must reference parent orderId");
        for (const item of group.items) {
          assertEqual(item.orderId, order.id, "OrderItem must reference parent orderId");
          assertEqual(item.orderGroupId, group.id, "OrderItem must reference parent orderGroupId");
        }
      }
    }
  );

  await test(
    "ADV2.CHK.3",
    "Server-authoritative pricing: client-tampered price is completely ignored in favor of DB price",
    "Multi-Vendor Split Checkout",
    async () => {
      const orderPayload = {
        items: [
          { productId: productA.id, quantity: 1, price: 0.01 }, // Tampered cheap price
        ],
        shippingAddress: {
          title: "Ev",
          firstName: "Hacker",
          lastName: "Test",
          phone: "05550000000",
          city: "İzmir",
          district: "Konak",
          addressLine: "Kordon No: 1",
        },
      };

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: orderPayload,
      });

      assertEqual(res.status, 200, "Checkout succeeds");
      const order = res.data.order;
      // DB price is 150.0, NOT 0.01
      assertEqual(order.subtotal, 150.0, "Subtotal must be computed from DB price (150.0)");
    }
  );

  await test(
    "ADV2.CHK.4",
    "CONCURRENCY STRESS: 10 concurrent checkouts for stock=3 item -> exactly 3 succeed, 7 fail with 400",
    "Multi-Vendor Split Checkout",
    async () => {
      // Create a dedicated limited-stock product with stock=3
      const scarceProduct = await prisma.product.create({
        data: {
          sellerId: sellerA.id,
          categoryId: category.id,
          name: `Scarce Item ${Date.now()}`,
          slug: `scarce-item-${Date.now()}`,
          description: "Scarce stock product for concurrency test",
          brand: "ScarceBrand",
          sku: `SKU-SCARCE-${Date.now()}`,
          price: 99.0,
          stock: 3,
          imageUrl: "/images/scarce.jpg",
          status: "ACTIVE",
        },
      });
      createdProductIds.push(scarceProduct.id);

      // Launch 10 simultaneous checkout requests
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => {
        return request("/api/orders", {
          method: "POST",
          headers: customerHeaders,
          body: {
            items: [{ productId: scarceProduct.id, quantity: 1 }],
            shippingAddress: {
              title: "Adres",
              firstName: `User${i}`,
              lastName: "Test",
              phone: "05551112233",
              city: "Bursa",
              district: "Nilüfer",
              addressLine: `Cadde ${i}`,
            },
          },
        });
      });

      const responses = await Promise.all(concurrentRequests);

      const successful = responses.filter((r) => r.status === 200);
      const rejected = responses.filter((r) => r.status === 400 || r.status === 500);

      assertEqual(
        successful.length,
        3,
        `Expected exactly 3 checkouts to succeed for stock=3. Actual: ${successful.length}`
      );
      assertEqual(
        rejected.length,
        7,
        `Expected exactly 7 checkouts to be rejected. Actual: ${rejected.length}`
      );

      // Verify DB final stock is exactly 0 (zero overselling)
      const finalProd = await prisma.product.findUnique({ where: { id: scarceProduct.id } });
      assertEqual(finalProd.stock, 0, "Final DB stock must be exactly 0 (no over-selling or negative stock)");
    }
  );

  await test(
    "ADV2.CHK.5",
    "Multi-item atomic rollback: out-of-stock item causes entire order to abort without decrementing in-stock items",
    "Multi-Vendor Split Checkout",
    async () => {
      const inStockProd = await prisma.product.create({
        data: {
          sellerId: sellerA.id,
          categoryId: category.id,
          name: `In Stock Item ${Date.now()}`,
          slug: `in-stock-${Date.now()}`,
          description: "In stock item",
          brand: "TestBrand",
          sku: `SKU-INSTOCK-${Date.now()}`,
          price: 100.0,
          stock: 10,
          imageUrl: "/images/instock.jpg",
          status: "ACTIVE",
        },
      });
      createdProductIds.push(inStockProd.id);

      const zeroStockProd = await prisma.product.create({
        data: {
          sellerId: sellerB.id,
          categoryId: category.id,
          name: `Zero Stock Item ${Date.now()}`,
          slug: `zero-stock-${Date.now()}`,
          description: "Zero stock item",
          brand: "TestBrand",
          sku: `SKU-ZERO-${Date.now()}`,
          price: 200.0,
          stock: 0,
          imageUrl: "/images/zero.jpg",
          status: "ACTIVE",
        },
      });
      createdProductIds.push(zeroStockProd.id);

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [
            { productId: inStockProd.id, quantity: 2 },
            { productId: zeroStockProd.id, quantity: 1 },
          ],
          shippingAddress: {
            title: "Ev",
            firstName: "Rollback",
            lastName: "Tester",
            phone: "05559998877",
            city: "Antalya",
            district: "Muratpaşa",
            addressLine: "Lara Cad. No: 10",
          },
        },
      });

      assertEqual(res.status, 400, "Expected 400 Bad Request due to 0-stock item");

      // Verify inStockProd stock was NOT decremented
      const checkInStock = await prisma.product.findUnique({ where: { id: inStockProd.id } });
      assertEqual(checkInStock.stock, 10, "In-stock item stock must remain 10 after aborted transaction");
    }
  );

  await test(
    "ADV2.CHK.6",
    "Quantity boundary validation: quantities 0, negative, floating point, and >99 are strictly rejected",
    "Multi-Vendor Split Checkout",
    async () => {
      const invalidQuantities = [0, -1, 1.5, 100, -99];

      for (const q of invalidQuantities) {
        const res = await request("/api/orders", {
          method: "POST",
          headers: customerHeaders,
          body: {
            items: [{ productId: productA.id, quantity: q }],
            shippingAddress: {
              title: "Ev",
              firstName: "Boundary",
              lastName: "Test",
              phone: "05551234567",
              city: "İstanbul",
              district: "Kadıköy",
              addressLine: "Test Adres",
            },
          },
        });
        assertEqual(res.status, 400, `Expected 400 for invalid quantity: ${q}`);
      }
    }
  );

  await test(
    "ADV2.CHK.7",
    "Inactive or draft product cannot be purchased",
    "Multi-Vendor Split Checkout",
    async () => {
      const draftProd = await prisma.product.create({
        data: {
          sellerId: sellerA.id,
          categoryId: category.id,
          name: `Draft Item ${Date.now()}`,
          slug: `draft-item-${Date.now()}`,
          description: "Draft product",
          brand: "DraftBrand",
          sku: `SKU-DRAFT-${Date.now()}`,
          price: 120.0,
          stock: 50,
          imageUrl: "/images/draft.jpg",
          status: "DRAFT", // Inactive/Draft
        },
      });
      createdProductIds.push(draftProd.id);

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: draftProd.id, quantity: 1 }],
          shippingAddress: {
            title: "Ev",
            firstName: "Draft",
            lastName: "Tester",
            phone: "05551234567",
            city: "İstanbul",
            district: "Kadıköy",
            addressLine: "Test",
          },
        },
      });

      assertEqual(res.status, 400, "Draft product purchase should be rejected with 400");
    }
  );

  await test(
    "ADV2.CHK.8",
    "Dynamic shipping fee threshold from PlatformSettings is strictly enforced",
    "Multi-Vendor Split Checkout",
    async () => {
      const settings = (await prisma.platformSettings.findUnique({ where: { id: "default" } })) || {
        defaultShippingFee: 34.9,
        freeShippingThreshold: 200.0,
      };
      const threshold = settings.freeShippingThreshold || 200.0;
      const expectedFee = settings.defaultShippingFee ?? 34.9;

      const unitPrice = Math.max(10, Math.floor(threshold / 2));
      const cheapProd = await prisma.product.create({
        data: {
          sellerId: sellerA.id,
          categoryId: category.id,
          name: `Cheap Item ${Date.now()}`,
          slug: `cheap-item-${Date.now()}`,
          description: "Under threshold item",
          brand: "CheapBrand",
          sku: `SKU-CHEAP-${Date.now()}`,
          price: unitPrice,
          stock: 50,
          imageUrl: "/images/cheap.jpg",
          status: "ACTIVE",
        },
      });
      createdProductIds.push(cheapProd.id);

      // 1. Order below threshold (1 item = unitPrice < threshold)
      const resBelow = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: cheapProd.id, quantity: 1 }],
          shippingAddress: {
            title: "Ev",
            firstName: "Ship",
            lastName: "Test",
            phone: "05551112233",
            city: "İstanbul",
            district: "Beşiktaş",
            addressLine: "Çarşı No: 5",
          },
        },
      });
      assertEqual(resBelow.status, 200, "Checkout succeeds");
      assertEqual(resBelow.data.order.shippingFee, expectedFee, `Shipping fee should be ${expectedFee} for order < threshold`);
      assertEqual(resBelow.data.order.grandTotal, unitPrice + expectedFee, "Grand total must include shipping fee");

      // 2. Order above threshold
      const qualifyingQty = Math.ceil((threshold + 10) / unitPrice);
      const resAbove = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: cheapProd.id, quantity: qualifyingQty }],
          shippingAddress: {
            title: "Ev",
            firstName: "Ship",
            lastName: "Test",
            phone: "05551112233",
            city: "İstanbul",
            district: "Beşiktaş",
            addressLine: "Çarşı No: 5",
          },
        },
      });
      assertEqual(resAbove.status, 200, "Checkout succeeds");
      assertEqual(resAbove.data.order.shippingFee, 0, "Shipping fee should be 0 for order >= threshold");
      assertEqual(resAbove.data.order.grandTotal, unitPrice * qualifyingQty, "Grand total should have 0 shipping fee");
    }
  );

  // ============================================================================
  // DOMAIN 3: COUPON VALIDATION, MINIMUM THRESHOLDS & USAGE LIMIT EXHAUSTION
  // ============================================================================
  console.log("\n--- DOMAIN 3: Coupon Validation, Minimum Thresholds & Usage Limits ---");

  let createdCouponIds = [];

  await test(
    "ADV2.CPN.1",
    "Percentage discount calculation precision: 20% discount on 500 TL cart equals 100 TL discount",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTPERC${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "PERCENTAGE",
          value: 20,
          active: true,
        },
      });
      assertEqual(cpnRes.status, 200, "Coupon creation should succeed");
      createdCouponIds.push(cpnRes.data.coupon.id);

      const valRes = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 500.0 },
      });
      assertEqual(valRes.status, 200, "Validation should return 200 OK");
      assertEqual(valRes.data.coupon.discountAmount, 100.0, "20% of 500 should be 100.0 TL");
    }
  );

  await test(
    "ADV2.CPN.2",
    "Fixed discount coupon calculation precision: 50 TL fixed discount on any qualifying subtotal",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTFIXED${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "FIXED",
          value: 50.0,
          active: true,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      const valRes = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 300.0 },
      });
      assertEqual(valRes.status, 200, "Validation succeeds");
      assertEqual(valRes.data.coupon.discountAmount, 50.0, "Fixed discount should be 50.0 TL");
    }
  );

  await test(
    "ADV2.CPN.3",
    "Cart minimum threshold boundary: subtotal 1 cent below minimumOrder is rejected with 400",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTMIN${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "PERCENTAGE",
          value: 10,
          minimumOrder: 400.0,
          active: true,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      // Subtotal 399.99 (below minimum 400.00)
      const valFail = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 399.99 },
      });
      assertEqual(valFail.status, 400, "Subtotal below minimumOrder must return 400");
      assertContains(valFail.data.error, "400", "Error message should mention minimum threshold");

      // Subtotal 400.00 (exact minimum)
      const valPass = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 400.00 },
      });
      assertEqual(valPass.status, 200, "Subtotal equal to minimumOrder must return 200 OK");
      assertEqual(valPass.data.coupon.discountAmount, 40.0, "10% of 400 should be 40.0 TL");
    }
  );

  await test(
    "ADV2.CPN.4",
    "Maximum discount capping: percentage discount that exceeds maximumDiscount is strictly capped",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTCAP${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "PERCENTAGE",
          value: 50, // 50%
          maximumDiscount: 75.0, // Capped at 75 TL
          active: true,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      // On subtotal 1000 TL, 50% = 500 TL, but cap is 75 TL
      const valRes = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 1000.0 },
      });
      assertEqual(valRes.status, 200, "Validation succeeds");
      assertEqual(valRes.data.coupon.discountAmount, 75.0, "Discount must be strictly capped at 75.0 TL");
    }
  );

  await test(
    "ADV2.CPN.5",
    "Expired coupon code is rejected with 400 during validation and checkout",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTEXP${Date.now()}`;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "FIXED",
          value: 30.0,
          expiresAt: yesterday,
          active: true,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      const valRes = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 250.0 },
      });
      assertEqual(valRes.status, 400, "Expired coupon validation must return 400");

      // Checkout attempt with expired coupon
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: productA.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: {
            title: "Ev",
            firstName: "Exp",
            lastName: "Tester",
            phone: "05551112233",
            city: "İstanbul",
            district: "Kadıköy",
            addressLine: "Test",
          },
        },
      });
      assertEqual(orderRes.status, 400, "Order with expired coupon must return 400");
    }
  );

  await test(
    "ADV2.CPN.6",
    "Inactive coupon toggle: setting active:false immediately rejects coupon validation and checkout",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTINACT${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "FIXED",
          value: 25.0,
          active: false,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      const valRes = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 200.0 },
      });
      assertEqual(valRes.status, 400, "Inactive coupon validation must return 400");
    }
  );

  await test(
    "ADV2.CPN.7",
    "Usage limit exhaustion: coupon with usageLimit=2 rejects the 3rd checkout attempt",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTLIMIT${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "FIXED",
          value: 20.0,
          usageLimit: 2,
          active: true,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      // Create 3 distinct test users to simulate 3 different customers
      const testCust1 = await prisma.user.create({
        data: {
          email: `cust1-${Date.now()}@test.com`,
          passwordHash: "hash",
          firstName: "Cust1",
          lastName: "Test",
          role: "CUSTOMER",
        },
      });
      const testCust2 = await prisma.user.create({
        data: {
          email: `cust2-${Date.now()}@test.com`,
          passwordHash: "hash",
          firstName: "Cust2",
          lastName: "Test",
          role: "CUSTOMER",
        },
      });
      const testCust3 = await prisma.user.create({
        data: {
          email: `cust3-${Date.now()}@test.com`,
          passwordHash: "hash",
          firstName: "Cust3",
          lastName: "Test",
          role: "CUSTOMER",
        },
      });

      const h1 = await getAuthHeaders({ id: testCust1.id, email: testCust1.email, role: "CUSTOMER" });
      const h2 = await getAuthHeaders({ id: testCust2.id, email: testCust2.email, role: "CUSTOMER" });
      const h3 = await getAuthHeaders({ id: testCust3.id, email: testCust3.email, role: "CUSTOMER" });

      const payload = {
        items: [{ productId: productA.id, quantity: 1 }],
        couponCode: code,
        shippingAddress: {
          title: "Ev",
          firstName: "Limit",
          lastName: "Test",
          phone: "05551112233",
          city: "İstanbul",
          district: "Kadıköy",
          addressLine: "Test",
        },
      };

      // 1st checkout (usage 1/2) -> Succeeds
      const o1 = await request("/api/orders", { method: "POST", headers: h1, body: payload });
      assertEqual(o1.status, 200, "1st checkout must succeed");

      // 2nd checkout (usage 2/2) -> Succeeds
      const o2 = await request("/api/orders", { method: "POST", headers: h2, body: payload });
      assertEqual(o2.status, 200, "2nd checkout must succeed");

      // 3rd checkout (usage 3/2) -> Rejection
      const o3 = await request("/api/orders", { method: "POST", headers: h3, body: payload });
      assertEqual(o3.status, 400, "3rd checkout must fail with 400 due to usage limit exhaustion");

      // Verify in DB usageCount is 2
      const checkCpn = await prisma.coupon.findUnique({ where: { id: cpnRes.data.coupon.id } });
      assertEqual(checkCpn.usageCount, 2, "Coupon usageCount in DB must be exactly 2");
    }
  );

  await test(
    "ADV2.CPN.8",
    "Single-user redemption uniqueness: same user cannot use the same coupon code in multiple orders",
    "Coupon & Promotion Engine",
    async () => {
      const code = `TESTONCE${Date.now()}`;
      const cpnRes = await request("/api/coupons", {
        method: "POST",
        headers: adminHeaders,
        body: {
          code,
          type: "PERCENTAGE",
          value: 15,
          active: true,
        },
      });
      createdCouponIds.push(cpnRes.data.coupon.id);

      const testUser = await prisma.user.create({
        data: {
          email: `singleuser-${Date.now()}@test.com`,
          passwordHash: "hash",
          firstName: "Tekil",
          lastName: "Kullanıcı",
          role: "CUSTOMER",
        },
      });
      const singleUserHeaders = await getAuthHeaders({
        id: testUser.id,
        email: testUser.email,
        role: "CUSTOMER",
      });

      const couponProd = await prisma.product.create({
        data: {
          sellerId: sellerA.id,
          categoryId: category.id,
          name: `Coupon Prod ${Date.now()}`,
          slug: `coupon-prod-${Date.now()}`,
          description: "Coupon test product",
          brand: "TestBrand",
          sku: `SKU-CPNPROD-${Date.now()}`,
          price: 100.0,
          stock: 50,
          imageUrl: "/images/cpnprod.jpg",
          status: "ACTIVE",
        },
      });
      createdProductIds.push(couponProd.id);

      const payload = {
        items: [{ productId: couponProd.id, quantity: 1 }],
        couponCode: code,
        shippingAddress: {
          title: "Ev",
          firstName: "Tekil",
          lastName: "Kullanıcı",
          phone: "05551234567",
          city: "İstanbul",
          district: "Kadıköy",
          addressLine: "Test",
        },
      };

      // 1st order with singleUserHeaders
      const o1 = await request("/api/orders", { method: "POST", headers: singleUserHeaders, body: payload });
      assertEqual(o1.status, 200, "1st redemption succeeds");

      // 2nd order with same singleUserHeaders and same coupon
      const o2 = await request("/api/orders", { method: "POST", headers: singleUserHeaders, body: payload });
      assertEqual(o2.status, 400, "2nd redemption by same user must fail with 400");
      assert(
        o2.data?.code === "COUPON_ALREADY_REDEEMED" || o2.data?.error?.includes("önce"),
        "Error should state coupon already redeemed by user"
      );
    }
  );

  // ============================================================================
  // DOMAIN 4: RETURN REQUESTS, PHOTO EVIDENCE FORMATS & REFUND CALCULATIONS
  // ============================================================================
  console.log("\n--- DOMAIN 4: Returns, Evidence Formatting & Refund Precision ---");

  // Create a delivered order for testing return requests
  const deliveredOrder = await prisma.order.create({
    data: {
      orderNumber: `CS-RET-${Date.now().toString().slice(-6)}`,
      customerId: customer.id,
      status: "DELIVERED",
      subtotal: 450.0,
      grandTotal: 450.0,
      shippingFee: 0,
      currency: "TRY",
      shippingAddressSnapshot: JSON.stringify({ city: "İstanbul", addressLine: "Test" }),
      orderGroups: {
        create: {
          sellerId: sellerA.id,
          status: "DELIVERED",
          subtotal: 450.0,
        },
      },
    },
  });

  const orderGroupA = await prisma.orderGroup.findFirst({ where: { orderId: deliveredOrder.id } });

  const deliveredItem1 = await prisma.orderItem.create({
    data: {
      orderId: deliveredOrder.id,
      orderGroupId: orderGroupA.id,
      productId: productA.id,
      quantity: 3,
      price: 150.0,
    },
  });

  let createdReturnIds = [];

  await test(
    "ADV2.RET.1",
    "Customer can create return request on delivered order item with valid reason",
    "Returns & Refunds Lifecycle",
    async () => {
      const res = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: {
          orderId: deliveredOrder.id,
          orderItemId: deliveredItem1.id,
          reason: "Ürün bedeni uymadı ve kumaş kalitesi beklediğim gibi değil.",
          evidenceImages: [
            "https://images.cadde.store/returns/img1.jpg",
            "https://images.cadde.store/returns/img2.png",
          ],
        },
      });

      assertEqual(res.status, 201, "Expected 201 Created for return request");
      const ret = res.data.returnRequest;
      createdReturnIds.push(ret.id);

      assertEqual(ret.status, "PENDING", "Initial status should be PENDING");
      assertEqual(ret.refundAmount, 450.0, "Refund amount should be price * quantity (150 * 3 = 450.0)");
    }
  );

  await test(
    "ADV2.RET.2",
    "Photo evidence formatting: JSON array of image URLs is safely serialized and parsed",
    "Returns & Refunds Lifecycle",
    async () => {
      const returnRecord = await prisma.returnRequest.findFirst({
        where: { orderItemId: deliveredItem1.id },
      });
      assert(returnRecord, "Return record must exist in DB");

      const images = JSON.parse(returnRecord.evidenceImages);
      assert(Array.isArray(images), "evidenceImages should parse to array");
      assertEqual(images.length, 2, "Should contain 2 image URLs");
      assertEqual(images[0], "https://images.cadde.store/returns/img1.jpg", "Image 1 URL matches");
      assertEqual(images[1], "https://images.cadde.store/returns/img2.png", "Image 2 URL matches");
    }
  );

  await test(
    "ADV2.RET.3",
    "Photo evidence empty format: submitting without photos defaults to empty array JSON",
    "Returns & Refunds Lifecycle",
    async () => {
      // Create a second delivered item
      const item2 = await prisma.orderItem.create({
        data: {
          orderId: deliveredOrder.id,
          orderGroupId: orderGroupA.id,
          productId: productA.id,
          quantity: 1,
          price: 150.0,
        },
      });

      const res = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: {
          orderId: deliveredOrder.id,
          orderItemId: item2.id,
          reason: "Kusurlu ürün",
          // evidenceImages omitted
        },
      });

      assertEqual(res.status, 201, "Expected 201 Created");
      createdReturnIds.push(res.data.returnRequest.id);

      const dbRecord = await prisma.returnRequest.findUnique({ where: { id: res.data.returnRequest.id } });
      const parsed = JSON.parse(dbRecord.evidenceImages);
      assert(Array.isArray(parsed), "evidenceImages should be valid JSON array");
      assertEqual(parsed.length, 0, "Empty array length should be 0");
    }
  );

  await test(
    "ADV2.RET.4",
    "Item refund calculation precision: floating point precision with decimal prices (e.g. 149.99 * 3 = 449.97)",
    "Returns & Refunds Lifecycle",
    async () => {
      const itemDecimal = await prisma.orderItem.create({
        data: {
          orderId: deliveredOrder.id,
          orderGroupId: orderGroupA.id,
          productId: productA.id,
          quantity: 3,
          price: 149.99,
        },
      });

      const res = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: {
          orderId: deliveredOrder.id,
          orderItemId: itemDecimal.id,
          reason: "Fiyat/hesaplama testi",
        },
      });

      assertEqual(res.status, 201, "Return creation succeeds");
      createdReturnIds.push(res.data.returnRequest.id);

      const expected = 149.99 * 3;
      const actual = res.data.returnRequest.refundAmount;
      assert(
        Math.abs(actual - expected) < 0.001,
        `Expected refundAmount ${expected}, got ${actual}`
      );
    }
  );

  await test(
    "ADV2.RET.5",
    "Cross-user security isolation: customer B cannot create return request for customer A's order item",
    "Returns & Refunds Lifecycle",
    async () => {
      // Create user B
      const userB = await prisma.user.create({
        data: {
          email: `attacker-${Date.now()}@test.com`,
          passwordHash: "hash",
          firstName: "Attacker",
          lastName: "Test",
          role: "CUSTOMER",
        },
      });
      const attackerHeaders = await getAuthHeaders({ id: userB.id, email: userB.email, role: "CUSTOMER" });

      const res = await request("/api/returns", {
        method: "POST",
        headers: attackerHeaders,
        body: {
          orderId: deliveredOrder.id,
          orderItemId: deliveredItem1.id,
          reason: "Yetkisiz iade denemesi",
        },
      });

      assertEqual(res.status, 403, "Cross-user return initiation must be rejected with 403 Forbidden");
    }
  );

  await test(
    "ADV2.RET.6",
    "Mismatched orderId and orderItemId is rejected with 400 Bad Request",
    "Returns & Refunds Lifecycle",
    async () => {
      const res = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: {
          orderId: "fake-non-matching-order-id",
          orderItemId: deliveredItem1.id,
          reason: "Uyuşmayan ID testi",
        },
      });

      assertEqual(res.status, 400, "Mismatched order and item should return 400");
    }
  );

  await test(
    "ADV2.RET.7",
    "Admin and seller return request moderation updates status and records AuditLog",
    "Returns & Refunds Lifecycle",
    async () => {
      const targetReturnId = createdReturnIds[0];
      assert(targetReturnId, "Target return ID must exist");

      // Admin approves return request
      const putRes = await request(`/api/returns/${targetReturnId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          status: "APPROVED",
          adminNote: "İade onaylandı, kargo kodu bekleniyor.",
        },
      });

      assertEqual(putRes.status, 200, "Moderation PUT should return 200");
      assertEqual(putRes.data.returnRequest.status, "APPROVED", "Status must be updated to APPROVED");

      // Verify AuditLog record
      const audit = await prisma.auditLog.findFirst({
        where: { action: "RETURN_REQUEST_MODERATED", entityId: targetReturnId },
      });
      assert(audit, "AuditLog record must exist for return request moderation");
      const meta = JSON.parse(audit.metadataJson);
      assertEqual(meta.newStatus, "APPROVED", "Audit metadata must log newStatus as APPROVED");
    }
  );

  await test(
    "ADV2.RET.8",
    "Customer notification is generated upon return request status modification",
    "Returns & Refunds Lifecycle",
    async () => {
      const targetReturnId = createdReturnIds[0];
      const notification = await prisma.notification.findFirst({
        where: { userId: customer.id, type: "ORDER" },
        orderBy: { createdAt: "desc" },
      });

      assert(notification, "Customer notification should exist");
      assertContains(notification.titleTR, "İade Talebi Güncellendi", "Notification title should mention update");
    }
  );

  // Summary Metrics
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const total = results.length;

  console.log("\n================================================================================");
  console.log("             CHALLENGER 2 ADVERSARIAL TEST SUITE SUMMARY                        ");
  console.log("================================================================================");
  console.log(`  Passed: ${passed} / ${total} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${failed} / ${total}`);
  console.log("================================================================================\n");

  return results;
}

if (require.main === module) {
  (async () => {
    const serverInfo = await startServerIfNeeded();
    try {
      const results = await runChallenger2AdversarialTests();
      const failed = results.filter((r) => r.status === "FAILED").length;
      if (failed > 0) {
        process.exitCode = 1;
      }
    } catch (e) {
      console.error("[Challenger 2 Suite Fatal Error]:", e);
      process.exitCode = 1;
    } finally {
      if (serverInfo.wasSpawned && serverInfo.process) {
        try {
          if (process.platform === "win32") {
            require("child_process").execSync(`taskkill /pid ${serverInfo.process.pid} /T /F`, { stdio: "ignore" });
          } else {
            serverInfo.process.kill("SIGTERM");
          }
        } catch (e) {}
      }
    }
  })();
}

module.exports = {
  runChallenger2AdversarialTests,
};
