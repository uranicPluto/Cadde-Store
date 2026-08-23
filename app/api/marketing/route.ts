import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const placement = searchParams.get("placement");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || searchParams.get("query");

    const where: any = {};

    if (type) {
      where.type = type;
    }
    if (placement) {
      where.placement = placement;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.name = { contains: search };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("GET Marketing Campaigns API Error:", error);
    return NextResponse.json({ error: "Kampanyalar yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json(
        { error: "Bu işlem için yönetici veya satıcı yetkisi gereklidir." },
        { status: 403 }
      );
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

    if (!name || budget === undefined || budget === null) {
      return NextResponse.json(
        { error: "Kampanya adı ve bütçe zorunludur." },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        type: type || "SPONSORED_PRODUCT",
        targetId: targetId || null,
        placement: placement || null,
        budget: Number(budget),
        spent: spent !== undefined ? Number(spent) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? Number(priority) : 1,
        status: status || "ACTIVE",
        impressions: impressions !== undefined ? Number(impressions) : 0,
        clicks: clicks !== undefined ? Number(clicks) : 0,
        orders: orders !== undefined ? Number(orders) : 0,
        revenue: revenue !== undefined ? Number(revenue) : 0,
      },
    });

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "CAMPAIGN_CREATED",
        entityType: "MARKETING",
        entityId: campaign.id,
        metadataJson: JSON.stringify({
          name: campaign.name,
          type: campaign.type,
          budget: campaign.budget,
          placement: campaign.placement,
          targetId: campaign.targetId,
        }),
      },
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error("POST Marketing Campaign API Error:", error);
    return NextResponse.json({ error: "Kampanya oluşturulamadı." }, { status: 500 });
  }
}
