import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { getDefaultBaselineSections } from "@/lib/cms/cms-service";

export async function GET() {
  try {
    const draft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });

    if (draft && draft.draftJson) {
      try {
        const parsed = JSON.parse(draft.draftJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json({
            sections: parsed,
            updatedAt: draft.updatedAt,
            updatedBy: draft.updatedBy,
            source: "draft_database",
          });
        }
      } catch (e) {
        console.warn("Draft JSON parse failed, initializing fallback", e);
      }
    }

    // Fallback: load currently published live sections
    const liveSections = await prisma.homepageSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: { banners: { orderBy: { orderIndex: "asc" } } },
    });

    if (liveSections && liveSections.length > 0) {
      return NextResponse.json({
        sections: liveSections,
        source: "live_database",
      });
    }

    // Default baseline fallback
    const defaults = getDefaultBaselineSections();
    return NextResponse.json({
      sections: defaults,
      source: "baseline_defaults",
    });
  } catch (error) {
    console.error("[API Draft GET Error]:", error);
    return NextResponse.json({
      sections: getDefaultBaselineSections(),
      source: "fallback_error",
    });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Geçersiz bölüm verisi." }, { status: 400 });
    }

    const draft = await prisma.homepageDraft.upsert({
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

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error("[API Draft PUT Error]:", error);
    return NextResponse.json({ error: "Taslak kaydedilemedi." }, { status: 500 });
  }
}
