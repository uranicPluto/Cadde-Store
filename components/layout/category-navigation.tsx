"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getMockNavigationCategories, CategoryData } from "@/lib/navigation-data";
import { MegaMenu } from "@/components/layout/mega-menu";
import { Menu, Flame, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface HeaderNavItem {
  id: string;
  titleTr: string;
  titleEn: string;
  url: string;
  section: string;
  badgeTr?: string | null;
  badgeEn?: string | null;
  sortOrder: number;
  isActive: boolean;
  deviceVisibility?: string;
}

export interface CategoryNavigationProps {
  categories?: CategoryData[];
  headerLinks?: HeaderNavItem[];
  className?: string;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  headerLinks,
  className,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === "en";
  const [activeCategories, setActiveCategories] = useState<CategoryData[]>(
    categories || getMockNavigationCategories(language)
  );
  const [activeHeaderLinks, setActiveHeaderLinks] = useState<HeaderNavItem[]>(headerLinks || []);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategories(categories);
    }
    if (headerLinks && headerLinks.length > 0) {
      setActiveHeaderLinks(headerLinks);
    }

    async function loadNavCategories() {
      try {
        const res = await fetch(`/api/navigation?lang=${language}&device=DESKTOP`);
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setActiveCategories(data.categories);
        } else if (!categories) {
          setActiveCategories(getMockNavigationCategories(language));
        }

        if (data.items && Array.isArray(data.items)) {
          const headers = data.items.filter(
            (i: any) =>
              i.section === "HEADER" &&
              !i.parentId &&
              i.isActive !== false &&
              (i.deviceVisibility === "ALL" || i.deviceVisibility === "DESKTOP" || !i.deviceVisibility)
          );
          if (headers.length > 0) {
            setActiveHeaderLinks(headers);
          }
        }
      } catch (err) {
        if (!categories) {
          setActiveCategories(getMockNavigationCategories(language));
        }
      }
    }

    loadNavCategories();
  }, [categories, headerLinks, language]);

  // MegaMenu is open ONLY when hovering or clicking the main "Categories" button
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full bg-white border-b border-slate-200 shadow-2xs z-30", className)} ref={containerRef}>
      <div className="max-w-wide mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* ONLY THIS BUTTON OPENS THE MEGAMENU */}
          <div
            onMouseEnter={() => setIsMenuOpen(true)}
            className="relative shrink-0 flex items-center pr-2 border-r border-slate-200"
          >
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="py-2.5 px-3 text-xs font-black text-slate-900 hover:text-primary transition-colors flex items-center gap-1.5 outline-none select-none cursor-pointer"
            >
              <Menu className="w-4 h-4 text-slate-700" />
              <span>{isEn ? "Categories" : "Tüm Kategoriler"}</span>
              <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                {isEn ? "NEW" : "YENİ"}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 transition-transform ml-0.5", isMenuOpen && "rotate-180")} />
            </button>
          </div>

          {/* Clean Direct Category Links */}
          {activeCategories.map((cat) => {
            const categoryName = t(`categories.${cat.slug}`) || cat.name;
            const badgeText = isEn ? cat.badgeEN || (cat.isHot ? "HOT" : null) : cat.badgeTR || (cat.isHot ? "YENİ" : null);

            return (
              <div
                key={cat.id}
                className="relative shrink-0 flex items-center"
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn(
                    "py-2.5 px-2.5 sm:px-3 text-xs font-bold text-slate-800 hover:text-primary transition-all border-b-2 border-transparent flex items-center gap-1.5 outline-none select-none",
                    cat.slug === "kadin" && "border-primary text-primary font-black",
                    cat.isHot && "text-slate-900 font-bold"
                  )}
                >
                  {cat.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />}
                  <span>{categoryName}</span>

                  {badgeText && (
                    <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      {badgeText}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}

          {/* Optional Header Quick Links if configured */}
          {activeHeaderLinks.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 ml-auto border-l border-slate-200 shrink-0">
              {activeHeaderLinks.map((link) => {
                const title = isEn ? link.titleEn || link.titleTr : link.titleTr;
                const badge = isEn ? link.badgeEn || link.badgeTr : link.badgeTr;

                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    className="py-1 px-2.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors flex items-center gap-1 shrink-0 rounded-md hover:bg-slate-50"
                  >
                    <span>{title}</span>
                    {badge && (
                      <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Master 2-Panel MegaMenu Dropdown (Opens ONLY on Categories Button Hover) */}
      {isMenuOpen && activeCategories.length > 0 && (
        <MegaMenu
          category={activeCategories[0]}
          allCategories={activeCategories}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};
