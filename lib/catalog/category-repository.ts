import { Language } from "../i18n/config";

export interface CategoryDetailMock {
  slug: string;
  name: string;
  description: string;
  bannerImage: string;
  subcategories: { slug: string; name: string }[];
}

export function getCategoryBySlug(slug: string, lang: Language = "tr"): CategoryDetailMock | undefined {
  const isEn = lang === "en";

  const categoriesMap: Record<string, CategoryDetailMock> = {
    women: {
      slug: "women",
      name: isEn ? "Women's Clothing" : "Kadın Giyim",
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
    },
    men: {
      slug: "men",
      name: isEn ? "Men's Clothing" : "Erkek Giyim",
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
    },
    electronics: {
      slug: "electronics",
      name: isEn ? "Electronics" : "Elektronik",
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
    },
    "shoes-bags": {
      slug: "shoes-bags",
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
    },
    "home-living": {
      slug: "home-living",
      name: isEn ? "Home & Living" : "Ev & Yaşam",
      description: isEn
        ? "Kitchenware, cookware sets, small appliances, and home decor items."
        : "Mutfak gereçleri, tencere setleri, küçük ev aletleri ve ev dekorasyon ürünleri.",
      bannerImage: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80",
      subcategories: [
        { slug: "cookware", name: isEn ? "Cookware Sets" : "Tencere Setleri" },
        { slug: "airfryers", name: isEn ? "Airfryers & Fryers" : "Fritözler" },
        { slug: "decor", name: isEn ? "Home Decor" : "Ev Dekorasyon" },
      ],
    },
    "beauty-care": {
      slug: "beauty-care",
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
    },
  };

  return categoriesMap[slug] || {
    slug,
    name: slug.toUpperCase(),
    description: isEn ? "Products in this category" : "Bu kategorideki ürünler",
    bannerImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    subcategories: [],
  };
}
