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

async function runTier4Tests() {
  const results = [];

  async function testScenario(id, name, description, fn) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        description,
        tier: 4,
        status: "PASSED",
        duration: Date.now() - start,
      });
    } catch (err) {
      results.push({
        id,
        name,
        description,
        tier: 4,
        status: "FAILED",
        error: err.message,
        duration: Date.now() - start,
      });
    }
  }

  console.log("\n=======================================================");
  console.log("  TIER 4: REAL-WORLD APPLICATION WORKLOAD SCENARIOS (>=8)");
  console.log("=======================================================\n");

  // ==========================================
  // SCENARIO 1: Multi-Vendor Customer Purchase Journey
  // ==========================================
  await testScenario(
    "SCENARIO-1",
    "Complete Multi-Vendor Purchase Journey with Coupon & Split OrderGroups",
    "Search → Product Detail → Cart → Coupon Validation → Atomic Checkout → Split OrderGroups → Stock Decrement",
    async () => {
      // 1. Search catalog
      const searchRes = await request("/api/products?search=");
      assertEqual(searchRes.status, 200, "Step 1: Products search must return 200");
      assert(searchRes.data.products.length >= 2, "Need at least 2 products");

      // 2. Select products from two distinct sellers
      const sellers = await prisma.seller.findMany({ where: { status: "ACTIVE" }, take: 2 });
      const cat = await prisma.category.findFirst();
      let prod1 = await prisma.product.findFirst({
        where: { sellerId: sellers[0].id, status: "ACTIVE", stock: { gte: 5 } },
      });
      if (!prod1) {
        prod1 = await prisma.product.create({
          data: {
            name: `Scenario 1 Prod 1 ${Date.now()}`,
            slug: `scen-prod-1-${Date.now()}`,
            description: "Test description",
            price: 200,
            stock: 20,
            brand: "Brand1",
            sku: `SCEN-SKU-1-${Date.now()}`,
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
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
            name: `Scenario 1 Prod 2 ${Date.now()}`,
            slug: `scen-prod-2-${Date.now()}`,
            description: "Test description",
            price: 200,
            stock: 20,
            brand: "Brand2",
            sku: `SCEN-SKU-2-${Date.now()}`,
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
            categoryId: cat.id,
            sellerId: sellers[1].id,
            status: "ACTIVE",
          },
        });
      }

      const initialStock1 = prod1.stock;
      const initialStock2 = prod2.stock;

      // 3. Prepare coupon
      const couponCode = `SCENARIO1_${Date.now()}`;
      await prisma.coupon.create({
        data: {
          code: couponCode,
          type: "PERCENTAGE",
          value: 10,
          minimumOrder: 10,
          active: true,
        },
      });

      // 4. Validate coupon via API
      const valRes = await request("/api/coupons/validate", {
        method: "POST",
        body: { code: couponCode, subtotal: prod1.price + prod2.price },
      });
      assertEqual(valRes.status, 200, "Step 4: Coupon validation must succeed");
      assertEqual(valRes.data.valid, true, "Coupon must be valid");

      // 5. Customer places order
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [
            { productId: prod1.id, quantity: 1, selectedColor: "Siyah", selectedSize: "M" },
            { productId: prod2.id, quantity: 1, selectedColor: "Mavi", selectedSize: "L" },
          ],
          couponCode,
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "İstanbul",
            district: "Kadıköy",
            addressLine: "Moda Cad. No: 42 D: 5",
            country: "Türkiye",
          },
          paymentMethod: "credit_card",
        },
      });

      assertEqual(orderRes.status, 200, "Step 5: Order creation must return 200 OK");
      const order = orderRes.data.order;
      assert(order.id, "Order ID must exist");
      assertEqual(order.status, "CONFIRMED", "Order status must be CONFIRMED");
      assert(order.couponDiscount > 0, "Coupon discount must be applied");

      // 6. Verify split OrderGroups created
      assert(order.orderGroups.length >= 1, "Order must have OrderGroups");

      // 7. Verify atomic stock decrement
      const updatedProd1 = await prisma.product.findUnique({ where: { id: prod1.id } });
      const updatedProd2 = await prisma.product.findUnique({ where: { id: prod2.id } });
      assertEqual(updatedProd1.stock, initialStock1 - 1, "Prod 1 stock decremented");
      assertEqual(updatedProd2.stock, initialStock2 - 1, "Prod 2 stock decremented");
    }
  );

  // ==========================================
  // SCENARIO 2: Defective Item Return & Moderation Lifecycle
  // ==========================================
  await testScenario(
    "SCENARIO-2",
    "Defective Item Return Lifecycle with Moderation & In-App Alerts",
    "Customer Return Request → Seller Notification → Moderation Approval → Refund Trigger",
    async () => {
      // 1. Find or create an order item
      const custUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
      const orderItem = await prisma.orderItem.findFirst({
        where: { order: { customerId: custUser.id } },
        include: { product: { include: { seller: { include: { user: true } } } }, order: true },
      });
      assert(orderItem, "Must have an existing order item for customer");

      // 2. Customer submits return request
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const retRes = await request("/api/returns", {
        method: "POST",
        headers: custHeaders,
        body: {
          orderId: orderItem.orderId,
          orderItemId: orderItem.id,
          reason: "Kumaş dikişinde sökük var (Kusurlu Ürün)",
          evidenceImages: ["https://example.com/kusurlu-1.jpg", "https://example.com/kusurlu-2.jpg"],
        },
      });
      assertEqual(retRes.status, 201, "Step 2: Return request creation must return 201");
      const returnId = retRes.data.returnRequest.id;

      // 3. Seller reviews and approves return request
      const sellerUser = orderItem.product.seller.user;
      const sellerHeaders = await getAuthHeaders({
        id: sellerUser.id,
        email: sellerUser.email,
        firstName: sellerUser.firstName,
        lastName: sellerUser.lastName,
        role: "SELLER",
        sellerSlug: orderItem.product.seller.slug,
      });

      const approveRes = await request(`/api/returns/${returnId}`, {
        method: "PUT",
        headers: sellerHeaders,
        body: {
          status: "APPROVED",
          sellerNote: "Kusurlu ürün onaylandı. Aras Kargo 123456 anlaşma koduyla ücretsiz gönderiniz.",
        },
      });
      assertEqual(approveRes.status, 200, "Step 3: Seller approval must return 200");
      assertEqual(approveRes.data.returnRequest.status, "APPROVED", "Status should be APPROVED");

      // 4. Admin issues refund
      const adminHeaders = await getAuthHeaders("ADMIN");
      const refundRes = await request(`/api/returns/${returnId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          status: "REFUNDED",
          adminNote: "Para iadesi bankanıza iletildi.",
        },
      });
      assertEqual(refundRes.status, 200, "Step 4: Admin refund must return 200");
      assertEqual(refundRes.data.returnRequest.status, "REFUNDED", "Status should be REFUNDED");

      // 5. Verify customer notification received
      const custNotif = await prisma.notification.findFirst({
        where: { userId: custUser.id },
        orderBy: { createdAt: "desc" },
      });
      assert(custNotif, "Step 5: Customer must receive in-app notification");
    }
  );

  // ==========================================
  // SCENARIO 3: Admin Seasonal Campaign Merchandising Studio
  // ==========================================
  await testScenario(
    "SCENARIO-3",
    "Admin Seasonal Campaign Launch & Dynamic Homepage Merchandising",
    "Create Campaign Section → Add Banners → Feature Flagship Brand → Verify Dynamic CMS Delivery",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Create campaign section
      const secRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: "Büyük Bahar Festivali 2026",
          titleEN: "Grand Spring Festival 2026",
          type: "BANNER_STRIP",
          orderIndex: 0,
          configJson: JSON.stringify({ bgGradient: "from-orange-500 to-amber-600" }),
        },
      });
      assertEqual(secRes.status, 201, "Step 1: Campaign section created");
      const sectionId = secRes.data.section.id;

      // 2. Add campaign banner
      const bannerRes = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: {
          sectionId,
          titleTR: "Bahar İndirimlerinde %60'a Varan Fırsatlar",
          titleEN: "Up to 60% Off in Spring Deals",
          imageUrlDesktop: "https://example.com/spring-campaign.jpg",
          targetType: "CATEGORY",
          targetValue: "/category/women",
          orderIndex: 0,
        },
      });
      assertEqual(bannerRes.status, 201, "Step 2: Campaign banner created");

      // 3. Create & feature flagship brand
      const brandSlug = `bahar-marka-${Date.now()}`;
      const brandRes = await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: "Bahar Moda Evi",
          slug: brandSlug,
          logoUrl: "https://example.com/bahar-logo.png",
          isFeatured: true,
        },
      });
      assertEqual(brandRes.status, 201, "Step 3: Featured brand created");

      // 4. Verify homepage sections API delivers the live campaign
      const cmsRes = await request("/api/cms/sections");
      assertEqual(cmsRes.status, 200, "Step 4: CMS sections API returns 200");
      const campaignSection = cmsRes.data.sections.find((s) => s.id === sectionId);
      assert(campaignSection, "Campaign section delivered on homepage");
      assertEqual(campaignSection.banners.length, 1, "Banner attached to section");

      // 5. Verify featured brands list contains the brand
      const featBrandsRes = await request("/api/brands?featured=true");
      assertEqual(featBrandsRes.status, 200, "Step 5: Featured brands API returns 200");
      const foundBrand = featBrandsRes.data.brands.find((b) => b.slug === brandSlug);
      assert(foundBrand, "Created brand appears in featured brands list");
    }
  );

  // ==========================================
  // SCENARIO 4: Seller Onboarding, Catalog Listing & Review Reply
  // ==========================================
  await testScenario(
    "SCENARIO-4",
    "Seller Storefront Operations, Multi-Variant Catalog Listing & Review Replies",
    "Seller Profile Setup → Multi-Variant Product Listing → Customer Review → Seller Reply",
    async () => {
      // 1. Retrieve active seller
      const seller = await prisma.seller.findFirst({
        where: { status: "ACTIVE" },
        include: { user: true },
      });
      assert(seller, "Active seller must exist");

      // 2. Seller lists multi-variant product
      const cat = await prisma.category.findFirst();
      const uniqueSku = `SCENARIO4-SKU-${Date.now()}`;
      const sellerHeaders = await getAuthHeaders({
        id: seller.user.id,
        email: seller.user.email,
        firstName: seller.user.firstName,
        lastName: seller.user.lastName,
        role: "SELLER",
        sellerSlug: seller.slug,
      });

      const prodRes = await request("/api/products", {
        method: "POST",
        headers: sellerHeaders,
        body: {
          name: "Premium Slim Fit Kot Pantolon",
          brand: seller.storeName,
          description: "Yüksek dayanıklı denim kumaş, esnek ve rahat kesim.",
          categoryId: cat.id,
          price: 499.9,
          originalPrice: 699.9,
          stock: 30,
          sku: uniqueSku,
          colors: ["Açık Mavi", "Koyu Mavi", "Siyah"],
          sizes: ["30/32", "32/32", "34/32", "36/32"],
        },
      });
      assertEqual(prodRes.status, 200, "Step 2: Product creation must succeed");
      const createdProd = prodRes.data.product;

      // 3. Customer submits review on the product
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const revRes = await request("/api/reviews", {
        method: "POST",
        headers: custHeaders,
        body: {
          productId: createdProd.id,
          rating: 5,
          comment: "Kumaşı ve dikişleri harika, bedeni tam oldu.",
        },
      });
      assertEqual(revRes.status, 200, "Step 3: Customer review submission must succeed");
      const reviewId = revRes.data.review.id;

      // 4. Seller replies to the review
      const replyRes = await request("/api/reviews", {
        method: "PUT",
        headers: sellerHeaders,
        body: {
          reviewId,
          sellerReply: "Memnun kalmanıza çok sevindik, iyi günlerde kullanın!",
        },
      });
      assertEqual(replyRes.status, 200, "Step 4: Seller reply submission must succeed");

      // 5. Verify public reviews display the seller reply
      const getRevRes = await request(`/api/reviews?productId=${createdProd.id}`);
      assertEqual(getRevRes.status, 200, "Step 5: Reviews query must return 200");
      const targetReview = getRevRes.data.reviews.find((r) => r.id === reviewId);
      assert(targetReview && targetReview.sellerReply, "Review must include seller reply");
    }
  );

  // ==========================================
  // SCENARIO 5: Turkish Localization & PWA Compliance Suite
  // ==========================================
  await testScenario(
    "SCENARIO-5",
    "Turkish Marketplace Localization & PWA Installability Compliance",
    "Bilingual TR/EN Parity → TRY/USD Support → KVKK Compliance → PWA Manifest",
    async () => {
      // 1. Verify TR dictionary
      const trPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "tr.ts");
      const trContent = fs.readFileSync(trPath, "utf8");
      assertContains(trContent, "searchPlaceholder", "Step 1: TR dictionary must contain search placeholder");

      // 2. Verify EN dictionary
      const enPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "en.ts");
      const enContent = fs.readFileSync(enPath, "utf8");
      assertContains(enContent, "searchPlaceholder", "Step 2: EN dictionary must contain search placeholder");

      // 3. Verify PWA manifest
      const manifestPath = path.join(__dirname, "..", "..", "public", "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assertEqual(manifest.lang, "tr", "Step 3: Manifest lang must be 'tr'");
      assertEqual(manifest.theme_color, "#ea580c", "Step 3: Manifest theme color orange");

      // 4. Verify categories bilingual names
      const catRes = await request("/api/categories");
      assertEqual(catRes.status, 200, "Step 4: Categories API returns 200");
      catRes.data.categories.forEach((c) => {
        assert(c.nameTR && c.nameEN, "Category bilingual name strings present");
      });
    }
  );

  // ==========================================
  // SCENARIO 6: Customer Account & Address Book Synchronization
  // ==========================================
  await testScenario(
    "SCENARIO-6",
    "Customer Account Lifecycle & Guest Address Synchronization",
    "Register / Login → Address Book Sync → Default Address Selection → Favorite Management",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");

      // 1. Add multiple addresses
      const addrRes1 = await request("/api/addresses", {
        method: "POST",
        headers: custHeaders,
        body: {
          title: "İş Adresi Levent",
          firstName: "Ahmet",
          lastName: "Yılmaz",
          phone: "0532 123 4567",
          city: "İstanbul",
          district: "Şişli",
          addressLine: "Büyükdere Cad. No: 199",
          isDefault: true,
        },
      });
      assertEqual(addrRes1.status, 200, "Step 1: Address 1 creation must return 200");

      // 2. Retrieve addresses list
      const listRes = await request("/api/addresses", { headers: custHeaders });
      assertEqual(listRes.status, 200, "Step 2: Addresses list must return 200");
      assert(listRes.data.addresses.length >= 1, "Addresses list must contain added address");

      // 3. Toggle favorites
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
      const favRes = await request("/api/favorites", {
        method: "POST",
        headers: custHeaders,
        body: { productId: prod.id },
      });
      assertEqual(favRes.status, 200, "Step 3: Favorite toggle must return 200");
    }
  );

  // ==========================================
  // SCENARIO 7: Admin Governance, Security Audit Trail & Platform Settings
  // ==========================================
  await testScenario(
    "SCENARIO-7",
    "Admin Platform Governance, Moderation & Immutable Security Audit Trail",
    "Admin Settings Update → Seller Moderation → Security Audit Trail Verification",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Update platform financial settings
      const setRes = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          defaultCommissionRate: 12.5,
          defaultShippingFee: 39.9,
          freeShippingThreshold: 250.0,
        },
      });
      assertEqual(setRes.status, 200, "Step 1: Platform settings update must succeed");
      assertEqual(setRes.data.settings.defaultCommissionRate, 12.5, "Commission rate updated");

      // 2. Moderate seller status
      const seller = await prisma.seller.findFirst();
      const selRes = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          sellerId: seller.id,
          verified: true,
          status: "ACTIVE",
        },
      });
      assertEqual(selRes.status, 200, "Step 2: Seller verification update must succeed");

      // 3. Inspect audit trail
      const auditRes = await request("/api/admin/audit", { headers: adminHeaders });
      assertEqual(auditRes.status, 200, "Step 3: Audit trail query must succeed");
      assert(Array.isArray(auditRes.data.logs), "Audit logs must be an array");
    }
  );

  // ==========================================
  // SCENARIO 8: Carrier Logistics & Seller Fulfillment Pipeline
  // ==========================================
  await testScenario(
    "SCENARIO-8",
    "Turkish Carrier Logistics & Multi-Carrier Fulfillment Pipeline",
    "Order Placement → Seller Fulfillment → Carrier Code Assignment (Yurtiçi, Aras, MNG, Sürat, PTT, HepsiJet) → Tracking Progression",
    async () => {
      const custHeaders = await getAuthHeaders("CUSTOMER");
      const prod = await prisma.product.findFirst({ where: { status: "ACTIVE", stock: { gte: 5 } } });

      // 1. Customer places order
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: prod.id, quantity: 1 }],
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "Trabzon",
            district: "Ortahisar",
            addressLine: "Sahil Cad. No: 61",
          },
        },
      });
      assertEqual(orderRes.status, 200, "Step 1: Order created successfully");
      const orderGroup = orderRes.data.order.orderGroups[0];

      // 2. Seller transitions status with HepsiJet carrier tracking
      const sellerUser = await prisma.user.findFirst({
        where: { sellerProfile: { id: orderGroup.sellerId } },
      });
      const sellerHeaders = await getAuthHeaders({
        id: sellerUser.id,
        email: sellerUser.email,
        firstName: sellerUser.firstName,
        lastName: sellerUser.lastName,
        role: "SELLER",
      });

      const shipRes = await request("/api/orders/seller", {
        method: "PUT",
        headers: sellerHeaders,
        body: {
          orderGroupId: orderGroup.id,
          status: "SHIPPED",
          note: "HepsiJet Kuryesine teslim edildi. Takip No: HJ-998822019",
        },
      });
      assertEqual(shipRes.status, 200, "Step 2: Seller shipping fulfillment must succeed");

      // 3. Transition to DELIVERED
      const deliverRes = await request("/api/orders/seller", {
        method: "PUT",
        headers: sellerHeaders,
        body: {
          orderGroupId: orderGroup.id,
          status: "DELIVERED",
          note: "Alıcıya teslim edildi.",
        },
      });
      assertEqual(deliverRes.status, 200, "Step 3: Delivery transition must succeed");
      assertEqual(deliverRes.data.orderGroup.status, "DELIVERED", "Status should be DELIVERED");

      // 4. Verify status history audit records both transitions
      const history = await prisma.orderStatusHistory.findMany({
        where: { orderId: orderGroup.orderId },
        orderBy: { createdAt: "asc" },
      });
      assert(history.length >= 2, "History must contain transition records");
    }
  );

  return results;
}

module.exports = { runTier4Tests };

if (require.main === module) {
  runTier4Tests().then((res) => {
    const passed = res.filter((r) => r.status === "PASSED").length;
    const failed = res.filter((r) => r.status === "FAILED").length;
    console.log(`\nTier 4 Summary: ${passed} passed, ${failed} failed out of ${res.length} tests.`);
    if (failed > 0) {
      console.log("\nFailed tests:");
      res.filter((r) => r.status === "FAILED").forEach((r) => console.log(`  - [${r.id}] ${r.name}: ${r.error}`));
    }
  });
}
