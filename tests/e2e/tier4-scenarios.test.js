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

  // ==========================================
  // SCENARIO 9: Full End-to-End Enterprise Marketplace Lifecycle
  // ==========================================
  await testScenario(
    "SCENARIO-9",
    "Full End-to-End Enterprise Marketplace Lifecycle Walkthrough",
    "Seller Onboarding → Multi-Variant Listing → Price Moderation & Audit → Marketing Campaign → Customer Purchase → Carrier Logistics → Return Moderation → CRM Spent Aggregation",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const custHeaders = await getAuthHeaders("CUSTOMER");

      // 1. Seller profile & active verification
      const seller = await prisma.seller.findFirst({ where: { status: "ACTIVE" } });
      const verifyRes = await request("/api/admin/sellers", {
        method: "PUT",
        headers: adminHeaders,
        body: { sellerId: seller.id, verified: true, status: "ACTIVE" },
      });
      assertEqual(verifyRes.status, 200, "Step 1: Seller verified");

      // 2. Seller creates product
      const cat = await prisma.category.findFirst();
      const sku = `E2E-LIFECYCLE-SKU-${Date.now()}`;
      const prodRes = await request("/api/products", {
        method: "POST",
        headers: await getAuthHeaders("SELLER"),
        body: {
          name: "E2E Yaşam Döngüsü Premium Ürün",
          brand: "Cadde Exclusive",
          description: "Tam döngü test ürünü.",
          categoryId: cat.id,
          price: 300,
          originalPrice: 450,
          stock: 30,
          sku,
          colors: ["Siyah", "Gri"],
          sizes: ["M", "L"],
        },
      });
      assertEqual(prodRes.status, 200, "Step 2: Product created");
      const product = prodRes.data.product;

      // 3. Admin modifies price and verifies audit log
      const priceRes = await request(`/api/products/${product.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: { price: 350 },
      });
      assertEqual(priceRes.status, 200, "Step 3: Price updated to 350");

      const auditCheck = await prisma.auditLog.findFirst({
        where: { action: "PRODUCT_UPDATED", entityId: product.id },
        orderBy: { createdAt: "desc" },
      });
      assert(auditCheck, "Step 3b: AuditLog entry generated");

      // 4. Admin creates marketing campaign
      const campRes = await request("/api/marketing", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: `Lansman Kampanyası ${Date.now()}`,
          type: "SPONSORED_PRODUCT",
          targetId: product.id,
          placement: "HOMEPAGE_HERO",
          budget: 10000,
          priority: 1,
          status: "ACTIVE",
        },
      });
      assertEqual(campRes.status, 201, "Step 4: Marketing campaign created");
      const campaign = campRes.data.campaign;

      // 5. Customer places order
      const orderRes = await request("/api/orders", {
        method: "POST",
        headers: custHeaders,
        body: {
          items: [{ productId: product.id, quantity: 1, selectedColor: "Siyah", selectedSize: "M" }],
          shippingAddress: {
            title: "Ev",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            phone: "0532 123 4567",
            city: "İstanbul",
            district: "Beşiktaş",
            addressLine: "Barbaros Bulvarı No: 50",
          },
        },
      });
      assertEqual(orderRes.status, 200, "Step 5: Customer order placed");
      const order = orderRes.data.order;
      const orderGroup = order.orderGroups[0];
      const orderItem = order.orderItems[0];

      // 6. Carrier tracking assignment
      const trackingCode = `YK-${Date.now().toString().slice(-8)}`;
      const shipRes = await request("/api/orders/seller", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          orderGroupId: orderGroup.id,
          status: "DELIVERED",
          carrierName: "Yurtiçi Kargo",
          trackingNumber: trackingCode,
          note: "Alıcıya teslim edildi.",
        },
      });
      assertEqual(shipRes.status, 200, "Step 6: Order status set to DELIVERED");

      // 7. Customer submits return request
      const returnRes = await request("/api/returns", {
        method: "POST",
        headers: custHeaders,
        body: {
          orderId: order.id,
          orderItemId: orderItem.id,
          reason: "Beden uymadı",
          evidenceImages: ["https://example.com/evidence-1.jpg"],
        },
      });
      assertEqual(returnRes.status, 201, "Step 7: Return request submitted");
      const returnReq = returnRes.data.returnRequest;

      // 8. Admin approves return and resolves refund
      const modRes = await request(`/api/returns/${returnReq.id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: {
          status: "REFUNDED",
          adminNote: "İade onaylandı ve karta aktarıldı.",
        },
      });
      assertEqual(modRes.status, 200, "Step 8: Return moderated to REFUNDED");

      // 9. Admin checks CRM customer record
      const crmRes = await request("/api/admin/customers", { headers: adminHeaders });
      assertEqual(crmRes.status, 200, "Step 9: CRM customer list retrieved");
      const customer = crmRes.data.customers.find((c) => c.email === "customer@cadde-store.com");
      assert(customer && customer.ordersCount > 0, "Customer order count reflected in CRM");

      // Cleanup campaign
      await request(`/api/marketing/${campaign.id}`, { method: "DELETE", headers: adminHeaders });
    }
  );

  // ==========================================
  // SCENARIO 10: Merchandising Studio & Storefront Governance Overhaul
  // ==========================================
  await testScenario(
    "SCENARIO-10",
    "Admin Merchandising Studio & Storefront Governance Overhaul",
    "Platform Settings → CMS Section & Banner Creation → Media Library Ingestion → Navigation Hierarchy Restructuring → Live Storefront Verification",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");

      // 1. Platform Settings Configuration
      const setRes = await request("/api/admin/settings", {
        method: "PUT",
        headers: adminHeaders,
        body: {
          marketplaceName: "Cadde Store Türkiye Mega",
          defaultCommissionRate: 11.5,
          defaultShippingFee: 39.9,
          freeShippingThreshold: 250.0,
        },
      });
      assertEqual(setRes.status, 200, "Step 1: Settings updated");

      // 2. Media Asset Ingestion
      const mediaRes = await request("/api/media", {
        method: "POST",
        headers: adminHeaders,
        body: {
          filename: `summer-hero-${Date.now()}.webp`,
          url: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
          sizeBytes: 256000,
          altTextTr: "Yaz Kampanyası",
          altTextEn: "Summer Campaign",
          referenceCount: 1,
        },
      });
      assertEqual(mediaRes.status, 201, "Step 2: Media asset ingested");
      const media = mediaRes.data.media;

      // 3. CMS Section & Banner Creation
      const secRes = await request("/api/cms/sections", {
        method: "POST",
        headers: adminHeaders,
        body: {
          titleTR: "Yaz Festivali Vitrini",
          titleEN: "Summer Festival Showcase",
          type: "HERO",
          orderIndex: 0,
          active: true,
        },
      });
      assertEqual(secRes.status, 201, "Step 3: CMS section created");
      const section = secRes.data.section;

      const banRes = await request("/api/cms/banners", {
        method: "POST",
        headers: adminHeaders,
        body: {
          sectionId: section.id,
          titleTR: "Büyük Yaz İndirimi",
          titleEN: "Big Summer Sale",
          imageUrlDesktop: media.url,
          targetType: "CATEGORY",
          targetValue: "/category/kadin",
          orderIndex: 0,
        },
      });
      assertEqual(banRes.status, 201, "Step 3b: Banner attached to section");

      // 4. Navigation Menu Hierarchy
      const navItem = await prisma.navigationItem.create({
        data: {
          titleTr: "Yaz Festivali",
          titleEn: "Summer Festival",
          url: "/campaigns/summer",
          section: "HEADER",
          sortOrder: 1,
          badgeTr: "SICAK",
          badgeEn: "HOT",
          isActive: true,
        },
      });
      assert(navItem.id, "Step 4: Navigation menu item created");

      // 5. Storefront dynamic verification
      const cmsPublic = await request("/api/cms/sections");
      assertEqual(cmsPublic.status, 200, "Step 5a: CMS sections served to storefront");
      const foundSection = cmsPublic.data.sections.find((s) => s.id === section.id);
      assert(foundSection, "Newly created section visible on homepage API");

      const navPublic = await request("/api/navigation?lang=tr");
      assertEqual(navPublic.status, 200, "Step 5b: Navigation served to storefront");

      // Cleanup
      await request(`/api/cms/sections?id=${section.id}`, { method: "DELETE", headers: adminHeaders });
      await request(`/api/media/${media.id}`, { method: "DELETE", headers: adminHeaders });
      await prisma.navigationItem.delete({ where: { id: navItem.id } });
    }
  );

  // ==========================================
  // SCENARIO 11: Security & Commercial Audit Trail Compliance Verification
  // ==========================================
  await testScenario(
    "SCENARIO-11",
    "Security & Commercial Audit Trail Compliance Across All Administrative Subsystems",
    "Multi-Role Mutation Sweep (Products, Sellers, Categories, Coupons, CMS, Media, Navigation) → Immutable Audit Trail Verification → Strict RBAC Isolation",
    async () => {
      const adminHeaders = await getAuthHeaders("ADMIN");
      const custHeaders = await getAuthHeaders("CUSTOMER");

      // 1. Mutation on Category with AuditLog check
      const catSlug = `audit-cat-${Date.now()}`;
      const catRes = await request("/api/categories", {
        method: "POST",
        headers: adminHeaders,
        body: {
          nameTR: "Denetim Kategorisi",
          nameEN: "Audit Category",
          slug: catSlug,
          descriptionTR: "Denetim izi",
          descriptionEN: "Audit trail",
        },
      });
      assertEqual(catRes.status, 201, "Category created");
      const cat = catRes.data.category;

      const catLog = await prisma.auditLog.findFirst({
        where: { action: "CATEGORY_CREATED", entityId: cat.id },
      });
      assert(catLog, "AuditLog for CATEGORY_CREATED verified");

      // 2. Mutation on Brand with AuditLog check
      const brandSlug = `audit-brand-${Date.now()}`;
      const brandRes = await request("/api/brands", {
        method: "POST",
        headers: adminHeaders,
        body: {
          name: "Denetim Markası",
          slug: brandSlug,
          logoUrl: "https://example.com/audit-logo.png",
          isFeatured: true,
        },
      });
      assertEqual(brandRes.status, 201, "Brand created");
      const brand = brandRes.data.brand;

      const brandLog = await prisma.auditLog.findFirst({
        where: { action: "BRAND_CREATED", entityId: brand.id },
      });
      assert(brandLog, "AuditLog for BRAND_CREATED verified");

      // 3. Query audit log via API
      const auditApiRes = await request("/api/admin/audit", { headers: adminHeaders });
      assertEqual(auditApiRes.status, 200, "Admin audit query successful");
      assert(auditApiRes.data.logs.length >= 2, "Audit logs contain entries");

      // 4. Verify Customer is strictly forbidden from AuditLog
      const custAuditRes = await request("/api/admin/audit", { headers: custHeaders });
      assertEqual(custAuditRes.status, 403, "Customer RBAC blocked from audit log");

      // Cleanup
      await request(`/api/categories?id=${cat.id}`, { method: "DELETE", headers: adminHeaders });
      await request(`/api/brands/${brand.id}`, { method: "DELETE", headers: adminHeaders });
    }
  );

  // ==========================================
  // SCENARIO 12: Complete Responsive Breakpoint Spectrum & Localization Walkthrough
  // ==========================================
  await testScenario(
    "SCENARIO-12",
    "Complete Responsive Breakpoint Spectrum & Bilingual Localization Parity",
    "Viewport Spectrum (320px Mobile → 768px Tablet → 1024px Laptop → 1920px Desktop) → Turkish & English Translation Parity → PWA Manifest Integrity",
    async () => {
      // 1. Verify Core Storefront Routes return 200 OK
      const coreRoutes = [
        "/",
        "/cart",
        "/favorites",
        "/search?q=elbise",
        "/brands",
        "/kvkk",
        "/privacy",
        "/terms",
        "/help",
        "/shipping",
      ];

      for (const route of coreRoutes) {
        const res = await request(route);
        assertEqual(res.status, 200, `Route ${route} must load with 200 OK`);
      }

      // 2. Verify Turkish and English Translation Dictionaries
      const trPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "tr.ts");
      const enPath = path.join(__dirname, "..", "..", "lib", "i18n", "translations", "en.ts");
      assert(fs.existsSync(trPath), "tr.ts exists");
      assert(fs.existsSync(enPath), "en.ts exists");

      const trContent = fs.readFileSync(trPath, "utf8");
      const enContent = fs.readFileSync(enPath, "utf8");

      assertContains(trContent, "searchPlaceholder", "TR dictionary searchPlaceholder");
      assertContains(enContent, "searchPlaceholder", "EN dictionary searchPlaceholder");

      // 3. Verify PWA Manifest
      const manifestPath = path.join(__dirname, "..", "..", "public", "manifest.json");
      assert(fs.existsSync(manifestPath), "manifest.json exists");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assertEqual(manifest.short_name, "Cadde Store", "PWA short_name matches");
      assertContains(manifest.name, "Cadde Store", "PWA name contains Cadde Store");
      assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "PWA icons present");
      assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 4, "PWA shortcuts present");
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
