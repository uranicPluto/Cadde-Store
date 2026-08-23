"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MainHeader } from "@/components/layout/main-header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/i18n/language-context";
import { Award, Search, Star, ArrowRight, Sparkles, Grid } from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl?: string | null;
  descriptionTR?: string | null;
  descriptionEN?: string | null;
  isFeatured: boolean;
  _count?: { products: number };
}

export default function BrandsCatalogPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        const res = await fetch("/api/brands");
        const data = await res.json();
        if (data.brands) {
          setBrands(data.brands);
        }
      } catch (e) {
        console.error("Failed to load brands:", e);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  const alphabet = [
    "ALL",
    "A",
    "B",
    "C",
    "Ç",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "İ",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "Ö",
    "P",
    "R",
    "S",
    "Ş",
    "T",
    "U",
    "Ü",
    "V",
    "Y",
    "Z",
  ];

  const filteredBrands = brands.filter((brand) => {
    const q = searchQuery.trim().toLocaleLowerCase("tr-TR");
    const matchesSearch =
      !q ||
      brand.name.toLocaleLowerCase("tr-TR").includes(q) ||
      brand.slug.toLocaleLowerCase("tr-TR").includes(q);

    const firstChar = brand.name.trim().charAt(0).toLocaleUpperCase("tr-TR");
    const matchesLetter = selectedLetter === "ALL" || firstChar === selectedLetter;

    return matchesSearch && matchesLetter;
  });

  const featuredBrands = brands.filter((b) => b.isFeatured);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <MainHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Hero Banner Header */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
            <div className="max-w-2xl space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                <Award className="w-4 h-4" />
                {isEn ? "Official Brand Directory" : "Resmi Markalar Rehberi"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {isEn ? "Shop by Brands You Love" : "Sevdiğiniz Markalarla Alışverişe Başlayın"}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {isEn
                  ? "Explore thousands of original products across top global and Turkish fashion, electronics, and home brands."
                  : "Moda, teknoloji ve ev yaşamında Türkiye'nin ve dünyanın en popüler orijinal markalarını tek çatı altında keşfedin."}
              </p>
            </div>
          </div>

          {/* Featured Brands Carousel/Grid */}
          {featuredBrands.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>{isEn ? "Featured Brands" : "Öne Çıkan Markalar"}</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {featuredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/search?brand=${encodeURIComponent(brand.name)}`}
                    className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all flex flex-col items-center text-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-xl bg-slate-50 p-2 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform overflow-hidden">
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {brand.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {brand._count?.products || 10}+ {isEn ? "Products" : "Ürün"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search & Alphabet Filter */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search brand by name..." : "Marka adı ara..."}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="text-xs font-bold text-slate-500">
                {filteredBrands.length} {isEn ? "Brands Found" : "Marka Bulundu"}
              </div>
            </div>

            {/* A-Z Letter Buttons with Turkish Alphabet Support */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {alphabet.map((letter) => (
                <button
                  type="button"
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                    selectedLetter === letter
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* All Brands Directory Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
              {isEn ? "Loading brands..." : "Markalar listeleniyor..."}
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700">{isEn ? "No Brands Found" : "Marka Bulunamadı"}</p>
              <p className="mt-1">{isEn ? "Try adjusting your search or filter." : "Farklı bir harf veya arama terimi deneyin."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {filteredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/search?brand=${encodeURIComponent(brand.name)}`}
                  className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all flex flex-col items-center text-center justify-between gap-2.5 min-h-[150px] cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-lg bg-slate-50 p-2 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform overflow-hidden">
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {brand.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {brand._count?.products || 0} {isEn ? "products" : "ürün"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
