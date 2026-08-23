"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Heart, ShoppingCart } from "lucide-react";
import { SearchComponent } from "@/components/marketplace/search-component";
import { MobileCategoryDrawer } from "@/components/layout/mobile-category-drawer";
import { MOCK_NAVIGATION_CATEGORIES } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";

export interface MobileHeaderProps {
  isLoggedInMock?: boolean;
  onLoginToggleMock?: () => void;
  favoriteCount?: number;
  cartCount?: number;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  isLoggedInMock,
  onLoginToggleMock,
  favoriteCount,
  cartCount,
  className,
}) => {
  const { t } = useLanguage();
  const { totalCount: liveCartCount } = useCart();
  const { favoriteCount: liveFavCount } = useFavorites();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeCartCount = cartCount !== undefined ? cartCount : liveCartCount;
  const activeFavCount = favoriteCount !== undefined ? favoriteCount : liveFavCount;

  return (
    <div className={cn("w-full bg-white border-b border-slate-200 flex flex-col lg:hidden", className)}>
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label={t("common.close")}
            className="p-2 rounded-lg text-text-main hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo - Clicking sends to home page / */}
          <Link href="/" className="flex items-center gap-1.5 text-text-main">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-base">
              C
            </div>
            <span className="font-extrabold text-base tracking-tight">CADDE STORE</span>
          </Link>
        </div>

        {/* Mobile Action Icons */}
        <div className="flex items-center gap-1">
          <Link
            href="/favorites"
            aria-label={t("common.favorites")}
            className="relative p-2 rounded-lg text-text-main hover:text-rose-500 transition-colors"
          >
            <Heart className="w-5 h-5" />
            {activeFavCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] text-center leading-none">
                {activeFavCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={t("common.cart")}
            className="relative p-2 rounded-lg text-text-main hover:text-primary transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {activeCartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] text-center leading-none">
                {activeCartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Full-width Search Input */}
      <div className="p-3 bg-slate-50 border-b border-slate-100">
        <SearchComponent placeholder={t("common.searchPlaceholder")} />
      </div>

      {/* Horizontal Category Scroll Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 bg-white text-xs">
        {MOCK_NAVIGATION_CATEGORIES.map((cat) => {
          const categoryName = t(`categories.${cat.slug}`) || cat.name;

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={cn(
                "px-3 py-1 bg-slate-100 hover:bg-primary-light hover:text-primary text-text-main rounded-full font-semibold shrink-0 transition-colors",
                cat.isHot && "bg-rose-50 text-rose-600 border border-rose-200"
              )}
            >
              {categoryName}
            </Link>
          );
        })}
      </div>

      {/* Drawer Component */}
      <MobileCategoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoggedInMock={isLoggedInMock}
        onLoginToggleMock={onLoginToggleMock}
      />
    </div>
  );
};
