import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Stage 09...");

  // Common password hash for test accounts (Password: Password123!)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@cadde-store.com" },
    update: {},
    create: {
      email: "admin@cadde-store.com",
      passwordHash,
      firstName: "Sistem",
      lastName: "Yöneticisi",
      role: "ADMIN",
    },
  });

  // 2. Seller User 1 & Profile
  const sellerUser1 = await prisma.user.upsert({
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

  const sellerProfile1 = await prisma.seller.upsert({
    where: { slug: "trend-fashion-magazasi" },
    update: {},
    create: {
      userId: sellerUser1.id,
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

  // Seller User 2 & Profile
  const sellerUser2 = await prisma.user.upsert({
    where: { email: "tech@cadde-store.com" },
    update: {},
    create: {
      email: "tech@cadde-store.com",
      passwordHash,
      firstName: "Cadde",
      lastName: "Teknoloji",
      phone: "0850 987 6543",
      role: "SELLER",
    },
  });

  const sellerProfile2 = await prisma.seller.upsert({
    where: { slug: "cadde-teknoloji" },
    update: {},
    create: {
      userId: sellerUser2.id,
      storeName: "Cadde Teknoloji & Aksesuar",
      slug: "cadde-teknoloji",
      description: "Orijinal kulaklıklar, akıllı saatler, telefon aksesuarları ve en yeni teknolojik cihazlar.",
      logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      verified: true,
      followers: 890,
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

  const catElectronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      slug: "electronics",
      nameTR: "Elektronik",
      nameEN: "Electronics",
      descriptionTR: "Akıllı telefonlar, kulaklıklar ve bilgisayarlar.",
      descriptionEN: "Smartphones, headphones, and laptops.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 5. Products
  const prod1 = await prisma.product.upsert({
    where: { slug: "oversize-pamuk-tisort" },
    update: {},
    create: {
      sellerId: sellerProfile1.id,
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

  const prod2 = await prisma.product.upsert({
    where: { slug: "cicek-desenli-yazlik-elbise" },
    update: {},
    create: {
      sellerId: sellerProfile1.id,
      categoryId: catWomen.id,
      name: "Çiçek Desenli Kemerli Yazlık Elbise",
      slug: "cicek-desenli-yazlik-elbise",
      brand: "Trend Fashion",
      description: "Hafif vual kumaştan üretilmiş, belden bağlamalı şık çiçek desenli yazlık kadın elbise.",
      sku: "CS-WDR-002",
      price: 599.9,
      originalPrice: 799.9,
      stock: 28,
      rating: 4.9,
      reviewCount: 52,
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
      colors: JSON.stringify(["Kırmızı", "Mavi", "Desenli"]),
      sizes: JSON.stringify(["36", "38", "40"]),
      status: "ACTIVE",
    },
  });

  const prod3 = await prisma.product.upsert({
    where: { slug: "kablosuz-anc-kulaklik" },
    update: {},
    create: {
      sellerId: sellerProfile2.id,
      categoryId: catElectronics.id,
      name: "Bluetooth 5.3 Aktif Gürültü Önleyici Kulaklık",
      slug: "kablosuz-anc-kulaklik",
      brand: "SoundMaster",
      description: "40 saat pil ömrü, ANC aktif gürültü engelleme teknolojisi ve ergo dinamik kulak süngerleri.",
      sku: "CS-ELC-003",
      price: 1299.0,
      originalPrice: 1699.0,
      stock: 15,
      rating: 4.8,
      reviewCount: 19,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      colors: JSON.stringify(["Mat Siyah", "Gümüş"]),
      sizes: JSON.stringify(["Standart"]),
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

  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: "FREE_SHIPPING",
      value: 34.9,
      minimumOrder: 200,
      active: true,
    },
  });

  // 7. Customer Address
  await prisma.address.createMany({
    data: [
      {
        userId: customer.id,
        title: "Ev Adresi",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        phone: "0532 123 4567",
        email: "customer@cadde-store.com",
        city: "İstanbul",
        district: "Kadıköy",
        addressLine: "Caferağa Mah. Moda Cad. No: 42 D: 5",
        country: "Türkiye",
        isDefault: true,
      },
    ],
  });

  // 8. Reviews
  await prisma.review.create({
    data: {
      productId: prod1.id,
      userId: customer.id,
      rating: 5,
      comment: "Kumaşı ve kalıbı mükemmel! Yıkandıktan sonra hiç çekme yapmadı.",
      status: "PUBLISHED",
      sellerReply: "Güzel yorumunuz için çok teşekkür ederiz, keyifle kullanmanız dileğiyle!",
    },
  });

  // 9. Platform Settings
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

  console.log("Database seeded successfully with rich Stage 09 catalog!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
