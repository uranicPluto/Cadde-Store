import React, { useState, useRef, useEffect } from "react";
import { getMockNavigationCategories, CategoryData } from "@/lib/navigation-data";
import { MegaMenu } from "@/components/layout/mega-menu";
import { Flame, ChevronDown } from "lucide-react";
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
    <div className={cn("relative w-full bg-white border-b border-slate-200 shadow-xs z-30", className)} ref={containerRef}>
      <div className="max-w-wide mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {activeCategories.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            const categoryName = t(`categories.${cat.slug}`) || cat.name;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveCategory(cat)}
                className="relative shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  aria-expanded={isActive}
                  className={cn(
                    "py-2.5 px-3 text-xs font-bold text-text-main hover:text-primary transition-all border-b-2 border-transparent flex items-center gap-1 outline-none select-none",
                    isActive && "text-primary border-primary bg-primary-light/50 rounded-t",
                    cat.isHot && "text-rose-600 hover:text-rose-700 font-extrabold"
                  )}
                >
                  {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                  <span>{categoryName}</span>
                  <ChevronDown className={cn("w-3 h-3 text-text-subtle transition-transform", isActive && "rotate-180")} />
                </button>
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
