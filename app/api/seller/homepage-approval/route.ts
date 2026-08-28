import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem yalnızca satıcılar veya yöneticiler içindir." },
        { status: 403 }
      );
    }

    // Get current draft and latest approval request
    const draft = await prisma.homepageDraft.findUnique({
      where: { id: "current_draft" },
    });

    const latestRequest = await prisma.homepageApprovalRequest.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let parsedSections = [];
    if (draft?.draftJson) {
      try {
        parsedSections = JSON.parse(draft.draftJson);
      } catch {}
    }

    return NextResponse.json({
      approvalStatus: draft?.approvalStatus || "DRAFT",
      requestedBy: draft?.requestedBy || null,
      requestedAt: draft?.requestedAt || null,
      approvedBy: draft?.approvedBy || null,
      approvedAt: draft?.approvedAt || null,
      rejectionReason: draft?.rejectionReason || null,
      sellerNotes: draft?.sellerNotes || null,
      latestRequest,
      sections: parsedSections,
    });
  } catch (error) {
    console.error("[API Seller Homepage Approval GET Error]:", error);
    return NextResponse.json({ error: "Onay bilgileri alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Yalnızca doğrulanmış satıcılar vitrin değişikliklerini onaylayabilir." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, rejectionReason, sellerNotes } = body; // action: "APPROVE" | "REJECT"

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { error: "Geçersiz onay eylemi. 'APPROVE' veya 'REJECT' olmalıdır." },
        { status: 400 }
      );
    }

    if (action === "REJECT" && !rejectionReason) {
      return NextResponse.json(
        { error: "Reddetme gerekçesi belirtilmelidir." },
        { status: 400 }
      );
    }

    // Find seller profile if available
    let sellerStoreName = user.firstName + " " + user.lastName;
    const sellerRecord = await prisma.seller.findFirst({
      where: { userId: user.id },
    });
    if (sellerRecord) {
      sellerStoreName = sellerRecord.storeName;
    }

    const now = new Date();
    const isApproved = action === "APPROVE";
    const newStatus = isApproved ? "SELLER_APPROVED" : "SELLER_REJECTED";

    // Update draft and approval request record
    const [updatedDraft] = await prisma.$transaction([
      prisma.homepageDraft.update({
        where: { id: "current_draft" },
        data: {
          approvalStatus: newStatus,
          approvedBy: isApproved ? `${sellerStoreName} (${user.email})` : null,
          approvedAt: isApproved ? now : null,
          rejectionReason: !isApproved ? rejectionReason : null,
          sellerNotes: sellerNotes || null,
        },
      }),
      prisma.homepageApprovalRequest.create({
        data: {
          draftJson: (await prisma.homepageDraft.findUnique({ where: { id: "current_draft" } }))?.draftJson || "[]",
          status: isApproved ? "APPROVED" : "REJECTED",
          requestedBy: "admin",
          sellerId: sellerRecord?.id || null,
          sellerEmail: user.email,
          sellerStoreName,
          sellerNotes: sellerNotes || null,
          rejectionReason: !isApproved ? rejectionReason : null,
          approvedAt: isApproved ? now : null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: isApproved ? "SELLER_HOMEPAGE_APPROVED" : "SELLER_HOMEPAGE_REJECTED",
          entityType: "CMS",
          entityId: "current_draft",
          metadataJson: JSON.stringify({
            sellerEmail: user.email,
            sellerStoreName,
            action,
            rejectionReason,
            sellerNotes,
          }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      approvalStatus: updatedDraft.approvalStatus,
      approvedBy: updatedDraft.approvedBy,
      approvedAt: updatedDraft.approvedAt,
      message: isApproved
        ? "Ana sayfa vitrin değişiklikleri satıcı tarafından başarıyla onaylandı ve teyit edildi."
        : "Ana sayfa vitrin değişiklikleri satıcı tarafından reddedildi.",
    });
  } catch (error) {
    console.error("[API Seller Homepage Approval POST Error]:", error);
    return NextResponse.json({ error: "Onay işlemi gerçekleştirilemedi." }, { status: 500 });
  }
}
