import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const seller = await prisma.seller.findUnique({
        where: { slug },
        include: { products: { where: { status: "ACTIVE" } } },
      });
      if (!seller) return NextResponse.json({ error: "Satıcı bulunamadı." }, { status: 404 });
      return NextResponse.json({ seller });
    }

    const sellers = await prisma.seller.findMany({
      where: { status: "ACTIVE" },
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("GET Sellers API Error:", error);
    return NextResponse.json({ error: "Satıcılar getirilemedi." }, { status: 500 });
  }
}
