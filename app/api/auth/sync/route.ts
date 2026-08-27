import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lütfen önce giriş yapın." }, { status: 401 });
    }

    const body = await request.json();
    const { favoriteProductIds, addresses } = body;

    // 1. Sync Guest Favorites
    if (Array.isArray(favoriteProductIds) && favoriteProductIds.length > 0) {
      for (const prodId of favoriteProductIds) {
        // Check if product exists in DB
        const product = await prisma.product.findFirst({
          where: { OR: [{ id: prodId }, { slug: prodId }] },
        });
        if (product) {
          await prisma.favorite.upsert({
            where: {
              userId_productId: {
                userId: session.id,
                productId: product.id,
              },
            },
            update: {},
            create: {
              userId: session.id,
              productId: product.id,
            },
          });
        }
      }
    }

    // 2. Sync Guest Addresses
    if (Array.isArray(addresses) && addresses.length > 0) {
      for (const addr of addresses) {
        if (addr.title && addr.city && addr.addressLine) {
          await prisma.address.create({
            data: {
              userId: session.id,
              title: addr.title,
              firstName: addr.firstName || session.firstName,
              lastName: addr.lastName || session.lastName,
              phone: addr.phone || "0532 000 0000",
              email: addr.email || session.email,
              city: addr.city,
              district: addr.district || "",
              addressLine: addr.addressLine,
              country: addr.country || "Türkiye",
              isDefault: !!addr.isDefault,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, synced: true });
  } catch (error) {
    console.error("Auth Sync API Error:", error);
    return NextResponse.json({ error: "Senkronizasyon sırasında hata oluştu." }, { status: 500 });
  }
}
