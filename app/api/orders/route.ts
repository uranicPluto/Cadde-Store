import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

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
    return NextResponse.json({ error: "Siparişler getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { items, couponCode, shippingAddress, customerInfo } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Geçersiz sipariş verileri." }, { status: 400 });
    }

    // 1. Resolve Customer ID (Guest support preserved)
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

    // 2. Database-Authoritative Product Resolution & Server-Side Price / Stock Recalculation
    let serverSubtotal = 0;
    const validatedItems: {
      dbProd: any;
      quantity: number;
      price: number;
      selectedColor?: string;
      selectedSize?: string;
    }[] = [];

    for (const item of items) {
      const productId = typeof item.product === "object" ? item.product?.id : item.productId || item.id;
      const productSlug = typeof item.product === "object" ? item.product?.slug : undefined;

      const dbProd = await prisma.product.findFirst({
        where: {
          OR: [
            ...(productId ? [{ id: String(productId) }] : []),
            ...(productSlug ? [{ slug: String(productSlug) }] : []),
          ],
        },
        include: { seller: true },
      });

      // Strict Validation: Product MUST exist in DB with ACTIVE status. No fallback product/seller/category creation!
      if (!dbProd || dbProd.status !== "ACTIVE" || !dbProd.seller) {
        return NextResponse.json(
          { error: `"${item.product?.name || item.name || 'Seçilen ürün'}" mevcut değildir veya artık satışta bulunmamaktadır.` },
          { status: 400 }
        );
      }

      if (dbProd.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${dbProd.name}" için yetersiz stok! Mevcut stok: ${dbProd.stock} adet.` },
          { status: 400 }
        );
      }

      // Authoritative DB Price
      const price = dbProd.price;
      serverSubtotal += price * item.quantity;

      validatedItems.push({
        dbProd,
        quantity: item.quantity,
        price,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    // 3. Server-side Coupon Validation
    let couponDiscount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: String(couponCode).toUpperCase().trim() },
      });

      if (coupon && coupon.active && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
        if (!coupon.minimumOrder || serverSubtotal >= coupon.minimumOrder) {
          validCouponId = coupon.id;
          if (coupon.type === "PERCENTAGE") {
            couponDiscount = (serverSubtotal * coupon.value) / 100;
            if (coupon.maximumDiscount && couponDiscount > coupon.maximumDiscount) {
              couponDiscount = coupon.maximumDiscount;
            }
          } else if (coupon.type === "FIXED" || coupon.type === "FREE_SHIPPING") {
            couponDiscount = coupon.value;
          }
        }
      }
    }

    const shippingFee = serverSubtotal >= 200 ? 0 : 34.9;
    const grandTotal = Math.max(0, serverSubtotal - couponDiscount + shippingFee);
    const orderNumber = `CS-${Date.now().toString().slice(-6)}`;

    // 4. Atomic Prisma Transaction: Create Order, OrderGroups, OrderItems, Redemptions & Decrement Stock
    const result = await prisma.$transaction(async (tx) => {
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
              note: "Sipariş veritabanı ürünleri ile doğrulandı ve onaylandı.",
            },
          },
        },
      });

      // Group items by Seller ID derived directly from database Product relation
      const itemsBySeller: Record<string, typeof validatedItems> = {};
      for (const item of validatedItems) {
        const sellerId = item.dbProd.sellerId;
        if (!itemsBySeller[sellerId]) itemsBySeller[sellerId] = [];
        itemsBySeller[sellerId].push(item);
      }

      // Create OrderGroups, OrderItems, and Decrement Stock for valid merchants
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
              productId: item.dbProd.id,
              quantity: item.quantity,
              price: item.price,
              selectedColor: item.selectedColor || null,
              selectedSize: item.selectedSize || null,
            },
          });

          // Decrement Stock
          await tx.product.update({
            where: { id: item.dbProd.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Record Coupon Redemption if applicable
      if (validCouponId) {
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
  } catch (error) {
    console.error("POST Order API Error:", error);
    return NextResponse.json({ error: "Sipariş işlenirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}
