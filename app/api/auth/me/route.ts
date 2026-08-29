import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  let sellerId: string | null = null;
  let seller = null;

  if (session.role === "SELLER" || session.role === "ADMIN") {
    const sellerProfile = await prisma.seller.findUnique({
      where: { userId: session.id },
    });
    if (sellerProfile) {
      sellerId = sellerProfile.id;
      seller = {
        id: sellerProfile.id,
        storeName: sellerProfile.storeName,
        slug: sellerProfile.slug,
        status: sellerProfile.status,
      };
    }
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...session,
      sellerId,
      seller,
    },
  });
}

