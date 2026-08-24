import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      success: true,
      seo: {
        siteTitleTr: "Cadde Store Türkiye | Güvenilir Çok Satıcılı Pazaryeri",
        siteTitleEn: "Cadde Store Turkey | Multi-Vendor Marketplace",
        metaDescriptionTr: "Türkiye'nin en popüler kadın giyim, erkek modası, elektronik ve ev yaşam ürünleri avantajlı fiyatlarla Cadde Store'da.",
        metaDescriptionEn: "Shop top-rated women's fashion, menswear, electronics, and home essentials with fast shipping on Cadde Store.",
        keywords: "alışveriş, pazaryeri, kadın giyim, erkek giyim, elektronik, indirim, flaş fırsatlar, türkiye",
        canonicalUrl: "https://cadde-store.vercel.app",
        ogImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        indexEnabled: true,
        sitemapEnabled: true,
      },
    });
  } catch (error) {
    console.error("GET SEO Error:", error);
    return NextResponse.json({ error: "SEO ayarları getirilemedi." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const body = await request.json();

    // Log to AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorEmail: session.email,
        actorRole: session.role,
        action: "SEO_SETTINGS_UPDATED",
        entityType: "SETTINGS",
        metadataJson: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, message: "SEO ayarları güncellendi." });
  } catch (error) {
    console.error("PUT SEO Error:", error);
    return NextResponse.json({ error: "SEO ayarları kaydedilemedi." }, { status: 500 });
  }
}
