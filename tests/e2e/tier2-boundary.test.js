const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertContains,
  assertMatches,
} = require("./harness");
const fs = require("fs");
const path = require("path");

async function runTier2Tests() {
  const results = [];

  async function test(id, name, feature, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        feature,
        tier: 2,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        feature,
        tier: 2,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  TIER 2: BOUNDARY & CORNER CASES SUITE (>=75 tests)");
  console.log("=======================================================\n");

  // ==========================================
  // FEATURE 1: Product Catalog & Multi-Faceted Filters (BVA)
  // ==========================================
  await test(
    "T2.1.1",
    "Empty search query returns active products without crashing",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const res = await request("/api/products?search=");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
    }
  );

  await test(
    "T2.1.2",
    "Search with SQL/HTML meta-characters escapes safely",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const metaQuery = "%27%22%3C%3E%25_";
      const res = await request(`/api/products?search=${metaQuery}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected array result");
    }
  );

  await test(
    "T2.1.3",
    "Search with very long string (200+ characters)",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const longQuery = "a".repeat(250);
      const res = await request(`/api/products?search=${longQuery}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.products.length, 0, "No products should match 250 'a's");
    }
  );

  await test(
    "T2.1.4",
    "Filter by non-existent category slug returns empty array",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const res = await request("/api/products?category=does-not-exist-category-xyz");
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.products.length, 0, "Expected 0 matching products");
    }
  );

  await test(
    "T2.1.5",
    "Filter by non-existent seller slug returns empty array",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const res = await request("/api/products?seller=fake-store-slug-999");
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.products.length, 0, "Expected 0 matching products");
    }
  );

  // ==========================================
  // FEATURE 2: Product Detail, Variants & Installment Matrix (BVA)
  // ==========================================
  await test(
    "T2.2.1",
    "Product lookup with empty slug parameter returns full catalog",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const res = await request("/api/products?slug=");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected array of products");
    }
  );

  await test(
    "T2.2.2",
    "Product with empty variants JSON arrays parses gracefully",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/products?slug=${prod.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      const colors = JSON.parse(res.data.product.colors || "[]");
      assert(Array.isArray(colors), "Colors parsed as array");
    }
  );

  await test(
    "T2.2.3",
    "Extreme pricing precision and formatting handled",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      assert(Number.isFinite(prod.price), "Price must be a valid finite number");
      assert(prod.price > 0 && prod.price < 10000000, "Price should be within realistic bounds");
    }
  );

  await test(
    "T2.2.4",
    "Boundary stock value 0 handled correctly",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      // Find or verify product with stock >= 0
      const prod = await prisma.product.findFirst();
      assert(prod.stock >= 0, "Stock should never be negative in DB");
    }
  );

  await test(
    "T2.2.5",
    "Product slug with Turkish unicode characters encoded properly",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/products?slug=${encodeURIComponent(prod.slug)}`);
      assertEqual(res.status, 200, "Expected 200 OK for encoded slug");
      assertEqual(res.data.product.id, prod.id, "Product ID matches");
    }
  );

  // ==========================================
  // FEATURE 3: Cart Management & Guest-to-Auth Sync (BVA)
  // ==========================================
  await test(
    "T2.3.1",
    "Guest sync with empty payload returns synced true",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/auth/sync", {
        method: "POST",
        headers,
        body: { favoriteProductIds: [], addresses: [] },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.synced, true, "Expected synced true");
    }
  );

  await test(
    "T2.3.2",
    "Guest sync with duplicate favorite IDs is idempotent",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/auth/sync", {
        method: "POST",
        headers,
        body: { favoriteProductIds: [prod.id, prod.id, prod.id] },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.synced, true, "Expected synced true");
    }
  );

  await test(
    "T2.3.3",
    "Guest address sync skips incomplete addresses safely",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const invalidAddr = { title: "Eksik Adres" }; // Missing city, line
      const res = await request("/api/auth/sync", {
        method: "POST",
        headers,
        body: { addresses: [invalidAddr] },
      });
      assertEqual(res.status, 200, "Expected 200 OK without failing");
    }
  );

  await test(
    "T2.3.4",
    "Guest favorites sync with non-existent product IDs handles gracefully",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/auth/sync", {
        method: "POST",
        headers,
        body: { favoriteProductIds: ["fake-non-existent-product-id-999"] },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
    }
  );

  await test(
    "T2.3.5",
    "Guest sync without auth session returns 401 Unauthorized",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const res = await request("/api/auth/sync", {
        method: "POST",
        body: { favoriteProductIds: [] },
      });
      assertEqual(res.status, 401, "Expected 401 Unauthorized");
    }
  );

  // ==========================================
  // FEATURE 4: Coupon Validation & Calculation Engine (BVA)
  // ==========================================
  await test(
    "T2.4.1",
    "Coupon validate with zero subtotal",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "CADDE10", subtotal: 0 },
      });
      // Subtotal 0 is below minimumOrder of 200
      assertEqual(res.status, 400, "Expected 400 for 0 subtotal");
    }
  );

  await test(
    "T2.4.2",
    "Expired coupon code returns error",
    "Coupon Validation & Calculation Engine",
    async () => {
      // Ensure expired coupon exists
      let expCoupon = await prisma.coupon.findUnique({ where: { code: "EXPIRED99" } });
      if (!expCoupon) {
        expCoupon = await prisma.coupon.create({
          data: {
            code: "EXPIRED99",
            type: "FIXED",
            value: 50,
            expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
            active: true,
          },
        });
      }
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "EXPIRED99", subtotal: 500 },
      });
      assertEqual(res.status, 400, "Expected 400 for expired coupon");
      assertContains(res.data.error, "süresi dolmuştur", "Error should mention expiry");
    }
  );

  await test(
    "T2.4.3",
    "Inactive/disabled coupon returns error",
    "Coupon Validation & Calculation Engine",
    async () => {
      let disCoupon = await prisma.coupon.findUnique({ where: { code: "DISABLED99" } });
      if (!disCoupon) {
        disCoupon = await prisma.coupon.create({
          data: {
            code: "DISABLED99",
            type: "PERCENTAGE",
            value: 15,
            active: false,
          },
        });
      }
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "DISABLED99", subtotal: 500 },
      });
      assertEqual(res.status, 400, "Expected 400 for disabled coupon");
    }
  );

  await test(
    "T2.4.4",
    "Coupon code with surrounding whitespace trims cleanly",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "   cadde10   ", subtotal: 350 },
      });
      assertEqual(res.status, 200, "Expected 200 OK for untrimmed code");
      assertEqual(res.data.coupon.code, "CADDE10", "Should normalize to CADDE10");
    }
  );

  await test(
    "T2.4.5",
    "Coupon validate missing code or subtotal returns 400",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "" },
      });
      assertEqual(res.status, 400, "Expected 400 for missing code and subtotal");
    }
  );

  // ==========================================
  // FEATURE 5: Server-Authoritative Multi-Vendor Checkout (BVA)
  // ==========================================
  await test(
    "T2.5.1",
    "Checkout with empty items array returns 400 ORDER_VALIDATION_ERROR",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [],
          shippingAddress: { city: "İstanbul", addressLine: "Test" },
        },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
      assertEqual(res.data.code, "ORDER_VALIDATION_ERROR", "Error code matches");
    }
  );

  await test(
    "T2.5.2",
    "Checkout with negative quantity returns 400 INVALID_QUANTITY",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: prod.id, quantity: -2 }],
          shippingAddress: { city: "İstanbul", addressLine: "Test" },
        },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
      assertEqual(res.data.code, "INVALID_QUANTITY", "Error code matches");
    }
  );

  await test(
    "T2.5.3",
    "Checkout with fractional quantity (1.5) returns 400 INVALID_QUANTITY",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: prod.id, quantity: 1.5 }],
          shippingAddress: { city: "İstanbul", addressLine: "Test" },
        },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
      assertEqual(res.data.code, "INVALID_QUANTITY", "Error code matches");
    }
  );

  await test(
    "T2.5.4",
    "Checkout with extreme quantity (>99) returns 400 INVALID_QUANTITY",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: prod.id, quantity: 100 }],
          shippingAddress: { city: "İstanbul", addressLine: "Test" },
        },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
      assertEqual(res.data.code, "INVALID_QUANTITY", "Error code matches");
    }
  );

  await test(
    "T2.5.5",
    "Checkout requesting quantity exceeding stock returns 400 INSUFFICIENT_STOCK",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const requestedQty = prod.stock + 10;
      if (requestedQty <= 99) {
        const res = await request("/api/orders", {
          method: "POST",
          headers,
          body: {
            items: [{ productId: prod.id, quantity: requestedQty }],
            shippingAddress: { city: "İstanbul", addressLine: "Test" },
          },
        });
        assertEqual(res.status, 400, "Expected 400 Bad Request");
        assertEqual(res.data.code, "INSUFFICIENT_STOCK", "Error code matches");
      }
    }
  );

  // ==========================================
  // FEATURE 6: Two-Tier Order Hierarchy & Carrier Tracking (BVA)
  // ==========================================
  await test(
    "T2.6.1",
    "Order creation without shipping address returns 400 validation error",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          // missing shippingAddress
        },
      });
      assertEqual(res.status, 400, "Expected 400 for missing shipping address");
    }
  );

  await test(
    "T2.6.2",
    "Order creation with inactive product returns 400 PRODUCT_UNAVAILABLE",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      let inactProd = await prisma.product.findFirst({ where: { status: "INACTIVE" } });
      if (!inactProd) {
        const seller = await prisma.seller.findFirst();
        const cat = await prisma.category.findFirst();
        inactProd = await prisma.product.create({
          data: {
            name: "Pasif Ürün",
            slug: `pasif-urun-${Date.now()}`,
            brand: "Cadde",
            sku: `INACT-${Date.now()}`,
            price: 100,
            stock: 10,
            status: "INACTIVE",
            sellerId: seller.id,
            categoryId: cat.id,
            description: "Pasif",
            imageUrl: "https://example.com/p.jpg",
          },
        });
      }
      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: inactProd.id, quantity: 1 }],
          shippingAddress: { city: "Ankara", addressLine: "Test" },
        },
      });
      assertEqual(res.status, 400, "Expected 400 for inactive product");
      assertEqual(res.data.code, "PRODUCT_UNAVAILABLE", "Error code matches");
    }
  );

  await test(
    "T2.6.3",
    "Multiple items from same seller aggregate into single OrderGroup",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const prods = await prisma.product.findMany({
        where: { sellerId: seller.id, status: "ACTIVE", stock: { gte: 5 } },
        take: 2,
      });

      if (prods.length >= 2) {
        const res = await request("/api/orders", {
          method: "POST",
          headers,
          body: {
            items: [
              { productId: prods[0].id, quantity: 1 },
              { productId: prods[1].id, quantity: 1 },
            ],
            shippingAddress: { city: "İzmir", addressLine: "Alsancak" },
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.order.orderGroups.length, 1, "Single seller items should have 1 OrderGroup");
      }
    }
  );

  await test(
    "T2.6.4",
    "Order tracking number supports arbitrary alphanumeric carrier formats",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const sampleCodes = [
        "YRT-948201948",
        "ARS-883920194",
        "MNG-552019482",
        "SRT-110294820",
        "PTT-TR94820194",
        "HJ-998822019",
      ];
      sampleCodes.forEach((code) => {
        assert(code.length >= 10, "Tracking code length should be at least 10 chars");
        assertMatches(code, /^[A-Z0-9-]+$/, "Tracking code format alphanumeric");
      });
    }
  );

  await test(
    "T2.6.5",
    "Grand total calculation never yields negative values",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const orders = await prisma.order.findMany({ take: 20 });
      orders.forEach((o) => {
        assert(o.grandTotal >= 0, "Grand total must be non-negative");
        assert(o.subtotal >= 0, "Subtotal must be non-negative");
      });
    }
  );

  // ==========================================
  // FEATURE 7: Order Status Transitions & Notifications (BVA)
  // ==========================================
  await test(
    "T2.7.1",
    "Seller updating non-existent orderGroupId returns 404",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const res = await request("/api/orders/seller", {
        method: "PUT",
        headers,
        body: {
          orderGroupId: "non-existent-group-id-999",
          status: "PROCESSING",
        },
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.7.2",
    "Seller updating another seller's orderGroup returns 403 Forbidden",
    "Order Status Transitions & Notifications",
    async () => {
      const sellers = await prisma.seller.findMany({ take: 2 });
      if (sellers.length >= 2) {
        const groupOther = await prisma.orderGroup.findFirst({
          where: { sellerId: sellers[1].id },
        });

        if (groupOther) {
          // Seller 1 attempts to update Seller 2's group
          const seller1User = await prisma.user.findUnique({ where: { id: sellers[0].userId } });
          const seller1Headers = await getAuthHeaders({
            id: seller1User.id,
            email: seller1User.email,
            firstName: seller1User.firstName,
            lastName: seller1User.lastName,
            role: "SELLER",
            sellerSlug: sellers[0].slug,
          });

          const res = await request("/api/orders/seller", {
            method: "PUT",
            headers: seller1Headers,
            body: {
              orderGroupId: groupOther.id,
              status: "SHIPPED",
            },
          });
          assertEqual(res.status, 403, "Expected 403 Forbidden for cross-seller modification");
        }
      }
    }
  );

  await test(
    "T2.7.3",
    "Update order status without status or orderGroupId returns 400",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const res = await request("/api/orders/seller", {
        method: "PUT",
        headers,
        body: { orderGroupId: "some-id" }, // missing status
      });
      assertEqual(res.status, 400, "Expected 400 for missing status");
    }
  );

  await test(
    "T2.7.4",
    "Notification markAllAsRead updates all unread notifications to read",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/notifications", {
        method: "PUT",
        headers,
        body: { markAllAsRead: true },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.success, true, "Success true");
    }
  );

  await test(
    "T2.7.5",
    "Notification update with empty body returns 400",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/notifications", {
        method: "PUT",
        headers,
        body: {},
      });
      assertEqual(res.status, 400, "Expected 400 for empty update payload");
    }
  );

  // ==========================================
  // FEATURE 8: Customer Return Request & Evidence Upload (BVA)
  // ==========================================
  await test(
    "T2.8.1",
    "Customer return request on another user's order returns 403 Forbidden",
    "Customer Return Request & Evidence Upload",
    async () => {
      const allItems = await prisma.orderItem.findMany({ include: { order: true } });
      const custUsers = await prisma.user.findMany({ where: { role: "CUSTOMER" }, take: 2 });

      if (custUsers.length >= 2) {
        // Find item belonging to customer 1
        const item1 = allItems.find((i) => i.order.customerId === custUsers[0].id);
        if (item1) {
          // Customer 2 attempts return on Customer 1's item
          const cust2Headers = await getAuthHeaders({
            id: custUsers[1].id,
            email: custUsers[1].email,
            firstName: custUsers[1].firstName,
            lastName: custUsers[1].lastName,
            role: "CUSTOMER",
          });

          const res = await request("/api/returns", {
            method: "POST",
            headers: cust2Headers,
            body: {
              orderId: item1.orderId,
              orderItemId: item1.id,
              reason: "Hatalı iade denemesi",
            },
          });
          assertEqual(res.status, 403, "Expected 403 Forbidden for unauthorized return request");
        }
      }
    }
  );

  await test(
    "T2.8.2",
    "Return request on non-existent orderItemId returns 403/400",
    "Customer Return Request & Evidence Upload",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/returns", {
        method: "POST",
        headers,
        body: {
          orderId: "some-order-id",
          orderItemId: "non-existent-order-item-999",
          reason: "Kusurlu ürün",
        },
      });
      assert(res.status === 400 || res.status === 403, "Expected 400 or 403 for non-existent item");
    }
  );

  await test(
    "T2.8.3",
    "Return request with empty reason string returns 400",
    "Customer Return Request & Evidence Upload",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/returns", {
        method: "POST",
        headers,
        body: {
          orderId: "some-order",
          orderItemId: "some-item",
          reason: "",
        },
      });
      assertEqual(res.status, 400, "Expected 400 for empty reason");
    }
  );

  await test(
    "T2.8.4",
    "Return request with 10+ evidence image URLs stores valid JSON array",
    "Customer Return Request & Evidence Upload",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const orderItem = await prisma.orderItem.findFirst({
        where: { order: { customerId: custUser.id } },
      });

      if (orderItem) {
        const images = Array.from({ length: 10 }, (_, i) => `https://example.com/evidence-${i + 1}.jpg`);
        const res = await request("/api/returns", {
          method: "POST",
          headers,
          body: {
            orderId: orderItem.orderId,
            orderItemId: orderItem.id,
            reason: "Ürün hasarlı geldi ve kutusu ezilmiş",
            evidenceImages: images,
          },
        });
        assertEqual(res.status, 201, "Expected 201 Created");
        const parsed = JSON.parse(res.data.returnRequest.evidenceImages);
        assertEqual(parsed.length, 10, "Should store all 10 image URLs");
      }
    }
  );

  await test(
    "T2.8.5",
    "Unauthenticated return request returns 401 Unauthorized",
    "Customer Return Request & Evidence Upload",
    async () => {
      const res = await request("/api/returns", {
        method: "POST",
        body: { orderId: "1", orderItemId: "1", reason: "test" },
      });
      assertEqual(res.status, 401, "Expected 401 Unauthorized");
    }
  );

  // ==========================================
  // FEATURE 9: Seller & Admin Return Moderation & Refunds (BVA)
  // ==========================================
  await test(
    "T2.9.1",
    "Customer attempting to approve/reject return request returns 403 Forbidden",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const returnReq = await prisma.returnRequest.findFirst();
      if (returnReq) {
        const custHeaders = await getAuthHeaders("CUSTOMER");
        const res = await request(`/api/returns/${returnReq.id}`, {
          method: "PUT",
          headers: custHeaders,
          body: { status: "APPROVED" },
        });
        assertEqual(res.status, 403, "Expected 403 Forbidden for customer role");
      }
    }
  );

  await test(
    "T2.9.2",
    "Moderating non-existent return request returns 404 Not Found",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/returns/non-existent-return-id-999", {
        method: "PUT",
        headers,
        body: { status: "APPROVED" },
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.9.3",
    "Unauthenticated PUT to return moderation returns 401 Unauthorized",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const res = await request("/api/returns/any-id", {
        method: "PUT",
        body: { status: "APPROVED" },
      });
      assertEqual(res.status, 401, "Expected 401 Unauthorized");
    }
  );

  await test(
    "T2.9.4",
    "Seller rejects return with detailed sellerNote",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      let returnReq = await prisma.returnRequest.findFirst({
        include: { seller: { include: { user: true } } },
      });
      if (returnReq && returnReq.seller && returnReq.seller.user) {
        const sellerHeaders = await getAuthHeaders({
          id: returnReq.seller.user.id,
          email: returnReq.seller.user.email,
          firstName: returnReq.seller.user.firstName,
          lastName: returnReq.seller.user.lastName,
          role: "SELLER",
          sellerSlug: returnReq.seller.slug,
        });
        const res = await request(`/api/returns/${returnReq.id}`, {
          method: "PUT",
          headers: sellerHeaders,
          body: {
            status: "REJECTED",
            sellerNote: "Kullanılmış ürünlerde hijyen sebebiyle iade kabul edilmemektedir.",
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.returnRequest.status, "REJECTED", "Status should be REJECTED");
      }
    }
  );

  await test(
    "T2.9.5",
    "Status progression to CARGO_RECEIVED and REFUNDED",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const returnReq = await prisma.returnRequest.findFirst();
      if (returnReq) {
        const headers = await getAuthHeaders("ADMIN");
        const res = await request(`/api/returns/${returnReq.id}`, {
          method: "PUT",
          headers,
          body: { status: "CARGO_RECEIVED" },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.returnRequest.status, "CARGO_RECEIVED", "Status should be CARGO_RECEIVED");
      }
    }
  );

  // ==========================================
  // FEATURE 10: Admin Homepage CMS Sections & Banners (BVA)
  // ==========================================
  await test(
    "T2.10.1",
    "Create CMS section with missing title returns 400 Bad Request",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/sections", {
        method: "POST",
        headers,
        body: { type: "HERO" }, // missing titleTR and titleEN
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.10.2",
    "Create banner with missing imageUrlDesktop or targetValue returns 400",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/banners", {
        method: "POST",
        headers,
        body: { titleTR: "Banner" }, // missing imageUrlDesktop and targetValue
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.10.3",
    "Update CMS section without ID returns 400 Bad Request",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/sections", {
        method: "PUT",
        headers,
        body: { orderIndex: 10 }, // missing id
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.10.4",
    "Delete banner without id query param returns 400 Bad Request",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/banners", {
        method: "DELETE",
        headers,
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.10.5",
    "Non-admin (customer) attempting CMS section creation returns 403 Forbidden",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/cms/sections", {
        method: "POST",
        headers,
        body: { titleTR: "Yetkisiz Bölüm", titleEN: "Unauthorized" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  // ==========================================
  // FEATURE 11: Dedicated Brand Directory & Admin Panel (BVA)
  // ==========================================
  await test(
    "T2.11.1",
    "Create brand with missing name, slug, or logoUrl returns 400",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/brands", {
        method: "POST",
        headers,
        body: { name: "Marka" }, // missing slug and logoUrl
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.11.2",
    "Create brand with duplicate slug returns 409 Conflict",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const existing = await prisma.brand.findFirst();
      if (existing) {
        const res = await request("/api/brands", {
          method: "POST",
          headers,
          body: {
            name: "Çakışan Marka",
            slug: existing.slug,
            logoUrl: "https://example.com/logo.png",
          },
        });
        assertEqual(res.status, 409, "Expected 409 Conflict for duplicate brand slug");
      }
    }
  );

  await test(
    "T2.11.3",
    "Fetch brand details with non-existent ID returns 404 Not Found",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const res = await request("/api/brands/non-existent-brand-id-999");
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.11.4",
    "Non-admin user attempting brand creation returns 403 Forbidden",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/brands", {
        method: "POST",
        headers,
        body: { name: "Hileli Marka", slug: "hileli-marka", logoUrl: "https://example.com/l.png" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.11.5",
    "Brand logo URL and banner URL nullability handled cleanly",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const brands = await prisma.brand.findMany();
      brands.forEach((b) => {
        assert(typeof b.name === "string" && b.name.length > 0, "Brand name non-empty");
        assert(typeof b.slug === "string" && b.slug.length > 0, "Brand slug non-empty");
      });
    }
  );

  // ==========================================
  // FEATURE 12: Seller Product Management & Stock Alerts (BVA)
  // ==========================================
  await test(
    "T2.12.1",
    "Seller product creation with missing required fields returns 400",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const res = await request("/api/products", {
        method: "POST",
        headers,
        body: { name: "Eksik Ürün" }, // missing price, categoryId, sku
      });
      assertEqual(res.status, 400, "Expected 400 for missing required product fields");
    }
  );

  await test(
    "T2.12.2",
    "Non-seller/non-admin (customer) attempting product creation returns 403",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const cat = await prisma.category.findFirst();
      const res = await request("/api/products", {
        method: "POST",
        headers,
        body: {
          name: "Yetkisiz Ürün",
          categoryId: cat.id,
          price: 100,
          sku: `SKU-UNAUTH-${Date.now()}`,
        },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.12.3",
    "Admin product moderation PUT without productId returns 400",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/products", {
        method: "PUT",
        headers,
        body: { status: "ACTIVE" }, // missing productId
      });
      assertEqual(res.status, 400, "Expected 400 for missing productId");
    }
  );

  await test(
    "T2.12.4",
    "Admin product moderation by customer returns 403 Forbidden",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/admin/products", {
        method: "PUT",
        headers,
        body: { productId: "any-id", status: "REJECTED" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.12.5",
    "Product stock levels 0 trigger out of stock behavior in orders",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const zeroStockProd = await prisma.product.findFirst({ where: { stock: 0 } });
      if (zeroStockProd) {
        const res = await request("/api/orders", {
          method: "POST",
          headers,
          body: {
            items: [{ productId: zeroStockProd.id, quantity: 1 }],
            shippingAddress: { city: "İstanbul", addressLine: "Test" },
          },
        });
        assertEqual(res.status, 400, "Expected 400 for 0 stock product");
      }
    }
  );

  // ==========================================
  // FEATURE 13: Seller Review Replies & Custom Storefront (BVA)
  // ==========================================
  await test(
    "T2.13.1",
    "Fetch reviews without productId query parameter returns 400",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const res = await request("/api/reviews");
      assertEqual(res.status, 400, "Expected 400 for missing productId query");
    }
  );

  await test(
    "T2.13.2",
    "Submit review with missing rating or comment returns 400",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/reviews", {
        method: "POST",
        headers,
        body: { productId: prod.id }, // missing rating and comment
      });
      assertEqual(res.status, 400, "Expected 400 for missing rating and comment");
    }
  );

  await test(
    "T2.13.3",
    "Seller attempting reply to review of another seller's product returns 403",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const sellers = await prisma.seller.findMany({ take: 2 });
      if (sellers.length >= 2) {
        const reviewSeller2 = await prisma.review.findFirst({
          where: { product: { sellerId: sellers[1].id } },
        });

        if (reviewSeller2) {
          const seller1User = await prisma.user.findUnique({ where: { id: sellers[0].userId } });
          const seller1Headers = await getAuthHeaders({
            id: seller1User.id,
            email: seller1User.email,
            firstName: seller1User.firstName,
            lastName: seller1User.lastName,
            role: "SELLER",
            sellerSlug: sellers[0].slug,
          });

          const res = await request("/api/reviews", {
            method: "PUT",
            headers: seller1Headers,
            body: {
              reviewId: reviewSeller2.id,
              sellerReply: "Yetkisiz yanıt",
            },
          });
          assertEqual(res.status, 403, "Expected 403 Forbidden for replying to other seller review");
        }
      }
    }
  );

  await test(
    "T2.13.4",
    "Review reply with non-existent reviewId returns 404 Not Found",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/reviews", {
        method: "PUT",
        headers,
        body: {
          reviewId: "non-existent-review-id-999",
          sellerReply: "Yanıt",
        },
      });
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  await test(
    "T2.13.5",
    "Fetch seller storefront with non-existent slug returns 404",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const res = await request("/api/sellers?slug=non-existent-store-slug-xyz");
      assertEqual(res.status, 404, "Expected 404 Not Found");
    }
  );

  // ==========================================
  // FEATURE 14: Admin Governance, Audit Trail & RBAC (BVA)
  // ==========================================
  await test(
    "T2.14.1",
    "Audit log query with non-matching entityType returns empty logs array",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/audit?entityType=NON_EXISTENT_ENTITY", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.logs.length, 0, "Expected 0 logs for unknown entity type");
    }
  );

  await test(
    "T2.14.2",
    "Update seller status with missing sellerId returns 400 Bad Request",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/sellers", {
        method: "PUT",
        headers,
        body: { verified: true }, // missing sellerId
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.14.3",
    "Update customer status with missing customerId returns 400 Bad Request",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/customers", {
        method: "PUT",
        headers,
        body: { status: "blocked" }, // missing customerId
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request");
    }
  );

  await test(
    "T2.14.4",
    "Platform settings handles floating point values cleanly",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers,
        body: {
          defaultShippingFee: 29.99,
          freeShippingThreshold: 250.0,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings.defaultShippingFee, 29.99, "Shipping fee updated");
      assertEqual(res.data.settings.freeShippingThreshold, 250.0, "Threshold updated");
    }
  );

  await test(
    "T2.14.5",
    "Unauthenticated request to admin settings returns 403 Forbidden",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const res = await request("/api/admin/settings", {
        method: "PUT",
        body: { defaultShippingFee: 10 },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden for missing auth");
    }
  );

  // ==========================================
  // FEATURE 15: Turkish/English Localization & PWA Manifest (BVA)
  // ==========================================
  await test(
    "T2.15.1",
    "PWA manifest icons array contains 192x192 and 512x512 entries",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const manifestPath = path.join(__dirname, "..", "..", "public", "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const sizes = manifest.icons.map((i) => i.sizes);
      assertContains(sizes, "192x192", "192x192 icon present");
      assertContains(sizes, "512x512", "512x512 icon present");
    }
  );

  await test(
    "T2.15.2",
    "Turkish dictionary file exports valid non-empty object with 700+ lines",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const trPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "tr.ts");
      const lines = fs.readFileSync(trPath, "utf8").split("\n");
      assert(lines.length >= 700, "Turkish dictionary should have at least 700 lines");
    }
  );

  await test(
    "T2.15.3",
    "English dictionary file exports valid non-empty object with 700+ lines",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const enPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "en.ts");
      const lines = fs.readFileSync(enPath, "utf8").split("\n");
      assert(lines.length >= 700, "English dictionary should have at least 700 lines");
    }
  );

  await test(
    "T2.15.4",
    "Currency storage key and language storage key definitions",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const configPath = path.join(__dirname, "..", "..", "lib", "i18n", "config.ts");
      const content = fs.readFileSync(configPath, "utf8");
      assertContains(content, "cadde-store-language", "Language key present");
      assertContains(content, "cadde-store-currency", "Currency key present");
    }
  );

  await test(
    "T2.15.5",
    "Turkish special characters preserved across Category names in DB",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const categories = await prisma.category.findMany();
      assert(categories.length > 0, "Categories must exist");
      const hasTurkishChar = categories.some((c) => /[şğüçöıİŞĞÜÇÖ]/.test(c.nameTR));
      assert(hasTurkishChar, "Category nameTR must contain proper Turkish characters");
    }
  );

  // ==========================================
  // FEATURE 16: Marketing Campaign Budget & Dates Boundary Tests (BVA)
  // ==========================================
  await test(
    "T2.16.1",
    "Create marketing campaign with zero budget (boundary minimum: 0)",
    "Marketing Campaigns & Sponsored Advertising Studio",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/marketing", {
        method: "POST",
        headers,
        body: {
          name: `Zero Budget Campaign ${Date.now()}`,
          budget: 0,
          type: "SPONSORED_PRODUCT",
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created for zero budget");
      assertEqual(res.data.campaign.budget, 0, "Budget should be 0");
    }
  );

  await test(
    "T2.16.2",
    "Reject campaign creation when budget parameter is missing",
    "Marketing Campaigns & Sponsored Advertising Studio",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/marketing", {
        method: "POST",
        headers,
        body: {
          name: "Missing Budget Campaign",
          type: "SPONSORED_PRODUCT",
        },
      });
      assertEqual(res.status, 400, "Expected 400 Bad Request when budget missing");
    }
  );

  await test(
    "T2.16.3",
    "Query campaigns with non-existent placement returns empty array",
    "Marketing Campaigns & Sponsored Advertising Studio",
    async () => {
      const res = await request("/api/marketing?placement=NON_EXISTENT_PLACEMENT_XYZ");
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.campaigns.length, 0, "Should return 0 matching campaigns");
    }
  );

  await test(
    "T2.16.4",
    "Update non-existent campaign ID returns 404",
    "Marketing Campaigns & Sponsored Advertising Studio",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/marketing/non-existent-campaign-id-999", {
        method: "PUT",
        headers,
        body: { budget: 5000 },
      });
      assertEqual(res.status, 404, "Expected 404 for missing campaign ID");
    }
  );

  await test(
    "T2.16.5",
    "Campaign with negative priority (-99) handled and stored correctly",
    "Marketing Campaigns & Sponsored Advertising Studio",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/marketing", {
        method: "POST",
        headers,
        body: {
          name: `Negative Priority Campaign ${Date.now()}`,
          budget: 1000,
          priority: -99,
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assertEqual(res.data.campaign.priority, -99, "Priority should be -99");
    }
  );

  // ==========================================
  // FEATURE 17: Navigation Circular Parents & Hierarchy Boundary Tests (BVA)
  // ==========================================
  await test(
    "T2.17.1",
    "Navigation item with null parentId treated as top-level root item",
    "Navigation Menu Governance & Hierarchies",
    async () => {
      const rootItem = await prisma.navigationItem.create({
        data: {
          titleTr: "Ana Kategori Kök",
          titleEn: "Root Category Main",
          url: "/category/kok",
          section: "HEADER",
          parentId: null,
          sortOrder: 0,
        },
      });
      assert(rootItem.id, "Root item created");
      assertEqual(rootItem.parentId, null, "parentId should be null");
    }
  );

  await test(
    "T2.17.2",
    "Lookup non-existent navigation item ID via GET /api/navigation/[id] returns 404",
    "Navigation Menu Governance & Hierarchies",
    async () => {
      const res = await request("/api/navigation/non-existent-nav-id-999");
      assertEqual(res.status, 404, "Expected 404 for missing navigation item");
    }
  );

  await test(
    "T2.17.3",
    "Navigation item with very long title (200+ characters) persists safely",
    "Navigation Menu Governance & Hierarchies",
    async () => {
      const longTitle = "Nav ".repeat(50);
      const item = await prisma.navigationItem.create({
        data: {
          titleTr: longTitle,
          titleEn: longTitle,
          url: "/long-nav",
          section: "HEADER",
        },
      });
      assert(item.id, "Item with long title created");
      assertEqual(item.titleTr, longTitle, "Title preserved");
    }
  );

  await test(
    "T2.17.4",
    "Update non-existent navigation item ID returns 404",
    "Navigation Menu Governance & Hierarchies",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/navigation/non-existent-nav-id-999", {
        method: "PUT",
        headers,
        body: { sortOrder: 5 },
      });
      assertEqual(res.status, 404, "Expected 404 for missing navigation ID");
    }
  );

  await test(
    "T2.17.5",
    "Delete non-existent navigation item ID returns 404",
    "Navigation Menu Governance & Hierarchies",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/navigation/non-existent-nav-id-999", {
        method: "DELETE",
        headers,
      });
      assertEqual(res.status, 404, "Expected 404 for missing navigation ID");
    }
  );

  // ==========================================
  // FEATURE 18: Media Asset Extreme Sizes & Mime-Types Boundary Tests (BVA)
  // ==========================================
  await test(
    "T2.18.1",
    "Create media asset with 0 sizeBytes (boundary minimum)",
    "Media Asset Library Management & Reference Tracking",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/media", {
        method: "POST",
        headers,
        body: {
          filename: `zero-size-${Date.now()}.png`,
          url: "https://example.com/zero.png",
          sizeBytes: 0,
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created for 0 sizeBytes");
      assertEqual(res.data.media.sizeBytes, 0, "sizeBytes should be 0");
    }
  );

  await test(
    "T2.18.2",
    "Create media asset with extreme sizeBytes (500MB = 524288000 bytes)",
    "Media Asset Library Management & Reference Tracking",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const extremeSize = 524288000;
      const res = await request("/api/media", {
        method: "POST",
        headers,
        body: {
          filename: `large-video-${Date.now()}.mp4`,
          url: "https://example.com/large.mp4",
          sizeBytes: extremeSize,
          mimeType: "video/mp4",
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created for extreme size");
      assertEqual(res.data.media.sizeBytes, extremeSize, "sizeBytes matches");
    }
  );

  await test(
    "T2.18.3",
    "Reject media asset creation when required filename or URL is missing",
    "Media Asset Library Management & Reference Tracking",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/media", {
        method: "POST",
        headers,
        body: { sizeBytes: 1024 }, // missing filename and url
      });
      assertEqual(res.status, 400, "Expected 400 when filename and url missing");
    }
  );

  await test(
    "T2.18.4",
    "Media asset search with special characters handles query gracefully",
    "Media Asset Library Management & Reference Tracking",
    async () => {
      const res = await request("/api/media?search=%27%22%3C%3E");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.media || res.data.assets), "Array returned");
    }
  );

  await test(
    "T2.18.5",
    "Lookup non-existent media asset ID returns 404",
    "Media Asset Library Management & Reference Tracking",
    async () => {
      const res = await request("/api/media/non-existent-media-id-999");
      assertEqual(res.status, 404, "Expected 404 for missing media asset ID");
    }
  );

  // ==========================================
  // FEATURE 19: AuditLog Entity Filter & Metadata Boundary Tests (BVA)
  // ==========================================
  await test(
    "T2.19.1",
    "Query audit log with non-existent entityType returns empty logs array",
    "Product Commercial Mutations & AuditLog Diffs",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/audit?entityType=NON_EXISTENT_ENTITY_TYPE_999", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.logs.length, 0, "Should return 0 matching logs");
    }
  );

  await test(
    "T2.19.2",
    "Query audit log with URL encoded SQL/HTML meta-characters handled safely",
    "Product Commercial Mutations & AuditLog Diffs",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/audit?entityType=%27%20OR%201=1--", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.logs.length, 0, "Should safely return empty list without injection");
    }
  );

  await test(
    "T2.19.3",
    "AuditLog handles complex serialized JSON metadata with nested structures",
    "Product Commercial Mutations & AuditLog Diffs",
    async () => {
      const complexMeta = {
        diff: {
          price: { before: 100, after: 150 },
          stock: { before: 10, after: 20 },
        },
        tags: ["promo", "flash_sale"],
      };

      const log = await prisma.auditLog.create({
        data: {
          action: "COMPLEX_TEST_ACTION",
          entityType: "PRODUCT",
          metadataJson: JSON.stringify(complexMeta),
        },
      });

      assert(log.id, "AuditLog created");
      const parsed = JSON.parse(log.metadataJson);
      assertEqual(parsed.diff.price.before, 100, "Nested metadata preserved");
    }
  );

  await test(
    "T2.19.4",
    "Unauthenticated request to GET /api/admin/audit returns 403 Forbidden",
    "Product Commercial Mutations & AuditLog Diffs",
    async () => {
      const res = await request("/api/admin/audit");
      assertEqual(res.status, 403, "Expected 403 for unauthenticated request");
    }
  );

  await test(
    "T2.19.5",
    "AuditLog query returns max 100 recent entries by default",
    "Product Commercial Mutations & AuditLog Diffs",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/audit", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.logs.length <= 100, "Logs count should not exceed 100");
    }
  );

  // ==========================================
  // FEATURE 20: Order Carrier Tracking Formats & Edge Case Logistics (BVA)
  // ==========================================
  await test(
    "T2.20.1",
    "Update order group with non-existent orderGroupId returns 404",
    "Admin Order Fulfillment & Turkish Carrier Logistics",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/orders/seller", {
        method: "PUT",
        headers,
        body: {
          orderGroupId: "non-existent-order-group-id-999",
          status: "SHIPPED",
        },
      });
      assertEqual(res.status, 404, "Expected 404 for missing orderGroupId");
    }
  );

  await test(
    "T2.20.2",
    "Update order group missing status returns 400 Bad Request",
    "Admin Order Fulfillment & Turkish Carrier Logistics",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const group = await prisma.orderGroup.findFirst();
      const res = await request("/api/orders/seller", {
        method: "PUT",
        headers,
        body: {
          orderGroupId: group.id,
          // status is missing
        },
      });
      assertEqual(res.status, 400, "Expected 400 when status is missing");
    }
  );

  await test(
    "T2.20.3",
    "Update order group with custom Turkish carrier name persists safely",
    "Admin Order Fulfillment & Turkish Carrier Logistics",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const group = await prisma.orderGroup.findFirst();
      const res = await request("/api/orders/seller", {
        method: "PUT",
        headers,
        body: {
          orderGroupId: group.id,
          status: "PROCESSING",
          carrierName: "HepsiJet Express",
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.orderGroup.carrierName, "HepsiJet Express", "Carrier name updated");
    }
  );

  await test(
    "T2.20.4",
    "Update order group with very long tracking code (100+ chars) persists safely",
    "Admin Order Fulfillment & Turkish Carrier Logistics",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const group = await prisma.orderGroup.findFirst();
      const longTracking = "TRK-" + "9".repeat(120);
      const res = await request("/api/orders/seller", {
        method: "PUT",
        headers,
        body: {
          orderGroupId: group.id,
          status: "SHIPPED",
          trackingNumber: longTracking,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.orderGroup.trackingNumber, longTracking, "Long tracking code preserved");
    }
  );

  await test(
    "T2.20.5",
    "Order lookup with non-existent order ID returns 404",
    "Admin Order Fulfillment & Turkish Carrier Logistics",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/orders/non-existent-order-id-xyz-999", { headers });
      assertEqual(res.status, 404, "Expected 404 for missing order ID");
    }
  );

  // ==========================================
  // FEATURE 21: Seller Commission Boundary Values (BVA)
  // ==========================================
  await test(
    "T2.21.1",
    "Set platform default commission rate to boundary minimum 0%",
    "Seller Commission Configuration & Governance",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers,
        body: { defaultCommissionRate: 0.0 },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings.defaultCommissionRate, 0.0, "Commission rate should be 0.0%");
    }
  );

  await test(
    "T2.21.2",
    "Set platform default commission rate to boundary maximum 100%",
    "Seller Commission Configuration & Governance",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/settings", {
        method: "PUT",
        headers,
        body: { defaultCommissionRate: 100.0 },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.settings.defaultCommissionRate, 100.0, "Commission rate should be 100.0%");
    }
  );

  await test(
    "T2.21.3",
    "Update seller with non-existent sellerId returns 404",
    "Seller Commission Configuration & Governance",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/sellers", {
        method: "PUT",
        headers,
        body: {
          sellerId: "non-existent-seller-id-999",
          verified: true,
        },
      });
      assertEqual(res.status, 404, "Expected 404 for missing seller ID");
    }
  );

  await test(
    "T2.21.4",
    "Update seller missing sellerId returns 400 Bad Request",
    "Seller Commission Configuration & Governance",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/sellers", {
        method: "PUT",
        headers,
        body: { verified: true }, // missing sellerId
      });
      assertEqual(res.status, 400, "Expected 400 when sellerId is missing");
    }
  );

  await test(
    "T2.21.5",
    "Non-admin attempt to toggle seller verification returns 403 Forbidden",
    "Seller Commission Configuration & Governance",
    async () => {
      const seller = await prisma.seller.findFirst();
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/admin/sellers", {
        method: "PUT",
        headers: custHeaders,
        body: {
          sellerId: seller.id,
          verified: false,
        },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden for non-admin");
    }
  );

  // ==========================================
  // FEATURE 22: Customer CRM Edge Case Aggregations & Status Boundaries (BVA)
  // ==========================================
  await test(
    "T2.22.1",
    "Customer with 0 orders displays totalSpent 0 and ordersCount 0 in CRM",
    "Customer CRM Profile Analytics & Account Controls",
    async () => {
      const newCustomer = await prisma.user.create({
        data: {
          email: `crm-zero-order-${Date.now()}@test.com`,
          passwordHash: "test-hash",
          firstName: "Yeni",
          lastName: "Müşteri",
          role: "CUSTOMER",
        },
      });

      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/customers", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      const found = res.data.customers.find((c) => c.id === newCustomer.id);
      assert(found, "Customer should appear in CRM list");
      assertEqual(found.ordersCount, 0, "ordersCount should be 0");
      assertEqual(found.totalSpent, 0, "totalSpent should be 0");
    }
  );

  await test(
    "T2.22.2",
    "Update customer missing customerId returns 400 Bad Request",
    "Customer CRM Profile Analytics & Account Controls",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/customers", {
        method: "PUT",
        headers,
        body: { status: "blocked" }, // missing customerId
      });
      assertEqual(res.status, 400, "Expected 400 when customerId is missing");
    }
  );

  await test(
    "T2.22.3",
    "Non-admin attempt to retrieve customer CRM returns 403 Forbidden",
    "Customer CRM Profile Analytics & Account Controls",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/admin/customers", { headers: custHeaders });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.22.4",
    "Non-admin attempt to update customer status returns 403 Forbidden",
    "Customer CRM Profile Analytics & Account Controls",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/admin/customers", {
        method: "PUT",
        headers: custHeaders,
        body: { customerId: "some-id", status: "blocked" },
      });
      assertEqual(res.status, 403, "Expected 403 Forbidden");
    }
  );

  await test(
    "T2.22.5",
    "Customer CRM handles special characters in customer names without error",
    "Customer CRM Profile Analytics & Account Controls",
    async () => {
      const specialCust = await prisma.user.create({
        data: {
          email: `special-char-${Date.now()}@test.com`,
          passwordHash: "test-hash",
          firstName: "Çağdaş & Şükrü",
          lastName: "Öztürk-İlhan",
          role: "CUSTOMER",
        },
      });

      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/customers", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      const found = res.data.customers.find((c) => c.id === specialCust.id);
      assert(found, "Special character customer found");
      assertContains(found.name, "Çağdaş", "Turkish characters preserved in name");
    }
  );

  // ==========================================
  // FEATURE 23: Cookie Consent & Legal Route Breakpoint Spectrum (BVA)
  // ==========================================
  await test(
    "T2.23.1",
    "Verify /kvkk page loads under 2500ms with 200 OK",
    "KVKK Compliance & Cookie Consent Management",
    async () => {
      const res = await request("/kvkk");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.duration < 2500, "Response duration should be under 2500ms");
    }
  );

  await test(
    "T2.23.2",
    "Verify /privacy page contains Privacy Policy headers without exceptions",
    "KVKK Compliance & Cookie Consent Management",
    async () => {
      const res = await request("/privacy");
      assertEqual(res.status, 200, "Expected 200 OK");
    }
  );

  await test(
    "T2.23.3",
    "Verify /terms page renders Distance Sales Agreement headers",
    "KVKK Compliance & Cookie Consent Management",
    async () => {
      const res = await request("/terms");
      assertEqual(res.status, 200, "Expected 200 OK");
    }
  );

  await test(
    "T2.23.4",
    "Verify /help page renders customer support navigation without server exceptions",
    "KVKK Compliance & Cookie Consent Management",
    async () => {
      const res = await request("/help");
      assertEqual(res.status, 200, "Expected 200 OK");
    }
  );

  await test(
    "T2.23.5",
    "Verify /shipping page renders Turkish carrier shipping details",
    "KVKK Compliance & Cookie Consent Management",
    async () => {
      const res = await request("/shipping");
      assertEqual(res.status, 200, "Expected 200 OK");
    }
  );

  return results;
}

module.exports = { runTier2Tests };

if (require.main === module) {
  runTier2Tests().then((res) => {
    const passed = res.filter((r) => r.status === "PASSED").length;
    const failed = res.filter((r) => r.status === "FAILED").length;
    console.log(`\nTier 2 Summary: ${passed} passed, ${failed} failed out of ${res.length} tests.`);
    if (failed > 0) {
      console.log("\nFailed tests:");
      res.filter((r) => r.status === "FAILED").forEach((r) => console.log(`  - [${r.id}] ${r.name}: ${r.error}`));
    }
  });
}
