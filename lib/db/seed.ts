import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Password hashes (Password: Password123!)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@cadde-store.com" },
    update: {},
    create: {
      email: "admin@cadde-store.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  // 2. Seller User & Profile
  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@cadde-store.com" },
    update: {},
    create: {
      email: "seller@cadde-store.com",
      passwordHash,
      firstName: "Trendy",
      lastName: "Fashion",
      phone: "0850 123 4567",
      role: "SELLER",
    },
  });

  const sellerProfile = await prisma.seller.upsert({
    where: { slug: "trend-fashion-magazasi" },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: "Trend Fashion Mağazası",
      slug: "trend-fashion-magazasi",
      description: "Kadın ve erkek giyimde en son moda kıyafetler, aksesuarlar ve özel tasarım koleksiyonlar.",
      logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 4.8,
      verified: true,
      followers: 1240,
      status: "ACTIVE",
    },
  });

  // 3. Customer User
  const customer = await prisma.user.upsert({
    where: { email: "customer@cadde-store.com" },
    update: {},
    create: {
      email: "customer@cadde-store.com",
      passwordHash,
      firstName: "Ahmet",
      lastName: "Yılmaz",
      phone: "0532 123 4567",
      role: "CUSTOMER",
    },
  });

  // 4. Categories
  const catMen = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: {
      slug: "men",
      nameTR: "Erkek Giyim",
      nameEN: "Men's Fashion",
      descriptionTR: "Tişört, gömlek, pantolon ve dış giyim ürünleri.",
      descriptionEN: "T-shirts, shirts, trousers, and outerwear.",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
    },
  });

  const catWomen = await prisma.category.upsert({
    where: { slug: "women" },
    update: {},
    create: {
      slug: "women",
      nameTR: "Kadın Giyim",
      nameEN: "Women's Fashion",
      descriptionTR: "Elbise, bluz, etek ve aksesuar serisi.",
      descriptionEN: "Dresses, blouses, skirts, and accessory collections.",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 5. Products
  const prod1 = await prisma.product.upsert({
    where: { slug: "oversize-pamuk-tisort" },
    update: {},
    create: {
      sellerId: sellerProfile.id,
      categoryId: catMen.id,
      name: "Oversize %100 Pamuklu Erkek Tişört",
      slug: "oversize-pamuk-tisort",
      brand: "Trendyol Collection",
      description: "Rahat kesim, nefes alabilen %100 pamuklu kumaştan üretilmiş premium günlük erkek tişört.",
      sku: "CS-MTS-001",
      price: 249.9,
      originalPrice: 349.9,
      stock: 45,
      rating: 4.7,
      reviewCount: 38,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      colors: JSON.stringify(["Siyah", "Beyaz", "Gri"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      status: "ACTIVE",
    },
  });

  // 6. Coupons
  await prisma.coupon.upsert({
    where: { code: "CADDE10" },
    update: {},
    create: {
      code: "CADDE10",
      type: "PERCENTAGE",
      value: 10,
      minimumOrder: 150,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME150" },
    update: {},
    create: {
      code: "WELCOME150",
      type: "FIXED",
      value: 150,
      minimumOrder: 500,
      active: true,
    },
  });

  // 7. Platform Settings
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      marketplaceName: "Cadde Store Türkiye",
      supportEmail: "destek@cadde.store",
      defaultCommissionRate: 10,
      orderCancellationWindowDays: 2,
      returnWindowDays: 14,
      defaultShippingFee: 34.9,
      freeShippingThreshold: 200,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
