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
];

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

function createSlug(text) {
  const trMap = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };

  const converted = text
    .split("")
    .map((char) => trMap[char] || char)
    .join("");

  return converted
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    console.log(`[Challenger 1] Server already running at ${BASE_URL}.`);
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

  await ensureServerReady(30000);
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
  console.log("             CHALLENGER 1 — ADVERSARIAL STRESS TEST SUITE                       ");
  console.log("================================================================================\n");

  // Retrieve fixtures from DB
  const testProduct = await prisma.product.findFirst({
    where: { status: "ACTIVE", stock: { gte: 10 } },
    include: { seller: true },
  });
  assert(testProduct, "Active product with stock >= 10 required in DB");

  const customerUser = await prisma.user.findFirst({
    where: { role: "CUSTOMER" },
  });
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

  const adminHeaders = await getAuthHeaders("ADMIN");
  const customerHeaders = await getAuthHeaders("CUSTOMER");
  const sellerHeaders = await getAuthHeaders("SELLER");

  // =========================================================================
  // DOMAIN 1: COUPONS, QUANTITIES & OUT-OF-STOCK CHECKOUT ADVERSARIAL SCENARIOS
  // =========================================================================
  console.log("\n--- Domain 1: Coupons, Quantities & Out-of-Stock Checkout ---");

  await test(
    "ADV-1.1",
    "Coupon validate rejects missing coupon code or invalid subtotal",
    "Coupons & Checkout",
    async () => {
      const res1 = await request("/api/coupons/validate", {
        method: "POST",
        body: { subtotal: 100 },
      });
      assertEqual(res1.status, 400, `Should reject missing code (Got ${res1.status}: ${JSON.stringify(res1.data)})`);

      const res2 = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "WELCOME10", subtotal: "one-hundred" },
      });
      assertEqual(res2.status, 400, `Should reject non-numeric subtotal (Got ${res2.status}: ${JSON.stringify(res2.data)})`);
    }
  );

  await test(
    "ADV-1.2",
    "Coupon validate rejects non-existent or random promotional codes",
    "Coupons & Checkout",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "HACKER_PROMO_9999_NOT_REAL", subtotal: 500 },
      });
      assertEqual(res.status, 400, `Should reject fake coupon (Got ${res.status}: ${JSON.stringify(res.data)})`);
      assertContains(res.data.error, "Geçersiz veya süresi dolmuş");
    }
  );

  await test(
    "ADV-1.3",
    "Coupon validate rejects inactive/disabled coupon",
    "Coupons & Checkout",
    async () => {
      const code = `INACT_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "FIXED",
          value: 25,
          active: false,
        },
      });

      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 200 },
      });
      assertEqual(res.status, 400, `Should reject inactive coupon (Got ${res.status})`);
    }
  );

  await test(
    "ADV-1.4",
    "Coupon validate rejects expired coupon",
    "Coupons & Checkout",
    async () => {
      const code = `EXP_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "PERCENTAGE",
          value: 20,
          active: true,
          expiresAt: new Date(Date.now() - 86400000),
        },
      });

      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 200 },
      });
      assertEqual(res.status, 400, `Should reject expired coupon (Got ${res.status})`);
      assertContains(res.data.error, "kullanım süresi dolmuştur");
    }
  );

  await test(
    "ADV-1.5",
    "Coupon validate rejects subtotal below minimumOrder threshold",
    "Coupons & Checkout",
    async () => {
      const code = `MIN_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "FIXED",
          value: 50,
          minimumOrder: 300,
          active: true,
        },
      });

      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 150 },
      });
      assertEqual(res.status, 400, `Should reject when subtotal < minimumOrder (Got ${res.status})`);
      assertContains(res.data.error, "en az 300 ₺");
    }
  );

  await test(
    "ADV-1.6",
    "Coupon validate rejects coupon that exceeded usage limit",
    "Coupons & Checkout",
    async () => {
      const code = `MAXUSE_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "FIXED",
          value: 30,
          usageLimit: 5,
          usageCount: 5,
          active: true,
        },
      });

      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code, subtotal: 200 },
      });
      assertEqual(res.status, 400, `Should reject exhausted coupon limit (Got ${res.status})`);
      assertContains(res.data.error, "kullanım limiti dolmuştur");
    }
  );

  await test(
    "ADV-1.7",
    "Coupon validate handles lowercase trimming and percentage maximum cap correctly",
    "Coupons & Checkout",
    async () => {
      const code = `CAP_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "PERCENTAGE",
          value: 50,
          maximumDiscount: 100,
          active: true,
        },
      });

      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: `  ${code.toLowerCase()}  `, subtotal: 1000 },
      });
      assertEqual(res.status, 200, `Should accept valid coupon case-insensitively (Got ${res.status})`);
      assertEqual(res.data.coupon.discountAmount, 100, "Should cap discount at maximumDiscount 100 TL");
    }
  );

  await test(
    "ADV-1.8",
    "Checkout rejects zero, negative, decimal, and non-numeric quantities",
    "Coupons & Checkout",
    async () => {
      const invalidQuantities = [0, -1, -50, 1.5, 2.7, "abc", null];
      for (const qty of invalidQuantities) {
        const res = await request("/api/orders", {
          method: "POST",
          headers: customerHeaders,
          body: {
            items: [{ productId: testProduct.id, quantity: qty }],
            shippingAddress: {
              title: "Ev",
              recipientName: "Test User",
              phone: "05551112233",
              city: "İstanbul",
              district: "Kadıköy",
              neighborhood: "Caddebostan",
              fullAddress: "Bağdat Cad. No:1",
            },
          },
        });
        assertEqual(res.status, 400, `Quantity ${qty} must be rejected with 400 (Got ${res.status})`);
        assertEqual(res.data.code, "INVALID_QUANTITY");
      }
    }
  );

  await test(
    "ADV-1.9",
    "Checkout rejects quantity exceeding 99 limit",
    "Coupons & Checkout",
    async () => {
      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: testProduct.id, quantity: 100 }],
          shippingAddress: {
            title: "Ev",
            recipientName: "Test",
            phone: "05551112233",
            city: "Ankara",
            district: "Çankaya",
            fullAddress: "Kızılay",
          },
        },
      });
      assertEqual(res.status, 400, `Quantity > 99 must be rejected (Got ${res.status})`);
      assertEqual(res.data.code, "INVALID_QUANTITY");
    }
  );

  await test(
    "ADV-1.10",
    "Checkout rejects non-existent or inactive products",
    "Coupons & Checkout",
    async () => {
      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: "non-existent-product-id-999", quantity: 1 }],
          shippingAddress: {
            title: "Ev",
            recipientName: "Test",
            phone: "05551112233",
            city: "İzmir",
            district: "Konak",
            fullAddress: "Alsancak",
          },
        },
      });
      assertEqual(res.status, 400, `Non-existent product must return 400 (Got ${res.status})`);
      assertEqual(res.data.code, "PRODUCT_UNAVAILABLE");
    }
  );

  await test(
    "ADV-1.11",
    "Checkout rejects out-of-stock items (stock = 0)",
    "Coupons & Checkout",
    async () => {
      const oosProd = await prisma.product.create({
        data: {
          name: `OOS Product ${Date.now()}`,
          slug: `oos-prod-${Date.now()}`,
          description: "Out of stock test product description",
          brand: "Test Brand",
          sku: `OOS-${Date.now()}`,
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          price: 199.99,
          stock: 0,
          status: "ACTIVE",
          categoryId: testProduct.categoryId,
          sellerId: testProduct.sellerId,
        },
      });

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: oosProd.id, quantity: 1 }],
          shippingAddress: {
            title: "Ev",
            recipientName: "Test",
            phone: "05551112233",
            city: "Bursa",
            district: "Nilüfer",
            fullAddress: "Görükle",
          },
        },
      });

      assertEqual(res.status, 400, `Stock = 0 must return 400 INSUFFICIENT_STOCK (Got ${res.status})`);
      assertEqual(res.data.code, "INSUFFICIENT_STOCK");
    }
  );

  await test(
    "ADV-1.12",
    "Checkout rejects order when requested quantity exceeds available stock",
    "Coupons & Checkout",
    async () => {
      const lowStockProd = await prisma.product.create({
        data: {
          name: `Low Stock Prod ${Date.now()}`,
          slug: `low-stock-${Date.now()}`,
          description: "Low stock test product description",
          brand: "Test Brand",
          sku: `LOW-${Date.now()}`,
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          price: 99.99,
          stock: 2,
          status: "ACTIVE",
          categoryId: testProduct.categoryId,
          sellerId: testProduct.sellerId,
        },
      });

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: lowStockProd.id, quantity: 5 }],
          shippingAddress: {
            title: "Ofis",
            recipientName: "Test",
            phone: "05551112233",
            city: "Antalya",
            district: "Muratpaşa",
            fullAddress: "Lara",
          },
        },
      });

      assertEqual(res.status, 400, `Quantity > stock must return 400 INSUFFICIENT_STOCK (Got ${res.status})`);
      assertEqual(res.data.code, "INSUFFICIENT_STOCK");
    }
  );

  await test(
    "ADV-1.13",
    "Checkout rejects double coupon redemption by the same user",
    "Coupons & Checkout",
    async () => {
      const code = `SINGLE_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "FIXED",
          value: 20,
          active: true,
        },
      });

      const res1 = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: testProduct.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: {
            title: "Ev",
            recipientName: "Test User",
            phone: "05551112233",
            city: "İstanbul",
            district: "Kadıköy",
            fullAddress: "Moda",
          },
        },
      });
      assertEqual(res1.status, 200, `First checkout with coupon should succeed (Got ${res1.status})`);

      const res2 = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: testProduct.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: {
            title: "Ev",
            recipientName: "Test User",
            phone: "05551112233",
            city: "İstanbul",
            district: "Kadıköy",
            fullAddress: "Moda",
          },
        },
      });
      assertEqual(res2.status, 400, `Second checkout with same coupon must be rejected (Got ${res2.status})`);
      assertEqual(res2.data.code, "COUPON_ALREADY_REDEEMED");
    }
  );

  await test(
    "ADV-1.14",
    "Checkout performs atomic stock decrement accurately",
    "Coupons & Checkout",
    async () => {
      const stockProd = await prisma.product.create({
        data: {
          name: `Atomic Stock Test ${Date.now()}`,
          slug: `atomic-stock-${Date.now()}`,
          description: "Atomic stock test description",
          brand: "Test Brand",
          sku: `ATOMIC-${Date.now()}`,
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          price: 50.0,
          stock: 10,
          status: "ACTIVE",
          categoryId: testProduct.categoryId,
          sellerId: testProduct.sellerId,
        },
      });

      const res = await request("/api/orders", {
        method: "POST",
        headers: customerHeaders,
        body: {
          items: [{ productId: stockProd.id, quantity: 3 }],
          shippingAddress: {
            title: "Ev",
            recipientName: "Atomic Tester",
            phone: "05551112233",
            city: "İstanbul",
            district: "Üsküdar",
            fullAddress: "Çamlıca",
          },
        },
      });

      assertEqual(res.status, 200, `Order should succeed (Got ${res.status})`);

      const afterProd = await prisma.product.findUnique({
        where: { id: stockProd.id },
      });
      assertEqual(afterProd.stock, 7, "Stock must decrement exactly from 10 to 7");
    }
  );

  // =========================================================================
  // DOMAIN 2: CARRIER TRACKING URL GENERATION & TRACKING NUMBER VALIDATION
  // =========================================================================
  console.log("\n--- Domain 2: Carrier Tracking URL Generation & Logistics ---");

  await test(
    "ADV-2.1",
    "getCarrierTrackingUrl generates accurate direct tracking portal URLs for all 6 Turkish carriers",
    "Logistics & Carriers",
    async () => {
      const trackingCode = "TRK123456789";

      const yrtUrl = getCarrierTrackingUrl("Yurtiçi Kargo", trackingCode);
      assertEqual(yrtUrl, `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${trackingCode}`);

      const arasUrl = getCarrierTrackingUrl("Aras Kargo", trackingCode);
      assertEqual(arasUrl, `https://www.araskargo.com.tr/kargotakip/?trackingNumber=${trackingCode}`);

      const mngUrl = getCarrierTrackingUrl("MNG Kargo", trackingCode);
      assertEqual(mngUrl, `https://www.mngkargo.com.tr/kargotakip?trackingNumber=${trackingCode}`);

      const suratUrl = getCarrierTrackingUrl("Sürat Kargo", trackingCode);
      assertEqual(suratUrl, `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${trackingCode}`);

      const pttUrl = getCarrierTrackingUrl("PTT Kargo", trackingCode);
      assertEqual(pttUrl, `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${trackingCode}`);

      const hjUrl = getCarrierTrackingUrl("HepsiJet", trackingCode);
      assertEqual(hjUrl, `https://www.hepsijet.com/gonderi-takibi/${trackingCode}`);
    }
  );

  await test(
    "ADV-2.2",
    "getCarrierTrackingUrl handles unsupported carriers and empty/null tracking numbers safely",
    "Logistics & Carriers",
    async () => {
      const fallbackUrl = getCarrierTrackingUrl("Özel Kurye", "EXPR-999");
      assertContains(fallbackUrl, "google.com/search?q=");

      const emptyUrl1 = getCarrierTrackingUrl("Yurtiçi Kargo", "");
      assertEqual(emptyUrl1, "#", "Empty tracking number should return #");

      const emptyUrl2 = getCarrierTrackingUrl("Aras Kargo", null);
      assertEqual(emptyUrl2, "#", "Null tracking number should return #");
    }
  );

  await test(
    "ADV-2.3",
    "validateTrackingNumber rejects invalid lengths, injection strings, and invalid symbols",
    "Logistics & Carriers",
    async () => {
      assert(!validateTrackingNumber("Yurtiçi Kargo", "").valid, "Empty should be invalid");
      assert(!validateTrackingNumber("Yurtiçi Kargo", null).valid, "Null should be invalid");
      assert(!validateTrackingNumber("Aras Kargo", "123").valid, "3 chars should be invalid");
      assert(!validateTrackingNumber("Aras Kargo", "ABCD").valid, "4 chars should be invalid");

      const tooLong = "A".repeat(51);
      assert(!validateTrackingNumber("MNG Kargo", tooLong).valid, "51 chars should be invalid");

      const maliciousPatterns = [
        "<script>alert(1)</script>",
        "TRK-123; DROP TABLE orders;",
        "YRT 999 888",
        "ARS#999*88",
        "PTT@BARCODE",
      ];
      for (const pattern of maliciousPatterns) {
        const val = validateTrackingNumber("Yurtiçi Kargo", pattern);
        assert(!val.valid, `Pattern "${pattern}" must be invalid`);
      }

      const validCodes = [
        "YRT-948201948",
        "ARS883920194",
        "MNG_552019482",
        "SRT-110294820",
        "KP029384819",
        "HJ-998822019",
      ];
      for (const code of validCodes) {
        const val = validateTrackingNumber("Yurtiçi Kargo", code);
        assert(val.valid, `Code "${code}" must be valid`);
      }
    }
  );

  await test(
    "ADV-2.4",
    "Seller order fulfillment endpoint enforces RBAC and validates parameters",
    "Logistics & Carriers",
    async () => {
      const resUnauth = await request("/api/orders/seller", {
        method: "PUT",
        body: { orderGroupId: "some-id", status: "SHIPPED" },
      });
      assertEqual(resUnauth.status, 403, `Unauthenticated PUT should return 403 (Got ${resUnauth.status}: ${JSON.stringify(resUnauth.data)})`);

      const resCust = await request("/api/orders/seller", {
        method: "PUT",
        headers: customerHeaders,
        body: { orderGroupId: "some-id", status: "SHIPPED" },
      });
      assertEqual(resCust.status, 403, `Customer role should return 403 (Got ${resCust.status}: ${JSON.stringify(resCust.data)})`);

      const resMissing = await request("/api/orders/seller", {
        method: "PUT",
        headers: sellerHeaders,
        body: { status: "SHIPPED" },
      });
      assertEqual(resMissing.status, 400, `Missing orderGroupId should return 400 (Got ${resMissing.status}: ${JSON.stringify(resMissing.data)})`);

      const resNotFound = await request("/api/orders/seller", {
        method: "PUT",
        headers: sellerHeaders,
        body: { orderGroupId: "non-existent-group-id-999", status: "SHIPPED" },
      });
      assertEqual(resNotFound.status, 404, `Non-existent order group should return 404 (Got ${resNotFound.status}: ${JSON.stringify(resNotFound.data)})`);
    }
  );

  await test(
    "ADV-2.5",
    "Cross-seller authorization: Seller A cannot update Seller B's order group",
    "Logistics & Carriers",
    async () => {
      const existingGroup = await prisma.orderGroup.findFirst({
        where: { sellerId: { not: sellerUser.sellerProfile?.id || sellerUser.id } },
      });

      if (!existingGroup) {
        console.log("    (Skipping cross-seller check: only 1 seller in DB)");
        return;
      }

      const resAttack = await request("/api/orders/seller", {
        method: "PUT",
        headers: sellerHeaders,
        body: {
          orderGroupId: existingGroup.id,
          status: "SHIPPED",
          carrierName: "Yurtiçi Kargo",
          trackingNumber: "YRT-998877",
        },
      });

      assertEqual(resAttack.status, 403, `Seller A must NOT be able to modify Seller B's order group (Got ${resAttack.status}: ${JSON.stringify(resAttack.data)})`);
    }
  );

  // =========================================================================
  // DOMAIN 3: RETURNS LIFECYCLE & MODERATION SECURITY
  // =========================================================================
  console.log("\n--- Domain 3: Returns Lifecycle & Moderation Security ---");

  const existingDeliveredOrder = await prisma.order.findFirst({
    include: { orderItems: true },
  });
  assert(existingDeliveredOrder && existingDeliveredOrder.orderItems.length > 0, "Delivered order with items required");
  const returnTestOrder = existingDeliveredOrder;
  const returnTestOrderItem = returnTestOrder.orderItems[0];

  await test(
    "ADV-3.1",
    "Return request creation rejects unauthenticated requests",
    "Returns & Refunds",
    async () => {
      const res = await request("/api/returns", {
        method: "POST",
        body: {
          orderId: returnTestOrder.id,
          orderItemId: returnTestOrderItem.id,
          reason: "Beden uymadı",
        },
      });
      assertEqual(res.status, 401, `Unauthenticated return request must return 401 (Got ${res.status}: ${JSON.stringify(res.data)})`);
    }
  );

  await test(
    "ADV-3.2",
    "Return request creation validates mandatory fields and non-empty reasons",
    "Returns & Refunds",
    async () => {
      const res1 = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: { orderItemId: returnTestOrderItem.id, reason: "Beden uymadı" },
      });
      assertEqual(res1.status, 400, "Missing orderId must return 400");

      const res2 = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: { orderId: returnTestOrder.id, reason: "Beden uymadı" },
      });
      assertEqual(res2.status, 400, "Missing orderItemId must return 400");

      const res3 = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: {
          orderId: returnTestOrder.id,
          orderItemId: returnTestOrderItem.id,
          reason: "    ",
        },
      });
      assertEqual(res3.status, 400, "Whitespace reason must return 400");
    }
  );

  await test(
    "ADV-3.3",
    "Customer cannot create a return on another customer's order item",
    "Returns & Refunds",
    async () => {
      const otherCustHeaders = await getAuthHeaders({
        id: "attacker-customer-id-999",
        email: "attacker@cadde.store",
        role: "CUSTOMER",
      });

      const res = await request("/api/returns", {
        method: "POST",
        headers: otherCustHeaders,
        body: {
          orderId: returnTestOrder.id,
          orderItemId: returnTestOrderItem.id,
          reason: "Defective item",
        },
      });
      assertEqual(res.status, 403, `Must return 403 when trying to return another user's item (Got ${res.status}: ${JSON.stringify(res.data)})`);
    }
  );

  let createdReturnId;
  await test(
    "ADV-3.4",
    "Customer creates valid return request with evidence images and refund calculation",
    "Returns & Refunds",
    async () => {
      // Find order item belonging to customerUser
      const custItem = await prisma.orderItem.findFirst({
        where: { order: { customerId: customerUser.id } },
        include: { order: true, product: true },
      });
      assert(custItem, "Customer order item must exist");

      const res = await request("/api/returns", {
        method: "POST",
        headers: customerHeaders,
        body: {
          orderId: custItem.orderId,
          orderItemId: custItem.id,
          reason: "Ürün hasarlı geldi, kumaşında yırtık var.",
          evidenceImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
        },
      });

      assertEqual(res.status, 201, `Should create return with 201 Created (Got ${res.status}: ${JSON.stringify(res.data)})`);
      assert(res.data.returnRequest?.id, "Should return returnRequest object");
      assertEqual(res.data.returnRequest.status, "PENDING");
      assertEqual(res.data.returnRequest.refundAmount, custItem.price * custItem.quantity);
      createdReturnId = res.data.returnRequest.id;
    }
  );

  await test(
    "ADV-3.5",
    "Return moderation endpoint rejects unauthenticated and customer moderation attempts",
    "Returns & Refunds",
    async () => {
      const resUnauth = await request(`/api/returns/${createdReturnId}`, {
        method: "PUT",
        body: { status: "APPROVED" },
      });
      assertEqual(resUnauth.status, 401, `Unauthenticated PUT must return 401 (Got ${resUnauth.status}: ${JSON.stringify(resUnauth.data)})`);

      const resCust = await request(`/api/returns/${createdReturnId}`, {
        method: "PUT",
        headers: customerHeaders,
        body: { status: "APPROVED" },
      });
      assertEqual(resCust.status, 403, `Customer role must NOT be allowed to moderate returns (403) (Got ${resCust.status}: ${JSON.stringify(resCust.data)})`);
    }
  );

  await test(
    "ADV-3.6",
    "Unauthorized cross-seller cannot moderate returns belonging to another seller",
    "Returns & Refunds",
    async () => {
      const targetReturn = await prisma.returnRequest.findUnique({
        where: { id: createdReturnId },
        include: { seller: true },
      });

      const otherSeller = await prisma.seller.findFirst({
        where: { id: { not: targetReturn.sellerId } },
      });

      if (!otherSeller) {
        console.log("    (Skipping cross-seller moderation check: single seller in DB)");
        return;
      }

      const otherSellerTokenHeaders = await getAuthHeaders({
        id: otherSeller.userId,
        email: "other-seller@cadde.store",
        role: "SELLER",
      });

      const res = await request(`/api/returns/${createdReturnId}`, {
        method: "PUT",
        headers: otherSellerTokenHeaders,
        body: { status: "APPROVED", sellerNote: "Unauthorized approval" },
      });

      assertEqual(res.status, 403, `Other seller should get 403 when moderating another seller's return (Got ${res.status}: ${JSON.stringify(res.data)})`);
    }
  );

  await test(
    "ADV-3.7",
    "Admin and owning seller can moderate returns and generate AuditLog entries",
    "Returns & Refunds",
    async () => {
      const res = await request(`/api/returns/${createdReturnId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          status: "APPROVED",
          adminNote: "Admin tarafından iade onaylandı ve kargo kodu verildi.",
        },
      });

      assertEqual(res.status, 200, `Admin should be able to moderate return (Got ${res.status}: ${JSON.stringify(res.data)})`);
      assertEqual(res.data.returnRequest.status, "APPROVED");

      const audit = await prisma.auditLog.findFirst({
        where: {
          entityType: "ORDER",
          entityId: createdReturnId,
          action: "RETURN_REQUEST_MODERATED",
        },
      });
      assert(audit, "AuditLog record must be generated on return moderation");
      assertEqual(audit.actorRole, "ADMIN");
    }
  );

  // =========================================================================
  // DOMAIN 4: BRAND AUTO-SLUGIFIER & TURKISH UNICODE NORMALIZATION
  // =========================================================================
  console.log("\n--- Domain 4: Brand Auto-Slugifier with Turkish Unicode ---");

  await test(
    "ADV-4.1",
    "createSlug normalizes all Turkish special letters (ç, ğ, ı, ö, ş, ü, İ, Ç, Ğ, I, Ö, Ş, Ü)",
    "Brand & Unicode Slug",
    async () => {
      const input = "çanta gömlek ışık örgü şapka üzüm İPEK ÇANTA GÖMLEK IŞIK ÖRGÜ ŞAPKA ÜZÜM";
      const expected = "canta-gomlek-isik-orgu-sapka-uzum-ipek-canta-gomlek-isik-orgu-sapka-uzum";
      const result = createSlug(input);
      assertEqual(result, expected, `Slug must handle all Turkish characters correctly. Got: ${result}`);
    }
  );

  await test(
    "ADV-4.2",
    "createSlug handles complex Turkish business names and special punctuation",
    "Brand & Unicode Slug",
    async () => {
      const testCases = [
        {
          input: "Özgür Çiçekçilik & Şık Giyim Ltd. Şti.",
          expected: "ozgur-cicekcilik-sik-giyim-ltd-sti",
        },
        {
          input: "İpek Yolu İthalat & İhracat A.Ş.",
          expected: "ipek-yolu-ithalat-ihracat-as",
        },
        {
          input: "Isparta Halı & İplik Sanayii",
          expected: "isparta-hali-iplik-sanayii",
        },
        {
          input: "Kadıköy Çarşısı / Beşiktaş Butik (2026)",
          expected: "kadikoy-carsisi-besiktas-butik-2026",
        },
        {
          input: "---Nike &&& Adidas Spor---Giyim---",
          expected: "nike-adidas-spor-giyim",
        },
        {
          input: "Şölen Çikolata, Bisküvi ve Şekerleme!",
          expected: "solen-cikolata-biskuvi-ve-sekerleme",
        },
      ];

      for (const tc of testCases) {
        const actual = createSlug(tc.input);
        assertEqual(actual, tc.expected, `Slug for "${tc.input}" must equal "${tc.expected}"`);
      }
    }
  );

  await test(
    "ADV-4.3",
    "Brand API enforces RBAC and validation on brand creation",
    "Brand Management",
    async () => {
      const resForbidden = await request("/api/brands", {
        method: "POST",
        headers: sellerHeaders,
        body: {
          name: "Test Brand",
          slug: "test-brand",
          logoUrl: "https://example.com/logo.png",
        },
      });
      assertEqual(resForbidden.status, 403, `Non-admin must be rejected with 403 (Got ${resForbidden.status}: ${JSON.stringify(resForbidden.data)})`);

      const resMissing = await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: { name: "Test Brand" },
      });
      assertEqual(resMissing.status, 400, `Missing required brand fields must return 400 (Got ${resMissing.status}: ${JSON.stringify(resMissing.data)})`);
    }
  );

  await test(
    "ADV-4.4",
    "Brand API creates brand with Turkish slug and prevents duplicate slug collisions",
    "Brand Management",
    async () => {
      const brandName = `Özgür Çiçekçilik ${Date.now()}`;
      const slug = createSlug(brandName);

      const res1 = await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: brandName,
          slug,
          logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          isFeatured: true,
        },
      });
      assertEqual(res1.status, 201, `Admin should be able to create brand (Got ${res1.status}: ${JSON.stringify(res1.data)})`);
      assertEqual(res1.data.brand.slug, slug);

      const res2 = await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `Another Brand ${Date.now()}`,
          slug,
          logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        },
      });
      assertEqual(res2.status, 409, `Duplicate slug must return 409 Conflict (Got ${res2.status}: ${JSON.stringify(res2.data)})`);
    }
  );

  // =========================================================================
  // DOMAIN 5: CMS SECTIONS, REORDERING & EMPTY BANNER FALLBACKS
  // =========================================================================
  console.log("\n--- Domain 5: CMS Section Reordering & Empty Banner Fallbacks ---");

  await test(
    "ADV-5.1",
    "CMS sections API returns active sections ordered by orderIndex",
    "CMS Merchandising",
    async () => {
      const res = await request("/api/cms/sections");
      assertEqual(res.status, 200, `Expected 200 OK (Got ${res.status}: ${JSON.stringify(res.data)})`);
      assert(Array.isArray(res.data.sections), "Expected sections array");
      assert(res.data.sections.length > 0, "Sections should not be empty");

      for (let i = 1; i < res.data.sections.length; i++) {
        assert(
          res.data.sections[i].orderIndex >= res.data.sections[i - 1].orderIndex,
          "Sections must be sorted by orderIndex ascending"
        );
      }
    }
  );

  await test(
    "ADV-5.2",
    "CMS section creation rejects missing titles and unauthorized users",
    "CMS Merchandising",
    async () => {
      const resAuth = await request("/api/cms/sections", {
        method: "POST",
        headers: customerHeaders,
        body: { titleTR: "Yeni Kampanya", titleEN: "New Campaign" },
      });
      assertEqual(resAuth.status, 403, `Non-admin must get 403 (Got ${resAuth.status}: ${JSON.stringify(resAuth.data)})`);

      const resMissing = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: { titleTR: "Sadece Türkçe" },
      });
      assertEqual(resMissing.status, 400, `Missing titleEN must get 400 (Got ${resMissing.status}: ${JSON.stringify(resMissing.data)})`);
    }
  );

  let testSectionId1, testSectionId2;
  await test(
    "ADV-5.3",
    "CMS sections support arbitrary orderIndex values (negative, zero, large) and reordering",
    "CMS Merchandising",
    async () => {
      const s1 = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: "Öne Çıkan Kampanyalar",
          titleEN: "Featured Campaigns",
          type: "PROMO_GRID",
          orderIndex: -10,
          active: true,
        },
      });
      assertEqual(s1.status, 201, `Create s1 should succeed (Got ${s1.status}: ${JSON.stringify(s1.data)})`);
      testSectionId1 = s1.data.section.id;

      const s2 = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: "Alt Sezon Sonu İndirimi",
          titleEN: "Bottom Season End Sale",
          type: "CAROUSEL",
          orderIndex: 500,
          active: true,
        },
      });
      assertEqual(s2.status, 201, `Create s2 should succeed (Got ${s2.status}: ${JSON.stringify(s2.data)})`);
      testSectionId2 = s2.data.section.id;

      const reorderRes = await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          id: testSectionId1,
          orderIndex: 600,
        },
      });
      assertEqual(reorderRes.status, 200, `Reorder s1 should succeed (Got ${reorderRes.status}: ${JSON.stringify(reorderRes.data)})`);
      assertEqual(reorderRes.data.section.orderIndex, 600);
    }
  );

  await test(
    "ADV-5.4",
    "Toggling active: false excludes section from public view but includes in admin ?all=true view",
    "CMS Merchandising",
    async () => {
      const deactivateRes = await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          id: testSectionId2,
          active: false,
        },
      });
      assertEqual(deactivateRes.status, 200, `Deactivate should succeed (Got ${deactivateRes.status}: ${JSON.stringify(deactivateRes.data)})`);
      assertEqual(deactivateRes.data.section.active, false);

      const publicRes = await request("/api/cms/sections");
      assertEqual(publicRes.status, 200);
      const foundInPublic = publicRes.data.sections.some((s) => s.id === testSectionId2);
      assertEqual(foundInPublic, false, "Inactive section must NOT appear in public view");

      const adminRes = await request("/api/cms/sections?all=true");
      assertEqual(adminRes.status, 200);
      const foundInAdmin = adminRes.data.sections.some((s) => s.id === testSectionId2);
      assertEqual(foundInAdmin, true, "Inactive section MUST appear in admin ?all=true view");
    }
  );

  await test(
    "ADV-5.5",
    "CMS sections with zero banners are handled gracefully with empty array",
    "CMS Merchandising",
    async () => {
      const publicRes = await request("/api/cms/sections");
      assertEqual(publicRes.status, 200);
      const s1 = publicRes.data.sections.find((s) => s.id === testSectionId1);
      assert(s1, "Section 1 should exist in public view");
      assert(Array.isArray(s1.banners), "Banners must be an array");
      assertEqual(s1.banners.length, 0, "Banners should be empty array without runtime error");
    }
  );

  await test(
    "ADV-5.6",
    "Banner creation validates required fields and associates correctly with section",
    "CMS Merchandising",
    async () => {
      const resBad = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: {
          sectionId: testSectionId1,
          targetValue: "/category/shoes",
        },
      });
      assertEqual(resBad.status, 400, `Missing imageUrlDesktop must return 400 (Got ${resBad.status}: ${JSON.stringify(resBad.data)})`);

      const resGood = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: {
          sectionId: testSectionId1,
          titleTR: "Yaz İndirimi %50",
          titleEN: "Summer Sale 50%",
          imageUrlDesktop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
          targetType: "CATEGORY",
          targetValue: "/category/fashion",
          orderIndex: 0,
          active: true,
        },
      });
      assertEqual(resGood.status, 201, `Banner creation should succeed (Got ${resGood.status}: ${JSON.stringify(resGood.data)})`);
      assertEqual(resGood.data.banner.sectionId, testSectionId1);
    }
  );

  // ==========================================
  // DOMAIN 6: Auth & Token Tampering Resistance
  // ==========================================
  console.log("\n--- Domain 6: Auth & Token Tampering Resistance ---");

  await test(
    "ADV-6.1",
    "Reject forged JWT signature on protected admin endpoint",
    "Auth & Security",
    async () => {
      const { SignJWT } = require("jose");
      const fakeSecret = new TextEncoder().encode("attacker-completely-wrong-secret-key-000");
      const fakeToken = await new SignJWT({ id: "admin-1", role: "ADMIN" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(fakeSecret);

      const res = await request("/api/admin/audit", {
        headers: { Cookie: `cadde_store_session=${fakeToken}` },
      });
      assert(res.status === 401 || res.status === 403, `Expected 401/403 for tampered JWT, got ${res.status}`);
    }
  );

  await test(
    "ADV-6.2",
    "Reject expired JWT session token on protected admin endpoint",
    "Auth & Security",
    async () => {
      const { SignJWT } = require("jose");
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "cadde-store-super-secret-jwt-key-stage-08");
      const expiredToken = await new SignJWT({ id: "admin-1", role: "ADMIN" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 100000)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 1000)
        .sign(secret);

      const res = await request("/api/admin/audit", {
        headers: { Cookie: `cadde_store_session=${expiredToken}` },
      });
      assert(res.status === 401 || res.status === 403, `Expected 401/403 for expired JWT, got ${res.status}`);
    }
  );

  await test(
    "ADV-6.3",
    "Reject malformed non-JWT cookie strings gracefully without 500",
    "Auth & Security",
    async () => {
      const res = await request("/api/admin/audit", {
        headers: { Cookie: "cadde_store_session=not.a.valid.jwt.token" },
      });
      assert(res.status === 401 || res.status === 403, `Expected 401/403 for garbage cookie, got ${res.status}`);
    }
  );

  // ==========================================
  // DOMAIN 7: SQL Injection & XSS Attack Resistance
  // ==========================================
  console.log("\n--- Domain 7: SQL Injection & XSS Attack Resistance ---");

  await test(
    "ADV-7.1",
    "SQL injection in search parameter does not execute or drop data",
    "Injection Defense",
    async () => {
      const sqlInjections = [
        "' OR '1'='1",
        "'; DROP TABLE \"User\";--",
        "1 UNION SELECT 1, 'admin', 'hash'--",
      ];
      for (const sql of sqlInjections) {
        const res = await request(`/api/products?search=${encodeURIComponent(sql)}`);
        assertEqual(res.status, 200, "Search query should return 200 OK without crashing");
        assert(Array.isArray(res.data.products), "Response should be an array");
        const userCount = await prisma.user.count();
        assert(userCount > 0, "Users table must remain intact");
      }
    }
  );

  await test(
    "ADV-7.2",
    "XSS payloads in review comments are safely accepted without script execution",
    "Injection Defense",
    async () => {
      const activeProd = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/reviews", {
        method: "POST",
        headers: custHeaders,
        body: {
          productId: activeProd.id,
          rating: 5,
          comment: "<script>alert('XSS-TEST')</script>",
        },
      });
      assert(res.status === 200 || res.status === 201 || res.status === 400, `Review submission returned ${res.status}`);
    }
  );

  // ==========================================
  // DOMAIN 8: Cross-Customer Data Isolation
  // ==========================================
  console.log("\n--- Domain 8: Cross-Customer Data Isolation ---");

  await test(
    "ADV-8.1",
    "Customer 2 cannot delete or access Customer 1 private addresses",
    "Customer Isolation",
    async () => {
      const customers = await prisma.user.findMany({ where: { role: "CUSTOMER" }, take: 2 });
      if (customers.length >= 2) {
        const c1Address = await prisma.address.create({
          data: {
            userId: customers[0].id,
            title: "Private House C1",
            fullName: "Private Owner",
            phone: "05550001122",
            city: "Ankara",
            district: "Cankaya",
            neighborhood: "Kavaklidere",
            addressLine: "Private Str. No 5",
          },
        });

        const c2Headers = await getAuthHeaders({
          id: customers[1].id,
          email: customers[1].email,
          firstName: customers[1].firstName,
          lastName: customers[1].lastName,
          role: "CUSTOMER",
        });

        const delRes = await request(`/api/addresses?id=${c1Address.id}`, {
          method: "DELETE",
          headers: c2Headers,
        });
        const check = await prisma.address.findUnique({ where: { id: c1Address.id } });
        assert(check !== null, "Customer 1 address must not be deleted by Customer 2");
      }
    }
  );

  // ==========================================
  // DOMAIN 9: Complete 73+ Route Crawl & Health Audit
  // ==========================================
  console.log("\n--- Domain 9: Complete 73+ Route Crawl & Health Audit ---");

  await test(
    "ADV-9.1",
    "Public routes respond with 200 OK and valid HTML/JSON",
    "Route Health",
    async () => {
      const routes = [
        "/",
        "/about",
        "/help",
        "/terms",
        "/privacy",
        "/kvkk",
        "/shipping",
        "/returns",
        "/brands",
        "/cart",
        "/checkout",
        "/favorites",
        "/search",
        "/design-system",
        "/header-demo",
        "/manifest.json",
        "/seller",
      ];
      for (const route of routes) {
        const res = await request(route);
        assertEqual(res.status, 200, `Public route ${route} must return 200 OK (Got ${res.status})`);
      }
    }
  );

  await test(
    "ADV-9.2",
    "Customer account routes render with 200 OK when authenticated",
    "Route Health",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const routes = [
        "/account",
        "/account/orders",
        "/account/addresses",
        "/account/cards",
        "/account/coupons",
        "/account/history",
        "/account/notifications",
        "/account/questions",
        "/account/reviews",
        "/account/security",
        "/account/sessions",
        "/account/settings",
        "/account/stores",
        "/account/assistant",
        "/account/buy-again",
      ];
      for (const route of routes) {
        const res = await request(route, { headers: custHeaders });
        assertEqual(res.status, 200, `Account route ${route} must return 200 OK (Got ${res.status})`);
      }
    }
  );

  await test(
    "ADV-9.3",
    "Seller dashboard routes render with 200 OK when authenticated as seller",
    "Route Health",
    async () => {
      const sellerHeaders = await getAuthHeaders("SELLER");
      const routes = [
        "/seller/dashboard",
        "/seller/dashboard/products",
        "/seller/dashboard/products/new",
        "/seller/dashboard/orders",
        "/seller/dashboard/returns",
        "/seller/dashboard/reviews",
        "/seller/dashboard/settings",
      ];
      for (const route of routes) {
        const res = await request(route, { headers: sellerHeaders });
        assertEqual(res.status, 200, `Seller route ${route} must return 200 OK (Got ${res.status})`);
      }
    }
  );

  await test(
    "ADV-9.4",
    "Admin governance routes render with 200 OK when authenticated as admin",
    "Route Health",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const routes = [
        "/admin",
        "/admin/audit",
        "/admin/brands",
        "/admin/categories",
        "/admin/cms",
        "/admin/coupons",
        "/admin/customers",
        "/admin/orders",
        "/admin/products",
        "/admin/returns",
        "/admin/reviews",
        "/admin/sellers",
        "/admin/settings",
      ];
      for (const route of routes) {
        const res = await request(route, { headers: adminHeaders });
        assertEqual(res.status, 200, `Admin route ${route} must return 200 OK (Got ${res.status})`);
      }
    }
  );

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;

  console.log("\n================================================================================");
  console.log("             ADVERSARIAL STRESS TEST EXECUTION SUMMARY                          ");
  console.log("================================================================================");
  console.log(`  TOTAL ADVERSARIAL CHECKS: ${passed}/${total} passed (${failed} failed)`);
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
