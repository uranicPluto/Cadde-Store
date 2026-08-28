import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const draft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });

    const requests = await prisma.homepageApprovalRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      approvalStatus: draft?.approvalStatus || "DRAFT",
      requestedBy: draft?.requestedBy || null,
      requestedAt: draft?.requestedAt || null,
      approvedBy: draft?.approvedBy || null,
      approvedAt: draft?.approvedAt || null,
      rejectionReason: draft?.rejectionReason || null,
      sellerNotes: draft?.sellerNotes || null,
      requests,
    });
  } catch (error) {
    console.error("[API Homepage Approval GET Error]:", error);
    return NextResponse.json({ error: "Onay durumu alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "HOMEPAGE", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json(
        { error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN" },
        { status: perm.status || 403 }
      );
    }

    const body = await request.json();
    const { targetSellerId, notes } = body;

    // Get current draft
    const draft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });

    if (!draft || !draft.draftJson || draft.draftJson === "[]") {
      return NextResponse.json(
        { error: "Onaya gönderilecek taslak vitrin bulunamadı." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Create approval request record and update draft status
    const [approvalReq, updatedDraft] = await prisma.$transaction([
      prisma.homepageApprovalRequest.create({
        data: {
          draftJson: draft.draftJson,
          status: "PENDING",
          requestedBy: user!.email,
          requestedAt: now,
          sellerId: targetSellerId || null,
          sellerNotes: notes || null,
        },
      }),
      prisma.homepageDraft.update({
        where: { id: "current_draft" },
        data: {
          approvalStatus: "PENDING_SELLER_APPROVAL",
          requestedBy: user!.email,
          requestedAt: now,
          approvalSellerId: targetSellerId || null,
          rejectionReason: null,
          approvedBy: null,
          approvedAt: null,
          sellerNotes: notes || null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: "HOMEPAGE_APPROVAL_REQUESTED",
          entityType: "CMS",
          entityId: "current_draft",
          metadataJson: JSON.stringify({
            requestedBy: user!.email,
            targetSellerId: targetSellerId || "ALL_VERIFIED_SELLERS",
            notes,
          }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      approvalStatus: updatedDraft.approvalStatus,
      requestId: approvalReq.id,
      requestedAt: updatedDraft.requestedAt,
      message: "Taslak vitrin satıcı onayına başarıyla gönderildi.",
    });
  } catch (error) {
    console.error("[API Homepage Approval Request Error]:", error);
    return NextResponse.json({ error: "Onay talebi oluşturulamadı." }, { status: 500 });
  }
}
