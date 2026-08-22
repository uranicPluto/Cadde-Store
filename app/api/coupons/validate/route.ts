import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ error: "Kupon kodu ve sepet tutarı zorunludur." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş kupon kodu." }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Bu kupon kodunun kullanım süresi dolmuştur." }, { status: 400 });
    }

    if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
      return NextResponse.json(
        { error: `Bu kupon en az ${coupon.minimumOrder} ₺ tutarındaki sepetlerde geçerlidir.` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Bu kuponun kullanım limiti dolmuştur." }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else if (coupon.type === "FIXED" || coupon.type === "FREE_SHIPPING") {
      discountAmount = coupon.value;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("Coupon Validate API Error:", error);
    return NextResponse.json({ error: "Kupon doğrulanırken bir hata oluştu." }, { status: 500 });
  }
}
