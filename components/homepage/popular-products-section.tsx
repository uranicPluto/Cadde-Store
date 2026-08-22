"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { formatCurrency } from "@/lib/utils";
import { Heart, Star, ShoppingBag, Tag, Sparkles, ChevronRight, Check } from "lucide-react";

export const PopularProductsSection: React.FC = () => {
  const { language, currency } = useLanguage();
  const { addToCart } = useCart();
  const isEn = language === "en";

  const popularProducts = [
    {
      id: "pop-1",
      slug: "icollagen-tablets",
      brand: "iCollagen",
      name: isEn ? "Collagen and Prebiotic Tablets" : "Kolajen + Prebiyotik Desteği",
      price: 350,
      originalPrice: 420,
      rating: 4.2,
      reviewCount: 56581,
      recommender: isEn ? "busemsimsek recommends!" : "busemsimsek öneriyor!",
      promoTag: isEn ? "Buy 3, pay 2" : "3 Al 2 Öde",
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80",
      freeShipping: true,
      unitPriceInfo: "5.83 TL / tablet",
    },
    {
      id: "pop-2",
      slug: "magly-building-blocks",
      brand: "Magly",
      name: isEn ? "Magnetic Building Blocks - 72 Pieces" : "Manyetik Yapı Blokları 72 Parça",
      price: 1784.25,
      originalPrice: 2196,
      rating: 4.7,
      reviewCount: 11169,
      recommender: isEn ? "songuldonmez recommends!" : "songuldonmez öneriyor!",
      promoTag: isEn ? "35% off on cart" : "Sepette %35 İndirim",
      imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80",
      freeShipping: true,
    },
    {
      id: "pop-3",
      slug: "momordica-coconut-mix",
      brand: "MOMORDİCA",
      name: isEn ? "Coconut Mix - 250 ml" : "Hindistan Cevizi Miksi - 250 ml",
      price: 212.55,
      originalPrice: 217.29,
      rating: 3.7,
      reviewCount: 34247,
      recommender: isEn ? "gozdekaraman recommends!" : "gozdekaraman öneriyor!",
      promoTag: isEn ? "Buy 3, pay 2" : "3 Al 2 Öde",
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=500&q=80",
      freeShipping: false,
    },
    {
      id: "pop-4",
      slug: "embeauty-anti-hair-loss",
      brand: "Embeauty",
      name: isEn ? "9-Active Anti Hair Loss Fast Growth" : "9 Aktifli Dökülme Karşıtı Bakım Serum",
      price: 398.05,
      originalPrice: 419,
      rating: 4.1,
      reviewCount: 84063,
      recommender: isEn ? "gozdekaraman recommends!" : "gozdekaraman öneriyor!",
      promoTag: isEn ? "Cadde Plus Exclusive" : "Cadde Plus Özel Fiyat",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80",
      freeShipping: true,
    },
    {
      id: "pop-5",
      slug: "moen-massage-tool",
      brand: "MOEN",
      name: isEn ? "Heated Massage Tool Hand Kneading" : "Isıtmalı Boyun & Omuz Masaj Aleti",
      price: 2681.56,
      rating: 4.2,
      reviewCount: 3696,
      recommender: isEn ? "36.7K people have this in cart" : "36.7K kişi sepetine ekledi!",
      promoTag: isEn ? "3 Installments at Cash Price" : "Peşin Fiyatına 3 Taksit",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80",
      freeShipping: true,
    },
    {
      id: "pop-6",
      slug: "bibimcos-shower-filter",
      brand: "Bibimcos",
      name: isEn ? "Madeca Shower Filter 160g" : "Madeca Nemlendirici Duş Filtresi 160g",
      price: 595,
      originalPrice: 850,
      rating: 4.3,
      reviewCount: 1424,
      recommender: isEn ? "pharmaglitter recommends!" : "pharmaglitter öneriyor!",
      promoTag: isEn ? "-30% on item 2" : "2. Ürüne %30 İndirim",
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80",
      freeShipping: true,
    },
  ];

  return (
    <section className="w-full bg-slate-100 py-4 select-none">
      <div className="max-w-wide mx-auto px-4 sm:px-6">
        {/* Grey Card Wrap Shell (Matches Reference Screenshot) */}
        <div className="bg-[#eef0f2] border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-2xs">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {isEn ? "Popular products" : "Popüler Ürünler"}
              </h2>
            </div>
            <Link
              href="/search?q=popular"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              <span>{isEn ? "View All" : "Tümünü Gör"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Popular Product Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {popularProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group relative"
              >
                {/* Top Overlay Badges */}
                <div className="relative w-full h-44 sm:h-48 bg-slate-50 overflow-hidden">
                  {/* BEST SELLING Orange Starburst Badge */}
                  <div className="absolute top-0 left-0 bg-[#f27a1a] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-br-xl shadow-xs z-10 flex items-center gap-1">
                    <span>BEST SELLING</span>
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                    aria-label="Add to favorites"
                  >
                    <Heart className="w-4 h-4" />
                  </button>

                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Dark Bottom Shipping Strip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-700 text-white text-[10px] font-bold text-center py-1 shadow-2xs">
                    {p.freeShipping ? (isEn ? "Free shipping" : "Kargo Bedava") : (isEn ? "Fast Delivery" : "Hızlı Teslimat")}
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    {/* Brand & Name */}
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="text-xs font-black text-slate-900 line-clamp-2 hover:text-primary transition-colors leading-tight">
                        <span className="font-extrabold text-slate-950 mr-1">{p.brand}</span>
                        <span>{p.name}</span>
                      </h3>
                    </Link>

                    {/* Social Recommender Tag */}
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md w-fit">
                      <span>👤</span>
                      <span className="truncate max-w-[130px]">{p.recommender}</span>
                    </div>

                    {/* Rating Stars & Review Count */}
                    <div className="flex items-center gap-1 mt-1 text-[11px]">
                      <span className="font-bold text-slate-800">{p.rating}</span>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({p.reviewCount})</span>
                    </div>

                    {/* Promo Discount Badge */}
                    {p.promoTag && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-extrabold text-[#f27a1a]">
                        <Tag className="w-3 h-3" />
                        <span>{p.promoTag}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Row & Add to Cart */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-[#f27a1a]">
                        {formatCurrency(p.price, currency)}
                      </span>
                      {p.originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through font-semibold">
                          {formatCurrency(p.originalPrice, currency)}
                        </span>
                      )}
                    </div>

                    {p.unitPriceInfo && (
                      <span className="text-[9px] text-slate-400 font-bold -mt-1">{p.unitPriceInfo}</span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          slug: p.slug,
                          name: p.name,
                          brand: p.brand,
                          categorySlug: "beauty-care",
                          categoryName: "Beauty",
                          storeName: "Cadde Verified Store",
                          price: p.price,
                          originalPrice: p.originalPrice,
                          rating: p.rating,
                          reviewCount: p.reviewCount,
                          imageUrl: p.imageUrl,
                          galleryImages: [p.imageUrl],
                          badges: { freeShipping: true, fastDelivery: true, bestseller: true },
                          description: p.name,
                          specifications: {},
                          stock: 100,
                          reviews: [],
                        })
                      }
                      className="w-full bg-[#f27a1a] hover:bg-[#d9660d] text-white font-extrabold text-xs py-1.5 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isEn ? "Add to Cart" : "Sepete Ekle"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
