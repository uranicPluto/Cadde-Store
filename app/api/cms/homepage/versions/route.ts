import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { SectionItem } from "@/lib/cms/cms-types";

export async function GET() {
  try {
    const versions = await prisma.homepageVersion.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("[API Versions GET Error]:", error);
    return NextResponse.json({ error: "Sürüm geçmişi yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ error: "Sürüm ID gereklidir." }, { status: 400 });
    }

    const targetVersion = await prisma.homepageVersion.findUnique({
      where: { id: versionId },
    });

    if (!targetVersion || !targetVersion.snapshotJson) {
      return NextResponse.json({ error: "Geri yüklenecek sürüm bulunamadı." }, { status: 404 });
    }

    const sections: SectionItem[] = JSON.parse(targetVersion.snapshotJson);

    // Get last version number and increment for rollback record
    const lastVersion = await prisma.homepageVersion.findFirst({
      orderBy: { versionNumber: "desc" },
    });
    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await prisma.$transaction(async (tx) => {
      // 1. Clear current live
      await tx.banner.deleteMany({});
      await tx.homepageSection.deleteMany({});

      // 2. Re-create sections from snapshot
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

      // 3. Create new rollback version record
      await tx.homepageVersion.create({
        data: {
          versionNumber: nextVersionNumber,
          snapshotJson: targetVersion.snapshotJson,
          changeSummary: `Sürüm v${targetVersion.versionNumber}'dan geri yüklendi (Rollback)`,
          authorEmail: user.email,
        },
      });

      // 4. Update draft to match restored
      await tx.homepageDraft.upsert({
        where: { id: "current_draft" },
        update: {
          draftJson: targetVersion.snapshotJson,
          updatedBy: user.email,
        },
        create: {
          id: "current_draft",
          draftJson: targetVersion.snapshotJson,
          updatedBy: user.email,
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "HOMEPAGE_ROLLED_BACK",
          entityType: "CMS",
          entityId: `v${nextVersionNumber}`,
          metadataJson: JSON.stringify({
            restoredFromVersion: targetVersion.versionNumber,
            newVersion: nextVersionNumber,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      restoredFrom: targetVersion.versionNumber,
      newVersionNumber: nextVersionNumber,
    });
  } catch (error) {
    console.error("[API Version Rollback Error]:", error);
    return NextResponse.json({ error: "Sürüm geri yüklenemedi." }, { status: 500 });
  }
}
