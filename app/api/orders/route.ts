import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export interface ValidatedOrderItem {
  productId: string;
  name: string;
  sellerId: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export async function GET() {
  try {
    const session = await getSession();

    let orders;
    if (session?.role === "ADMIN") {
      orders = await prisma.order.findMany({
        include: {
          orderItems: { include: { product: true } },
          orderGroups: { include: { seller: true } },
          statusHistory: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session?.id) {
      orders = await prisma.order.findMany({
        where: { customerId: session.id },
        include: {
          orderItems: { include: { product: true } },
          orderGroups: { include: { seller: true } },
          statusHistory: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ orders: [] });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET Orders API Error:", error);
    return NextResponse.json({ error: "Siparişler getirilemedi.", code: "ORDERS_FETCH_ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { items, couponCode, shippingAddress, customerInfo } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: "Geçersiz sipariş verileri.", code: "ORDER_VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // 1. Quantity Validation (Fix 1)
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        return NextResponse.json(
          {
            error: `"${item.product?.name || item.name || 'Ürün'}" için geçersiz adet (${item.quantity}). Adet 1 ile 99 arasında tam sayı olmalıdır.`,
            code: "INVALID_QUANTITY",
          },
          { status: 400 }
        );
      }
    }

    // 2. Resolve Customer ID (Guest support preserved)
    let customerId = session?.id;
    if (!customerId) {
      const guestEmail = customerInfo?.email || `guest-${Date.now()}@cadde.store`;
      const guestUser = await prisma.user.upsert({
        where: { email: guestEmail },
        update: {},
        create: {
          email: guestEmail,
          passwordHash: "guest",
          firstName: customerInfo?.firstName || "Misafir",
          lastName: customerInfo?.lastName || "Kullanıcı",
          phone: customerInfo?.phone || null,
        },
      });
      customerId = guestUser.id;
    }

    // 3. Initial Product & Price Resolution from DB (Fix 5 & Fix 10)
    let serverSubtotal = 0;
    const validatedItems: ValidatedOrderItem[] = [];

    for (const item of items) {
      const productId = typeof item.product === "object" ? item.product?.id : item.productId || item.id;
      const productSlug = typeof item.product === "object" ? item.product?.slug : undefined;
      const requestedQty = Number(item.quantity);

      const dbProd = await prisma.product.findFirst({
        where: {
          OR: [
            ...(productId ? [{ id: String(productId) }] : []),
            ...(productSlug ? [{ slug: String(productSlug) }] : []),
          ],
        },
        include: { seller: true },
      });

      if (!dbProd || dbProd.status !== "ACTIVE" || !dbProd.seller) {
        return NextResponse.json(
          {
            error: `"${item.product?.name || item.name || 'Seçilen ürün'}" mevcut değildir veya artık satışta bulunmamaktadır.`,
            code: "PRODUCT_UNAVAILABLE",
          },
          { status: 400 }
        );
      }

      if (dbProd.stock < requestedQty) {
        return NextResponse.json(
          {
            error: `"${dbProd.name}" için yetersiz stok! Mevcut stok: ${dbProd.stock} adet.`,
            code: "INSUFFICIENT_STOCK",
          },
          { status: 400 }
        );
      }

      const price = dbProd.price;
      serverSubtotal += price * requestedQty;

      validatedItems.push({
        productId: dbProd.id,
        name: dbProd.name,
        sellerId: dbProd.sellerId,
        price,
        quantity: requestedQty,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    // 4. Server-Side Coupon Verification (Fix 3 & Fix 4)
    let couponDiscount = 0;
    let validCouponId: string | null = null;
    let validCouponCode: string | null = null;

    if (couponCode) {
      const formattedCode = String(couponCode).toUpperCase().trim();
      const coupon = await prisma.coupon.findUnique({
        where: { code: formattedCode },
      });

      if (!coupon || !coupon.active) {
        return NextResponse.json(
          { error: "Geçersiz veya pasif kupon kodu.", code: "COUPON_INVALID" },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: "Bu kupon kodunun kullanım süresi dolmuştur.", code: "COUPON_EXPIRED" },
          { status: 400 }
        );
      }

      if (coupon.minimumOrder && serverSubtotal < coupon.minimumOrder) {
        return NextResponse.json(
          {
            error: `Bu kupon en az ${coupon.minimumOrder} ₺ tutarındaki sepetlerde geçerlidir.`,
            code: "COUPON_MINIMUM_ORDER_NOT_MET",
          },
          { status: 400 }
        );
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: "Bu kuponun toplam kullanım limiti dolmuştur.", code: "COUPON_USAGE_LIMIT" },
          { status: 400 }
        );
      }

      // Pre-check customer redemption uniqueness
      const existingRedemption = await prisma.couponRedemption.findFirst({
        where: { couponId: coupon.id, userId: customerId },
      });
      if (existingRedemption) {
        return NextResponse.json(
          { error: "Bu kuponu daha önce kullandınız.", code: "COUPON_ALREADY_REDEEMED" },
          { status: 400 }
        );
      }

      validCouponId = coupon.id;
      validCouponCode = coupon.code;

      if (coupon.type === "PERCENTAGE") {
        couponDiscount = (serverSubtotal * coupon.value) / 100;
        if (coupon.maximumDiscount && couponDiscount > coupon.maximumDiscount) {
          couponDiscount = coupon.maximumDiscount;
        }
      } else if (coupon.type === "FIXED" || coupon.type === "FREE_SHIPPING") {
        couponDiscount = coupon.value;
      }
    }

    // 5. Database Platform Settings Shipping Calculation (Fix 6)
    let settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = {
        id: "default",
        marketplaceName: "Cadde Store Türkiye",
        supportEmail: "destek@cadde.store",
        defaultCommissionRate: 10.0,
        orderCancellationWindowDays: 2,
        returnWindowDays: 14,
        defaultShippingFee: 34.9,
        freeShippingThreshold: 200.0,
        updatedAt: new Date(),
      };
    }

    const shippingFee = serverSubtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
    const grandTotal = Math.max(0, serverSubtotal - couponDiscount + shippingFee);
    const orderNumber = `CS-${Date.now().toString().slice(-6)}`;

    // 6. Atomic Prisma Transaction (Fix 2 & Fix 8)
    const result = await prisma.$transaction(async (tx) => {
      // Re-verify Atomic Stock & Perform Conditional Atomic Decrement
      for (const item of validatedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            status: "ACTIVE",
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
        }
      }

      // Create root Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerId!,
          status: "CONFIRMED",
          subtotal: serverSubtotal,
          productDiscount: 0,
          couponDiscount,
          shippingFee,
          grandTotal,
          currency: "TRY",
          shippingAddressSnapshot: JSON.stringify(shippingAddress),
          statusHistory: {
            create: {
              status: "CONFIRMED",
              note: "Sipariş veritabanı stok ve güvenlik kontrolleri ile onaylandı.",
            },
          },
        },
      });

      // Group items by Seller ID
      const itemsBySeller: Record<string, ValidatedOrderItem[]> = {};
      for (const item of validatedItems) {
        if (!itemsBySeller[item.sellerId]) itemsBySeller[item.sellerId] = [];
        itemsBySeller[item.sellerId].push(item);
      }

      // Create OrderGroups & OrderItems
      for (const sellerId of Object.keys(itemsBySeller)) {
        const groupItems = itemsBySeller[sellerId];
        const groupSubtotal = groupItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const orderGroup = await tx.orderGroup.create({
          data: {
            orderId: order.id,
            sellerId,
            status: "CONFIRMED",
            subtotal: groupSubtotal,
          },
        });

        for (const item of groupItems) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              orderGroupId: orderGroup.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              selectedColor: item.selectedColor || null,
              selectedSize: item.selectedSize || null,
            },
          });
        }
      }

      // Record Coupon Redemption & Increment Usage Count
      if (validCouponId) {
        const duplicateInTx = await tx.couponRedemption.findFirst({
          where: { couponId: validCouponId, userId: customerId! },
        });

        if (duplicateInTx) {
          throw new Error(`COUPON_ALREADY_REDEEMED:${validCouponCode}`);
        }

        await tx.couponRedemption.create({
          data: {
            couponId: validCouponId,
            userId: customerId!,
            orderId: order.id,
          },
        });

        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return order;
    });

    const completeOrder = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        orderItems: { include: { product: true } },
        orderGroups: { include: { seller: true, items: true } },
        statusHistory: true,
      },
    });

    return NextResponse.json({ success: true, order: completeOrder });
  } catch (error: any) {
    console.error("POST Order API Error:", error);

    const errorMsg = error?.message || "";
    if (errorMsg.startsWith("INSUFFICIENT_STOCK:")) {
      const prodName = errorMsg.split("INSUFFICIENT_STOCK:")[1] || "Ürün";
      return NextResponse.json(
        {
          error: `"${prodName}" için anlık yetersiz stok! Siparişiniz iptal edildi.`,
          code: "INSUFFICIENT_STOCK",
        },
        { status: 400 }
      );
    }

    if (errorMsg.startsWith("COUPON_ALREADY_REDEEMED:")) {
      return NextResponse.json(
        {
          error: "Bu kuponu daha önce kullandınız.",
          code: "COUPON_ALREADY_REDEEMED",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Sipariş işlenirken bir sunucu hatası oluştu.", code: "TRANSACTION_FAILED" },
      { status: 500 }
    );
  }
}
