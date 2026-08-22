import { Language } from "../i18n/config";

export interface CategoryDetailMock {
  slug: string;
  name: string;
  description: string;
  bannerImage: string;
  subcategories: { slug: string; name: string }[];
}

export function isCategorySlugMatch(prodCatSlug: string, targetSlug: string): boolean {
  if (!prodCatSlug || !targetSlug) return false;
  const p = prodCatSlug.toLowerCase().trim();
  const t = targetSlug.toLowerCase().trim();
  if (p === t) return true;

  const aliases: Record<string, string[]> = {
    women: ["kadin", "women"],
    kadin: ["kadin", "women"],
    men: ["erkek", "men"],
    erkek: ["erkek", "men"],
    kids: ["cocuk", "kids"],
    cocuk: ["cocuk", "kids"],
    electronics: ["elektronik", "electronics"],
    elektronik: ["elektronik", "electronics"],
    "home-living": ["ev-yasam", "home-living"],
    "ev-yasam": ["ev-yasam", "home-living"],
    supermarket: ["supermarket"],
    "beauty-care": ["kozmetik", "beauty-care"],
    kozmetik: ["kozmetik", "beauty-care"],
    "shoes-bags": ["ayakkabi-canta", "shoes-bags"],
    "ayakkabi-canta": ["ayakkabi-canta", "shoes-bags"],
    spor: ["spor", "sports-outdoor"],
    "sports-outdoor": ["spor", "sports-outdoor"],
    "kitap-kirtasiye": ["kitap-kirtasiye", "books-hobbies"],
    "books-hobbies": ["kitap-kirtasiye", "books-hobbies"],
    "pet-shop": ["pet-shop"],
    otomotiv: ["otomotiv", "automotive"],
    automotive: ["otomotiv", "automotive"],
  };

  const pAliases = aliases[p] || [p];
  const tAliases = aliases[t] || [t];
  return pAliases.some((alias) => tAliases.includes(alias));
}

export function getCategoryBySlug(slug: string, lang: Language = "tr"): CategoryDetailMock {
  const isEn = lang === "en";
  const s = slug.toLowerCase().trim();

  if (s === "women" || s === "kadin") {
    return {
      slug: "kadin",
      name: isEn ? "Women's Collection" : "Kadın Koleksiyonu",
      description: isEn
        ? "Discover the latest season women's dresses, t-shirts, jackets, and accessories at Cadde Store."
        : "Cadde Store'da en yeni sezon kadın elbise, tişört, ceket ve aksesuar çeşitlerini keşfedin.",
      bannerImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "dresses", name: isEn ? "Dresses" : "Elbiseler" },
        { slug: "tshirts", name: isEn ? "T-Shirts" : "Tişörtler" },
        { slug: "jackets", name: isEn ? "Coats & Jackets" : "Ceket & Mont" },
        { slug: "shoes", name: isEn ? "Shoes" : "Ayakkabılar" },
      ],
    };
  }

  if (s === "men" || s === "erkek") {
    return {
      slug: "erkek",
      name: isEn ? "Men's Collection" : "Erkek Koleksiyonu",
      description: isEn
        ? "Explore classic and streetwear men's fashion, shirts, trousers, and sportswear."
        : "Klasik ve sokak modasına uygun erkek giyim, gömlek, pantolon ve spor kıyafetlerini inceleyin.",
      bannerImage: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "tshirts", name: isEn ? "T-Shirts" : "Tişörtler" },
        { slug: "shirts", name: isEn ? "Shirts" : "Gömlekler" },
        { slug: "trousers", name: isEn ? "Trousers" : "Pantolonlar" },
        { slug: "sweatshirts", name: isEn ? "Sweatshirts" : "Sweatshirt" },
      ],
    };
  }

  if (s === "kids" || s === "cocuk") {
    return {
      slug: "cocuk",
      name: isEn ? "Kids & Baby Collection" : "Çocuk & Bebek Koleksiyonu",
      description: isEn
        ? "Girls and boys fashion, baby sets, toys, and strollers at special prices."
        : "Kız ve erkek çocuk giyim, bebek takımları, oyuncak ve bebek arabası fırsatları.",
      bannerImage: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "girls", name: isEn ? "Girls" : "Kız Çocuk" },
        { slug: "boys", name: isEn ? "Boys" : "Erkek Çocuk" },
        { slug: "baby", name: isEn ? "Baby Care" : "Bebek Bakım" },
      ],
    };
  }

  if (s === "electronics" || s === "elektronik") {
    return {
      slug: "elektronik",
      name: isEn ? "Electronics & Tech" : "Elektronik & Teknoloji",
      description: isEn
        ? "Smartphones, laptops, headphones, smart TVs, and tech accessories with fast delivery."
        : "Akıllı telefonlar, bilgisayarlar, kulaklıklar ve televizyon modelleri hızlı teslimat fırsatıyla.",
      bannerImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "smartphones", name: isEn ? "Smartphones" : "Cep Telefonları" },
        { slug: "headphones", name: isEn ? "Headphones" : "Kulaklıklar" },
        { slug: "tvs", name: isEn ? "Smart TVs" : "Televizyonlar" },
        { slug: "laptops", name: isEn ? "Laptops" : "Bilgisayarlar" },
      ],
    };
  }

  if (s === "home-living" || s === "ev-yasam") {
    return {
      slug: "ev-yasam",
      name: isEn ? "Home & Living" : "Ev & Yaşam",
      description: isEn
        ? "Kitchenware, cookware sets, small appliances, and home decor items."
        : "Mutfak gereçleri, tencere setleri, küçük ev aletleri ve ev dekorasyon ürünleri.",
      bannerImage: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "cookware", name: isEn ? "Cookware Sets" : "Tencere Setleri" },
        { slug: "airfryers", name: isEn ? "Airfryers" : "Fritözler" },
        { slug: "decor", name: isEn ? "Home Decor" : "Ev Dekorasyon" },
      ],
    };
  }

  if (s === "supermarket") {
    return {
      slug: "supermarket",
      name: isEn ? "Supermarket & Pantry" : "Süpermarket & Gıda",
      description: isEn
        ? "Food items, cleaning products, beverages, and household consumables."
        : "Temel gıda, temizlik ürünleri, içecekler ve ev sarf malzemeleri.",
      bannerImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "groceries", name: isEn ? "Groceries" : "Temel Gıda" },
        { slug: "cleaning", name: isEn ? "Cleaning" : "Temizlik Ürünleri" },
      ],
    };
  }

  if (s === "beauty-care" || s === "kozmetik") {
    return {
      slug: "kozmetik",
      name: isEn ? "Beauty & Personal Care" : "Kozmetik & Kişisel Bakım",
      description: isEn
        ? "Skincare serums, perfumes, hair care, and makeup products from original brands."
        : "Cilt bakım serumları, parfümler, saç bakımı ve makyaj ürünleri yetkili satıcılardan.",
      bannerImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "skincare", name: isEn ? "Skincare" : "Cilt Bakımı" },
        { slug: "perfume", name: isEn ? "Perfumes" : "Parfüm" },
        { slug: "haircare", name: isEn ? "Haircare" : "Saç Bakımı" },
      ],
    };
  }

  if (s === "shoes-bags" || s === "ayakkabi-canta") {
    return {
      slug: "ayakkabi-canta",
      name: isEn ? "Shoes & Bags" : "Ayakkabı & Çanta",
      description: isEn
        ? "Leather bags, running sneakers, high heels, and boots guaranteed by top brands."
        : "Hakiki deri çantalar, spor ayakkabılar ve bot çeşitleri en sevilen markaların güvencesiyle.",
      bannerImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "sneakers", name: isEn ? "Sneakers" : "Spor Ayakkabılar" },
        { slug: "bags", name: isEn ? "Handbags" : "Omuz Çantaları" },
        { slug: "boots", name: isEn ? "Boots" : "Botlar" },
      ],
    };
  }

  return {
    slug,
    name: slug.toUpperCase(),
    description: isEn ? "Products in this category" : "Bu kategorideki ürünler",
    bannerImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    subcategories: [],
  };
}
