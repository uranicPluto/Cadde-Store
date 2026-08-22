import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        products: {
          take: 20,
          where: { status: "ACTIVE" },
        },
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("[API Brand Details Error]:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, logoUrl, bannerUrl, descriptionTR, descriptionEN, isFeatured, status } = body;

    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug: slug.toLowerCase().trim() }),
        ...(logoUrl && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(descriptionTR !== undefined && { descriptionTR }),
        ...(descriptionEN !== undefined && { descriptionEN }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(status && { status }),
      },
    });

    // Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "BRAND_UPDATED",
          entityType: "BRAND",
          entityId: brand.id,
          metadataJson: JSON.stringify({ brandName: brand.name, updates: body }),
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({ brand, success: true });
  } catch (error) {
    console.error("[API Brand PUT Error]:", error);
    return NextResponse.json({ error: "Marka güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    // Soft delete or delete
    const brand = await prisma.brand.delete({
      where: { id: params.id },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: "BRAND_DELETED",
          entityType: "BRAND",
          entityId: brand.id,
          metadataJson: JSON.stringify({ brandName: brand.name }),
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Brand DELETE Error]:", error);
    return NextResponse.json({ error: "Marka silinemedi." }, { status: 500 });
  }
}
