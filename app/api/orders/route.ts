import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

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
    const { items, calculation, shippingAddress, paymentInfo, customerInfo } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Geçersiz sipariş verileri." }, { status: 400 });
    }

    const orderNumber = `CS-${Date.now().toString().slice(-6)}`;

    // 1. Resolve Customer ID
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

    // 2. Fetch default seller & category for relational fallback if item product is not yet in DB
    const defaultSeller = await prisma.seller.findFirst() || await prisma.seller.create({
      data: {
        userId: customerId,
        storeName: "Cadde Store Mağazası",
        slug: `cadde-store-${Date.now()}`,
        description: "Varsayılan pazaryeri mağazası",
        logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      },
    });

    const defaultCategory = await prisma.category.findFirst() || await prisma.category.create({
      data: {
        slug: "genel",
        nameTR: "Genel",
        nameEN: "General",
        descriptionTR: "Genel kategorisi",
        descriptionEN: "General category",
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      },
    });

    // 3. Resolve DB Products & Group by Seller
    const resolvedItems: {
      productId: string;
      sellerId: string;
      price: number;
      quantity: number;
      selectedColor?: string;
      selectedSize?: string;
    }[] = [];

    const itemsBySeller: Record<string, typeof resolvedItems> = {};

    for (const item of items) {
      let dbProd = await prisma.product.findFirst({
        where: { OR: [{ id: item.product.id }, { slug: item.product.slug || item.product.id }] },
      });

      if (!dbProd) {
        // Create DB Product entry for custom seller item
        const itemSlug = `prod-${item.product.id}-${Date.now()}`;
        dbProd = await prisma.product.create({
          data: {
            sellerId: defaultSeller.id,
            categoryId: defaultCategory.id,
            name: item.product.name,
            slug: itemSlug,
            brand: item.product.brand || "Cadde Store",
            description: item.product.description || item.product.name,
            sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            price: item.product.price,
            stock: 100,
            imageUrl: item.product.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
          },
        });
      }

      const sellerId = dbProd.sellerId || defaultSeller.id;
      const resolved = {
        productId: dbProd.id,
        sellerId,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      };

      resolvedItems.push(resolved);

      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push(resolved);
    }

    // 4. Create Order with OrderGroup and OrderItem records
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: "CONFIRMED",
        subtotal: calculation.subtotal,
        productDiscount: calculation.productDiscount || 0,
        couponDiscount: calculation.couponDiscount || 0,
        shippingFee: calculation.shippingFee || 0,
        grandTotal: calculation.grandTotal,
        currency: calculation.currency || "TRY",
        shippingAddressSnapshot: JSON.stringify(shippingAddress),
        statusHistory: {
          create: {
            status: "CONFIRMED",
            note: "Sipariş alındı ve onaylandı.",
          },
        },
      },
    });

    // 5. Create OrderGroups and OrderItems
    for (const sellerId of Object.keys(itemsBySeller)) {
      const sellerItems = itemsBySeller[sellerId];
      const groupSubtotal = sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const orderGroup = await prisma.orderGroup.create({
        data: {
          orderId: order.id,
          sellerId,
          status: "CONFIRMED",
          subtotal: groupSubtotal,
        },
      });

      for (const item of sellerItems) {
        await prisma.orderItem.create({
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

    // 6. Fetch complete created order with relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: { include: { product: true } },
        orderGroups: { include: { seller: true, items: true } },
        statusHistory: true,
      },
    });

    return NextResponse.json({ success: true, order: completeOrder });
  } catch (error) {
    console.error("POST Order API Error:", error);
    return NextResponse.json({ error: "Sipariş oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
