import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getMockBrands } from "@/lib/mock-data";
import { getSessionUser } from "@/lib/auth/session";
import { requirePermission } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";
    const featuredOnly = searchParams.get("featured") === "true";
    const search = searchParams.get("search")?.trim();

    const where: any = {};
    if (!includeAll) {
      where.status = "ACTIVE";
    }
    if (featuredOnly) {
      where.isFeatured = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search.toLowerCase() } },
      ];
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brands || brands.length === 0) {
      if (includeAll || search) {
        return NextResponse.json({ brands: [], source: "empty" });
      }

      const mockBrands = getMockBrands();
      return NextResponse.json({
        brands: mockBrands.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          logoUrl: b.logoUrl,
          bannerUrl: b.bannerUrl || null,
          isFeatured: true,
          status: "ACTIVE",
          _count: { products: 12 },
        })),
        source: "mock",
      });
    }

    return NextResponse.json({ brands, source: "database" });
  } catch (error) {
    console.error("[API Brands GET Error]:", error);
    const mockBrands = getMockBrands();
    return NextResponse.json({
      brands: mockBrands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        logoUrl: b.logoUrl,
        bannerUrl: b.bannerUrl || null,
        isFeatured: true,
        status: "ACTIVE",
        _count: { products: 12 },
      })),
      source: "mock-fallback",
    });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const perm = requirePermission(user, "CATALOG", "WRITE");
    if (!perm.authorized) {
      return NextResponse.json({ error: perm.error || "Yetkisiz işlem", code: "FORBIDDEN", resource: "CATALOG", action: "WRITE" }, { status: perm.status || 403 });
    }

    const body = await request.json();
    const { name, slug, logoUrl, bannerUrl, descriptionTR, descriptionEN, isFeatured, status } = body;

    if (!name || !slug || !logoUrl) {
      return NextResponse.json({ error: "Marka adı, slug ve logo zorunludur." }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        logoUrl,
        bannerUrl: bannerUrl || null,
        descriptionTR: descriptionTR || null,
        descriptionEN: descriptionEN || null,
        isFeatured: Boolean(isFeatured),
        status: status || "ACTIVE",
      },
    });

    // Record Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user!.id,
          actorEmail: user!.email,
          actorRole: user!.role,
          action: "BRAND_CREATED",
          entityType: "BRAND",
          entityId: brand.id,
          metadataJson: JSON.stringify({ brandName: brand.name, slug: brand.slug, isFeatured: brand.isFeatured }),
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({ brand, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("[API Brands POST Error]:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Bu marka slug'ı zaten kullanımda." }, { status: 409 });
    }
    return NextResponse.json({ error: "Marka oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
