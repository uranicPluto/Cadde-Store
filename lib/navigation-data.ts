import { Language } from "./i18n/config";

export interface MegaMenuSubcategory {
  name: string;
  items: string[];
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  isHot?: boolean;
  subcategories: MegaMenuSubcategory[];
  popularBrands?: string[];
  promotionalBanner?: {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    bgGradient: string;
  };
}

export function getMockNavigationCategories(lang: Language = "tr"): CategoryData[] {
  const isEn = lang === "en";

  return [
    {
      id: "cat-kadin",
      name: isEn ? "Women" : "Kadın",
      slug: "kadin",
      isHot: true,
      subcategories: [
        {
          name: isEn ? "Clothing" : "Giyim",
          items: isEn
            ? ["Dresses", "T-Shirts & Tank Tops", "Shirts & Blouses", "Trousers", "Skirts", "Coats & Jackets", "Sweaters & Cardigans", "Sweatshirts", "Shorts"]
            : ["Elbiseler", "Tişört & Atlet", "Gömlek & Bluz", "Pantolon", "Etek", "Mont & Ceket", "Kazak & Hırka", "Sweatshirt", "Şort"],
        },
        {
          name: isEn ? "Footwear" : "Ayakkabı",
          items: isEn
            ? ["Sneakers", "Boots & Stilettos", "Sandals & Slippers", "Heels", "Flats", "Running Shoes"]
            : ["Sneaker", "Bot & Stiletto", "Sandalet & Terlik", "Topuklu Ayakkabı", "Babet", "Spor Ayakkabı"],
        },
        {
          name: isEn ? "Bags & Accessories" : "Çanta & Aksesuar",
          items: isEn
            ? ["Shoulder Bags", "Crossbody Bags", "Backpacks", "Wallets", "Jewelry", "Sunglasses", "Watches"]
            : ["Omuz Çantası", "Çapraz Çanta", "Sırt Çantası", "Cüzdan", "Takı & Mücevher", "Güneş Gözlüğü", "Saat"],
        },
        {
          name: isEn ? "Underwear & Pajamas" : "İç Giyim & Pijama",
          items: isEn
            ? ["Bras", "Lingerie Sets", "Pajama Sets", "Nightwear", "Shapewear", "Socks"]
            : ["Sütyen", "İç Çamaşırı Takımı", "Pijama Takımı", "Gecelik", "Korse", "Çorap"],
        },
      ],
      popularBrands: ["Zara", "Mango", "Stradivarius", "Pull&Bear", "Bershka", "Koton"],
      promotionalBanner: {
        title: isEn ? "Autumn Women's Fashion" : "Kadın Modasında Sonbahar",
        subtitle: isEn ? "Flat 40% Off Selected Dresses!" : "Seçili Elbiselerde Net %40 İndirim Fırsatı!",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
        ctaText: isEn ? "Explore" : "İncele",
        bgGradient: "from-orange-500 to-rose-600",
      },
    },
    {
      id: "cat-erkek",
      name: isEn ? "Men" : "Erkek",
      slug: "erkek",
      subcategories: [
        {
          name: isEn ? "Clothing" : "Giyim",
          items: isEn
            ? ["T-Shirts & Polos", "Shirts", "Trousers & Jeans", "Sweatshirts & Hoodies", "Coats & Jackets", "Suits", "Shorts & Swimwear"]
            : ["Tişört & Pololar", "Gömlek", "Pantolon & Jean", "Sweatshirt & Hoodies", "Mont & Ceket", "Takım Elbise", "Şort & Deniz Şortu"],
        },
        {
          name: isEn ? "Footwear" : "Ayakkabı",
          items: isEn
            ? ["Sneakers & Sport", "Classic Shoes", "Boots", "Sandals & Slippers", "Cleats"]
            : ["Sneaker & Spor", "Klasik Ayakkabı", "Bot", "Sandalet & Terlik", "Krampon"],
        },
        {
          name: isEn ? "Accessories & Bags" : "Aksesuar & Çanta",
          items: isEn
            ? ["Wristwatches", "Sunglasses", "Belts", "Wallets & Cardholders", "Backpacks", "Hats & Caps"]
            : ["Kol Saati", "Güneş Gözlüğü", "Kemer", "Cüzdan & Kartlık", "Sırt Çantası", "Şapka & Bere"],
        },
      ],
      popularBrands: ["Nike", "Adidas", "Puma", "Jack & Jones", "Mavi", "DeFacto"],
      promotionalBanner: {
        title: isEn ? "Men's Sports Collection" : "Erkek Spor Koleksiyonu",
        subtitle: isEn ? "No-Interest Installments on Nike & Adidas" : "Nike & Adidas Ürünlerinde Vade Farksız Taksit",
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
        ctaText: isEn ? "View Deals" : "Fırsatları Gör",
        bgGradient: "from-slate-800 to-indigo-900",
      },
    },
    {
      id: "cat-cocuk",
      name: isEn ? "Kids" : "Çocuk",
      slug: "cocuk",
      subcategories: [
        {
          name: isEn ? "Girls" : "Kız Çocuk",
          items: isEn
            ? ["Dresses & Jumper", "T-Shirts & Blouses", "Leggings & Trousers", "Coats & Jackets", "Shoes"]
            : ["Elbise & Jile", "Tişört & Bluz", "Tayt & Pantolon", "Mont & Ceket", "Ayakkabı"],
        },
        {
          name: isEn ? "Boys" : "Erkek Çocuk",
          items: isEn
            ? ["T-Shirts & Sweatshirts", "Tracksuits & Trousers", "Coats & Windbreakers", "Sneakers"]
            : ["Tişört & Sweatshirt", "Eşofman & Pantolon", "Mont & Rüzgarlık", "Spor Ayakkabı"],
        },
        {
          name: isEn ? "Baby (0-2 Yrs)" : "Bebek (0-2 Yaş)",
          items: isEn
            ? ["Bodysuits & Rompers", "Strollers", "High Chairs", "Baby Care"]
            : ["Zıbın & Tulum", "Bebek Arabası", "Mama Sandalyesi", "Bebek Bakım"],
        },
      ],
      popularBrands: ["LC Waikiki", "Civil", "Carter's", "Panço", "Koton Kids"],
    },
    {
      id: "cat-ev-yasam",
      name: isEn ? "Home & Living" : "Ev & Yaşam",
      slug: "ev-yasam",
      subcategories: [
        {
          name: isEn ? "Kitchen & Dining" : "Mutfak & Sofralar",
          items: isEn
            ? ["Cookware & Pan Sets", "Dinnerware", "Coffee Makers", "Tea Makers", "Blenders & Food Processors"]
            : ["Tencere & Tava Setleri", "Yemek Takımı", "Kahve Makinesi", "Çay Makinesi", "Blender & Mutfak Robotu"],
        },
        {
          name: isEn ? "Home Textiles" : "Ev Tekstili",
          items: isEn
            ? ["Bedding Sets", "Bedspreads", "Towels & Bathrobes", "Rugs & Carpets", "Curtains"]
            : ["Nevresim Takımı", "Yatak Örtüsü", "Havlular & Bornoz", "Halı & Kilim", "Perde"],
        },
        {
          name: isEn ? "Furniture & Decor" : "Mobilya & Dekorasyon",
          items: isEn
            ? ["Study Desks", "Gaming Chairs", "Bookshelves", "Lighting & Floor Lamps", "Wall Art & Decor"]
            : ["Çalışma Masası", "Oyuncu Koltuğu", "Kitaplık", "Aydınlatma & Lambader", "Tablo & Duvar Süsü"],
        },
      ],
      popularBrands: ["Karaca", "IKEA", "Tefal", "Philips", "Korkmaz", "Taç"],
    },
    {
      id: "cat-elektronik",
      name: isEn ? "Electronics" : "Elektronik",
      slug: "elektronik",
      isHot: true,
      subcategories: [
        {
          name: isEn ? "Phones & Accessories" : "Telefon & Aksesuar",
          items: isEn
            ? ["Smartphones", "Bluetooth Headphones", "Chargers & Cables", "Screen Protectors & Cases", "Smartwatches"]
            : ["Akıllı Telefonlar", "Bluetooth Kulaklıklar", "Şarj Aleti & Kablo", "Ekran Koruyucu & Kılıf", "Akıllı Saatler"],
        },
        {
          name: isEn ? "Computers & Tablets" : "Bilgisayar & Tablet",
          items: isEn
            ? ["Laptops & Notebooks", "Gaming PCs", "Tablets", "Monitors", "Keyboards & Mice"]
            : ["Laptop / Dizüstü", "Oyuncu Bilgisayarları", "Tabletler", "Monitör", "Klavye & Mouse"],
        },
        {
          name: isEn ? "TV & Home Entertainment" : "TV & Ev Eğlencesi",
          items: isEn
            ? ["Smart TVs", "Soundbars & Speakers", "Gaming Consoles (PS5/Xbox)", "Projectors"]
            : ["Smart TV", "Soundbar & Hoparlör", "Oyun Konsolları (PS5/Xbox)", "Projesiyon"],
        },
      ],
      popularBrands: ["Apple", "Samsung", "Sony", "Lenovo", "Dell", "Xiaomi"],
    },
    {
      id: "cat-supermarket",
      name: isEn ? "Supermarket" : "Süpermarket",
      slug: "supermarket",
      subcategories: [
        {
          name: isEn ? "Food & Groceries" : "Gıda & Temel Gıda",
          items: isEn
            ? ["Olive Oil & Cooking Oils", "Pulses & Pasta", "Snacks & Biscuits", "Tea & Coffee", "Breakfast Items"]
            : ["Zeytinyağı & Sıvı Yağ", "Bakliyat & Makarna", "Atıştırmalık & Bisküvi", "Çay & Kahve", "Kahvaltılıklar"],
        },
        {
          name: isEn ? "Detergent & Cleaning" : "Deterjan & Temizlik",
          items: isEn
            ? ["Laundry Detergent", "Dishwasher Tablets", "Surface Cleaners", "Paper Towels & Tissues"]
            : ["Çamaşır Deterjanı", "Bulaşık Tableti", "Yüzey Temizleyici", "Kağıt Havlu & Tuvalet Kağıdı"],
        },
      ],
      popularBrands: ["Fairy", "Ariel", "Lipton", "Jacobs", "Ülker", "Eti"],
    },
    {
      id: "cat-kozmetik",
      name: isEn ? "Beauty & Cosmetics" : "Kozmetik",
      slug: "kozmetik",
      subcategories: [
        {
          name: isEn ? "Skincare" : "Cilt Bakımı",
          items: isEn
            ? ["Facial Cleanser", "Moisturizing Cream", "Sunscreen", "Face Serums & Masks", "Eye Care"]
            : ["Yüz Temizleme", "Nemlendirici Krem", "Güneş Kremi", "Yüz Serumu & Maske", "Göz Çevresi Bakımı"],
        },
        {
          name: isEn ? "Makeup" : "Makyaj",
          items: isEn
            ? ["Lipstick & Lip Gloss", "Mascara", "Foundation & Concealers", "Blush & Highlighters"]
            : ["Ruj & Dudak Parlatıcı", "Rimel & Maskara", "Fondöten & Kapatıcı", "Allık & Aydınlatıcı"],
        },
        {
          name: isEn ? "Fragrance & Deodorant" : "Parfüm & Deodorant",
          items: isEn
            ? ["Women's Perfume", "Men's Perfume", "Deodorant & Roll-on"]
            : ["Kadın Parfüm", "Erkek Parfüm", "Deodorant & Roll-on"],
        },
      ],
      popularBrands: ["L'Oreal Paris", "Maybelline", "Nivea", "La Roche-Posay", "CeraVe"],
    },
    {
      id: "cat-ayakkabi-canta",
      name: isEn ? "Shoes & Bags" : "Ayakkabı & Çanta",
      slug: "ayakkabi-canta",
      subcategories: [
        {
          name: isEn ? "Women's Shoes" : "Kadın Ayakkabı",
          items: isEn
            ? ["Sneakers", "Heels", "Boots", "Slippers & Sandals"]
            : ["Sneaker", "Topuklu", "Bot", "Terlik & Sandalet"],
        },
        {
          name: isEn ? "Men's Shoes" : "Erkek Ayakkabı",
          items: isEn
            ? ["Sports Shoes", "Classic", "Boots", "Slippers"]
            : ["Spor Ayakkabı", "Klasik", "Bot", "Terlik"],
        },
      ],
    },
    {
      id: "cat-spor",
      name: isEn ? "Sports & Outdoor" : "Spor & Outdoor",
      slug: "spor",
      subcategories: [
        {
          name: isEn ? "Sportswear & Shoes" : "Spor Giyim & Ayakkabı",
          items: isEn
            ? ["Sports Shoes", "Tracksuits", "Leggings & Sports Bras", "Gym Bags"]
            : ["Spor Ayakkabı", "Eşofman Takımı", "Tayt & Spor Sütyeni", "Spor Çantası"],
        },
        {
          name: isEn ? "Outdoor & Camping" : "Outdoor & Kamp",
          items: isEn
            ? ["Camping Tents", "Thermoses & Water Bottles", "Sleeping Bags", "Backpacks"]
            : ["Kamp Çadırı", "Termos & Matara", "Uyku Tulumu", "Sırt Çantası"],
        },
      ],
    },
    {
      id: "cat-kitap",
      name: isEn ? "Books & Hobbies" : "Kitap & Hobi",
      slug: "kitap-kirtasiye",
      subcategories: [
        {
          name: isEn ? "Books" : "Kitaplar",
          items: isEn
            ? ["Literature & Novels", "Personal Development", "Exam Prep", "Children's Books"]
            : ["Edebiyat & Roman", "Kişisel Gelişim", "Sınav Hazırlık", "Çocuk Kitapları"],
        },
      ],
    },
    {
      id: "cat-petshop",
      name: isEn ? "Pet Shop" : "Pet Shop",
      slug: "pet-shop",
      subcategories: [
        {
          name: isEn ? "Cats & Dogs" : "Kedi & Köpek",
          items: isEn
            ? ["Cat Food", "Dog Food", "Cat Litter", "Scratching Posts & Beds"]
            : ["Kedi Maması", "Köpek Maması", "Kedi Kumu", "Kedi Tırmalama & Yatak"],
        },
      ],
    },
    {
      id: "cat-otomotiv",
      name: isEn ? "Automotive" : "Otomotiv",
      slug: "otomotiv",
      subcategories: [
        {
          name: isEn ? "Auto Accessories" : "Oto Aksesuar",
          items: isEn
            ? ["Engine Oil & Antifreeze", "Car Floor Mats", "In-Car Phone Holders", "Auto Care Chemicals"]
            : ["Motor Yağı & Antifriz", "Oto Paspas", "Araç İçi Telefon Tutucu", "Oto Bakım Kimyasalları"],
        },
      ],
    },
  ];
}

export function getMockTopUtilityLinks(lang: Language = "tr") {
  const isEn = lang === "en";
  return [
    { label: isEn ? "Help & FAQ" : "Yardım & SSS", href: "#" },
    { label: isEn ? "Customer Service" : "Müşteri Hizmetleri", href: "#" },
    { label: isEn ? "Become a Seller" : "Cadde'de Satıcı Ol", href: "#", highlight: true },
    { label: isEn ? "About Us" : "Hakkımızda", href: "#" },
  ];
}

export const MOCK_NAVIGATION_CATEGORIES = getMockNavigationCategories("tr");
export const MOCK_TOP_UTILITY_LINKS = getMockTopUtilityLinks("tr");
