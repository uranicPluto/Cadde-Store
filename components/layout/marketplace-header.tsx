"use client";

import React, { useState, useEffect } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { TopUtilityBar } from "@/components/layout/top-utility-bar";
import { MainHeader } from "@/components/layout/main-header";
import { CategoryNavigation } from "@/components/layout/category-navigation";
import { MobileHeader } from "@/components/layout/mobile-header";
import { RightCartDrawer } from "@/components/layout/right-cart-drawer";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";

export interface MarketplaceHeaderProps {
  isLoggedInMock?: boolean;
  onLoginToggleMock?: () => void;
  favoriteCount?: number;
  cartCount?: number;
  className?: string;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  isLoggedInMock = false,
  onLoginToggleMock,
  favoriteCount,
  cartCount,
  className,
}) => {
  const { totalCount: liveCartCount } = useCart();
  const { favoriteCount: liveFavCount } = useFavorites();
  const [isScrolled, setIsScrolled] = useState(false);

  const activeCartCount = cartCount !== undefined ? cartCount : liveCartCount;
  const activeFavCount = favoriteCount !== undefined ? favoriteCount : liveFavCount;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("w-full z-40 flex flex-col font-sans select-none", className)}>
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Desktop Header Layers */}
      <div className="hidden lg:flex flex-col w-full">
        {/* Layer 1: Top Utility Bar (hides on compact scroll) */}
        {!isScrolled && <TopUtilityBar />}

        {/* Layer 2 & 3 Sticky Container */}
        <div className={cn("sticky top-0 z-40 bg-white transition-all shadow-xs", isScrolled && "shadow-md")}>
          <MainHeader
            isLoggedInMock={isLoggedInMock}
            onLoginToggleMock={onLoginToggleMock}
            favoriteCount={activeFavCount}
            cartCount={activeCartCount}
            className={isScrolled ? "py-2" : "py-3.5"}
          />
          <CategoryNavigation />
        </div>
      </div>

      {/* Mobile Header (Dedicated Responsive View) */}
      <MobileHeader
        isLoggedInMock={isLoggedInMock}
        onLoginToggleMock={onLoginToggleMock}
        favoriteCount={activeFavCount}
        cartCount={activeCartCount}
      />

      {/* Slide-out Right Cart Drawer (Matches Screenshot 3) */}
      <RightCartDrawer />
    </header>
  );
};
