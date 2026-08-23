"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CategoryData, getMockNavigationCategories } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Flame, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface MegaMenuProps {
  category?: CategoryData;
  allCategories?: CategoryData[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  allCategories,
  isOpen,
  onClose,
  className,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>(
    allCategories || getMockNavigationCategories(language)
  );

  useEffect(() => {
    if (allCategories && allCategories.length > 0) {
      setCategoriesList(allCategories);
      return;
    }

    async function loadNavigation() {
      try {
        const res = await fetch(`/api/navigation?lang=${language}`);
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories);
        } else {
          setCategoriesList(getMockNavigationCategories(language));
        }
      } catch (err) {
        setCategoriesList(getMockNavigationCategories(language));
      }
    }
    loadNavigation();
  }, [allCategories, language]);

  // Default active category
  const initialCat = category || categoriesList[0] || getMockNavigationCategories(language)[0];
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCat?.id || "cat-kadin");

  useEffect(() => {
    if (category?.id) {
      setSelectedCatId(category.id);
    } else if (categoriesList.length > 0) {
      setSelectedCatId(categoriesList[0].id);
    }
  }, [category, categoriesList]);

  if (!isOpen) return null;

  // Find currently active category object in left sidebar selection
  const activeCat = categoriesList.find((c) => c.id === selectedCatId) || initialCat;

  // Helper slug generator for subcategory items
  const getSubSlug = (itemStr: string) => {
    const map: Record<string, string> = {
      Dresses: "dresses",
      Elbiseler: "dresses",
      "T-Shirts & Tank Tops": "tshirts",
      "Tişört & Atlet": "tshirts",
      "Coats & Jackets": "jackets",
      "Ceket & Mont": "jackets",
      Sneakers: "sneakers",
      "Spor Ayakkabı": "sneakers",
      "Shoulder Bags": "bags",
      "Omuz Çantası": "bags",
      Smartphones: "smartphones",
      "Cep Telefonları": "smartphones",
      Headphones: "headphones",
      Kulaklıklar: "headphones",
      "Cookware Sets": "cookware",
      "Tencere Setleri": "cookware",
      Skincare: "skincare",
      "Cilt Bakımı": "skincare",
    };
    return map[itemStr] || itemStr.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };

  return (
    <div
      onMouseLeave={onClose}
      className={cn(
        "absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 border-t border-slate-100",
        className
      )}
    >
      <div className="max-w-wide mx-auto flex min-h-[380px] max-h-[520px]">
        {/* LEFT SIDEBAR PANEL: All Main Categories List */}
        <div className="w-56 bg-white border-r border-slate-100 py-3 flex flex-col shrink-0 overflow-y-auto max-h-[500px]">
          {categoriesList.map((cat) => {
            const isSelected = cat.id === activeCat?.id;
            const catName = t(`categories.${cat.slug}`) || cat.name;
            const badgeText = isEn ? cat.badgeEN || (cat.isHot ? "HOT" : null) : cat.badgeTR || (cat.isHot ? "YENİ" : null);

            return (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => setSelectedCatId(cat.id)}
                onClick={() => setSelectedCatId(cat.id)}
                className={cn(
                  "w-full px-5 py-2.5 text-left text-xs font-bold transition-all flex items-center justify-between group cursor-pointer",
                  isSelected
                    ? "bg-[#fff5ee] text-primary font-black"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2">
                  {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                  <span>{catName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {badgeText && (
                    <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      {badgeText}
                    </span>
                  )}
                  {isSelected && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT PANEL: Multi-Column Subcategories & Promotional Banner */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[500px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {activeCat?.subcategories?.map((subGroup, sIdx) => (
              <div key={sIdx} className="flex flex-col gap-2">
                {/* Orange Subcategory Header */}
                <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center justify-between">
                  <span>{subGroup.name}</span>
                </h4>

                {/* View All link */}
                <Link
                  href={`/category/${activeCat.slug}`}
                  onClick={onClose}
                  className="text-[11px] text-slate-500 hover:text-primary font-semibold transition-colors"
                >
                  {isEn ? "View all" : "Tümünü Gör"}
                </Link>

                {/* Subcategory Items List */}
                <ul className="flex flex-col gap-1.5 pt-1 text-xs text-slate-700 font-medium">
                  {subGroup.items.map((itemStr, iIdx) => {
                    const itemSlug = getSubSlug(itemStr);
                    return (
                      <li key={iIdx}>
                        <Link
                          href={`/category/${activeCat.slug}/${itemSlug}`}
                          onClick={onClose}
                          className="hover:text-primary hover:font-bold transition-colors leading-tight block py-0.5"
                        >
                          {itemStr}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* Promotional Banner Box inside MegaMenu if present */}
            {activeCat?.promotionalBanner && (
              <div className="hidden lg:flex flex-col justify-between p-4 rounded-xl overflow-hidden relative text-white bg-slate-900 border border-slate-200 shadow-sm min-h-[180px]">
                <img
                  src={activeCat.promotionalBanner.imageUrl}
                  alt={activeCat.promotionalBanner.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${activeCat.promotionalBanner.bgGradient || "from-orange-500 to-rose-600"} opacity-75 mix-blend-multiply`} />

                <div className="relative z-10 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    {isEn ? "Special Offer" : "Özel Fırsat"}
                  </span>
                  <h5 className="font-black text-sm leading-tight text-white">
                    {activeCat.promotionalBanner.title}
                  </h5>
                  <p className="text-[11px] text-slate-100 font-medium line-clamp-2">
                    {activeCat.promotionalBanner.subtitle}
                  </p>
                </div>

                <Link
                  href={activeCat.promotionalBanner.link || `/category/${activeCat.slug}`}
                  onClick={onClose}
                  className="relative z-10 mt-3 inline-flex items-center gap-1 text-[11px] font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg w-fit transition-colors"
                >
                  <span>{activeCat.promotionalBanner.ctaText || (isEn ? "Shop Now" : "Alışverişe Başla")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Featured Brand Badges if available */}
          {activeCat?.popularBrands && activeCat.popularBrands.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-4 mt-4 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? "Featured Popular Brands" : "Öne Çıkan Popüler Markalar"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCat.popularBrands.map((b, idx) => (
                  <Link
                    key={idx}
                    href={`/search?brand=${encodeURIComponent(b)}`}
                    onClick={onClose}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-primary-light hover:text-primary rounded-lg font-bold text-slate-800 transition-colors"
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
