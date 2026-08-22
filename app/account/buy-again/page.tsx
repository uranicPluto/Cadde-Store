"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, ShoppingBag, RotateCcw, Clock, Star, Tag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyAgainProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: "all" | "grocery" | "care" | "fashion" | "tech";
  price: number;
  originalPrice?: number;
  rating: number;
  imageUrl: string;
  lastPurchasedDate: string;
  purchaseCount: number;
  reorderDiscount?: string;
}

export default function BuyAgainPage() {
  const { language, currency } = useLanguage();
  const { addToCart } = useCart();
  const isEn = language === "en";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const buyAgainCatalog: BuyAgainProduct[] = [
    {
      id: "ba-1",
      slug: "icollagen-tablets",
      name: isEn ? "Collagen and Prebiotic Tablets 60 Count" : "Kolajen ve Prebiyotik Tablet 60 Adet",
      brand: "iCollagen",
      category: "care",
      price: 350,
      originalPrice: 420,
      rating: 4.2,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80",
      lastPurchasedDate: "10.08.2026",
      purchaseCount: 3,
      reorderDiscount: isEn ? "15% off on 3rd Order" : "3. Siparişe Özel %15 İndirim",
    },
    {
      id: "ba-2",
      slug: "momordica-coconut-mix",
      name: isEn ? "Pure Cold-Pressed Coconut Oil 250ml" : "Saf Soğuk Sıkım Hindistan Cevizi Yağı 250ml",
      brand: "MOMORDİCA",
      category: "grocery",
      price: 212.55,
      originalPrice: 217.29,
      rating: 4.6,
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=80",
      lastPurchasedDate: "05.08.2026",
      purchaseCount: 4,
      reorderDiscount: isEn ? "Free Shipping Perk" : "Kargo Bedava Avantajı",
    },
    {
      id: "ba-3",
      slug: "zara-oversize-pamuklu-kadin-tisort-beyaz",
      name: isEn ? "Oversize 100% Combed Cotton T-Shirt - White" : "Oversize %100 Penye Pamuk Tişört - Beyaz",
      brand: "Zara",
      category: "fashion",
      price: 299.99,
      originalPrice: 399.99,
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80",
      lastPurchasedDate: "28.07.2026",
      purchaseCount: 2,
    },
    {
      id: "ba-4",
      slug: "bibimcos-shower-filter",
      name: isEn ? "Madeca Moisturizing Shower Filter 160g" : "Madeca Nemlendirici Duş Filtresi 160g",
      brand: "Bibimcos",
      category: "care",
      price: 595.00,
      originalPrice: 850.00,
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80",
      lastPurchasedDate: "15.07.2026",
      purchaseCount: 2,
      reorderDiscount: isEn ? "Buy 2, Get 10% Off" : "2. Ürüne %10 İndirim",
    },
    {
      id: "ba-5",
      slug: "apple-airpods-pro-2-nesil-usb-c",
      name: isEn ? "AirPods Pro (2nd Gen) USB-C Earbuds" : "AirPods Pro (2. Nesil) USB-C Kulaklık",
      brand: "Apple",
      category: "tech",
      price: 8499.00,
      originalPrice: 9499.00,
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80",
      lastPurchasedDate: "02.08.2026",
      purchaseCount: 1,
    },
  ];

  const filteredItems = buyAgainCatalog.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  const handleAddToCart = (item: BuyAgainProduct) => {
    addToCart({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      categorySlug: item.category,
      categoryName: item.brand,
      storeName: "Cadde Store",
      price: item.price,
      originalPrice: item.originalPrice,
      rating: item.rating,
      reviewCount: 120,
      imageUrl: item.imageUrl,
      galleryImages: [item.imageUrl],
      badges: { freeShipping: true, fastDelivery: true },
      description: item.name,
      specifications: {},
      stock: 50,
      reviews: [],
    });

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Buy Again" : "Tekrar Satın Al" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>{isEn ? "Smart Reorder" : "Akıllı Sipariş Yenileme"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Buy Again" : "Tekrar Satın Al"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Quickly re-order products you previously loved with special loyalty perks and 1-click cart addition."
                    : "Daha önce satın aldığınız ve memnun kaldığınız favori ürünlerinizi tek tıkla sepetinize ekleyin ve siparişinizi yenileyin."}
                </p>
              </div>

              {/* Category Chips Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: "all", label: isEn ? "All" : "Tümü" },
                  { id: "grocery", label: isEn ? "Grocery & Food" : "Gıda & Mutfak" },
                  { id: "care", label: isEn ? "Care & Health" : "Bakım & Sağlık" },
                  { id: "fashion", label: isEn ? "Fashion" : "Giyim" },
                  { id: "tech", label: isEn ? "Tech" : "Teknoloji" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border",
                      activeCategory === c.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top Image + Repeat Count Badge */}
                    <div className="relative w-full h-48 bg-slate-50 rounded-xl overflow-hidden">
                      <span className="absolute top-2 left-2 z-10 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <RotateCcw className="w-3 h-3" />
                        <span>
                          {item.purchaseCount} {isEn ? "times bought" : "kez alındı"}
                        </span>
                      </span>

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>{item.brand}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Son: {item.lastPurchasedDate}</span>
                        </span>
                      </div>

                      <Link href={`/product/${item.slug}`}>
                        <h3 className="text-xs font-black text-slate-900 line-clamp-2 hover:text-primary transition-colors leading-tight">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Promo Reorder Badge */}
                      {item.reorderDiscount && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-extrabold text-[#f27a1a] bg-orange-50 px-2 py-0.5 rounded-md w-fit">
                          <Tag className="w-3 h-3 shrink-0" />
                          <span>{item.reorderDiscount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & 1-Click Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#f27a1a]">
                        {formatCurrency(item.price, currency)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-semibold -mt-0.5">
                          {formatCurrency(item.originalPrice, currency)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={cn(
                        "font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs",
                        addedItems[item.id]
                          ? "bg-emerald-600 text-white"
                          : "bg-[#f27a1a] hover:bg-[#d9660d] text-white"
                      )}
                    >
                      {addedItems[item.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? "Added!" : "Eklendi!"}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isEn ? "Buy Again" : "Tekrar Al"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
