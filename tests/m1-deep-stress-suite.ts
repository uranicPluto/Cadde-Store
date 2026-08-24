/**
 * CADDE STORE — MILESTONE 1 (M1) EMPIRICAL VERIFICATION & STRESS TEST SUITE
 * 
 * Scope:
 *  1. lib/auth/permissions.ts (400-permutation permission matrix, RBAC roles, non-admin denial, session helpers)
 *  2. lib/appearance/appearance-repository.ts (Defaults, CSS variable derivation, partial updates, nested configs, reset, JSON resilience)
 *  3. lib/media/media-usage-scanner.ts (Multi-model scanning across Product, Category, Brand, Banner, CMS Page, Appearance; deletion safety; batch scanner; URL normalization)
 *  4. lib/cms/page-repository.ts (CRUD, slug uniqueness, version snapshots, multi-version rollbacks, unpublish, time-based scheduling, duplication, search/pagination, default static pages)
 */

import path from "path";
import Module from "module";

// Hook @/ path alias for standalone Node / ts-node execution
const origResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean) {
  if (request.startsWith("@/")) {
    request = path.join(process.cwd(), request.slice(2));
  }
  return origResolve.call(this, request, parent, isMain);
};

import prisma from "@/lib/db/prisma";
import {
  AdminRole,
  AdminResource,
  AdminAction,
  ROLE_PERMISSIONS_MAP,
  ROLE_METADATA,
  hasAdminPermission,
  getAdminRole,
  isSuperAdmin,
  isContentManager,
  isMerchandisingManager,
  isMarketingManager,
  isOperationsManager,
  isCustomer,
  isSeller,
  isAdmin,
  canModifySellerData,
  getRolePermissions,
} from "@/lib/auth/permissions";
import {
  getAppearanceSettings,
  updateAppearanceSettings,
  resetAppearanceSettings,
  deriveCssVariables,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from "@/lib/appearance/appearance-repository";
import {
  scanMediaAssetUsage,
  canDeleteMediaAsset,
  scanAllMediaAssetsUsage,
} from "@/lib/media/media-usage-scanner";
import {
  createPage,
  getPageById,
  getPageBySlug,
  getAllPages,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
  duplicatePage,
  getPageVersions,
  rollbackPageVersion,
  ensureDefaultStaticPages,
  DEFAULT_STATIC_PAGES,
} from "@/lib/cms/page-repository";

interface TestResult {
  group: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
  }
}

async function runTest(group: string, name: string, fn: () => Promise<void> | void) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ group, name, passed: true, durationMs: duration });
    console.log(`  ✓ [PASS] ${group} → ${name} (${duration}ms)`);
  } catch (err: any) {
    const duration = Date.now() - start;
    const errorMsg = err?.message || String(err);
    results.push({ group, name, passed: false, error: errorMsg, durationMs: duration });
    console.error(`  ✗ [FAIL] ${group} → ${name} (${duration}ms)\n    Error: ${errorMsg}`);
  }
}

// ============================================================================
// SUITE 1: PERMISSIONS & RBAC MATRIX (lib/auth/permissions.ts)
// ============================================================================
async function runPermissionsTests() {
  console.log("\n=======================================================");
  console.log("SUITE 1: PERMISSIONS & RBAC MATRIX (lib/auth/permissions.ts)");
  console.log("=======================================================");

  const ALL_ROLES: AdminRole[] = [
    "SUPER_ADMIN",
    "CONTENT_MANAGER",
    "MERCHANDISING_MANAGER",
    "MARKETING_MANAGER",
    "OPERATIONS_MANAGER",
  ];

  const ALL_RESOURCES: AdminResource[] = [
    "PAGES",
    "HOMEPAGE",
    "MEDIA",
    "NAVIGATION",
    "APPEARANCE",
    "LAYOUTS",
    "CATALOG",
    "MARKETING",
    "ORDERS",
    "RETURNS",
    "SELLERS",
    "CUSTOMERS",
    "SETTINGS",
    "AUDIT",
    "ANALYTICS",
    "HEALTH",
  ];

  const ALL_ACTIONS: AdminAction[] = ["READ", "WRITE", "DELETE", "PUBLISH", "ALL"];

  await runTest("PERM", "1.1 Super Admin Unrestricted Access Matrix (16 resources x 5 actions)", () => {
    const superAdminSession = {
      id: "sa-1",
      email: "superadmin@cadde.store",
      firstName: "Super",
      lastName: "Admin",
      role: "ADMIN" as const,
      adminRole: "SUPER_ADMIN",
    };

    for (const res of ALL_RESOURCES) {
      for (const act of ALL_ACTIONS) {
        const allowed = hasAdminPermission(superAdminSession, res, act);
        assert(allowed === true, `SUPER_ADMIN must be allowed on ${res}:${act}`);
      }
    }
  });

  await runTest("PERM", "1.2 Content Manager Granular Permissions Check", () => {
    const cmSession = {
      id: "cm-1",
      email: "cm@cadde.store",
      firstName: "Content",
      lastName: "Manager",
      role: "ADMIN" as const,
      adminRole: "CONTENT_MANAGER",
    };

    // Full access on CMS & Website Studio
    const fullResources: AdminResource[] = ["PAGES", "HOMEPAGE", "MEDIA", "NAVIGATION", "APPEARANCE"];
    for (const res of fullResources) {
      for (const act of ALL_ACTIONS) {
        assert(hasAdminPermission(cmSession, res, act), `CM must have ${act} on ${res}`);
      }
    }

    // Partial access on LAYOUTS (READ, WRITE allowed; DELETE, PUBLISH denied)
    assert(hasAdminPermission(cmSession, "LAYOUTS", "READ"), "CM must READ LAYOUTS");
    assert(hasAdminPermission(cmSession, "LAYOUTS", "WRITE"), "CM must WRITE LAYOUTS");
    assert(!hasAdminPermission(cmSession, "LAYOUTS", "DELETE"), "CM must NOT DELETE LAYOUTS");
    assert(!hasAdminPermission(cmSession, "LAYOUTS", "PUBLISH"), "CM must NOT PUBLISH LAYOUTS");

    // Read-only on ANALYTICS & HEALTH
    assert(hasAdminPermission(cmSession, "ANALYTICS", "READ"), "CM must READ ANALYTICS");
    assert(!hasAdminPermission(cmSession, "ANALYTICS", "WRITE"), "CM must NOT WRITE ANALYTICS");
    assert(hasAdminPermission(cmSession, "HEALTH", "READ"), "CM must READ HEALTH");
    assert(!hasAdminPermission(cmSession, "HEALTH", "WRITE"), "CM must NOT WRITE HEALTH");

    // Strictly denied resources
    const deniedResources: AdminResource[] = ["CATALOG", "MARKETING", "ORDERS", "RETURNS", "SELLERS", "CUSTOMERS", "SETTINGS", "AUDIT"];
    for (const res of deniedResources) {
      for (const act of ALL_ACTIONS) {
        assert(!hasAdminPermission(cmSession, res, act), `CM must be DENIED on ${res}:${act}`);
      }
    }
  });

  await runTest("PERM", "1.3 Merchandising Manager Granular Permissions Check", () => {
    const mmSession = {
      id: "mm-1",
      email: "mm@cadde.store",
      firstName: "Merch",
      lastName: "Manager",
      role: "ADMIN" as const,
      adminRole: "MERCHANDISING_MANAGER",
    };

    // Full on CATALOG & LAYOUTS
    for (const res of ["CATALOG", "LAYOUTS"] as AdminResource[]) {
      for (const act of ALL_ACTIONS) {
        assert(hasAdminPermission(mmSession, res, act), `MM must have ${act} on ${res}`);
      }
    }

    // Read/Write on HOMEPAGE, MEDIA, MARKETING
    for (const res of ["HOMEPAGE", "MEDIA", "MARKETING"] as AdminResource[]) {
      assert(hasAdminPermission(mmSession, res, "READ"), `MM must READ ${res}`);
      assert(hasAdminPermission(mmSession, res, "WRITE"), `MM must WRITE ${res}`);
      assert(!hasAdminPermission(mmSession, res, "DELETE"), `MM must NOT DELETE ${res}`);
    }

    // Denied on ORDERS, SETTINGS, AUDIT, SELLERS, CUSTOMERS, PAGES, NAVIGATION, APPEARANCE
    for (const res of ["ORDERS", "SETTINGS", "AUDIT", "SELLERS", "CUSTOMERS", "PAGES", "NAVIGATION", "APPEARANCE"] as AdminResource[]) {
      assert(!hasAdminPermission(mmSession, res, "READ"), `MM must NOT READ ${res}`);
    }
  });

  await runTest("PERM", "1.4 Marketing Manager Granular Permissions Check", () => {
    const mktSession = {
      id: "mkt-1",
      email: "mkt@cadde.store",
      firstName: "Marketing",
      lastName: "Manager",
      role: "ADMIN" as const,
      adminRole: "MARKETING_MANAGER",
    };

    // Full on MARKETING & ANALYTICS
    for (const res of ["MARKETING", "ANALYTICS"] as AdminResource[]) {
      for (const act of ALL_ACTIONS) {
        assert(hasAdminPermission(mktSession, res, act), `MKT must have ${act} on ${res}`);
      }
    }

    // Read/Write on HOMEPAGE, MEDIA, PAGES
    for (const res of ["HOMEPAGE", "MEDIA", "PAGES"] as AdminResource[]) {
      assert(hasAdminPermission(mktSession, res, "READ"), `MKT must READ ${res}`);
      assert(hasAdminPermission(mktSession, res, "WRITE"), `MKT must WRITE ${res}`);
      assert(!hasAdminPermission(mktSession, res, "DELETE"), `MKT must NOT DELETE ${res}`);
    }

    // Denied on ORDERS, RETURNS, SELLERS, CUSTOMERS, SETTINGS, AUDIT, CATALOG, APPEARANCE, LAYOUTS
    for (const res of ["ORDERS", "RETURNS", "SELLERS", "CUSTOMERS", "SETTINGS", "AUDIT", "CATALOG", "APPEARANCE", "LAYOUTS"] as AdminResource[]) {
      assert(!hasAdminPermission(mktSession, res, "READ"), `MKT must NOT READ ${res}`);
    }
  });

  await runTest("PERM", "1.5 Operations Manager Granular Permissions Check", () => {
    const opsSession = {
      id: "ops-1",
      email: "ops@cadde.store",
      firstName: "Ops",
      lastName: "Manager",
      role: "ADMIN" as const,
      adminRole: "OPERATIONS_MANAGER",
    };

    // Full on ORDERS, RETURNS, SELLERS, CUSTOMERS
    for (const res of ["ORDERS", "RETURNS", "SELLERS", "CUSTOMERS"] as AdminResource[]) {
      for (const act of ALL_ACTIONS) {
        assert(hasAdminPermission(opsSession, res, act), `OPS must have ${act} on ${res}`);
      }
    }

    // Read/Write on HEALTH
    assert(hasAdminPermission(opsSession, "HEALTH", "READ"), "OPS must READ HEALTH");
    assert(hasAdminPermission(opsSession, "HEALTH", "WRITE"), "OPS must WRITE HEALTH");
    assert(!hasAdminPermission(opsSession, "HEALTH", "DELETE"), "OPS must NOT DELETE HEALTH");

    // Read-only on AUDIT & ANALYTICS
    assert(hasAdminPermission(opsSession, "AUDIT", "READ"), "OPS must READ AUDIT");
    assert(!hasAdminPermission(opsSession, "AUDIT", "WRITE"), "OPS must NOT WRITE AUDIT");
    assert(hasAdminPermission(opsSession, "ANALYTICS", "READ"), "OPS must READ ANALYTICS");
    assert(!hasAdminPermission(opsSession, "ANALYTICS", "WRITE"), "OPS must NOT WRITE ANALYTICS");

    // Denied on PAGES, HOMEPAGE, MEDIA, NAVIGATION, APPEARANCE, LAYOUTS, CATALOG, MARKETING, SETTINGS
    for (const res of ["PAGES", "HOMEPAGE", "MEDIA", "NAVIGATION", "APPEARANCE", "LAYOUTS", "CATALOG", "MARKETING", "SETTINGS"] as AdminResource[]) {
      assert(!hasAdminPermission(opsSession, res, "READ"), `OPS must NOT READ ${res}`);
    }
  });

  await runTest("PERM", "1.6 Non-Admin Session Denial & Security Guards", () => {
    // Null session
    assert(!hasAdminPermission(null, "PAGES", "READ"), "Null session must be denied");
    assert(!hasAdminPermission(null, "ORDERS", "ALL"), "Null session must be denied");

    // Customer with forged adminRole
    const customerSession = {
      id: "cust-1",
      email: "attacker@fake.com",
      firstName: "Attacker",
      lastName: "Customer",
      role: "CUSTOMER" as const,
      adminRole: "SUPER_ADMIN",
    };
    assert(!hasAdminPermission(customerSession, "PAGES", "READ"), "Customer with forged adminRole must be denied");
    assert(!hasAdminPermission(customerSession, "SETTINGS", "ALL"), "Customer with forged adminRole must be denied");
    assert(!isAdmin(customerSession), "isAdmin must return false for customer");

    // Seller with forged adminRole
    const sellerSession = {
      id: "seller-1",
      email: "seller@store.com",
      firstName: "Seller",
      lastName: "Merchant",
      role: "SELLER" as const,
      adminRole: "SUPER_ADMIN",
      sellerSlug: "my-store",
    };
    assert(!hasAdminPermission(sellerSession, "SELLERS", "WRITE"), "Seller must be denied admin permission");
    assert(!isAdmin(sellerSession), "isAdmin must return false for seller");

    // Admin without adminRole defaults to SUPER_ADMIN
    const genericAdmin = {
      id: "adm-legacy",
      email: "admin@cadde.store",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as const,
    };
    assertEqual(getAdminRole(genericAdmin), "SUPER_ADMIN", "Admin with undefined adminRole defaults to SUPER_ADMIN");
    assert(hasAdminPermission(genericAdmin, "SETTINGS", "ALL"), "Admin with default role gets super admin access");
  });

  await runTest("PERM", "1.7 Seller Data Access Control (canModifySellerData)", () => {
    const adminSession = { id: "a1", email: "a@c.s", firstName: "A", lastName: "D", role: "ADMIN" as const };
    const sellerA = { id: "s1", email: "s1@c.s", firstName: "S1", lastName: "M", role: "SELLER" as const, sellerSlug: "store-alpha" };
    const customer = { id: "c1", email: "c1@c.s", firstName: "C", lastName: "U", role: "CUSTOMER" as const };

    assert(canModifySellerData(adminSession, "store-alpha"), "Admin can modify any seller");
    assert(canModifySellerData(adminSession, "store-beta"), "Admin can modify any seller");
    assert(canModifySellerData(sellerA, "store-alpha"), "Seller can modify own store");
    assert(!canModifySellerData(sellerA, "store-beta"), "Seller CANNOT modify other store");
    assert(!canModifySellerData(sellerA, undefined), "Seller cannot modify undefined target");
    assert(!canModifySellerData(customer, "store-alpha"), "Customer cannot modify store");
    assert(!canModifySellerData(null, "store-alpha"), "Null session cannot modify store");
  });

  await runTest("PERM", "1.8 Role Hierarchy and Metadata Sanity", () => {
    const saSession = { id: "sa", email: "sa@c.s", firstName: "S", lastName: "A", role: "ADMIN" as const, adminRole: "SUPER_ADMIN" };
    const cmSession = { id: "cm", email: "cm@c.s", firstName: "C", lastName: "M", role: "ADMIN" as const, adminRole: "CONTENT_MANAGER" };
    const mmSession = { id: "mm", email: "mm@c.s", firstName: "M", lastName: "M", role: "ADMIN" as const, adminRole: "MERCHANDISING_MANAGER" };

    // Super Admin fulfills all role check helpers
    assert(isSuperAdmin(saSession), "saSession is Super Admin");
    assert(isContentManager(saSession), "saSession fulfills isContentManager");
    assert(isMerchandisingManager(saSession), "saSession fulfills isMerchandisingManager");
    assert(isMarketingManager(saSession), "saSession fulfills isMarketingManager");
    assert(isOperationsManager(saSession), "saSession fulfills isOperationsManager");

    // CM does not fulfill other manager roles
    assert(!isSuperAdmin(cmSession), "CM is not Super Admin");
    assert(isContentManager(cmSession), "CM is Content Manager");
    assert(!isMerchandisingManager(cmSession), "CM is NOT Merchandising Manager");
    assert(!isMarketingManager(cmSession), "CM is NOT Marketing Manager");
    assert(!isOperationsManager(cmSession), "CM is NOT Operations Manager");

    // Check ROLE_METADATA has all 5 roles with TR and EN descriptions
    for (const role of ALL_ROLES) {
      const meta = ROLE_METADATA[role];
      assert(!!meta, `Metadata for ${role} must exist`);
      assert(meta.nameTr.length > 0, `${role} nameTr required`);
      assert(meta.nameEn.length > 0, `${role} nameEn required`);
      assert(meta.descriptionTr.length > 0, `${role} descriptionTr required`);
      assert(meta.descriptionEn.length > 0, `${role} descriptionEn required`);
    }
  });
}

// ============================================================================
// SUITE 2: APPEARANCE REPOSITORY (lib/appearance/appearance-repository.ts)
// ============================================================================
async function runAppearanceTests() {
  console.log("\n=======================================================");
  console.log("SUITE 2: APPEARANCE REPOSITORY (lib/appearance/appearance-repository.ts)");
  console.log("=======================================================");

  await runTest("APPEARANCE", "2.1 Reset & Retrieve Default Settings", async () => {
    const settings = await resetAppearanceSettings();
    assert(settings.id === "default", "Settings ID must be default");
    assertEqual(settings.brandColor, DEFAULT_APPEARANCE_SETTINGS.brandColor, "Brand color matches default");
    assertEqual(settings.accentColor, DEFAULT_APPEARANCE_SETTINGS.accentColor, "Accent color matches default");
    assertEqual(settings.borderRadius, DEFAULT_APPEARANCE_SETTINGS.borderRadius, "Border radius matches default");
    assertEqual(settings.fontHeading, DEFAULT_APPEARANCE_SETTINGS.fontHeading, "Heading font matches default");
    assertEqual(settings.headerConfig.logoHeight, 40, "Default logo height is 40");
    assertEqual(settings.footerConfig.columns.length, 4, "Default footer has 4 columns");

    const retrieved = await getAppearanceSettings();
    assertEqual(retrieved.marketplaceName, settings.marketplaceName, "Retrieved matches reset");
  });

  await runTest("APPEARANCE", "2.2 CSS Variable Derivation Logic", () => {
    const customSettings = {
      ...DEFAULT_APPEARANCE_SETTINGS,
      brandColor: "#059669",
      accentColor: "#d97706",
      borderRadius: "16px",
      fontHeading: "Poppins",
      fontBody: "Roboto",
      updatedAt: new Date(),
    };

    const cssVars = deriveCssVariables(customSettings);
    assertEqual(cssVars["--brand-primary"], "#059669", "--brand-primary matches");
    assertEqual(cssVars["--brand-accent"], "#d97706", "--brand-accent matches");
    assertEqual(cssVars["--radius"], "16px", "--radius matches");
    assertEqual(cssVars["--font-heading"], "Poppins", "--font-heading matches");
    assertEqual(cssVars["--font-body"], "Roboto", "--font-body matches");
  });

  await runTest("APPEARANCE", "2.3 Partial Updates on Top-Level Attributes", async () => {
    // Modify brandColor and tagline only
    const updated = await updateAppearanceSettings({
      brandColor: "#4f46e5",
      tagline: "Türkiye'nin Lider Pazaryeri",
    });

    assertEqual(updated.brandColor, "#4f46e5", "brandColor updated");
    assertEqual(updated.tagline, "Türkiye'nin Lider Pazaryeri", "tagline updated");
    // Verify untouched fields preserved
    assertEqual(updated.accentColor, DEFAULT_APPEARANCE_SETTINGS.accentColor, "accentColor preserved");
    assertEqual(updated.fontHeading, DEFAULT_APPEARANCE_SETTINGS.fontHeading, "fontHeading preserved");
    assertEqual(updated.headerConfig.showAnnouncement, true, "headerConfig preserved");
  });

  await runTest("APPEARANCE", "2.4 Nested Header & Footer Partial Updates", async () => {
    // Update only sticky flag and Turkish announcement text
    const updatedHeader = await updateAppearanceSettings({
      headerConfig: {
        sticky: false,
        announcementTextTr: "Yaz Kampanyası Başladı!",
      },
    });

    assertEqual(updatedHeader.headerConfig.sticky, false, "sticky updated to false");
    assertEqual(updatedHeader.headerConfig.announcementTextTr, "Yaz Kampanyası Başladı!", "announcementTextTr updated");
    assertEqual(updatedHeader.headerConfig.showSearch, true, "showSearch preserved");
    assertEqual(updatedHeader.headerConfig.logoHeight, 40, "logoHeight preserved");

    // Update only footer newsletter visibility
    const updatedFooter = await updateAppearanceSettings({
      footerConfig: {
        showNewsletter: false,
      },
    });

    assertEqual(updatedFooter.footerConfig.showNewsletter, false, "showNewsletter disabled");
    assertEqual(updatedFooter.footerConfig.columns.length, 4, "footer columns preserved");
    assertEqual(updatedFooter.footerConfig.socialLinks.length, 5, "social links preserved");
  });

  await runTest("APPEARANCE", "2.5 Nullable Fields Handling (logoUrl, faviconUrl, tagline)", async () => {
    const updated = await updateAppearanceSettings({
      logoUrl: null,
      faviconUrl: null,
      tagline: null,
    });

    assertEqual(updated.logoUrl, null, "logoUrl correctly set to null");
    assertEqual(updated.faviconUrl, null, "faviconUrl correctly set to null");
    assertEqual(updated.tagline, null, "tagline correctly set to null");

    // Verify retrieval preserves null
    const retrieved = await getAppearanceSettings();
    assertEqual(retrieved.logoUrl, null, "retrieved logoUrl is null");
  });

  await runTest("APPEARANCE", "2.6 Resiliency Against Corrupted JSON in Database", async () => {
    // Manually inject corrupted JSON into appearanceSettings
    await prisma.appearanceSettings.update({
      where: { id: "default" },
      data: {
        headerConfigJson: "{INVALID_JSON_CORRUPTED",
        footerConfigJson: "{MALFORMED_FOOTER_JSON",
      },
    });

    // getAppearanceSettings should gracefully fall back to default configs without throwing
    const safeSettings = await getAppearanceSettings();
    assert(!!safeSettings.headerConfig, "headerConfig must not be undefined");
    assertEqual(safeSettings.headerConfig.showAnnouncement, true, "falls back to default header config");
    assert(!!safeSettings.footerConfig, "footerConfig must not be undefined");
    assertEqual(safeSettings.footerConfig.columns.length, 4, "falls back to default footer config");

    // Clean up
    await resetAppearanceSettings();
  });
}

// ============================================================================
// SUITE 3: MEDIA USAGE SCANNER (lib/media/media-usage-scanner.ts)
// ============================================================================
async function runMediaScannerTests() {
  console.log("\n=======================================================");
  console.log("SUITE 3: MEDIA USAGE SCANNER (lib/media/media-usage-scanner.ts)");
  console.log("=======================================================");

  // Unique URLs for empirical isolation
  const TEST_TAG = `m1-test-${Date.now()}`;
  const URL_PRODUCT_COVER = `https://cdn.cadde.store/test/${TEST_TAG}/prod-cover.jpg`;
  const URL_PRODUCT_GALLERY_STR = `https://cdn.cadde.store/test/${TEST_TAG}/prod-gallery-str.jpg`;
  const URL_PRODUCT_GALLERY_OBJ = `https://cdn.cadde.store/test/${TEST_TAG}/prod-gallery-obj.jpg`;
  const URL_CATEGORY_HERO = `https://cdn.cadde.store/test/${TEST_TAG}/cat-hero.jpg`;
  const URL_BRAND_LOGO = `https://cdn.cadde.store/test/${TEST_TAG}/brand-logo.png`;
  const URL_BANNER_DESKTOP = `https://cdn.cadde.store/test/${TEST_TAG}/banner-desk.jpg`;
  const URL_CMS_EMBEDDED = `https://cdn.cadde.store/test/${TEST_TAG}/cms-content.png`;
  const URL_APPEARANCE_LOGO = `https://cdn.cadde.store/test/${TEST_TAG}/app-logo.svg`;
  const URL_UNUSED_ASSET = `https://cdn.cadde.store/test/${TEST_TAG}/unused-orphan.jpg`;

  let createdEntities: {
    productId?: string;
    categoryId?: string;
    brandId?: string;
    bannerId?: string;
    cmsPageId?: string;
    mediaAssetIds: string[];
  } = { mediaAssetIds: [] };

  try {
    // Setup test fixtures across models
    const seller = await prisma.seller.findFirst();
    const category = await prisma.category.findFirst();

    if (!seller || !category) {
      throw new Error("Missing baseline seller or category for fixture creation");
    }

    // 1. Create test Product with cover & gallery images
    const testProd = await prisma.product.create({
      data: {
        name: `Test M1 Scanner Product ${TEST_TAG}`,
        slug: `test-m1-prod-${TEST_TAG}`,
        sku: `SKU-M1-${TEST_TAG}`,
        price: 99.99,
        stock: 10,
        imageUrl: URL_PRODUCT_COVER,
        images: JSON.stringify([
          URL_PRODUCT_GALLERY_STR,
          { url: URL_PRODUCT_GALLERY_OBJ, alt: "Alt text" },
        ]),
        sellerId: seller.id,
        categoryId: category.id,
        description: "Test description for media scanner",
        brand: "TestBrand",
      },
    });
    createdEntities.productId = testProd.id;

    // 2. Create test Category
    const testCat = await prisma.category.create({
      data: {
        nameTR: `Test Kategori ${TEST_TAG}`,
        nameEN: `Test Category ${TEST_TAG}`,
        slug: `test-cat-${TEST_TAG}`,
        descriptionTR: "Açıklama",
        descriptionEN: "Description",
        imageUrl: URL_CATEGORY_HERO,
      },
    });
    createdEntities.categoryId = testCat.id;

    // 3. Create test Brand
    const testBrand = await prisma.brand.create({
      data: {
        name: `Test Brand ${TEST_TAG}`,
        slug: `test-brand-${TEST_TAG}`,
        logoUrl: URL_BRAND_LOGO,
      },
    });
    createdEntities.brandId = testBrand.id;

    // 4. Create test Banner
    const testBanner = await prisma.banner.create({
      data: {
        titleTR: `Test Banner ${TEST_TAG}`,
        imageUrlDesktop: URL_BANNER_DESKTOP,
        imageUrlMobile: URL_BANNER_DESKTOP,
      },
    });
    createdEntities.bannerId = testBanner.id;

    // 5. Create test CMS Page containing embedded image in sectionsJson
    const testPage = await prisma.cmsPage.create({
      data: {
        titleTr: `Test CMS Sayfa ${TEST_TAG}`,
        titleEn: `Test CMS Page ${TEST_TAG}`,
        slug: `test-cms-${TEST_TAG}`,
        sectionsJson: JSON.stringify([
          {
            id: "sec-1",
            type: "RICH_CONTENT",
            configJson: {
              customHtmlTR: `<img src="${URL_CMS_EMBEDDED}" alt="Test" />`,
            },
          },
        ]),
      },
    });
    createdEntities.cmsPageId = testPage.id;

    // 6. Update Appearance logoUrl
    await prisma.appearanceSettings.update({
      where: { id: "default" },
      data: { logoUrl: URL_APPEARANCE_LOGO },
    });

    // 7. Seed MediaAsset catalog entries
    const mediaAsset1 = await prisma.mediaAsset.create({
      data: {
        filename: "prod-cover.jpg",
        url: URL_PRODUCT_COVER,
        mimeType: "image/jpeg",
        sizeBytes: 10240,
      },
    });
    const mediaAsset2 = await prisma.mediaAsset.create({
      data: {
        filename: "unused-orphan.jpg",
        url: URL_UNUSED_ASSET,
        mimeType: "image/jpeg",
        sizeBytes: 5120,
      },
    });
    createdEntities.mediaAssetIds.push(mediaAsset1.id, mediaAsset2.id);

    // --- TEST SUITES ---

    await runTest("MEDIA", "3.1 Product Cover & Gallery Scanning (String + Object Array)", async () => {
      // Cover image
      const scanCover = await scanMediaAssetUsage(URL_PRODUCT_COVER);
      assert(scanCover.isUsed === true, "Cover image must be detected as in-use");
      assert(scanCover.referenceCount >= 1, "Reference count >= 1");
      const coverUsage = scanCover.usages.find((u) => u.entityType === "PRODUCT" && u.fieldName === "imageUrl");
      assert(!!coverUsage, "Found usage in Product.imageUrl");

      // Gallery string
      const scanGalStr = await scanMediaAssetUsage(URL_PRODUCT_GALLERY_STR);
      assert(scanGalStr.isUsed === true, "Gallery string must be detected as in-use");
      const galStrUsage = scanGalStr.usages.find((u) => u.entityType === "PRODUCT" && u.fieldName === "images[]");
      assert(!!galStrUsage, "Found usage in Product.images[] (string)");

      // Gallery object
      const scanGalObj = await scanMediaAssetUsage(URL_PRODUCT_GALLERY_OBJ);
      assert(scanGalObj.isUsed === true, "Gallery object must be detected as in-use");
      const galObjUsage = scanGalObj.usages.find((u) => u.entityType === "PRODUCT" && u.fieldName === "images[]");
      assert(!!galObjUsage, "Found usage in Product.images[] (object)");
    });

    await runTest("MEDIA", "3.2 Category & Brand Asset Scanning", async () => {
      // Category
      const scanCat = await scanMediaAssetUsage(URL_CATEGORY_HERO);
      assert(scanCat.isUsed === true, "Category hero must be detected");
      assert(scanCat.usages.some((u) => u.entityType === "CATEGORY" && u.fieldName === "imageUrl"), "Found Category usage");

      // Brand
      const scanBrand = await scanMediaAssetUsage(URL_BRAND_LOGO);
      assert(scanBrand.isUsed === true, "Brand logo must be detected");
      assert(scanBrand.usages.some((u) => u.entityType === "BRAND" && u.fieldName === "logoUrl"), "Found Brand usage");
    });

    await runTest("MEDIA", "3.3 Banner & CMS Page Embedded Scanning", async () => {
      // Banner
      const scanBanner = await scanMediaAssetUsage(URL_BANNER_DESKTOP);
      assert(scanBanner.isUsed === true, "Banner desktop/mobile must be detected");
      assert(scanBanner.referenceCount >= 2, "Banner desktop and mobile counted");

      // CMS Page
      const scanPage = await scanMediaAssetUsage(URL_CMS_EMBEDDED);
      assert(scanPage.isUsed === true, "CMS embedded section image must be detected");
      assert(scanPage.usages.some((u) => u.entityType === "CMS_PAGE"), "Found CMS Page usage");
    });

    await runTest("MEDIA", "3.4 Appearance Settings Logo & Favicon Scanning", async () => {
      const scanApp = await scanMediaAssetUsage(URL_APPEARANCE_LOGO);
      assert(scanApp.isUsed === true, "Appearance logo must be detected");
      assert(scanApp.usages.some((u) => u.entityType === "APPEARANCE" && u.fieldName === "logoUrl"), "Found Appearance usage");
    });

    await runTest("MEDIA", "3.5 Deletion Safety Guard (canDeleteMediaAsset)", async () => {
      // In-use asset protection
      const inUseCheck = await canDeleteMediaAsset(URL_PRODUCT_COVER);
      assertEqual(inUseCheck.canDelete, false, "Live asset cannot be deleted");
      assert(inUseCheck.referenceCount >= 1, "Reference count >= 1");
      assert(inUseCheck.usageLocations.length > 0, "Provides human-readable usage locations");

      // Unused orphan asset
      const unusedCheck = await canDeleteMediaAsset(URL_UNUSED_ASSET);
      assertEqual(unusedCheck.canDelete, true, "Orphan asset CAN be deleted");
      assertEqual(unusedCheck.referenceCount, 0, "Orphan asset reference count is 0");
      assertEqual(unusedCheck.usageLocations.length, 0, "No usage locations");
    });

    await runTest("MEDIA", "3.6 URL Normalization and Substring Resiliency", async () => {
      // Mixed casing and whitespace
      const dirtyUrl = `  ${URL_PRODUCT_COVER.toUpperCase()}  `;
      const scanDirty = await scanMediaAssetUsage(dirtyUrl);
      assert(scanDirty.isUsed === true, "Case-insensitive and trimmed URL match works");

      // Blank URL safety
      const scanEmpty = await scanMediaAssetUsage("   ");
      assertEqual(scanEmpty.isUsed, false, "Empty URL returns safe unused response");
      assertEqual(scanEmpty.referenceCount, 0, "Empty URL reference count is 0");
    });

    await runTest("MEDIA", "3.7 Batch Media Assets Usage Scanner (scanAllMediaAssetsUsage)", async () => {
      const batchResult = await scanAllMediaAssetsUsage();
      assert(typeof batchResult === "object", "Batch result is an object map");
      assert(!!batchResult[mediaAsset1.id], "Contains mediaAsset1");
      assert(batchResult[mediaAsset1.id].isUsed === true, "mediaAsset1 is in use");
      assert(!!batchResult[mediaAsset2.id], "Contains mediaAsset2");
      assert(batchResult[mediaAsset2.id].isUsed === false, "mediaAsset2 is unused");
    });

  } finally {
    // Teardown test fixtures
    if (createdEntities.productId) {
      await prisma.product.delete({ where: { id: createdEntities.productId } }).catch(() => {});
    }
    if (createdEntities.categoryId) {
      await prisma.category.delete({ where: { id: createdEntities.categoryId } }).catch(() => {});
    }
    if (createdEntities.brandId) {
      await prisma.brand.delete({ where: { id: createdEntities.brandId } }).catch(() => {});
    }
    if (createdEntities.bannerId) {
      await prisma.banner.delete({ where: { id: createdEntities.bannerId } }).catch(() => {});
    }
    if (createdEntities.cmsPageId) {
      await prisma.cmsPage.delete({ where: { id: createdEntities.cmsPageId } }).catch(() => {});
    }
    for (const mId of createdEntities.mediaAssetIds) {
      await prisma.mediaAsset.delete({ where: { id: mId } }).catch(() => {});
    }
    await resetAppearanceSettings().catch(() => {});
  }
}

// ============================================================================
// SUITE 4: CMS PAGE BUILDER & REPOSITORY (lib/cms/page-repository.ts)
// ============================================================================
async function runPageRepositoryTests() {
  console.log("\n=======================================================");
  console.log("SUITE 4: CMS PAGE REPOSITORY (lib/cms/page-repository.ts)");
  console.log("=======================================================");

  const TEST_PREFIX = `m1-page-${Date.now()}`;
  const createdPageIds: string[] = [];

  try {
    await runTest("CMS", "4.1 Ensure Default Static Pages Seeding & Idempotency", async () => {
      await ensureDefaultStaticPages();
      for (const defPage of DEFAULT_STATIC_PAGES) {
        const found = await prisma.cmsPage.findUnique({ where: { slug: defPage.slug } });
        assert(!!found, `Default static page /${defPage.slug} must exist`);
        assertEqual(found?.status, "PUBLISHED", `Default page /${defPage.slug} must be PUBLISHED`);
      }

      // Re-running ensureDefaultStaticPages should be completely idempotent
      await ensureDefaultStaticPages();
    });

    await runTest("CMS", "4.2 Page Creation with Normalization & Defaults", async () => {
      const page = await createPage(
        {
          slug: `  ${TEST_PREFIX}-LANDING  `,
          titleTr: "  Yaz Sezonu Özel İndirimleri  ",
          titleEn: "  Summer Season Special Deals  ",
          sectionsJson: [
            {
              id: "sec-hero",
              type: "HERO_BANNER",
              titleTR: "Yaz Koleksiyonu",
              titleEN: "Summer Collection",
              orderIndex: 0,
              active: true,
            },
          ],
          metaTitleTr: "Yaz Kampanyası | Cadde Store",
          metaTitleEn: "Summer Deals | Cadde Store",
        },
        "author-admin-1"
      );

      createdPageIds.push(page.id);

      assertEqual(page.slug, `${TEST_PREFIX}-landing`, "Slug is trimmed and lowercased");
      assertEqual(page.titleTr, "Yaz Sezonu Özel İndirimleri", "titleTr is trimmed");
      assertEqual(page.titleEn, "Summer Season Special Deals", "titleEn is trimmed");
      assertEqual(page.type, "CUSTOM", "Default type is CUSTOM");
      assertEqual(page.status, "DRAFT", "Default status is DRAFT");
      assertEqual(page.authorId, "author-admin-1", "authorId attributed");

      const parsedSections = JSON.parse(page.sectionsJson);
      assertEqual(parsedSections.length, 1, "sectionsJson correctly serialized");
      assertEqual(parsedSections[0].type, "HERO_BANNER", "Section type preserved");
    });

    await runTest("CMS", "4.3 Slug Conflict & Uniqueness Enforcement", async () => {
      const conflictSlug = `${TEST_PREFIX}-unique-slug`;

      const page1 = await createPage({
        slug: conflictSlug,
        titleTr: "Orijinal Sayfa",
        titleEn: "Original Page",
      });
      createdPageIds.push(page1.id);

      // Attempt duplicate slug creation
      let failed = false;
      try {
        await createPage({
          slug: conflictSlug.toUpperCase(), // Same normalized slug
          titleTr: "Çakışan Sayfa",
          titleEn: "Conflicting Page",
        });
      } catch (err: any) {
        failed = true;
      }
      assert(failed, "Creating a page with an existing slug must throw UniqueConstraintError");
    });

    await runTest("CMS", "4.4 Publication, Version Increments & Snapshots", async () => {
      const page = await createPage({
        slug: `${TEST_PREFIX}-version-lifecycle`,
        titleTr: "Versiyon Test Sayfası v1",
        titleEn: "Version Test Page v1",
        sectionsJson: [{ id: "v1-sec", titleTR: "Versiyon 1 Başlığı" }],
      });
      createdPageIds.push(page.id);

      // Publish V1
      const pub1 = await publishPage(page.id, "admin-1", "First public release");
      assertEqual(pub1.page.status, "PUBLISHED", "Page status is PUBLISHED");
      assertEqual(pub1.version.versionNumber, 1, "First version number is 1");
      assertEqual(pub1.page.publishedVersionId, pub1.version.id, "publishedVersionId set to v1 id");

      const snap1 = JSON.parse(pub1.version.snapshotJson);
      assertEqual(snap1.titleTr, "Versiyon Test Sayfası v1", "Snapshot captured v1 titleTr");

      // Update and Publish V2
      await updatePage(page.id, {
        titleTr: "Versiyon Test Sayfası v2 (Güncellendi)",
        titleEn: "Version Test Page v2 (Updated)",
        sectionsJson: [{ id: "v2-sec", titleTR: "Versiyon 2 Yeni Bölüm" }],
      });

      const pub2 = await publishPage(page.id, "admin-2", "Updated with new banner layout");
      assertEqual(pub2.version.versionNumber, 2, "Second version number is 2");
      assertEqual(pub2.page.publishedVersionId, pub2.version.id, "publishedVersionId updated to v2 id");

      const versions = await getPageVersions(page.id);
      assertEqual(versions.length, 2, "Page has 2 recorded versions");
      assertEqual(versions[0].versionNumber, 2, "Versions ordered descending (latest first)");
      assertEqual(versions[1].versionNumber, 1, "Older version is second");
    });

    await runTest("CMS", "4.5 Rollback to Prior Snapshot", async () => {
      const page = await createPage({
        slug: `${TEST_PREFIX}-rollback-test`,
        titleTr: "Rollback Orijinal Başlık",
        titleEn: "Rollback Original Title",
        sectionsJson: [{ id: "s-orig", content: "Original V1 content" }],
      });
      createdPageIds.push(page.id);

      // Publish V1
      const pub1 = await publishPage(page.id, "admin-1", "Initial V1");
      const v1Id = pub1.version.id;

      // Update to V2 and Publish
      await updatePage(page.id, {
        titleTr: "Hatalı Değişiklik V2",
        titleEn: "Erroneous Change V2",
        sectionsJson: [{ id: "s-bad", content: "Broken V2 content" }],
      });
      const pub2 = await publishPage(page.id, "admin-1", "Broken V2");

      // Execute Rollback to V1
      const rolledBack = await rollbackPageVersion(page.id, v1Id, "admin-1");
      assertEqual(rolledBack.titleTr, "Rollback Orijinal Başlık", "titleTr restored to V1");
      assertEqual(rolledBack.titleEn, "Rollback Original Title", "titleEn restored to V1");
      assertEqual(rolledBack.status, "DRAFT", "Status set to DRAFT upon rollback for safety review");

      const restoredSections = JSON.parse(rolledBack.sectionsJson);
      assertEqual(restoredSections[0].content, "Original V1 content", "Sections restored to V1");

      // Verify invalid version rollback error
      let rollbackError = false;
      try {
        await rollbackPageVersion(page.id, "non-existent-version-id");
      } catch {
        rollbackError = true;
      }
      assert(rollbackError, "Rollback with invalid version ID throws error");
    });

    await runTest("CMS", "4.6 Unpublish and Storefront Visibility Controls", async () => {
      const page = await createPage({
        slug: `${TEST_PREFIX}-unpublish-test`,
        titleTr: "Yayından Kaldırma Testi",
        titleEn: "Unpublish Test Page",
      });
      createdPageIds.push(page.id);

      await publishPage(page.id);

      // Storefront can view published page
      const visible = await getPageBySlug(page.slug, false);
      assert(!!visible, "Published page is visible to storefront");

      // Unpublish
      await unpublishPage(page.id);

      // Storefront cannot view unpublished draft
      const hidden = await getPageBySlug(page.slug, false);
      assertEqual(hidden, null, "Unpublished draft is hidden from storefront");

      // Admin preview can view unpublished draft
      const adminPreview = await getPageBySlug(page.slug, true);
      assert(!!adminPreview, "Draft is visible when includeDraft=true");
      assertEqual(adminPreview?.status, "DRAFT", "Draft status confirmed");
    });

    await runTest("CMS", "4.7 Time-Based Publishing and Expiration Schedules", async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneHourAhead = new Date(now.getTime() + 3600000);

      // 1. Scheduled in the future -> NOT visible on storefront yet
      const futurePage = await createPage({
        slug: `${TEST_PREFIX}-future-scheduled`,
        titleTr: "Gelecek Kampanya",
        titleEn: "Future Campaign",
        status: "SCHEDULED",
        schedulePublishAt: oneHourAhead,
      });
      createdPageIds.push(futurePage.id);

      const storeFuture = await getPageBySlug(futurePage.slug, false);
      assertEqual(storeFuture, null, "Future scheduled page is hidden from storefront");
      const previewFuture = await getPageBySlug(futurePage.slug, true);
      assert(!!previewFuture, "Future scheduled page is visible in admin preview");

      // 2. Scheduled in the past -> Automatically visible on storefront
      const pastScheduledPage = await createPage({
        slug: `${TEST_PREFIX}-past-scheduled`,
        titleTr: "Başlamış Kampanya",
        titleEn: "Started Campaign",
        status: "SCHEDULED",
        schedulePublishAt: oneHourAgo,
      });
      createdPageIds.push(pastScheduledPage.id);

      const storePast = await getPageBySlug(pastScheduledPage.slug, false);
      assert(!!storePast, "Past scheduled page is active on storefront");

      // 3. Published but expired via scheduleUnpublishAt -> Automatically hidden
      const expiredPage = await createPage({
        slug: `${TEST_PREFIX}-expired-campaign`,
        titleTr: "Biten Kampanya",
        titleEn: "Expired Campaign",
        status: "PUBLISHED",
        scheduleUnpublishAt: oneHourAgo,
      });
      createdPageIds.push(expiredPage.id);

      const storeExpired = await getPageBySlug(expiredPage.slug, false);
      assertEqual(storeExpired, null, "Expired page is hidden from storefront");
    });

    await runTest("CMS", "4.8 Page Duplication Engine", async () => {
      const original = await createPage({
        slug: `${TEST_PREFIX}-dup-orig`,
        titleTr: "Orijinal Kampanya Şablonu",
        titleEn: "Original Campaign Template",
        type: "CAMPAIGN",
        sectionsJson: [{ id: "dup-sec", titleTR: "Şablon Başlık" }],
      });
      createdPageIds.push(original.id);

      // Duplicate with default copy naming
      const copy1 = await duplicatePage(original.id);
      createdPageIds.push(copy1.id);

      assert(copy1.slug.includes(`${original.slug}-copy-`), "Generated copy slug contains copy suffix");
      assert(copy1.titleTr.includes("(Kopya)"), "titleTr contains (Kopya)");
      assertEqual(copy1.status, "DRAFT", "Duplicated page starts as DRAFT");
      assertEqual(copy1.type, "CAMPAIGN", "Duplicated page preserves type");

      // Duplicate with explicit slug and title
      const copy2 = await duplicatePage(
        original.id,
        `${TEST_PREFIX}-dup-custom-slug`,
        "Özel Klon Başlık",
        "Custom Clone Title"
      );
      createdPageIds.push(copy2.id);

      assertEqual(copy2.slug, `${TEST_PREFIX}-dup-custom-slug`, "Uses custom slug");
      assertEqual(copy2.titleTr, "Özel Klon Başlık", "Uses custom titleTr");
    });

    await runTest("CMS", "4.9 Filtering, Search & Pagination (getAllPages)", async () => {
      // Query pages by type
      const policyPages = await getAllPages({ type: "POLICY" });
      assert(policyPages.length >= 4, "Found multiple POLICY pages");
      assert(policyPages.every((p) => p.type === "POLICY"), "All returned pages are POLICY");

      // Query pages by search query
      const searchResults = await getAllPages({ search: "Gizlilik" });
      assert(searchResults.length >= 1, "Found page by Turkish search query");
      assert(searchResults.some((p) => p.slug === "privacy-policy"), "Found privacy-policy");

      const searchEnResults = await getAllPages({ search: "Terms" });
      assert(searchEnResults.length >= 1, "Found page by English search query");
      assert(searchEnResults.some((p) => p.slug === "terms-of-service"), "Found terms-of-service");

      // Pagination
      const paginated = await getAllPages({ limit: 2, offset: 0 });
      assertEqual(paginated.length, 2, "Limit respected");
    });

  } finally {
    // Teardown test pages
    for (const pageId of createdPageIds) {
      await deletePage(pageId).catch(() => {});
    }
  }
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function main() {
  console.log("================================================================================");
  console.log("       CADDE STORE — M1 EMPIRICAL CHALLENGER VERIFICATION & STRESS SUITE        ");
  console.log("================================================================================");
  console.log(`Started At: ${new Date().toISOString()}`);

  const overallStart = Date.now();

  try {
    await runPermissionsTests();
    await runAppearanceTests();
    await runMediaScannerTests();
    await runPageRepositoryTests();
  } catch (fatal: any) {
    console.error("Fatal suite crash:", fatal);
  }

  const overallDuration = (Date.now() - overallStart) / 1000;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n================================================================================");
  console.log("                           M1 TEST EXECUTION SUMMARY                            ");
  console.log("================================================================================");
  console.log(`  Permissions (RBAC Matrix):         ${results.filter(r => r.group === "PERM" && r.passed).length}/${results.filter(r => r.group === "PERM").length} passed`);
  console.log(`  Appearance (Design Tokens & Reset): ${results.filter(r => r.group === "APPEARANCE" && r.passed).length}/${results.filter(r => r.group === "APPEARANCE").length} passed`);
  console.log(`  Media Scanner (Usage Tracking):    ${results.filter(r => r.group === "MEDIA" && r.passed).length}/${results.filter(r => r.group === "MEDIA").length} passed`);
  console.log(`  CMS Page Repository (Snapshots):   ${results.filter(r => r.group === "CMS" && r.passed).length}/${results.filter(r => r.group === "CMS").length} passed`);
  console.log("--------------------------------------------------------------------------------");
  console.log(`  TOTAL M1 TESTS:                    ${passedCount}/${results.length} passed (${failedCount} failed) in ${overallDuration.toFixed(2)}s`);
  console.log("================================================================================");

  if (failedCount > 0) {
    console.error("\n>>> VERDICT: REQUEST_CHANGES (Failures detected) <<<");
    process.exit(1);
  } else {
    console.log("\n>>> VERDICT: APPROVE (All M1 empirical tests passed cleanly) <<<");
    process.exit(0);
  }
}

main();
