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
    update: { passwordHash },
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
    update: { passwordHash },
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
    update: { commissionRate: 0.10 },
    create: {
      userId: sellerUser1.id,
      storeName: "Trend Fashion Mağazası",
      slug: "trend-fashion-magazasi",
      description: "Kadın ve erkek giyimde en son moda kıyafetler, aksesuarlar ve özel tasarım koleksiyonlar.",
      logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 4.8,
      verified: true,
      followers: 1240,
      commissionRate: 0.10,
      status: "ACTIVE",
    },
  });

  // Seller User 2 & Profile
  const sellerUser2 = await prisma.user.upsert({
    where: { email: "tech@cadde-store.com" },
    update: { passwordHash },
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
    update: { commissionRate: 0.12 },
    create: {
      userId: sellerUser2.id,
      storeName: "Cadde Teknoloji & Aksesuar",
      slug: "cadde-teknoloji",
      description: "Orijinal kulaklıklar, akıllı saatler, telefon aksesuarları ve en yeni teknolojik cihazlar.",
      logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      verified: true,
      followers: 890,
      commissionRate: 0.12,
      status: "ACTIVE",
    },
  });

  // 3. Customer User
  const customer = await prisma.user.upsert({
    where: { email: "customer@cadde-store.com" },
    update: { passwordHash },
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
    update: { brandId: brandZara.id, stock: 50, status: "ACTIVE", price: 299.9, badges: JSON.stringify(["BESTSELLER", "FAST_DELIVERY"]) },
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
      badges: JSON.stringify(["BESTSELLER", "FAST_DELIVERY"]),
      status: "ACTIVE",
    },
  });

  const prod2 = await prisma.product.upsert({
    where: { slug: "kablosuz-anc-bluetooth-kulaklik" },
    update: { brandId: brandApple.id, stock: 25, status: "ACTIVE", price: 1499.0, badges: JSON.stringify(["FREE_SHIPPING", "FLASH_SALE"]) },
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
      badges: JSON.stringify(["FREE_SHIPPING", "FLASH_SALE"]),
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

  // 10. Campaigns
  await prisma.campaign.upsert({
    where: { id: "campaign-nike-hero" },
    update: {},
    create: {
      id: "campaign-nike-hero",
      name: "Zara & Moda Özel Vitrin Sponsorluğu",
      type: "SPONSORED_PRODUCT",
      targetId: prod1.id,
      placement: "HOMEPAGE_HERO",
      budget: 5000.0,
      spent: 1450.0,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-31"),
      priority: 1,
      status: "ACTIVE",
      impressions: 48500,
      clicks: 2150,
      orders: 142,
      revenue: 42585.8,
    },
  });

  await prisma.campaign.upsert({
    where: { id: "campaign-apple-search" },
    update: {},
    create: {
      id: "campaign-apple-search",
      name: "Apple & Premium Teknoloji Arama Sponsorluğu",
      type: "SPONSORED_BRAND",
      targetId: brandApple.id,
      placement: "SEARCH_TOP",
      budget: 10000.0,
      spent: 3820.0,
      startDate: new Date("2026-08-10"),
      endDate: new Date("2026-11-30"),
      priority: 2,
      status: "ACTIVE",
      impressions: 92300,
      clicks: 4610,
      orders: 320,
      revenue: 479680.0,
    },
  });

  await prisma.campaign.upsert({
    where: { id: "campaign-trend-seller" },
    update: {},
    create: {
      id: "campaign-trend-seller",
      name: "Trend Fashion Mağaza Öne Çıkarma",
      type: "SPONSORED_SELLER",
      targetId: sellerProfile1.id,
      placement: "CATEGORY_TOP",
      budget: 3000.0,
      spent: 3000.0,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-08-20"),
      priority: 1,
      status: "COMPLETED",
      impressions: 34000,
      clicks: 1250,
      orders: 88,
      revenue: 26391.2,
    },
  });

  // 11. Navigation Items
  const navFashion = await prisma.navigationItem.upsert({
    where: { id: "nav-cat-fashion" },
    update: {},
    create: {
      id: "nav-cat-fashion",
      titleTr: "Giyim & Moda",
      titleEn: "Fashion & Apparel",
      url: "/category/men",
      section: "HEADER",
      sortOrder: 1,
      badgeTr: "Trend",
      badgeEn: "Trending",
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-sub-men" },
    update: {},
    create: {
      id: "nav-sub-men",
      parentId: navFashion.id,
      titleTr: "Erkek Giyim",
      titleEn: "Men's Fashion",
      url: "/category/men",
      section: "MEGA_MENU",
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-sub-women" },
    update: {},
    create: {
      id: "nav-sub-women",
      parentId: navFashion.id,
      titleTr: "Kadın Giyim",
      titleEn: "Women's Fashion",
      url: "/category/women",
      section: "MEGA_MENU",
      sortOrder: 2,
      isActive: true,
    },
  });

  const navElectronics = await prisma.navigationItem.upsert({
    where: { id: "nav-cat-electronics" },
    update: {},
    create: {
      id: "nav-cat-electronics",
      titleTr: "Elektronik",
      titleEn: "Electronics",
      url: "/category/electronics",
      section: "HEADER",
      sortOrder: 2,
      badgeTr: "Yeni",
      badgeEn: "New",
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-sub-headphones" },
    update: {},
    create: {
      id: "nav-sub-headphones",
      parentId: navElectronics.id,
      titleTr: "Kulaklıklar & Ses",
      titleEn: "Headphones & Audio",
      url: "/category/electronics",
      section: "MEGA_MENU",
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-brands" },
    update: {},
    create: {
      id: "nav-brands",
      titleTr: "Markalar",
      titleEn: "Brands",
      url: "/brands",
      section: "HEADER",
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-bestsellers" },
    update: {},
    create: {
      id: "nav-bestsellers",
      titleTr: "Çok Satanlar",
      titleEn: "Bestsellers",
      url: "/products?sort=bestseller",
      section: "HEADER",
      sortOrder: 4,
      badgeTr: "Fırsat",
      badgeEn: "Hot",
      isActive: true,
    },
  });

  // Footer Navigation
  await prisma.navigationItem.upsert({
    where: { id: "nav-footer-about" },
    update: {},
    create: {
      id: "nav-footer-about",
      titleTr: "Hakkımızda",
      titleEn: "About Us",
      url: "/about",
      section: "FOOTER",
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-footer-contact" },
    update: {},
    create: {
      id: "nav-footer-contact",
      titleTr: "Müşteri Hizmetleri",
      titleEn: "Customer Support",
      url: "/contact",
      section: "FOOTER",
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-footer-kvkk" },
    update: {},
    create: {
      id: "nav-footer-kvkk",
      titleTr: "KVKK Aydınlatma Metni",
      titleEn: "KVKK Policy",
      url: "/policies/kvkk",
      section: "FOOTER",
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.navigationItem.upsert({
    where: { id: "nav-footer-seller" },
    update: {},
    create: {
      id: "nav-footer-seller",
      titleTr: "Satıcı Ol",
      titleEn: "Become a Seller",
      url: "/seller/apply",
      section: "FOOTER",
      sortOrder: 4,
      isActive: true,
    },
  });

  // 12. Media Assets
  await prisma.mediaAsset.upsert({
    where: { id: "media-autumn-hero" },
    update: {},
    create: {
      id: "media-autumn-hero",
      filename: "autumn-hero-banner.jpg",
      url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      mimeType: "image/jpeg",
      sizeBytes: 245800,
      width: 1200,
      height: 600,
      altTextTr: "Sonbahar Moda Kampanyası Vitrin Görseli",
      altTextEn: "Autumn Fashion Campaign Showcase",
      tags: JSON.stringify(["moda", "banner", "hero", "autumn"]),
      referenceCount: 3,
      uploadedBy: admin.id,
    },
  });

  await prisma.mediaAsset.upsert({
    where: { id: "media-tech-headphones" },
    update: {},
    create: {
      id: "media-tech-headphones",
      filename: "anc-headphones-promo.jpg",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      mimeType: "image/jpeg",
      sizeBytes: 312400,
      width: 1200,
      height: 600,
      altTextTr: "ANC Bluetooth Kulaklık Tanıtım",
      altTextEn: "ANC Bluetooth Headphones Promo",
      tags: JSON.stringify(["tech", "electronics", "audio", "banner"]),
      referenceCount: 2,
      uploadedBy: admin.id,
    },
  });

  await prisma.mediaAsset.upsert({
    where: { id: "media-brand-nike" },
    update: {},
    create: {
      id: "media-brand-nike",
      filename: "nike-air-max-product.jpg",
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      mimeType: "image/jpeg",
      sizeBytes: 189400,
      width: 600,
      height: 600,
      altTextTr: "Nike Kırmızı Spor Ayakkabı",
      altTextEn: "Nike Red Running Shoe",
      tags: JSON.stringify(["nike", "shoes", "sneakers", "product"]),
      referenceCount: 4,
      uploadedBy: admin.id,
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
