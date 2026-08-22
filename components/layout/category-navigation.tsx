import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getMockNavigationCategories, CategoryData } from "@/lib/navigation-data";
import { MegaMenu } from "@/components/layout/mega-menu";
import { Menu, Flame, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface CategoryNavigationProps {
  categories?: CategoryData[];
  className?: string;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  className,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const activeCategories = categories || getMockNavigationCategories(language);
  const [activeCategory, setActiveCategory] = useState<CategoryData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCategory(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full bg-white border-b border-slate-200 shadow-2xs z-30", className)} ref={containerRef}>
      <div className="max-w-wide mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Competitor Screenshot Feature: ☰ Categories NEW Pill Badge */}
          <div
            onMouseEnter={() => setActiveCategory(activeCategories[0])}
            className="relative shrink-0 flex items-center pr-2 border-r border-slate-200"
          >
            <button
              type="button"
              className="py-2.5 px-3 text-xs font-black text-slate-900 hover:text-primary transition-colors flex items-center gap-1.5 outline-none select-none"
            >
              <Menu className="w-4 h-4 text-slate-700" />
              <span>{isEn ? "Categories" : "Tüm Kategoriler"}</span>
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                NEW
              </span>
            </button>
          </div>

          {/* Individual Category Tabs (Matches User Screenshot Layout) */}
          {activeCategories.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            const categoryName = t(`categories.${cat.slug}`) || cat.name;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveCategory(cat)}
                className="relative shrink-0 flex items-center"
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn(
                    "py-2.5 px-2.5 sm:px-3 text-xs font-bold text-slate-800 hover:text-primary transition-all border-b-2 border-transparent flex items-center gap-1.5 outline-none select-none",
                    isActive && "text-primary border-primary font-black",
                    cat.slug === "women" && "border-primary text-primary font-black",
                    cat.isHot && "text-slate-900 font-bold"
                  )}
                >
                  {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                  <span>{categoryName}</span>

                  {/* Red New Pill Badge for Flash & Bestsellers (Competitor Screenshot) */}
                  {(cat.slug === "deals" || cat.isHot) && (
                    <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      NEW
                    </span>
                  )}

                  <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isActive && "rotate-180")} />
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Mega Menu Dropdown */}
      {activeCategory && (
        <MegaMenu
          category={activeCategory}
          isOpen={!!activeCategory}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  );
};
