import React, { useState } from "react";
import Link from "next/link";
import { CategoryData, getMockNavigationCategories } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface MegaMenuProps {
  category: CategoryData;
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
  const categoriesList = allCategories || getMockNavigationCategories(language);

  // Active highlighted category state in left sidebar (defaults to currently hovered header category)
  const [selectedCatId, setSelectedCatId] = useState<string>(category.id);

  if (!isOpen) return null;

  // Find currently active category object in left sidebar selection
  const activeCat = categoriesList.find((c) => c.id === selectedCatId) || category;

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
      <div className="max-w-wide mx-auto flex min-h-[380px]">
        {/* LEFT SIDEBAR PANEL: All Main Categories List (Matches User Screenshots 1, 2, 3, 4) */}
        <div className="w-56 bg-white border-r border-slate-100 py-3 flex flex-col shrink-0">
          {categoriesList.map((cat) => {
            const isSelected = cat.id === activeCat.id;
            const catName = t(`categories.${cat.slug}`) || cat.name;

            return (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => setSelectedCatId(cat.id)}
                onClick={() => setSelectedCatId(cat.id)}
                className={cn(
                  "w-full px-5 py-2.5 text-left text-xs font-bold transition-all flex items-center justify-between group",
                  isSelected
                    ? "bg-[#fff5ee] text-primary font-black"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-2">
                  {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                  <span>{catName}</span>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* RIGHT PANEL: Multi-Column Subcategories & Items Grid (Matches User Screenshots 1, 2, 3, 4) */}
        <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8 overflow-y-auto max-h-[460px]">
          {activeCat.subcategories.map((subGroup, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-2">
              {/* Bold Orange Subcategory Header (Matches Screenshot 1 & 2) */}
              <h4 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center justify-between">
                <span>{subGroup.name}</span>
              </h4>

              {/* View All link */}
              <Link
                href={`/category/${activeCat.slug}`}
                onClick={onClose}
                className="text-[11px] text-slate-500 hover:text-primary font-semibold transition-colors"
              >
                {language === "en" ? "View all" : "Tümünü Gör"}
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

              {/* Show More toggle button (Competitor screenshot details) */}
              {subGroup.items.length >= 4 && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-primary pt-1 cursor-pointer"
                >
                  <span>{language === "en" ? "Show more" : "Daha fazla göster"}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              )}
            </div>
          ))}

          {/* Featured Brand Badges if available */}
          {activeCat.popularBrands && activeCat.popularBrands.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 sm:col-span-3 md:col-span-4">
              <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Öne Çıkan Popüler Markalar</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCat.popularBrands.map((b, idx) => (
                  <Link
                    key={idx}
                    href={`/search?q=${encodeURIComponent(b)}`}
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
