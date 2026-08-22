import React from "react";
import Link from "next/link";
import { SearchComponent } from "@/components/marketplace/search-component";
import { AccountMenu } from "@/components/layout/account-menu";
import { HeaderFavorites } from "@/components/layout/header-favorites";
import { HeaderCart } from "@/components/layout/header-cart";
import { cn } from "@/lib/utils";

export interface MainHeaderProps {
  isLoggedInMock?: boolean;
  onLoginToggleMock?: () => void;
  favoriteCount?: number;
  cartCount?: number;
  className?: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  isLoggedInMock,
  onLoginToggleMock,
  favoriteCount = 3,
  cartCount = 2,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 transition-all",
        className
      )}
    >
      <div className="max-w-wide mx-auto flex items-center justify-between gap-6">
        {/* LEFT: Logo Wordmark - Clicking sends to home page / */}
        <Link
          href="/"
          aria-label="Cadde Store Anasayfa"
          className="flex items-center gap-2 text-text-main group shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:bg-primary-hover transition-colors">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-text-main group-hover:text-primary transition-colors">
              CADDE STORE
            </span>
            <span className="text-[9px] text-text-subtle font-bold uppercase tracking-widest -mt-1">
              Pazaryeri
            </span>
          </div>
        </Link>

        {/* CENTER: Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden lg:block">
          <SearchComponent placeholder="Aradığınız ürün, marka veya kategoriyi yazınız..." />
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <AccountMenu
            isLoggedInMock={isLoggedInMock}
            onLoginToggleMock={onLoginToggleMock}
          />
          <HeaderFavorites favoriteCount={favoriteCount} />
          <HeaderCart cartCount={cartCount} />
        </div>
      </div>
    </div>
  );
};
