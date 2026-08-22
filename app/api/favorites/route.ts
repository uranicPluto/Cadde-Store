import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      include: { product: true },
    });

    return NextResponse.json({ favorites: favorites.map((f) => f.product) });
  } catch (error) {
    console.error("GET Favorites API Error:", error);
    return NextResponse.json({ error: "Favoriler getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lütfen önce giriş yapın." }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "Ürün ID zorunludur." }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: session.id,
          productId,
        },
      });
      return NextResponse.json({ success: true, isFavorite: true });
    }
  } catch (error) {
    console.error("POST Favorites API Error:", error);
    return NextResponse.json({ error: "Favori işlemi gerçekleştirilemedi." }, { status: 500 });
  }
}
