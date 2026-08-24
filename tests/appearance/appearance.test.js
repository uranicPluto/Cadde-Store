const {
  prisma,
  request,
  getAuthHeaders,
  assert,
  assertEqual,
} = require("../e2e/harness");

async function runAppearanceTests() {
  console.log("\n=======================================================");
  console.log("  TESTING GLOBAL APPEARANCE STUDIO & RUNTIME TOKENS");
  console.log("=======================================================\n");

  const adminHeaders = await getAuthHeaders("ADMIN");
  const customerHeaders = await getAuthHeaders("CUSTOMER");

  // 1. GET /api/appearance (Public)
  console.log("Test 1: Public GET /api/appearance...");
  const getRes = await request("/api/appearance", { method: "GET" });
  assertEqual(getRes.status, 200, "Expected 200 OK for GET /api/appearance");
  assert(getRes.data.success, "Expected success: true");
  assert(getRes.data.settings, "Expected settings object");
  assert(getRes.data.cssVariables, "Expected cssVariables object");
  assertEqual(getRes.data.cssVariables["--brand-primary"], getRes.data.settings.brandColor);
  console.log("  ✓ Test 1 Passed.");

  // 2. PUT /api/appearance without auth -> 403
  console.log("Test 2: Unauthenticated PUT /api/appearance returns 403...");
  const unauthRes = await request("/api/appearance", {
    method: "PUT",
    body: { marketplaceName: "Hacked Store" },
  });
  assertEqual(unauthRes.status, 403, "Expected 403 Forbidden for unauthenticated PUT");
  console.log("  ✓ Test 2 Passed.");

  // 3. PUT /api/appearance as Customer -> 403
  console.log("Test 3: Customer role PUT /api/appearance returns 403...");
  const custRes = await request("/api/appearance", {
    method: "PUT",
    headers: customerHeaders,
    body: { marketplaceName: "Customer Store" },
  });
  assertEqual(custRes.status, 403, "Expected 403 Forbidden for customer role PUT");
  console.log("  ✓ Test 3 Passed.");

  // 4. PUT /api/appearance as Admin -> Updates branding & tokens + AuditLog
  console.log("Test 4: Admin updates branding, tokens, headerConfig, footerConfig...");
  const customName = `Cadde Luxury Plaza ${Date.now()}`;
  const customBrandColor = "#7c3aed";
  const customAccentColor = "#ec4899";
  const customRadius = "16px";
  const customHeading = "Montserrat";
  const customBody = "Inter";

  const putRes = await request("/api/appearance", {
    method: "PUT",
    headers: adminHeaders,
    body: {
      marketplaceName: customName,
      tagline: "Lüks ve Seçkin Markalar",
      brandColor: customBrandColor,
      accentColor: customAccentColor,
      borderRadius: customRadius,
      fontHeading: customHeading,
      fontBody: customBody,
      headerConfig: {
        showAnnouncement: true,
        announcementTextTr: "✨ Yeni Sezon Lüks Koleksiyonlar Yayında!",
        announcementTextEn: "✨ New Season Luxury Collections Live!",
        announcementBgColor: "#4c1d95",
        announcementTextColor: "#f3e8ff",
        showSearch: true,
        showCartButton: true,
      },
      footerConfig: {
        showNewsletter: true,
        newsletterTitleTr: "Özel Fırsat Bülteni",
        showTrustBadges: true,
        showPaymentBadges: true,
      },
    },
  });

  assertEqual(putRes.status, 200, "Expected 200 OK for admin PUT /api/appearance");
  assert(putRes.data.success, "Expected success: true");
  assertEqual(putRes.data.settings.marketplaceName, customName);
  assertEqual(putRes.data.settings.brandColor, customBrandColor);
  assertEqual(putRes.data.settings.accentColor, customAccentColor);
  assertEqual(putRes.data.settings.borderRadius, customRadius);
  assertEqual(putRes.data.settings.fontHeading, customHeading);
  assertEqual(putRes.data.cssVariables["--brand-primary"], customBrandColor);
  assertEqual(putRes.data.cssVariables["--brand-accent"], customAccentColor);
  assertEqual(putRes.data.cssVariables["--radius"], customRadius);
  assertEqual(putRes.data.cssVariables["--font-heading"], customHeading);
  assertEqual(putRes.data.cssVariables["--announcement-bg"], "#4c1d95");
  console.log("  ✓ Test 4 Passed.");

  // 5. Verify AuditLog entry created for APPEARANCE_UPDATED
  console.log("Test 5: Verify AuditLog created for APPEARANCE_UPDATED...");
  const audit = await prisma.auditLog.findFirst({
    where: { action: "APPEARANCE_UPDATED", entityType: "APPEARANCE" },
    orderBy: { createdAt: "desc" },
  });
  assert(audit, "Expected AuditLog record for APPEARANCE_UPDATED");
  assert(audit.metadataJson.includes(customName), "Metadata should include custom marketplace name");
  console.log("  ✓ Test 5 Passed.");

  // 6. POST /api/appearance/reset as Admin -> Resets to defaults + AuditLog
  console.log("Test 6: Admin resets appearance to factory defaults...");
  const resetRes = await request("/api/appearance/reset", {
    method: "POST",
    headers: adminHeaders,
  });
  assertEqual(resetRes.status, 200, "Expected 200 OK for POST /api/appearance/reset");
  assert(resetRes.data.success, "Expected success: true");
  assertEqual(resetRes.data.settings.brandColor, "#2563eb");
  assertEqual(resetRes.data.settings.accentColor, "#f97316");
  assertEqual(resetRes.data.settings.borderRadius, "8px");
  assertEqual(resetRes.data.cssVariables["--brand-primary"], "#2563eb");

  const resetAudit = await prisma.auditLog.findFirst({
    where: { action: "APPEARANCE_RESET", entityType: "APPEARANCE" },
    orderBy: { createdAt: "desc" },
  });
  assert(resetAudit, "Expected AuditLog record for APPEARANCE_RESET");
  console.log("  ✓ Test 6 Passed.");

  console.log("\n>>> ALL APPEARANCE TESTS PASSED (6/6)! <<<\n");
}

runAppearanceTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Appearance test failed:", err);
    process.exit(1);
  });
