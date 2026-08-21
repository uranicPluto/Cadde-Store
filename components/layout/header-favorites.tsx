import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useFavorites } from "@/lib/favorites/favorites-context";

export interface HeaderFavoritesProps {
  favoriteCount?: number;
  onClick?: () => void;
  className?: string;
}

export const HeaderFavorites: React.FC<HeaderFavoritesProps> = ({
  favoriteCount,
  onClick,
  className,
}) => {
  const { t } = useLanguage();
  const { favoriteCount: liveFavCount } = useFavorites();

  const activeCount = favoriteCount !== undefined ? favoriteCount : liveFavCount;

  return (
    <Link
      href="/favorites"
      onClick={onClick}
      aria-label={`${t("common.favorites")} (${activeCount})`}
      className={cn(
        "relative flex items-center gap-2 p-2 rounded-lg text-text-main hover:text-primary hover:bg-slate-50 transition-all outline-none focus:ring-2 focus:ring-primary/20 group",
        className
      )}
    >
      <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-rose-300 group-hover:bg-rose-50 transition-colors">
        <Heart className="w-4 h-4 text-text-muted group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" />

        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs border border-white">
            {activeCount}
          </span>
        )}
      </div>

      <div className="hidden xl:flex flex-col text-left leading-tight">
        <span className="text-[10px] text-text-subtle font-semibold uppercase">{t("common.favorites")}</span>
        <span className="text-xs font-bold text-text-main group-hover:text-primary">
          {t("common.favorites")} ({activeCount})
        </span>
      </div>
    </Link>
  );
};
