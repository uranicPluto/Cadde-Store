import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { SectionItem } from "@/lib/cms/cms-types";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    let sections: SectionItem[] = body.sections;
    const changeSummary = body.changeSummary || "Admin Vitrin Güncellemesi";

    if (!Array.isArray(sections) || sections.length === 0) {
      const draft = await prisma.homepageDraft.findUnique({
        where: { id: "current_draft" },
      });
      if (draft && draft.draftJson) {
        sections = JSON.parse(draft.draftJson);
      }
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: "Yayınlanacak bölüm bulunamadı." }, { status: 400 });
    }

    // Get last version number
    const lastVersion = await prisma.homepageVersion.findFirst({
      orderBy: { versionNumber: "desc" },
    });
    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Transactional publish
    await prisma.$transaction(async (tx) => {
      // 1. Clear existing banners & sections
      await tx.banner.deleteMany({});
      await tx.homepageSection.deleteMany({});

      // 2. Insert new sections and banners
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const createdSec = await tx.homepageSection.create({
          data: {
            titleTR: sec.titleTR || "Bölüm",
            titleEN: sec.titleEN || "Section",
            type: (sec.type || "HERO").toUpperCase(),
            orderIndex: i,
            active: sec.active !== false,
            configJson:
              typeof sec.configJson === "string"
                ? sec.configJson
                : JSON.stringify(sec.configJson || {}),
            startDate: sec.startDate ? new Date(sec.startDate) : null,
            endDate: sec.endDate ? new Date(sec.endDate) : null,
          },
        });

        if (Array.isArray(sec.banners) && sec.banners.length > 0) {
          for (let bIdx = 0; bIdx < sec.banners.length; bIdx++) {
            const b = sec.banners[bIdx];
            await tx.banner.create({
              data: {
                sectionId: createdSec.id,
                titleTR: b.titleTR || null,
                titleEN: b.titleEN || null,
                subtitleTR: b.subtitleTR || null,
                subtitleEN: b.subtitleEN || null,
                imageUrlDesktop: b.imageUrlDesktop || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
                imageUrlMobile: b.imageUrlMobile || null,
                targetType: b.targetType || "CATEGORY",
                targetValue: b.targetValue || "/",
                badgeTextTR: b.badgeTextTR || null,
                badgeTextEN: b.badgeTextEN || null,
                orderIndex: bIdx,
                active: b.active !== false,
                startDate: b.startDate ? new Date(b.startDate) : null,
                endDate: b.endDate ? new Date(b.endDate) : null,
              },
            });
          }
        }
      }

      // 3. Create version record
      await tx.homepageVersion.create({
        data: {
          versionNumber: nextVersionNumber,
          snapshotJson: JSON.stringify(sections),
          changeSummary,
          authorEmail: user.email,
        },
      });

      // 4. Update draft to match published
      await tx.homepageDraft.upsert({
        where: { id: "current_draft" },
        update: {
          draftJson: JSON.stringify(sections),
          updatedBy: user.email,
        },
        create: {
          id: "current_draft",
          draftJson: JSON.stringify(sections),
          updatedBy: user.email,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "HOMEPAGE_PUBLISHED",
          entityType: "CMS",
          entityId: `v${nextVersionNumber}`,
          metadataJson: JSON.stringify({
            versionNumber: nextVersionNumber,
            sectionCount: sections.length,
            changeSummary,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      versionNumber: nextVersionNumber,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[API Homepage Publish Error]:", error);
    return NextResponse.json({ error: "Ana sayfa yayınlanamadı." }, { status: 500 });
  }
}
