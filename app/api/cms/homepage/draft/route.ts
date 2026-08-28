import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";
import { getDefaultBaselineSections } from "@/lib/cms/cms-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
            approvalStatus: draft.approvalStatus || "DRAFT",
            approvedBy: draft.approvedBy || null,
            approvedAt: draft.approvedAt || null,
            requestedBy: draft.requestedBy || null,
            requestedAt: draft.requestedAt || null,
            rejectionReason: draft.rejectionReason || null,
            sellerNotes: draft.sellerNotes || null,
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
        approvalStatus: draft?.approvalStatus || "DRAFT",
        source: "live_database",
      });
    }

    // Default baseline fallback
    const defaults = getDefaultBaselineSections();
    return NextResponse.json({
      sections: defaults,
      approvalStatus: "DRAFT",
      source: "baseline_defaults",
    });
  } catch (error) {
    console.error("[API Draft GET Error]:", error);
    return NextResponse.json({
      sections: getDefaultBaselineSections(),
      approvalStatus: "DRAFT",
      source: "fallback_error",
    });
  }
}

async function saveDraftHandler(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "HOMEPAGE", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "HOMEPAGE", action: "WRITE" },
        { status: perm.status || 403 }
      );
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
        updatedBy: user!.email,
      },
      create: {
        id: "current_draft",
        draftJson: JSON.stringify(sections),
        approvalStatus: "DRAFT",
        updatedBy: user!.email,
      },
    });

    return NextResponse.json({
      success: true,
      draft,
      approvalStatus: draft.approvalStatus || "DRAFT",
    });
  } catch (error) {
    console.error("[API Draft Save Error]:", error);
    return NextResponse.json({ error: "Taslak kaydedilemedi." }, { status: 500 });
  }
}

export const PUT = saveDraftHandler;
export const POST = saveDraftHandler;

