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

  // 4.1 Brands
  const brandNike = await prisma.brand.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      name: "Nike",
      slug: "nike",
      logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
      descriptionTR: "Dünyaca ünlü spor giyim, ayakkabı ve ekipman markası.",
      descriptionEN: "World-renowned sportswear, footwear, and equipment brand.",
      isFeatured: true,
      status: "ACTIVE",
    },
  });

  const brandZara = await prisma.brand.upsert({
    where: { slug: "zara" },
    update: {},
    create: {
      name: "Zara",
      slug: "zara",
      logoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
      descriptionTR: "Özgün tasarımlar ve trend giyim koleksiyonları.",
      descriptionEN: "Original designs and trending apparel collections.",
      isFeatured: true,
      status: "ACTIVE",
    },
  });

  const brandApple = await prisma.brand.upsert({
    where: { slug: "apple" },
    update: {},
    create: {
      name: "Apple",
      slug: "apple",
      logoUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=200&q=80",
      descriptionTR: "Yenilikçi akıllı telefon, tablet ve bilgisayar teknolojileri.",
      descriptionEN: "Innovative smartphone, tablet, and computer technology.",
      isFeatured: true,
      status: "ACTIVE",
    },
  });

  const brandSamsung = await prisma.brand.upsert({
    where: { slug: "samsung" },
    update: {},
    create: {
      name: "Samsung",
      slug: "samsung",
      logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80",
      descriptionTR: "Akıllı cihazlar, giyilebilir teknoloji ve ev aletleri.",
      descriptionEN: "Smart devices, wearables, and consumer electronics.",
      isFeatured: true,
      status: "ACTIVE",
    },
  });

  const brandKaraca = await prisma.brand.upsert({
    where: { slug: "karaca" },
    update: {},
    create: {
      name: "Karaca",
      slug: "karaca",
      logoUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=200&q=80",
      descriptionTR: "Mutfak, sofra ve ev tekstili ürünleri.",
      descriptionEN: "Kitchenware, tableware, and home textile collections.",
      isFeatured: true,
      status: "ACTIVE",
    },
  });

  // 5. Products
  const prod1 = await prisma.product.upsert({
    where: { slug: "oversize-pamuklu-erkek-tisort" },
    update: { brandId: brandZara.id, stock: 50, status: "ACTIVE", price: 299.9 },
    create: {
      sellerId: sellerProfile1.id,
      categoryId: catMen.id,
      brandId: brandZara.id,
      name: "Oversize Pamuklu Erkek Tişört",
      slug: "oversize-pamuklu-erkek-tisort",
      description: "Yüksek kaliteli %100 pamuklu kumaştan üretilmiş, rahat kalıp nefes alabilen oversize tişört.",
      brand: "Zara",
      sku: "TSH-OVR-001",
      price: 299.9,
      originalPrice: 449.9,
      stock: 50,
      rating: 4.9,
      reviewCount: 42,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      colors: JSON.stringify(["Beyaz", "Siyah", "Haki"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      status: "ACTIVE",
    },
  });

  const prod2 = await prisma.product.upsert({
    where: { slug: "kablosuz-anc-bluetooth-kulaklik" },
    update: { brandId: brandApple.id, stock: 25, status: "ACTIVE", price: 1499.0 },
    create: {
      sellerId: sellerProfile2.id,
      categoryId: catElectronics.id,
      brandId: brandApple.id,
      name: "Aktif Gürültü Engelleyici Kablosuz Kulaklık",
      slug: "kablosuz-anc-bluetooth-kulaklik",
      description: "40 saate varan pil ömrü, hibrit aktif gürültü engelleme (ANC) ve kristal netliğinde ses kalitesi.",
      brand: "Apple",
      sku: "TECH-ANC-002",
      price: 1499.0,
      originalPrice: 1999.0,
      stock: 25,
      rating: 4.8,
      reviewCount: 19,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      colors: JSON.stringify(["Mat Siyah", "Gümüş"]),
      sizes: JSON.stringify(["Standart"]),
      status: "ACTIVE",
    },
  });

  // 5.1 Homepage CMS Sections & Banners
  const heroSection = await prisma.homepageSection.upsert({
    where: { id: "hero-main-section" },
    update: {},
    create: {
      id: "hero-main-section",
      titleTR: "Ana Sayfa Vitrin Hero",
      titleEN: "Homepage Main Hero",
      type: "HERO",
      orderIndex: 0,
      active: true,
      configJson: JSON.stringify({ autoplay: true, intervalMs: 5000 }),
    },
  });

  await prisma.banner.upsert({
    where: { id: "banner-autumn-sale" },
    update: {},
    create: {
      id: "banner-autumn-sale",
      sectionId: heroSection.id,
      titleTR: "Büyük Sonbahar Fırsatları",
      titleEN: "Big Autumn Sale Deals",
      subtitleTR: "Seçili Moda ve Ayakkabı Ürünlerinde Net %50 İndirim",
      subtitleEN: "Flat 50% Off Selected Fashion & Footwear",
      imageUrlDesktop: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      imageUrlMobile: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
      targetType: "CATEGORY",
      targetValue: "/category/women",
      badgeTextTR: "Sınırlı Süre",
      badgeTextEN: "Limited Time",
      orderIndex: 0,
      active: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: "banner-tech-days" },
    update: {},
    create: {
      id: "banner-tech-days",
      sectionId: heroSection.id,
      titleTR: "Elektronik Günleri Başladı!",
      titleEN: "Electronics Days Started!",
      subtitleTR: "Telefon, Laptop ve Kulaklıklarda Peşin Fiyatına 6 Taksit",
      subtitleEN: "6 Installments on Phones, Laptops & Headphones",
      imageUrlDesktop: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      imageUrlMobile: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      targetType: "CATEGORY",
      targetValue: "/category/electronics",
      badgeTextTR: "Vade Farksız Taksit",
      badgeTextEN: "0% Interest",
      orderIndex: 1,
      active: true,
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
    update: {
      defaultShippingFee: 34.9,
      freeShippingThreshold: 200,
      defaultCommissionRate: 10,
    },
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
