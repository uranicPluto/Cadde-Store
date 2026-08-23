import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const params = await context.params;
    const { id } = params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("GET Marketing Campaign [id] API Error:", error);
    return NextResponse.json({ error: "Kampanya bilgisi getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      type,
      targetId,
      placement,
      budget,
      spent,
      startDate,
      endDate,
      priority,
      status,
      impressions,
      clicks,
      orders,
      revenue,
    } = body;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(type ? { type } : {}),
        ...(targetId !== undefined ? { targetId: targetId || null } : {}),
        ...(placement !== undefined ? { placement: placement || null } : {}),
        ...(budget !== undefined ? { budget: Number(budget) } : {}),
        ...(spent !== undefined ? { spent: Number(spent) } : {}),
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(priority !== undefined ? { priority: Number(priority) } : {}),
        ...(status ? { status } : {}),
        ...(impressions !== undefined ? { impressions: Number(impressions) } : {}),
        ...(clicks !== undefined ? { clicks: Number(clicks) } : {}),
        ...(orders !== undefined ? { orders: Number(orders) } : {}),
        ...(revenue !== undefined ? { revenue: Number(revenue) } : {}),
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CAMPAIGN_UPDATED",
        entityType: "MARKETING",
        entityId: id,
        metadataJson: JSON.stringify({
          name: updated.name,
          type: updated.type,
          status: updated.status,
          budget: updated.budget,
          spent: updated.spent,
        }),
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error("PUT Marketing Campaign [id] API Error:", error);
    return NextResponse.json({ error: "Kampanya güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const { id } = params;

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
    }

    await prisma.campaign.delete({ where: { id } });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CAMPAIGN_DELETED",
        entityType: "MARKETING",
        entityId: id,
        metadataJson: JSON.stringify({
          name: existing.name,
          type: existing.type,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Marketing Campaign [id] API Error:", error);
    return NextResponse.json({ error: "Kampanya silinemedi." }, { status: 500 });
  }
}
