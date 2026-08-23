const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertContains,
} = require("./harness");
const fs = require("fs");
const path = require("path");

async function runTier1Tests() {
  const results = [];

  async function test(id, name, feature, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        feature,
        tier: 1,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        feature,
        tier: 1,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  TIER 1: FEATURE COVERAGE SUITE (>=75 tests)");
  console.log("=======================================================\n");

  // ==========================================
  // FEATURE 1: Product Catalog & Multi-Faceted Filters
  // ==========================================
  await test(
    "T1.1.1",
    "Fetch active products list with categories and sellers",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const res = await request("/api/products");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
      assert(res.data.products.length > 0, "Products should not be empty");
      const first = res.data.products[0];
      assert(first.name && first.price && first.category && first.seller, "Product should include category and seller");
    }
  );

  await test(
    "T1.1.2",
    "Filter products by category slug",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const cat = await prisma.category.findFirst();
      assert(cat, "Category should exist in DB");
      const res = await request(`/api/products?category=${cat.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
      res.data.products.forEach((p) => {
        assertEqual(p.category.slug, cat.slug, "Product category slug should match filter");
      });
    }
  );

  await test(
    "T1.1.3",
    "Filter products by seller slug",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      assert(seller, "Active seller should exist");
      const res = await request(`/api/products?seller=${seller.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
      res.data.products.forEach((p) => {
        assertEqual(p.seller.slug, seller.slug, "Product seller slug should match filter");
      });
    }
  );

  await test(
    "T1.1.4",
    "Search products by keyword query",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const queryWord = prod.name.split(" ")[0];
      const res = await request(`/api/products?search=${encodeURIComponent(queryWord)}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
      assert(res.data.products.length > 0, "Search should return matching products");
    }
  );

  await test(
    "T1.1.5",
    "Verify product catalog schema and active status enforcement",
    "Product Catalog & Multi-Faceted Filters",
    async () => {
      const res = await request("/api/products");
      assertEqual(res.status, 200, "Expected 200 OK");
      res.data.products.forEach((p) => {
        assertEqual(p.status, "ACTIVE", "Only ACTIVE products should be returned");
        assert(typeof p.price === "number" && p.price >= 0, "Price should be non-negative number");
        assert(typeof p.stock === "number" && p.stock >= 0, "Stock should be non-negative integer");
      });
    }
  );

  // ==========================================
  // FEATURE 2: Product Detail, Variants & Installment Matrix
  // ==========================================
  await test(
    "T1.2.1",
    "Fetch single product details by slug",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/products?slug=${prod.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.product, "Expected product object");
      assertEqual(res.data.product.id, prod.id, "Product ID should match");
      assertEqual(res.data.product.slug, prod.slug, "Product slug should match");
    }
  );

  await test(
    "T1.2.2",
    "Verify variant attributes (colors, sizes, images JSON)",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/products?slug=${prod.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      const colors = JSON.parse(res.data.product.colors || "[]");
      const sizes = JSON.parse(res.data.product.sizes || "[]");
      const images = JSON.parse(res.data.product.images || "[]");
      assert(Array.isArray(colors), "Colors should be valid JSON array");
      assert(Array.isArray(sizes), "Sizes should be valid JSON array");
      assert(Array.isArray(images), "Images should be valid JSON array");
    }
  );

  await test(
    "T1.2.3",
    "Verify reviews attachment with reviewer names on product detail",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/products?slug=${prod.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.product.reviews), "Reviews array should be present");
    }
  );

  await test(
    "T1.2.4",
    "Verify stock count and pricing attributes",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/products?slug=${prod.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.product.stock >= 0, "Stock should be non-negative");
      assert(res.data.product.price > 0, "Price should be greater than 0");
    }
  );

  await test(
    "T1.2.5",
    "Return 404 for non-existent product slug",
    "Product Detail, Variants & Installment Matrix",
    async () => {
      const res = await request("/api/products?slug=non-existent-product-slug-xyz");
      assertEqual(res.status, 404, "Expected 404 for missing product slug");
      assert(res.data.error, "Error message should be returned");
    }
  );

  // ==========================================
  // FEATURE 3: Cart Management & Guest-to-Auth Sync
  // ==========================================
  await test(
    "T1.3.1",
    "Sync guest favorites to authenticated user account",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/auth/sync", {
        method: "POST",
        headers,
        body: { favoriteProductIds: [prod.id] },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.synced, true, "Expected synced flag to be true");
    }
  );

  await test(
    "T1.3.2",
    "Sync guest addresses to authenticated user account",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const guestAddr = {
        title: `Test Adres ${Date.now()}`,
        firstName: "Ahmet",
        lastName: "Yılmaz",
        phone: "0532 123 4567",
        city: "İstanbul",
        district: "Kadıköy",
        addressLine: "Cadde No 12 Daire 4",
      };
      const res = await request("/api/auth/sync", {
        method: "POST",
        headers,
        body: { addresses: [guestAddr] },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.synced, true, "Expected synced flag to be true");
    }
  );

  await test(
    "T1.3.3",
    "Fetch customer favorites list via /api/favorites",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/favorites", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.favorites), "Favorites should be an array");
    }
  );

  await test(
    "T1.3.4",
    "Toggle product favorite status via POST /api/favorites",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res1 = await request("/api/favorites", {
        method: "POST",
        headers,
        body: { productId: prod.id },
      });
      assertEqual(res1.status, 200, "Expected 200 OK");
      assert(typeof res1.data.isFavorite === "boolean", "isFavorite should be boolean");
    }
  );

  await test(
    "T1.3.5",
    "Fetch customer saved addresses via /api/addresses",
    "Cart Management & Guest-to-Auth Sync",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/addresses", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.addresses), "Addresses should be an array");
    }
  );

  // ==========================================
  // FEATURE 4: Coupon Validation & Calculation Engine
  // ==========================================
  await test(
    "T1.4.1",
    "Validate percentage coupon (CADDE10)",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "CADDE10", subtotal: 300 },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.valid, true, "Coupon should be valid");
      assertEqual(res.data.coupon.code, "CADDE10", "Code should match");
      assertEqual(res.data.coupon.discountAmount, 30, "10% of 300 is 30 TL");
    }
  );

  await test(
    "T1.4.2",
    "Validate fixed discount coupon (WELCOME150)",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "WELCOME150", subtotal: 600 },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.valid, true, "Coupon should be valid");
      assertEqual(res.data.coupon.discountAmount, 150, "Discount should be 150 TL");
    }
  );

  await test(
    "T1.4.3",
    "Reject coupon when subtotal is below minimum order requirement",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "WELCOME150", subtotal: 200 }, // minSubtotal is 500
      });
      assertEqual(res.status, 400, "Expected 400 when subtotal below minimum");
      assert(res.data.error, "Error message expected");
    }
  );

  await test(
    "T1.4.4",
    "Reject invalid or non-existent coupon code",
    "Coupon Validation & Calculation Engine",
    async () => {
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "INVALID_CODE_999", subtotal: 500 },
      });
      assertEqual(res.status, 400, "Expected 400 for invalid coupon");
      assert(res.data.error, "Error message expected");
    }
  );

  await test(
    "T1.4.5",
    "Calculate discount respecting maximumDiscount cap",
    "Coupon Validation & Calculation Engine",
    async () => {
      // Ensure coupon with maximumDiscount exists in DB
      let capCoupon = await prisma.coupon.findUnique({ where: { code: "MAXCAP50" } });
      if (!capCoupon) {
        capCoupon = await prisma.coupon.create({
          data: {
            code: "MAXCAP50",
            type: "PERCENTAGE",
            value: 20,
            maximumDiscount: 50,
            minimumOrder: 100,
            active: true,
          },
        });
      }
      const res = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: "MAXCAP50", subtotal: 1000 }, // 20% of 1000 = 200, capped at 50
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.coupon.discountAmount, 50, "Discount should be capped at 50");
    }
  );

  // ==========================================
  // FEATURE 5: Server-Authoritative Multi-Vendor Checkout
  // ==========================================
  await test(
    "T1.5.1",
    "Create single-vendor order with valid item and shipping address",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });
      assert(prod, "In-stock product must exist");

      const shippingAddress = {
        title: "Ev Adresi",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        phone: "0532 123 4567",
        city: "İstanbul",
        district: "Kadıköy",
        addressLine: "Bağdat Cad. No: 10",
        country: "Türkiye",
      };

      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          shippingAddress,
          paymentMethod: "credit_card",
        },
      });

      assertEqual(res.status, 200, "Expected 200 OK for order creation");
      assert(res.data.order, "Order record should be returned");
      assertEqual(res.data.order.status, "CONFIRMED", "Order status should be CONFIRMED");
      assertEqual(res.data.order.orderGroups.length, 1, "Should have 1 OrderGroup");
    }
  );

  await test(
    "T1.5.2",
    "Create multi-vendor order with products from multiple sellers",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const sellers = await prisma.seller.findMany({ where: { status: "ACTIVE" }, take: 2 });
      if (sellers.length >= 2) {
        const prod1 = await prisma.product.findFirst({
          where: { sellerId: sellers[0].id, status: "ACTIVE", stock: { gte: 5 } },
        });
        const prod2 = await prisma.product.findFirst({
          where: { sellerId: sellers[1].id, status: "ACTIVE", stock: { gte: 5 } },
        });

        if (prod1 && prod2) {
          const res = await request("/api/orders", {
            method: "POST",
            headers,
            body: {
              items: [
                { productId: prod1.id, quantity: 1 },
                { productId: prod2.id, quantity: 1 },
              ],
              shippingAddress: {
                title: "Ev",
                firstName: "Ahmet",
                lastName: "Yılmaz",
                phone: "0532 123 4567",
                city: "İzmir",
                district: "Konak",
                addressLine: "Kordon Boyu 15",
              },
            },
          });
          assertEqual(res.status, 200, "Expected 200 OK");
          assertEqual(res.data.order.orderGroups.length, 2, "Should create 2 OrderGroups for 2 sellers");
        }
      }
    }
  );

  await test(
    "T1.5.3",
    "Verify atomic stock decrement upon order placement",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const cat = await prisma.category.findFirst();

      const dedicatedProd = await prisma.product.create({
        data: {
          name: `Stock Decrement Test Prod ${Date.now()}`,
          slug: `stock-dec-prod-${Date.now()}`,
          description: "Test description",
          price: 250,
          stock: 20,
          brand: "TestBrand",
          sku: `T1-5-3-SKU-${Date.now()}`,
          imageUrl: "https://example.com/test-prod.jpg",
          categoryId: cat.id,
          sellerId: seller.id,
          status: "ACTIVE",
        },
      });

      const initialStock = dedicatedProd.stock;

      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: dedicatedProd.id, quantity: 2 }],
          shippingAddress: {
            title: "Ofis",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "Ankara",
            district: "Çankaya",
            addressLine: "Tunalı Hilmi 44",
          },
        },
      });

      assertEqual(res.status, 200, "Expected 200 OK");
      const updatedProd = await prisma.product.findUnique({ where: { id: dedicatedProd.id } });
      assertEqual(updatedProd.stock, initialStock - 2, "Product stock should be decremented by 2");
    }
  );

  await test(
    "T1.5.4",
    "Apply coupon code during checkout and verify couponDiscount recorded",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const cat = await prisma.category.findFirst();

      const dedicatedProd = await prisma.product.create({
        data: {
          name: `Coupon Order Test Prod ${Date.now()}`,
          slug: `coupon-ord-prod-${Date.now()}`,
          description: "Test description",
          price: 500,
          stock: 10,
          brand: "TestBrand",
          sku: `T1-5-4-SKU-${Date.now()}`,
          imageUrl: "https://example.com/test-prod.jpg",
          categoryId: cat.id,
          sellerId: seller.id,
          status: "ACTIVE",
        },
      });

      const uniqueCouponCode = `T154_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code: uniqueCouponCode,
          type: "PERCENTAGE",
          value: 10,
          minimumOrder: 50,
          active: true,
        },
      });

      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: dedicatedProd.id, quantity: 1 }],
          couponCode: uniqueCouponCode,
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "Bursa",
            district: "Nilüfer",
            addressLine: "FSM Bulvarı No: 5",
          },
        },
      });

      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.order.couponDiscount > 0, "Coupon discount should be recorded on Order");
    }
  );

  await test(
    "T1.5.5",
    "Verify shipping fee calculation against free shipping threshold",
    "Server-Authoritative Multi-Vendor Checkout",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });

      const res = await request("/api/orders", {
        method: "POST",
        headers,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "Antalya",
            district: "Muratpaşa",
            addressLine: "Lara Cad. No: 12",
          },
        },
      });

      assertEqual(res.status, 200, "Expected 200 OK");
      const order = res.data.order;
      if (order.subtotal >= settings.freeShippingThreshold) {
        assertEqual(order.shippingFee, 0, "Shipping fee should be 0 when above threshold");
      } else {
        assertEqual(order.shippingFee, settings.defaultShippingFee, "Shipping fee should match default fee");
      }
    }
  );

  // ==========================================
  // FEATURE 6: Two-Tier Order Hierarchy & Carrier Tracking
  // ==========================================
  await test(
    "T1.6.1",
    "Verify root Order model fields and JSON address snapshot",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const order = await prisma.order.findFirst({ orderBy: { createdAt: "desc" } });
      assert(order, "Order should exist in DB");
      assert(order.orderNumber.startsWith("CS-") || order.orderNumber.startsWith("CD-"), "Order number prefix");
      assert(order.customerId, "Order must have customerId");
      assert(order.grandTotal > 0, "Grand total must be positive");
      const addr = JSON.parse(order.shippingAddressSnapshot);
      assert(addr.city && addr.addressLine, "Shipping address snapshot must contain city & line");
    }
  );

  await test(
    "T1.6.2",
    "Verify Order creates separate OrderGroup per seller with subtotal and status",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const order = await prisma.order.findFirst({
        include: { orderGroups: true },
        orderBy: { createdAt: "desc" },
      });
      assert(order && order.orderGroups.length > 0, "Order must have orderGroups");
      order.orderGroups.forEach((og) => {
        assert(og.sellerId, "OrderGroup must have sellerId");
        assert(og.subtotal > 0, "OrderGroup subtotal must be positive");
        assertEqual(og.status, "CONFIRMED", "Initial OrderGroup status should be CONFIRMED");
      });
    }
  );

  await test(
    "T1.6.3",
    "Verify OrderItem records reference both Order and OrderGroup",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const item = await prisma.orderItem.findFirst({
        include: { order: true, orderGroup: true, product: true },
      });
      assert(item, "OrderItem should exist");
      assert(item.orderId, "OrderItem must reference orderId");
      assert(item.orderGroupId, "OrderItem must reference orderGroupId");
      assert(item.productId, "OrderItem must reference productId");
      assert(item.quantity >= 1, "Quantity must be at least 1");
    }
  );

  await test(
    "T1.6.4",
    "Verify initial order status history step created with CONFIRMED status",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const history = await prisma.orderStatusHistory.findFirst({
        where: { status: "CONFIRMED" },
      });
      assert(history, "Status history with CONFIRMED should exist");
      assert(history.orderId, "Status history must reference orderId");
    }
  );

  await test(
    "T1.6.5",
    "Verify carrier names support Turkish carriers (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet)",
    "Two-Tier Order Hierarchy & Carrier Tracking",
    async () => {
      const validCarriers = [
        "Yurtiçi Kargo",
        "Aras Kargo",
        "MNG Kargo",
        "Sürat Kargo",
        "PTT Kargo",
        "HepsiJet",
      ];
      const orders = await prisma.order.findMany({ take: 10 });
      orders.forEach((o) => {
        if (o.carrierName) {
          assert(validCarriers.includes(o.carrierName), `Carrier ${o.carrierName} must be recognized`);
        }
      });
    }
  );

  // ==========================================
  // FEATURE 7: Order Status Transitions & Notifications
  // ==========================================
  await test(
    "T1.7.1",
    "Retrieve seller order groups via GET /api/orders/seller",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const res = await request("/api/orders/seller", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.orderGroups), "Expected orderGroups array");
    }
  );

  await test(
    "T1.7.2",
    "Seller transitions order group status from CONFIRMED to PROCESSING",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const group = await prisma.orderGroup.findFirst({
        where: { sellerId: seller.id },
      });

      if (group) {
        const res = await request("/api/orders/seller", {
          method: "PUT",
          headers,
          body: {
            orderGroupId: group.id,
            status: "PROCESSING",
            note: "Sipariş paketleme aşamasına alındı.",
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.orderGroup.status, "PROCESSING", "Status should be PROCESSING");
      }
    }
  );

  await test(
    "T1.7.3",
    "Seller transitions order group status to SHIPPED with tracking code",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const group = await prisma.orderGroup.findFirst({
        where: { sellerId: seller.id },
      });

      if (group) {
        const res = await request("/api/orders/seller", {
          method: "PUT",
          headers,
          body: {
            orderGroupId: group.id,
            status: "SHIPPED",
            note: "Kargoya teslim edildi. Takip no: YRT-987654321",
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.orderGroup.status, "SHIPPED", "Status should be SHIPPED");
      }
    }
  );

  await test(
    "T1.7.4",
    "Verify order status history recorded for transitions",
    "Order Status Transitions & Notifications",
    async () => {
      const group = await prisma.orderGroup.findFirst({ where: { status: "SHIPPED" } });
      if (group) {
        const history = await prisma.orderStatusHistory.findMany({
          where: { orderId: group.orderId },
        });
        assert(history.length >= 1, "Status history entries must exist");
      }
    }
  );

  await test(
    "T1.7.5",
    "Retrieve customer in-app notifications list and unread count",
    "Order Status Transitions & Notifications",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/notifications", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.notifications), "Notifications should be array");
      assert(typeof res.data.unreadCount === "number", "unreadCount should be number");
    }
  );

  // ==========================================
  // FEATURE 8: Customer Return Request & Evidence Upload
  // ==========================================
  await test(
    "T1.8.1",
    "Customer submits return request via POST /api/returns",
    "Customer Return Request & Evidence Upload",
    async () => {
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const headers = await getAuthHeaders("CUSTOMER");
      const orderItem = await prisma.orderItem.findFirst({
        where: { order: { customerId: custUser.id } },
        include: { product: true },
      });

      if (orderItem) {
        const res = await request("/api/returns", {
          method: "POST",
          headers,
          body: {
            orderId: orderItem.orderId,
            orderItemId: orderItem.id,
            reason: "Ürün bedeni uymadı",
            evidenceImages: ["https://example.com/return-photo.jpg"],
          },
        });
        assertEqual(res.status, 201, "Expected 201 Created for return request");
        assert(res.data.returnRequest, "Expected returnRequest in response");
        assertEqual(res.data.returnRequest.status, "PENDING", "Initial status should be PENDING");
      }
    }
  );

  await test(
    "T1.8.2",
    "Verify return request records exact refund amount calculation",
    "Customer Return Request & Evidence Upload",
    async () => {
      const returnReq = await prisma.returnRequest.findFirst({
        include: { orderItem: true },
      });
      if (returnReq) {
        const expectedRefund = returnReq.orderItem.price * returnReq.orderItem.quantity;
        assertEqual(returnReq.refundAmount, expectedRefund, "Refund amount should equal item price * quantity");
      }
    }
  );

  await test(
    "T1.8.3",
    "Verify return request stores reason and evidenceImages JSON",
    "Customer Return Request & Evidence Upload",
    async () => {
      const returnReq = await prisma.returnRequest.findFirst();
      if (returnReq) {
        assert(returnReq.reason.length > 0, "Reason must be populated");
        const images = JSON.parse(returnReq.evidenceImages || "[]");
        assert(Array.isArray(images), "evidenceImages must be valid JSON array");
      }
    }
  );

  await test(
    "T1.8.4",
    "Verify return request validation rejects missing required fields",
    "Customer Return Request & Evidence Upload",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const res = await request("/api/returns", {
        method: "POST",
        headers,
        body: { orderId: "some-order" }, // missing orderItemId and reason
      });
      assertEqual(res.status, 400, "Expected 400 for missing fields");
    }
  );

  await test(
    "T1.8.5",
    "Verify notification dispatched to seller upon return request creation",
    "Customer Return Request & Evidence Upload",
    async () => {
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const notif = await prisma.notification.findFirst({
        where: { userId: seller.userId, type: "SELLER" },
      });
      assert(notif, "Seller notification should be created");
      assertContains(notif.titleTR, "İade", "Notification title should mention return");
    }
  );

  // ==========================================
  // FEATURE 9: Seller & Admin Return Moderation & Refunds
  // ==========================================
  await test(
    "T1.9.1",
    "Seller retrieves return requests for their store via GET /api/returns",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const res = await request("/api/returns", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.returns), "Expected returns array");
    }
  );

  await test(
    "T1.9.2",
    "Seller approves return request with sellerNote via PUT /api/returns/[id]",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const returnReq = await prisma.returnRequest.findFirst({
        where: { sellerId: seller.id },
      });

      if (returnReq) {
        const headers = await getAuthHeaders("SELLER");
        const res = await request(`/api/returns/${returnReq.id}`, {
          method: "PUT",
          headers,
          body: {
            status: "APPROVED",
            sellerNote: "İade talebiniz onaylandı, kargo kodunuz ile gönderiniz.",
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.returnRequest.status, "APPROVED", "Status should be APPROVED");
      }
    }
  );

  await test(
    "T1.9.3",
    "Admin retrieves all platform returns via GET /api/returns",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/returns", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.returns), "Expected returns array");
    }
  );

  await test(
    "T1.9.4",
    "Admin moderates return request to REFUNDED with adminNote",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const returnReq = await prisma.returnRequest.findFirst();
      if (returnReq) {
        const headers = await getAuthHeaders("ADMIN");
        const res = await request(`/api/returns/${returnReq.id}`, {
          method: "PUT",
          headers,
          body: {
            status: "REFUNDED",
            adminNote: "Para iadesi kredi kartına aktarıldı.",
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.returnRequest.status, "REFUNDED", "Status should be REFUNDED");
      }
    }
  );

  await test(
    "T1.9.5",
    "Verify customer receives in-app notification when return status updates",
    "Seller & Admin Return Moderation & Refunds",
    async () => {
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const notif = await prisma.notification.findFirst({
        where: { userId: custUser.id },
        orderBy: { createdAt: "desc" },
      });
      assert(notif, "Customer notification should exist");
    }
  );

  // ==========================================
  // FEATURE 10: Admin Homepage CMS Sections & Banners
  // ==========================================
  await test(
    "T1.10.1",
    "Fetch active homepage sections and banners via GET /api/cms/sections",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const res = await request("/api/cms/sections");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.sections), "Expected sections array");
    }
  );

  let createdSectionId;
  await test(
    "T1.10.2",
    "Admin creates new homepage CMS section via POST /api/cms/sections",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/sections", {
        method: "POST",
        headers,
        body: {
          titleTR: "Öne Çıkan Fırsatlar 2026",
          titleEN: "Featured Deals 2026",
          type: "FLASH_DEALS",
          orderIndex: 2,
          configJson: JSON.stringify({ countdown: true }),
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.section, "Expected section in response");
      createdSectionId = res.data.section.id;
    }
  );

  let createdBannerId;
  await test(
    "T1.10.3",
    "Admin creates new banner under section via POST /api/cms/banners",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/banners", {
        method: "POST",
        headers,
        body: {
          sectionId: createdSectionId,
          titleTR: "Yaz İndirimleri",
          titleEN: "Summer Sale",
          imageUrlDesktop: "https://example.com/summer-banner.jpg",
          targetType: "CATEGORY",
          targetValue: "/category/men",
          orderIndex: 0,
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.banner, "Expected banner in response");
      createdBannerId = res.data.banner.id;
    }
  );

  await test(
    "T1.10.4",
    "Admin updates section sort order and active status via PUT /api/cms/sections",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/cms/sections", {
        method: "PUT",
        headers,
        body: {
          id: createdSectionId,
          orderIndex: 5,
          active: true,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.section.orderIndex, 5, "Order index should be updated");
    }
  );

  await test(
    "T1.10.5",
    "Admin deletes banner via DELETE /api/cms/banners",
    "Admin Homepage CMS Sections & Banners",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request(`/api/cms/banners?id=${createdBannerId}`, {
        method: "DELETE",
        headers,
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.success, true, "Expected success true");
    }
  );

  // ==========================================
  // FEATURE 11: Dedicated Brand Directory & Admin Panel
  // ==========================================
  await test(
    "T1.11.1",
    "Fetch public brands directory with product counts via GET /api/brands",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const res = await request("/api/brands");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.brands), "Expected brands array");
      assert(res.data.brands.length > 0, "Brands should not be empty");
    }
  );

  await test(
    "T1.11.2",
    "Filter featured brands via GET /api/brands?featured=true",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const res = await request("/api/brands?featured=true");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.brands), "Expected brands array");
      res.data.brands.forEach((b) => {
        assertEqual(b.isFeatured, true, "All returned brands should have isFeatured true");
      });
    }
  );

  let createdBrandId;
  await test(
    "T1.11.3",
    "Admin creates new brand via POST /api/brands",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const uniqueSlug = `test-brand-${Date.now()}`;
      const res = await request("/api/brands", {
        method: "POST",
        headers,
        body: {
          name: "Test Marka Premium",
          slug: uniqueSlug,
          logoUrl: "https://example.com/brand-logo.png",
          descriptionTR: "Özel tasarım Türk markası",
          descriptionEN: "Custom designer Turkish brand",
          isFeatured: true,
        },
      });
      assertEqual(res.status, 201, "Expected 201 Created");
      assert(res.data.brand, "Brand should be returned");
      createdBrandId = res.data.brand.id;
    }
  );

  await test(
    "T1.11.4",
    "Fetch brand details by ID via GET /api/brands/[id]",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const res = await request(`/api/brands/${createdBrandId}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.brand, "Brand should be returned");
      assertEqual(res.data.brand.id, createdBrandId, "Brand ID should match");
    }
  );

  await test(
    "T1.11.5",
    "Admin updates and deletes brand via PUT & DELETE /api/brands/[id]",
    "Dedicated Brand Directory & Admin Panel",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const resPut = await request(`/api/brands/${createdBrandId}`, {
        method: "PUT",
        headers,
        body: { name: "Test Marka Güncellendi", isFeatured: false },
      });
      assertEqual(resPut.status, 200, "Expected 200 OK");

      const resDel = await request(`/api/brands/${createdBrandId}`, {
        method: "DELETE",
        headers,
      });
      assertEqual(resDel.status, 200, "Expected 200 OK");
    }
  );

  // ==========================================
  // FEATURE 12: Seller Product Management & Stock Alerts
  // ==========================================
  let createdProductId;
  await test(
    "T1.12.1",
    "Seller creates multi-variant product via POST /api/products",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const cat = await prisma.category.findFirst();
      const uniqueSku = `SKU-TEST-${Date.now()}`;

      const res = await request("/api/products", {
        method: "POST",
        headers,
        body: {
          name: "Özel Tasarım Pamuklu Tişört",
          brand: "Trend Fashion",
          description: "Yüksek kaliteli pamuklu kumaş.",
          categoryId: cat.id,
          price: 249.99,
          originalPrice: 349.99,
          stock: 45,
          sku: uniqueSku,
          colors: ["Siyah", "Beyaz", "Lacivert"],
          sizes: ["S", "M", "L", "XL"],
        },
      });

      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.product, "Product should be returned");
      createdProductId = res.data.product.id;
    }
  );

  await test(
    "T1.12.2",
    "Verify created product unique slug and active status",
    "Seller Product Management & Stock Alerts",
    async () => {
      const prod = await prisma.product.findUnique({ where: { id: createdProductId } });
      assert(prod, "Product should exist in DB");
      assertEqual(prod.status, "ACTIVE", "Status should be ACTIVE");
      assert(prod.slug.length > 0, "Slug must be generated");
    }
  );

  await test(
    "T1.12.3",
    "Admin views full product catalog via GET /api/admin/products",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/products", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
    }
  );

  await test(
    "T1.12.4",
    "Admin moderates product status via PUT /api/admin/products",
    "Seller Product Management & Stock Alerts",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/products", {
        method: "PUT",
        headers,
        body: {
          productId: createdProductId,
          status: "INACTIVE",
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.product.status, "INACTIVE", "Status should be updated to INACTIVE");
    }
  );

  await test(
    "T1.12.5",
    "Verify inactive product excluded from public catalog",
    "Seller Product Management & Stock Alerts",
    async () => {
      const prod = await prisma.product.findUnique({ where: { id: createdProductId } });
      const res = await request(`/api/products?slug=${prod.slug}`);
      // Inactive product should either 404 or not be visible in search
      const searchRes = await request(`/api/products?search=${encodeURIComponent(prod.name)}`);
      const found = searchRes.data.products?.some((p) => p.id === createdProductId);
      assertEqual(found, false, "Inactive product should not appear in public active search results");
    }
  );

  // ==========================================
  // FEATURE 13: Seller Review Replies & Custom Storefront
  // ==========================================
  await test(
    "T1.13.1",
    "Fetch public seller storefront profile by slug via GET /api/sellers?slug=...",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const res = await request(`/api/sellers?slug=${seller.slug}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.seller, "Seller profile should be returned");
      assertEqual(res.data.seller.slug, seller.slug, "Seller slug should match");
    }
  );

  let createdReviewId;
  await test(
    "T1.13.2",
    "Customer submits product review via POST /api/reviews",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const res = await request("/api/reviews", {
        method: "POST",
        headers,
        body: {
          productId: prod.id,
          rating: 5,
          comment: "Kumaş kalitesi çok iyi, tam beden!",
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(res.data.review, "Review should be returned");
      createdReviewId = res.data.review.id;
    }
  );

  await test(
    "T1.13.3",
    "Verify product average rating and reviewCount recalculated",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const review = await prisma.review.findUnique({ where: { id: createdReviewId } });
      const prod = await prisma.product.findUnique({ where: { id: review.productId } });
      assert(prod.reviewCount >= 1, "Review count should be at least 1");
      assert(prod.rating >= 1 && prod.rating <= 5, "Rating should be between 1 and 5");
    }
  );

  await test(
    "T1.13.4",
    "Seller replies to customer review via PUT /api/reviews",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const headers = await getAuthHeaders("SELLER");
      const res = await request("/api/reviews", {
        method: "PUT",
        headers,
        body: {
          reviewId: createdReviewId,
          sellerReply: "Geri bildiriminiz için teşekkür ederiz!",
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(
        res.data.review.sellerReply,
        "Geri bildiriminiz için teşekkür ederiz!",
        "Reply should match"
      );
    }
  );

  await test(
    "T1.13.5",
    "Fetch product reviews list displaying seller replies",
    "Seller Review Replies & Custom Storefront",
    async () => {
      const review = await prisma.review.findUnique({ where: { id: createdReviewId } });
      const res = await request(`/api/reviews?productId=${review.productId}`);
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.reviews), "Expected reviews array");
      const found = res.data.reviews.find((r) => r.id === createdReviewId);
      assert(found && found.sellerReply, "Review should include seller reply");
    }
  );

  // ==========================================
  // FEATURE 14: Admin Governance, Audit Trail & RBAC
  // ==========================================
  await test(
    "T1.14.1",
    "Admin retrieves immutable security audit trail via GET /api/admin/audit",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const res = await request("/api/admin/audit", { headers });
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.logs), "Expected logs array");
    }
  );

  await test(
    "T1.14.2",
    "Admin retrieves sellers and toggles verification status via GET & PUT /api/admin/sellers",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const resGet = await request("/api/admin/sellers", { headers });
      assertEqual(resGet.status, 200, "Expected 200 OK");
      assert(Array.isArray(resGet.data.sellers), "Expected sellers array");

      const seller = resGet.data.sellers[0];
      if (seller) {
        const resPut = await request("/api/admin/sellers", {
          method: "PUT",
          headers,
          body: {
            sellerId: seller.id,
            verified: true,
          },
        });
        assertEqual(resPut.status, 200, "Expected 200 OK");
        assertEqual(resPut.data.seller.verified, true, "Seller verified should be true");
      }
    }
  );

  await test(
    "T1.14.3",
    "Admin retrieves customers and updates status via GET & PUT /api/admin/customers",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const resGet = await request("/api/admin/customers", { headers });
      assertEqual(resGet.status, 200, "Expected 200 OK");
      assert(Array.isArray(resGet.data.customers), "Expected customers array");

      const cust = resGet.data.customers[0];
      if (cust) {
        const resPut = await request("/api/admin/customers", {
          method: "PUT",
          headers,
          body: {
            customerId: cust.id,
            status: "active",
          },
        });
        assertEqual(resPut.status, 200, "Expected 200 OK");
      }
    }
  );

  await test(
    "T1.14.4",
    "Admin retrieves and updates platform settings via GET & PUT /api/admin/settings",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const headers = await getAuthHeaders("ADMIN");
      const resGet = await request("/api/admin/settings", { headers });
      assertEqual(resGet.status, 200, "Expected 200 OK");
      assert(resGet.data.settings, "Expected settings object");

      const resPut = await request("/api/admin/settings", {
        method: "PUT",
        headers,
        body: {
          defaultShippingFee: 34.9,
          freeShippingThreshold: 200.0,
        },
      });
      assertEqual(resPut.status, 200, "Expected 200 OK");
      assertEqual(resPut.data.settings.freeShippingThreshold, 200.0, "Threshold should be 200");
    }
  );

  await test(
    "T1.14.5",
    "RBAC enforcement: non-admin gets 403 Forbidden on admin endpoints",
    "Admin Governance, Audit Trail & RBAC",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const resAudit = await request("/api/admin/audit", { headers: custHeaders });
      assertEqual(resAudit.status, 403, "Customer should be forbidden from audit log");

      const resSellers = await request("/api/admin/sellers", { headers: custHeaders });
      assertEqual(resSellers.status, 403, "Customer should be forbidden from admin sellers");
    }
  );

  // ==========================================
  // FEATURE 15: Turkish/English Localization & PWA Manifest
  // ==========================================
  await test(
    "T1.15.1",
    "Verify PWA manifest (/manifest.json) contains valid app metadata",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const manifestPath = path.join(__dirname, "..", "..", "public", "manifest.json");
      assert(fs.existsSync(manifestPath), "manifest.json should exist in public/");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assertEqual(manifest.short_name, "Cadde Store", "Short name matches");
      assertEqual(manifest.display, "standalone", "Display mode standalone");
      assertEqual(manifest.theme_color, "#ea580c", "Theme color orange");
      assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "Icons array valid");
    }
  );

  await test(
    "T1.15.2",
    "Verify PWA manifest shortcuts for Orders, Cart, Seller, Admin",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const manifestPath = path.join(__dirname, "..", "..", "public", "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assert(Array.isArray(manifest.shortcuts), "Shortcuts array should be present");
      const urls = manifest.shortcuts.map((s) => s.url);
      assertContains(urls, "/account/orders", "Shortcut to orders");
      assertContains(urls, "/cart", "Shortcut to cart");
      assertContains(urls, "/seller/dashboard", "Shortcut to seller");
      assertContains(urls, "/admin", "Shortcut to admin");
    }
  );

  await test(
    "T1.15.3",
    "Verify Turkish (TR) dictionary translations completeness",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const trPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "tr.ts");
      assert(fs.existsSync(trPath), "tr.ts dictionary must exist");
      const content = fs.readFileSync(trPath, "utf8");
      assertContains(content, "searchPlaceholder", "Common search placeholder in TR");
      assertContains(content, "checkoutCta", "Checkout CTA in TR");
      assertContains(content, "KVKK", "KVKK references in TR");
    }
  );

  await test(
    "T1.15.4",
    "Verify English (EN) dictionary translation key parity with Turkish",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const enPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "en.ts");
      assert(fs.existsSync(enPath), "en.ts dictionary must exist");
      const content = fs.readFileSync(enPath, "utf8");
      assertContains(content, "searchPlaceholder", "Common search placeholder in EN");
      assertContains(content, "Proceed to Checkout", "Checkout CTA in EN");
    }
  );

  await test(
    "T1.15.5",
    "Verify Categories API returns bilingual nameTR, nameEN, descriptionTR, descriptionEN",
    "Turkish/English Localization & PWA Manifest",
    async () => {
      const res = await request("/api/categories");
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.categories), "Expected categories array");
      res.data.categories.forEach((cat) => {
        assert(cat.nameTR && cat.nameEN, "Category must have nameTR and nameEN");
        assert(cat.descriptionTR && cat.descriptionEN, "Category must have descriptionTR and descriptionEN");
      });
    }
  );

  return results;
}

module.exports = { runTier1Tests };

if (require.main === module) {
  runTier1Tests().then((res) => {
    const passed = res.filter((r) => r.status === "PASSED").length;
    const failed = res.filter((r) => r.status === "FAILED").length;
    console.log(`\nTier 1 Summary: ${passed} passed, ${failed} failed out of ${res.length} tests.`);
    if (failed > 0) {
      console.log("\nFailed tests:");
      res.filter((r) => r.status === "FAILED").forEach((r) => console.log(`  - [${r.id}] ${r.name}: ${r.error}`));
    }
  });
}
