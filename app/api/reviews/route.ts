import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Ürün ID zorunludur." }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId, status: "PUBLISHED" },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET Reviews API Error:", error);
    return NextResponse.json({ error: "Yorumlar getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Yorum yapmak için giriş yapmalısınız." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment, orderId } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Lütfen puan ve yorum alanlarını doldurun." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.id,
        orderId: orderId || null,
        rating: Number(rating),
        comment,
        status: "PUBLISHED",
      },
    });

    // Update product rating average & review count
    const productReviews = await prisma.review.findMany({
      where: { productId, status: "PUBLISHED" },
    });

    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / productReviews.length).toFixed(1));

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: productReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("POST Review API Error:", error);
    return NextResponse.json({ error: "Yorum eklenirken bir hata oluştu." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, sellerReply, status } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "Yorum ID zorunludur." }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
    }

    // Admin can moderate status; Seller can post reply to product's review
    if (session.role === "ADMIN") {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          ...(status ? { status } : {}),
          ...(sellerReply !== undefined ? { sellerReply } : {}),
        },
      });
      return NextResponse.json({ success: true, review: updated });
    }

    if (session.role === "SELLER") {
      const seller = await prisma.seller.findUnique({ where: { userId: session.id } });
      if (!seller || review.product.sellerId !== seller.id) {
        return NextResponse.json({ error: "Bu yoruma yanıt verme yetkiniz bulunmamaktadır." }, { status: 403 });
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { sellerReply },
      });
      return NextResponse.json({ success: true, review: updated });
    }

    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
  } catch (error) {
    console.error("PUT Review API Error:", error);
    return NextResponse.json({ error: "Yorum güncellenirken bir hata oluştu." }, { status: 500 });
  }
}
