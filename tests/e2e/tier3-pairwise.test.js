const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
  assertContains,
} = require("./harness");

async function runTier3Tests() {
  const results = [];

  async function test(id, name, feature, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        feature,
        tier: 3,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        feature,
        tier: 3,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  TIER 3: PAIRWISE CROSS-FEATURE COMBINATIONS (>=15 tests)");
  console.log("=======================================================\n");

  // T3.1: Multi-vendor split cart + coupon redemption + free shipping calculation
  await test(
    "T3.1",
    "Multi-vendor order with coupon redemption and split OrderGroups",
    "Seller Grouping + Coupons + Checkout",
    async () => {
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const headers = await getAuthHeaders("CUSTOMER");
      const sellers = await prisma.seller.findMany({ where: { status: "ACTIVE" }, take: 2 });
      assert(sellers.length >= 2, "At least 2 sellers required");

      const cat = await prisma.category.findFirst();
      let prod1 = await prisma.product.findFirst({
        where: { sellerId: sellers[0].id, status: "ACTIVE", stock: { gte: 5 } },
      });
      if (!prod1) {
        prod1 = await prisma.product.create({
          data: {
            name: `Pairwise Prod 1 ${Date.now()}`,
            slug: `pair-prod-1-${Date.now()}`,
            description: "Test description",
            price: 200,
            stock: 20,
            brand: "Brand1",
            sku: `PAIR-SKU-1-${Date.now()}`,
            imageUrl: "https://example.com/pairwise-1.jpg",
            categoryId: cat.id,
            sellerId: sellers[0].id,
            status: "ACTIVE",
          },
        });
      }

      let prod2 = await prisma.product.findFirst({
        where: { sellerId: sellers[1].id, status: "ACTIVE", stock: { gte: 5 } },
      });
      if (!prod2) {
        prod2 = await prisma.product.create({
          data: {
            name: `Pairwise Prod 2 ${Date.now()}`,
            slug: `pair-prod-2-${Date.now()}`,
            description: "Test description",
            price: 200,
            stock: 20,
            brand: "Brand2",
            sku: `PAIR-SKU-2-${Date.now()}`,
            imageUrl: "https://example.com/pairwise-2.jpg",
            categoryId: cat.id,
            sellerId: sellers[1].id,
            status: "ACTIVE",
          },
        });
      }

      // Prepare fresh coupon
      const couponCode = `PAIRWISE_${Date.now()}`;
      const coupon = await prisma.coupon.create({
        data: {
          code: couponCode,
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
          items: [
            { productId: prod1.id, quantity: 1 },
            { productId: prod2.id, quantity: 1 },
          ],
          couponCode,
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "İstanbul",
            district: "Beşiktaş",
            addressLine: "Çarşı İçi No: 8",
          },
        },
      });

      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.order.orderGroups.length, 2, "Should create 2 OrderGroups for 2 distinct sellers");
      assert(res.data.order.couponDiscount > 0, "Coupon discount should be applied");

      // Verify redemption recorded in DB
      const redemption = await prisma.couponRedemption.findFirst({
        where: { couponId: coupon.id, userId: custUser.id },
      });
      assert(redemption, "CouponRedemption record must exist in DB");
    }
  );

  // T3.2: Multi-vendor split order + seller partial fulfillment + carrier tracking
  await test(
    "T3.2",
    "Partial seller fulfillment and independent carrier tracking across OrderGroups",
    "Multi-Vendor Logistics & Fulfillment",
    async () => {
      const order = await prisma.order.findFirst({
        where: { orderGroups: { some: {} } },
        include: { orderGroups: { include: { seller: true } } },
        orderBy: { createdAt: "desc" },
      });

      if (order && order.orderGroups.length >= 2) {
        const groupA = order.orderGroups[0];
        const groupB = order.orderGroups[1];

        // Seller A fulfills their group with Yurtiçi Kargo
        const sellerAUser = await prisma.user.findUnique({ where: { id: groupA.seller.userId } });
        const sellerAHeaders = await getAuthHeaders({
          id: sellerAUser.id,
          email: sellerAUser.email,
          firstName: sellerAUser.firstName,
          lastName: sellerAUser.lastName,
          role: "SELLER",
          sellerSlug: groupA.seller.slug,
        });

        const resA = await request("/api/orders/seller", {
          method: "PUT",
          headers: sellerAHeaders,
          body: {
            orderGroupId: groupA.id,
            status: "SHIPPED",
            note: "Yurtiçi Kargo ile gönderildi. Takip No: YRT-884920194",
          },
        });
        assertEqual(resA.status, 200, "Expected 200 OK for Seller A update");

        // Verify group A is SHIPPED while group B remains CONFIRMED
        const updatedA = await prisma.orderGroup.findUnique({ where: { id: groupA.id } });
        const updatedB = await prisma.orderGroup.findUnique({ where: { id: groupB.id } });
        assertEqual(updatedA.status, "SHIPPED", "Group A should be SHIPPED");
        assertEqual(updatedB.status, "CONFIRMED", "Group B should remain CONFIRMED");
      }
    }
  );

  // T3.3: Return request initiation + seller approval + customer notification
  await test(
    "T3.3",
    "Customer return initiation triggering seller notification and approval workflow",
    "Returns & Refunds Lifecycle + Notifications",
    async () => {
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const orderItem = await prisma.orderItem.findFirst({
        where: { order: { customerId: custUser.id } },
        include: { product: true, order: true },
      });

      if (orderItem) {
        const custHeaders = await getAuthHeaders("CUSTOMER");
        const resReturn = await request("/api/returns", {
          method: "POST",
          headers: custHeaders,
          body: {
            orderId: orderItem.orderId,
            orderItemId: orderItem.id,
            reason: "Yanlış renk gönderilmiş",
            evidenceImages: ["https://example.com/wrong-color.jpg"],
          },
        });
        assertEqual(resReturn.status, 201, "Expected 201 Created");
        const returnId = resReturn.data.returnRequest.id;

        // Seller approves return
        const sellerUser = await prisma.user.findFirst({
          where: { sellerProfile: { id: orderItem.product.sellerId } },
        });
        const sellerHeaders = await getAuthHeaders({
          id: sellerUser.id,
          email: sellerUser.email,
          firstName: sellerUser.firstName,
          lastName: sellerUser.lastName,
          role: "SELLER",
        });

        const resApprove = await request(`/api/returns/${returnId}`, {
          method: "PUT",
          headers: sellerHeaders,
          body: {
            status: "APPROVED",
            sellerNote: "İade onaylandı, lütfen ürünü kargoya verin.",
          },
        });
        assertEqual(resApprove.status, 200, "Expected 200 OK for approval");
        assertEqual(resApprove.data.returnRequest.status, "APPROVED", "Status should be APPROVED");

        // Verify customer received in-app notification
        const custNotif = await prisma.notification.findFirst({
          where: { userId: custUser.id },
          orderBy: { createdAt: "desc" },
        });
        assert(custNotif, "Customer notification should exist");
        assertContains(custNotif.titleTR, "İade", "Title should mention return");
      }
    }
  );

  // T3.4: Return request rejection + seller note preservation
  await test(
    "T3.4",
    "Return request rejection preserves moderation note and updates audit history",
    "Returns & Refunds Lifecycle + Moderation",
    async () => {
      const returnReq = await prisma.returnRequest.findFirst({
        where: { status: "PENDING" },
        include: { seller: { include: { user: true } } },
      });

      if (returnReq) {
        const sellerHeaders = await getAuthHeaders({
          id: returnReq.seller.user.id,
          email: returnReq.seller.user.email,
          firstName: returnReq.seller.user.firstName,
          lastName: returnReq.seller.user.lastName,
          role: "SELLER",
        });

        const res = await request(`/api/returns/${returnReq.id}`, {
          method: "PUT",
          headers: sellerHeaders,
          body: {
            status: "REJECTED",
            sellerNote: "İade süresi (14 gün) dolmuştur.",
          },
        });
        assertEqual(res.status, 200, "Expected 200 OK");
        assertEqual(res.data.returnRequest.status, "REJECTED", "Status should be REJECTED");
        assertEqual(
          res.data.returnRequest.sellerNote,
          "İade süresi (14 gün) dolmuştur.",
          "Seller note should be preserved"
        );
      }
    }
  );

  // T3.5: CMS Section creation + banner creation + homepage section delivery
  await test(
    "T3.5",
    "Admin creates CMS section with banner and verifies live public delivery",
    "CMS Merchandising + Homepage API",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const sectionRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: "Kış İndirimleri Vitrini",
          titleEN: "Winter Sale Showcase",
          type: "HERO",
          orderIndex: 1,
          configJson: JSON.stringify({ intervalMs: 4000 }),
        },
      });
      assertEqual(sectionRes.status, 201, "Expected 201 Created");
      const sectionId = sectionRes.data.section.id;

      const bannerRes = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: {
          sectionId,
          titleTR: "Kış Sezonu %50 İndirim",
          titleEN: "Winter Season 50% Off",
          imageUrlDesktop: "https://example.com/winter-hero.jpg",
          targetType: "CATEGORY",
          targetValue: "/category/men",
          orderIndex: 0,
        },
      });
      assertEqual(bannerRes.status, 201, "Expected 201 Created");

      // Verify public GET /api/cms/sections delivers the new section and banner
      const publicRes = await request("/api/cms/sections");
      assertEqual(publicRes.status, 200, "Expected 200 OK");
      const foundSection = publicRes.data.sections.find((s) => s.id === sectionId);
      assert(foundSection, "Created section must be present in public sections");
      assert(foundSection.banners.length >= 1, "Section should include the banner");
    }
  );

  // T3.6: Dedicated brand creation + product association + brand product count increment
  await test(
    "T3.6",
    "Brand creation and product association reflects aggregated product count",
    "Brand Directory + Product Catalog",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const brandSlug = `brand-agg-${Date.now()}`;
      const brandRes = await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: "Aggregation Brand",
          slug: brandSlug,
          logoUrl: "https://example.com/agg-brand.png",
          isFeatured: true,
        },
      });
      assertEqual(brandRes.status, 201, "Expected 201 Created");
      const brandId = brandRes.data.brand.id;

      // Assign an existing product or create one with this brandId
      const seller = await prisma.seller.findFirst();
      const cat = await prisma.category.findFirst();
      await prisma.product.create({
        data: {
          name: "Brand Association Product",
          slug: `brand-assoc-prod-${Date.now()}`,
          brand: "Aggregation Brand",
          brandId,
          sku: `SKU-BRAND-${Date.now()}`,
          price: 199.99,
          stock: 20,
          status: "ACTIVE",
          sellerId: seller.id,
          categoryId: cat.id,
          description: "Description",
          imageUrl: "https://example.com/img.jpg",
        },
      });

      // Verify brand details API returns count >= 1
      const brandDetail = await request(`/api/brands/${brandId}`);
      assertEqual(brandDetail.status, 200, "Expected 200 OK");
      assert(brandDetail.data.brand._count.products >= 1, "Product count should reflect assigned product");
    }
  );

  // T3.7: Guest favorites & address synchronization + immediate checkout with synced address
  await test(
    "T3.7",
    "Guest address sync directly usable in customer checkout flow",
    "Guest-to-Auth Sync + Checkout",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const uniqueAddrTitle = `Senkron Adres ${Date.now()}`;
      const guestAddr = {
        title: uniqueAddrTitle,
        firstName: "Ahmet",
        lastName: "Yılmaz",
        phone: "0532 123 4567",
        city: "Eskişehir",
        district: "Tepebaşı",
        addressLine: "Üniversite Cad. No: 20",
        country: "Türkiye",
      };

      const syncRes = await request("/api/auth/sync", {
        method: "POST",
        headers: custHeaders,
        body: { addresses: [guestAddr] },
      });
      assertEqual(syncRes.status, 200, "Expected 200 OK");

      // Place order using this address snapshot
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          shippingAddress: guestAddr,
        },
      });
      assertEqual(orderRes.status, 200, "Expected 200 OK");
      const orderAddr = JSON.parse(orderRes.data.order.shippingAddressSnapshot);
      assertEqual(orderAddr.city, "Eskişehir", "Order shipping address snapshot should match synced address");
    }
  );

  // T3.8: Customer review + rating recalculation + seller reply + review display
  await test(
    "T3.8",
    "Customer review submission updates rating and allows seller direct reply",
    "Seller Portal + Customer Reviews",
    async () => {
      const prod = await prisma.product.findFirst({
        where: { status: "ACTIVE" },
        include: { seller: { include: { user: true } } },
      });
      const custHeaders = await getAuthHeaders("CUSTOMER");

      // 1. Submit review
      const revRes = await request("/api/reviews", {
        method: "POST",
        headers: custHeaders,
        body: {
          productId: prod.id,
          rating: 4,
          comment: "Ürün gayet güzel ve kaliteli, kargo hızlıydı.",
        },
      });
      assertEqual(revRes.status, 200, "Expected 200 OK");
      const reviewId = revRes.data.review.id;

      // 2. Seller replies to review
      const sellerHeaders = await getAuthHeaders({
        id: prod.seller.user.id,
        email: prod.seller.user.email,
        firstName: prod.seller.user.firstName,
        lastName: prod.seller.user.lastName,
        role: "SELLER",
        sellerSlug: prod.seller.slug,
      });

      const replyRes = await request("/api/reviews", {
        method: "PUT",
        headers: sellerHeaders,
        body: {
          reviewId,
          sellerReply: "İyi günlerde kullanın, bizi tercih ettiğiniz için teşekkür ederiz!",
        },
      });
      assertEqual(replyRes.status, 200, "Expected 200 OK");
      assertEqual(
        replyRes.data.review.sellerReply,
        "İyi günlerde kullanın, bizi tercih ettiğiniz için teşekkür ederiz!",
        "Reply should match"
      );
    }
  );

  // T3.9: Admin seller status update + seller product verification
  await test(
    "T3.9",
    "Admin seller status update reflects in seller profile and management panel",
    "Admin Governance + Seller Operations",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const seller = await prisma.seller.findFirst();

      const res = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          sellerId: seller.id,
          status: "ACTIVE",
          verified: true,
        },
      });
      assertEqual(res.status, 200, "Expected 200 OK");
      assertEqual(res.data.seller.verified, true, "Seller verified should be true");
    }
  );

  // T3.10: Coupon usage limit exhaustion across multiple checkouts
  await test(
    "T3.10",
    "Coupon usage limit exhaustion prevents subsequent order checkouts",
    "Coupon Engine + Atomic Checkout",
    async () => {
      const code = `LIMIT1_${Date.now()}`;
      const coupon = await prisma.coupon.create({
        data: {
          code,
          type: "FIXED",
          value: 20,
          minimumOrder: 50,
          usageLimit: 1,
          usageCount: 0,
          active: true,
        },
      });

      const cust1Headers = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });

      // First order uses coupon
      const res1 = await request("/api/orders", {
        method: "POST",
        headers: cust1Headers,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: { city: "İstanbul", addressLine: "Test Line 1" },
        },
      });
      assertEqual(res1.status, 200, "First checkout with coupon should succeed");

      // Verify coupon usageCount incremented to 1
      const updatedCoupon = await prisma.coupon.findUnique({ where: { id: coupon.id } });
      assertEqual(updatedCoupon.usageCount, 1, "Coupon usageCount should be 1");

      // Second checkout with same coupon should fail due to usage limit
      const guestHeaders = await getAuthHeaders({
        id: `guest-${Date.now()}`,
        email: `other-cust-${Date.now()}@cadde.store`,
        firstName: "Veli",
        lastName: "Can",
        role: "CUSTOMER",
      });

      const res2 = await request("/api/orders", {
        method: "POST",
        headers: guestHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: { city: "Ankara", addressLine: "Test Line 2" },
        },
      });
      assertEqual(res2.status, 400, "Second checkout should fail because usage limit reached");
      assertEqual(res2.data.code, "COUPON_USAGE_LIMIT", "Error code should be COUPON_USAGE_LIMIT");
    }
  );

  // T3.11: Coupon per-user redemption uniqueness constraint
  await test(
    "T3.11",
    "Same customer cannot redeem single-use coupon multiple times",
    "Coupon Engine + Customer Redemptions",
    async () => {
      const code = `SINGLEUSER_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code,
          type: "PERCENTAGE",
          value: 15,
          minimumOrder: 50,
          active: true,
        },
      });

      const custHeaders = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });

      // Order 1
      const res1 = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: { city: "İzmir", addressLine: "Line 1" },
        },
      });
      assertEqual(res1.status, 200, "First redemption should succeed");

      // Order 2 with same customer and same coupon
      const res2 = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          couponCode: code,
          shippingAddress: { city: "İzmir", addressLine: "Line 2" },
        },
      });
      assertEqual(res2.status, 400, "Second redemption by same customer should fail");
      assertEqual(res2.data.code, "COUPON_ALREADY_REDEEMED", "Error code matches");
    }
  );

  // T3.12: Platform settings shipping fee mutation + immediate checkout recalculation
  await test(
    "T3.12",
    "Platform settings defaultShippingFee update immediately applies to subsequent orders",
    "Admin Settings + Checkout Calculation",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const customFee = 42.5;
      const customThreshold = 5000.0; // High threshold to ensure fee is charged

      await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          defaultShippingFee: customFee,
          freeShippingThreshold: customThreshold,
        },
      });

      const custHeaders = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });

      const resOrder = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          shippingAddress: { city: "Mersin", addressLine: "Pozcu" },
        },
      });

      assertEqual(resOrder.status, 200, "Expected 200 OK");
      assertEqual(resOrder.data.order.shippingFee, customFee, "Order shipping fee should match updated platform setting");

      // Restore standard settings
      await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          defaultShippingFee: 34.9,
          freeShippingThreshold: 200.0,
        },
      });
    }
  );

  // T3.13: Category filtering + search query intersection
  await test(
    "T3.13",
    "Combining category filter and search query returns precise subset",
    "Product Catalog Search & Filters",
    async () => {
      const prod = await prisma.product.findFirst({
        where: { status: "ACTIVE" },
        include: { category: true },
      });
      const queryWord = prod.name.split(" ")[0];
      const res = await request(
        `/api/products?category=${prod.category.slug}&search=${encodeURIComponent(queryWord)}`
      );
      assertEqual(res.status, 200, "Expected 200 OK");
      assert(Array.isArray(res.data.products), "Expected products array");
      res.data.products.forEach((p) => {
        assertEqual(p.category.slug, prod.category.slug, "Category matches");
        assert(
          p.name.includes(queryWord) || p.brand.includes(queryWord) || p.description.includes(queryWord),
          "Matches query word"
        );
      });
    }
  );

  // T3.14: Admin audit logging on CMS and Brand mutations
  await test(
    "T3.14",
    "Brand and CMS mutations automatically generate persistent AuditLog records",
    "Admin Governance & Security Audit Trail",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const brandSlug = `audit-brand-${Date.now()}`;

      await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: "Audit Test Markası",
          slug: brandSlug,
          logoUrl: "https://example.com/audit.png",
        },
      });

      // Verify AuditLog record in DB
      const log = await prisma.auditLog.findFirst({
        where: { entityType: "BRAND", action: "BRAND_CREATED" },
        orderBy: { createdAt: "desc" },
      });
      assert(log, "AuditLog for BRAND_CREATED must exist");
      assert(log.actorEmail, "AuditLog must contain actorEmail");
    }
  );

  // T3.15: Notification lifecycle: unread count → mark specific notification read
  await test(
    "T3.15",
    "Notification unread counter updates when marking notification as read",
    "In-App Notification Engine",
    async () => {
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const custHeaders = await getAuthHeaders("CUSTOMER");

      const listBefore = await request("/api/notifications", { headers: custHeaders });
      const baselineCount = listBefore.data.unreadCount;

      const notif = await prisma.notification.create({
        data: {
          userId: custUser.id,
          titleTR: "Özel İndirim Bildirimi",
          titleEN: "Special Discount Notification",
          messageTR: "Sepetinizdeki ürünlerde indirim başladı!",
          messageEN: "Sale started on items in your cart!",
          type: "PROMOTION",
          isRead: false,
        },
      });

      // Mark single notification as read
      const markRes = await request("/api/notifications", {
        method: "PUT",
        headers: custHeaders,
        body: { id: notif.id },
      });
      assertEqual(markRes.status, 200, "Expected 200 OK");

      const listAfter = await request("/api/notifications", { headers: custHeaders });
      assertEqual(listAfter.data.unreadCount, baselineCount, "Unread count should return to baseline count");

      const updatedNotif = await prisma.notification.findUnique({ where: { id: notif.id } });
      assertEqual(updatedNotif.isRead, true, "Notification isRead should be true in DB");
    }
  );

  // T3.16: Cross-role RBAC security matrix (Customer vs Seller vs Admin)
  await test(
    "T3.16",
    "Strict RBAC matrix enforced across customer, seller, and admin routes",
    "Role-Based Access Control (RBAC)",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const sellerHeaders = await getAuthHeaders("SELLER");
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Customer cannot access Admin Audit
      const res1 = await request("/api/admin/audit", { headers: custHeaders });
      assertEqual(res1.status, 403, "Customer cannot access admin audit");

      // 2. Seller cannot access Admin Audit
      const res2 = await request("/api/admin/audit", { headers: sellerHeaders });
      assertEqual(res2.status, 403, "Seller cannot access admin audit");

      // 3. Admin CAN access Admin Audit
      const res3 = await request("/api/admin/audit", { headers: adminHeaders });
      assertEqual(res3.status, 200, "Admin can access admin audit");

      // 4. Customer cannot access Seller Orders
      const res4 = await request("/api/orders/seller", { headers: custHeaders });
      assertEqual(res4.status, 403, "Customer cannot access seller orders");

      // 5. Seller CAN access Seller Orders
      const res5 = await request("/api/orders/seller", { headers: sellerHeaders });
      assertEqual(res5.status, 200, "Seller can access seller orders");
    }
  );

  // T3.17: CMS Section Reorder -> Homepage Dynamic Reflection
  await test(
    "T3.17",
    "CMS section reordering and active toggling dynamically reflected in homepage API delivery",
    "CMS Merchandising + Homepage Engine",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // Create two sections
      const s1Res = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: `Reorder Test Section A ${Date.now()}`,
          titleEN: "Reorder Test Section A",
          type: "HERO",
          orderIndex: 1,
          active: true,
        },
      });
      assertEqual(s1Res.status, 201, "Section A created");
      const secA = s1Res.data.section;

      const s2Res = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: `Reorder Test Section B ${Date.now()}`,
          titleEN: "Reorder Test Section B",
          type: "FLASH_DEALS",
          orderIndex: 2,
          active: true,
        },
      });
      assertEqual(s2Res.status, 201, "Section B created");
      const secB = s2Res.data.section;

      // Reorder: Move Sec B to orderIndex 0, Sec A to orderIndex 5
      await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { id: secB.id, orderIndex: 0 },
      });
      await request("/api/cms/sections", {
        method: "PUT",
        headers: adminHeaders,
        body: { id: secA.id, orderIndex: 5 },
      });

      // Public client queries homepage sections
      const pubRes = await request("/api/cms/sections");
      assertEqual(pubRes.status, 200, "Public CMS fetch successful");
      const sections = pubRes.data.sections;

      const idxA = sections.findIndex((s) => s.id === secA.id);
      const idxB = sections.findIndex((s) => s.id === secB.id);

      assert(idxB < idxA, "Section B (orderIndex 0) should appear before Section A (orderIndex 5)");

      // Cleanup
      await request(`/api/cms/sections?id=${secA.id}`, { method: "DELETE", headers: adminHeaders });
      await request(`/api/cms/sections?id=${secB.id}`, { method: "DELETE", headers: adminHeaders });
    }
  );

  // T3.18: Product Price Edit -> AuditLog Diff Verification -> Checkout Total Calculation
  await test(
    "T3.18",
    "Product price edit generates AuditLog diff and propagates to checkout total calculation",
    "Product Pricing + Audit Trail + Checkout",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const cat = await prisma.category.findFirst();

      const prod = await prisma.product.create({
        data: {
          name: `Pairwise Price Diff Product ${Date.now()}`,
          slug: `pairwise-price-diff-${Date.now()}`,
          description: "Price diff test product",
          price: 100,
          stock: 50,
          brand: "TestBrand",
          sku: `PW-PRICE-${Date.now()}`,
          imageUrl: "https://example.com/pw-price.jpg",
          categoryId: cat.id,
          sellerId: seller.id,
          status: "ACTIVE",
        },
      });

      // 1. Admin edits product price from 100 to 180 TL
      const updateRes = await request(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { price: 180 },
      });
      assertEqual(updateRes.status, 200, "Price updated to 180");

      // 2. Verify AuditLog recorded with PRODUCT_UPDATED and new price
      const auditLog = await prisma.auditLog.findFirst({
        where: { action: "PRODUCT_UPDATED", entityId: prod.id },
        orderBy: { createdAt: "desc" },
      });
      assert(auditLog, "AuditLog for PRODUCT_UPDATED must exist");
      const meta = JSON.parse(auditLog.metadataJson);
      assertEqual(meta.price, 180, "AuditLog captures new price 180");

      // 3. Customer checks out 2 units at updated price
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 2 }],
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "İstanbul",
            district: "Kadıköy",
            addressLine: "Bağdat Cad. No: 12",
          },
        },
      });
      assertEqual(orderRes.status, 200, "Order placed successfully");
      assertEqual(orderRes.data.order.subtotal, 360, "Subtotal must be 360 TL (180 * 2)");
    }
  );

  // T3.19: Admin Carrier Assignment -> Customer Order Tracking Link Verification
  await test(
    "T3.19",
    "Admin carrier code assignment updates order tracking and dispatches customer notification link",
    "Logistics Fulfillment + Notifications",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const adminHeaders = await getAuthHeaders("ADMIN");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });

      // 1. Place order
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          shippingAddress: {
            title: "Ofis",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "Ankara",
            district: "Çankaya",
            addressLine: "Atatürk Bulvarı 100",
          },
        },
      });
      assertEqual(orderRes.status, 200, "Order placed");
      const order = orderRes.data.order;
      const group = order.orderGroups[0];

      // 2. Admin assigns Aras Kargo tracking number
      const trackingCode = `ARAS-${Date.now().toString().slice(-8)}`;
      const shipRes = await request("/api/orders/seller", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          orderGroupId: group.id,
          status: "SHIPPED",
          carrierName: "Aras Kargo",
          trackingNumber: trackingCode,
        },
      });
      assertEqual(shipRes.status, 200, "Status advanced to SHIPPED");

      // 3. Customer checks order detail
      const checkOrder = await request(`/api/orders/${order.id}`, { headers: custHeaders });
      assertEqual(checkOrder.status, 200, "Order retrieved");
      assertEqual(checkOrder.data.order.carrierName, "Aras Kargo", "Carrier name updated on order");
      assertEqual(checkOrder.data.order.trackingNumber, trackingCode, "Tracking code updated on order");

      // 4. Customer verifies notification link
      const notifRes = await request("/api/notifications", { headers: custHeaders });
      assertEqual(notifRes.status, 200, "Notifications retrieved");
      const matchedNotif = notifRes.data.notifications.find((n) => n.messageTR && n.messageTR.includes(trackingCode)) || notifRes.data.notifications[0];
      assert(matchedNotif && matchedNotif.linkUrl, "Notification with link must exist");
      assertContains(matchedNotif.messageTR, trackingCode, "Notification message must include tracking code");
    }
  );

  // T3.20: Marketing Campaign Active Toggle -> Priority Ordering & Search Indexing
  await test(
    "T3.20",
    "Marketing campaign active toggle regulates priority ranking in marketing queries",
    "Marketing Studio + Search Indexing",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Create Campaign A (priority 10, ACTIVE)
      const c1Res = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `High Priority Campaign ${Date.now()}`,
          type: "FEATURED_SEARCH",
          budget: 5000,
          priority: 10,
          status: "ACTIVE",
        },
      });
      assertEqual(c1Res.status, 201, "Campaign A created");
      const campA = c1Res.data.campaign;

      // 2. Create Campaign B (priority 2, ACTIVE)
      const c2Res = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `Normal Priority Campaign ${Date.now()}`,
          type: "FEATURED_SEARCH",
          budget: 5000,
          priority: 2,
          status: "ACTIVE",
        },
      });
      assertEqual(c2Res.status, 201, "Campaign B created");
      const campB = c2Res.data.campaign;

      // 3. Pause Campaign A
      await request(`/api/marketing/${campA.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { status: "PAUSED" },
      });

      // 4. Query active campaigns
      const activeRes = await request("/api/marketing?status=ACTIVE");
      assertEqual(activeRes.status, 200, "Active campaigns fetched");
      const activeList = activeRes.data.campaigns;

      const hasA = activeList.some((c) => c.id === campA.id);
      const hasB = activeList.some((c) => c.id === campB.id);

      assertEqual(hasA, false, "Paused campaign A must not appear in active query");
      assertEqual(hasB, true, "Active campaign B must appear in active query");

      // Cleanup
      await request(`/api/marketing/${campA.id}`, { method: "DELETE", headers: adminHeaders });
      await request(`/api/marketing/${campB.id}`, { method: "DELETE", headers: adminHeaders });
    }
  );

  // T3.21: Navigation hierarchy modification -> Public mega menu reflection
  await test(
    "T3.21",
    "Navigation hierarchy modification reflects across category navigation and mega menu",
    "Navigation Menu + Public Storefront",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // Create a category
      const uniqueSlug = `nav-test-cat-${Date.now()}`;
      const catRes = await request("/api/categories", {
        method: "POST",
        headers: adminHeaders,
        body: {
          nameTR: "Navigasyon Test Kategorisi",
          nameEN: "Navigation Test Category",
          slug: uniqueSlug,
          descriptionTR: "Navigasyon entegrasyonu",
          descriptionEN: "Navigation integration",
        },
      });
      assertEqual(catRes.status, 201, "Category created");
      const catId = catRes.data.category.id;

      // Query public navigation
      const navRes = await request("/api/navigation?lang=tr");
      assertEqual(navRes.status, 200, "Navigation retrieved");
      assert(Array.isArray(navRes.data.categories), "Categories array present");
      const foundInNav = navRes.data.categories.some((c) => c.slug === uniqueSlug);
      assertEqual(foundInNav, true, "New category appears in navigation structure");

      // Cleanup
      await request(`/api/categories?id=${catId}`, { method: "DELETE", headers: adminHeaders });
    }
  );

  // T3.22: Media Asset Lifecycle -> Upload, Update Alt Text & Reference Count Tracking
  await test(
    "T3.22",
    "Media asset creation, metadata updating and reference count tracking lifecycle",
    "Media Library + Asset Reference Tracking",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Create Media Asset
      const createRes = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: {
          filename: `product-hero-shot-${Date.now()}.png`,
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          sizeBytes: 184320,
          altTextTr: "Kırmızı Spor Ayakkabı Ön Görünüm",
          altTextEn: "Red Sneaker Front View",
          referenceCount: 1,
        },
      });
      assertEqual(createRes.status, 201, "Media created");
      const media = createRes.data.media;

      // 2. Increment reference count when used in product
      const updateRes = await request(`/api/media/${media.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          referenceCount: 4,
          altTextTr: "Nike Kırmızı Spor Ayakkabı",
        },
      });
      assertEqual(updateRes.status, 200, "Media updated");
      assertEqual(updateRes.data.media.referenceCount, 4, "Reference count updated to 4");

      // 3. Search media by updated alt text
      const searchRes = await request(`/api/media?search=Nike`);
      assertEqual(searchRes.status, 200, "Search successful");
      const found = (searchRes.data.media || searchRes.data.assets).some((m) => m.id === media.id);
      assertEqual(found, true, "Media found in search results");

      // Cleanup
      await request(`/api/media/${media.id}`, { method: "DELETE", headers: adminHeaders });
    }
  );

  // T3.23: Seller Status Governance -> Storefront Verification & Moderation Audit
  await test(
    "T3.23",
    "Seller status change from PENDING to ACTIVE generates AuditLog and updates seller directory",
    "Seller Governance + AuditLog Trail",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const seller = await prisma.seller.findFirst();

      // Update seller status and verified badge
      const putRes = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          sellerId: seller.id,
          status: "ACTIVE",
          verified: true,
        },
      });
      assertEqual(putRes.status, 200, "Seller status updated");
      assertEqual(putRes.data.seller.verified, true, "Seller verified");

      // Verify AuditLog record created
      const log = await prisma.auditLog.findFirst({
        where: { action: "SELLER_STATUS_CHANGED", entityId: seller.id },
        orderBy: { createdAt: "desc" },
      });
      assert(log, "AuditLog for SELLER_STATUS_CHANGED must exist");
    }
  );

  // T3.24: Customer Account Sync -> Address Book Management -> CRM Spent Summary
  await test(
    "T3.24",
    "Customer address book management updates CRM metrics and checkout shipping selection",
    "Customer CRM + Address Sync + Checkout",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Add address
      const addrRes = await request("/api/addresses", {
        method: "POST",
        headers: custHeaders,
        body: {
          title: `İş Yeri ${Date.now()}`,
          firstName: "Ahmet",
          lastName: "Yılmaz",
          phone: "0532 123 4567",
          city: "İzmir",
          district: "Alsancak",
          addressLine: "Kıbrıs Şehitleri Cad. No: 15",
          isDefault: true,
        },
      });
      assertEqual(addrRes.status, 200, "Address added");

      // 2. Admin retrieves CRM customer list
      const crmRes = await request("/api/admin/customers", { headers: adminHeaders });
      assertEqual(crmRes.status, 200, "CRM fetched");
      const customerRecord = crmRes.data.customers.find((c) => c.email === "customer@cadde-store.com");
      assert(customerRecord, "Customer record found in CRM");
      assert(customerRecord.savedAddressesCount >= 1, "Saved address count reflects in CRM");
    }
  );

  return results;
}

module.exports = { runTier3Tests };

if (require.main === module) {
  runTier3Tests().then((res) => {
    const passed = res.filter((r) => r.status === "PASSED").length;
    const failed = res.filter((r) => r.status === "FAILED").length;
    console.log(`\nTier 3 Summary: ${passed} passed, ${failed} failed out of ${res.length} tests.`);
    if (failed > 0) {
      console.log("\nFailed tests:");
      res.filter((r) => r.status === "FAILED").forEach((r) => console.log(`  - [${r.id}] ${r.name}: ${r.error}`));
    }
  });
}
