import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleReorder(request);
}

export async function PUT(request: Request) {
  return handleReorder(request);
}

async function handleReorder(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yönetici yetkisi gereklidir." }, { status: 403 });
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : (Array.isArray(body) ? body : []);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Sıralanacak öğeler dizisi gereklidir." }, { status: 400 });
    }

    // Execute atomic batch update transaction
    await prisma.$transaction(
      items.map((item: any) =>
        prisma.navigationItem.update({
          where: { id: item.id },
          data: {
            ...(item.sortOrder !== undefined ? { sortOrder: Number(item.sortOrder) } : {}),
            ...(item.parentId !== undefined ? { parentId: item.parentId === "null" || !item.parentId ? null : item.parentId } : {}),
            ...(item.section ? { section: item.section } : {}),
            ...(item.isActive !== undefined ? { isActive: Boolean(item.isActive) } : {}),
          },
        })
      )
    );

    // Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "NAVIGATION_REORDERED",
        entityType: "NAVIGATION",
        metadataJson: JSON.stringify({
          reorderedCount: items.length,
          itemIds: items.map((i: any) => i.id),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Navigasyon sıralaması başarıyla güncellendi.",
      count: items.length,
    });
  } catch (error) {
    console.error("Navigation Reorder API Error:", error);
    return NextResponse.json({ error: "Navigasyon sıralaması güncellenemedi." }, { status: 500 });
  }
}
