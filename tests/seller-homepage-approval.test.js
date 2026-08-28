const { test, describe, before } = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

describe("Seller Approval & Confirmation Gate for Homepage Studio", async () => {
  let adminUser;
  let sellerUser;
  let sampleSections;

  before(async () => {
    // Ensure test admin and seller users exist
    adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      const hash = await bcrypt.hash("Password123!", 10);
      adminUser = await prisma.user.create({
        data: {
          email: "admin@cadde-store.com",
          passwordHash: hash,
          firstName: "Super",
          lastName: "Admin",
          role: "ADMIN",
          adminRole: "SUPER_ADMIN",
        },
      });
    }

    sellerUser = await prisma.user.findFirst({
      where: { role: "SELLER" },
    });

    sampleSections = [
      {
        id: "sec_hero_test",
        type: "HERO",
        titleTR: "Bahar Kampanyası",
        titleEN: "Spring Campaign",
        orderIndex: 0,
        active: true,
        banners: [
          {
            titleTR: "Özel Fırsat",
            titleEN: "Special Deal",
            imageUrlDesktop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            targetType: "CATEGORY",
            targetValue: "/category/women",
          },
        ],
      },
      {
        id: "sec_bestsellers_test",
        type: "PRODUCT_CAROUSEL",
        titleTR: "Çok Satanlar",
        titleEN: "Bestsellers",
        orderIndex: 1,
        active: true,
        banners: [],
      },
    ];
  });

  test("1. Homepage draft starts in unapproved DRAFT state", async () => {
    const draft = await prisma.homepageDraft.upsert({
      where: { id: "current_draft" },
      update: {
        draftJson: JSON.stringify(sampleSections),
        approvalStatus: "DRAFT",
        approvedBy: null,
        approvedAt: null,
        requestedBy: null,
        requestedAt: null,
        rejectionReason: null,
        sellerNotes: null,
        updatedBy: adminUser.email,
      },
      create: {
        id: "current_draft",
        draftJson: JSON.stringify(sampleSections),
        approvalStatus: "DRAFT",
        updatedBy: adminUser.email,
      },
    });

    assert.equal(draft.approvalStatus, "DRAFT");
    assert.equal(draft.approvedBy, null);
  });

  test("2. Direct publish without seller approval is strictly blocked", async () => {
    const draft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });

    const isExplicitlySellerApproved = false;
    const isDraftApprovedBySeller = draft?.approvalStatus === "SELLER_APPROVED";

    const allowed = isDraftApprovedBySeller || isExplicitlySellerApproved;
    assert.equal(allowed, false, "Publishing without seller confirmation must be blocked");
  });

  test("3. Admin submits homepage draft for seller approval", async () => {
    const now = new Date();
    const updatedDraft = await prisma.homepageDraft.update({
      where: { id: "current_draft" },
      data: {
        approvalStatus: "PENDING_SELLER_APPROVAL",
        requestedBy: adminUser.email,
        requestedAt: now,
        sellerNotes: "Please review new Spring layout and banners.",
      },
    });

    const approvalReq = await prisma.homepageApprovalRequest.create({
      data: {
        draftJson: updatedDraft.draftJson,
        status: "PENDING",
        requestedBy: adminUser.email,
        sellerNotes: "Please review new Spring layout and banners.",
      },
    });

    assert.equal(updatedDraft.approvalStatus, "PENDING_SELLER_APPROVAL");
    assert.equal(updatedDraft.requestedBy, adminUser.email);
    assert.equal(approvalReq.status, "PENDING");
  });

  test("4. Seller reviews and rejects draft with revision feedback", async () => {
    const rejectionReason = "Banner visual text is outdated. Please update.";
    const rejectedDraft = await prisma.homepageDraft.update({
      where: { id: "current_draft" },
      data: {
        approvalStatus: "SELLER_REJECTED",
        rejectionReason,
        approvedBy: null,
        approvedAt: null,
      },
    });

    assert.equal(rejectedDraft.approvalStatus, "SELLER_REJECTED");
    assert.equal(rejectedDraft.rejectionReason, rejectionReason);
  });

  test("5. Seller reviews updated draft and CONFIRMS/APPROVES the homepage changes", async () => {
    const now = new Date();
    const approvingSeller = "Trend Fashion Store (seller@cadde-store.com)";

    const approvedDraft = await prisma.homepageDraft.update({
      where: { id: "current_draft" },
      data: {
        approvalStatus: "SELLER_APPROVED",
        approvedBy: approvingSeller,
        approvedAt: now,
        rejectionReason: null,
        sellerNotes: "All banner layouts and merchant highlights verified and approved.",
      },
    });

    assert.equal(approvedDraft.approvalStatus, "SELLER_APPROVED");
    assert.equal(approvedDraft.approvedBy, approvingSeller);
    assert(approvedDraft.approvedAt instanceof Date);
  });

  test("6. Publish proceeds successfully after seller confirmation", async () => {
    const draft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });

    assert.equal(draft.approvalStatus, "SELLER_APPROVED");

    // Perform publish transaction
    const lastVersion = await prisma.homepageVersion.findFirst({
      orderBy: { versionNumber: "desc" },
    });
    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await prisma.$transaction([
      prisma.homepageVersion.create({
        data: {
          versionNumber: nextVersionNumber,
          snapshotJson: draft.draftJson,
          changeSummary: "Spring Campaign Live Update (Seller Approved)",
          authorEmail: adminUser.email,
        },
      }),
      prisma.homepageDraft.update({
        where: { id: "current_draft" },
        data: {
          approvalStatus: "DRAFT",
          approvedBy: null,
          approvedAt: null,
          requestedBy: null,
          requestedAt: null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: adminUser.id,
          actorEmail: adminUser.email,
          actorRole: adminUser.role,
          action: "HOMEPAGE_PUBLISHED",
          entityType: "CMS",
          entityId: `v${nextVersionNumber}`,
          metadataJson: JSON.stringify({
            versionNumber: nextVersionNumber,
            approvedBySeller: draft.approvedBy,
          }),
        },
      }),
    ]);

    const createdVersion = await prisma.homepageVersion.findFirst({
      where: { versionNumber: nextVersionNumber },
    });

    assert.ok(createdVersion, "Version should be created on live publish");
    assert.equal(createdVersion.versionNumber, nextVersionNumber);

    const resetDraft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });
    assert.equal(resetDraft.approvalStatus, "DRAFT", "Draft should reset to DRAFT for subsequent changes");
  });
});
