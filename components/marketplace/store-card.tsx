import React, { useState } from "react";
import Link from "next/link";
import { StoreMock } from "@/lib/mock-data";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface StoreCardProps {
  store: StoreMock;
  onFollowToggle?: (storeId: string, isFollowing: boolean) => void;
  className?: string;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onFollowToggle, className }) => {
  const { t } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    onFollowToggle?.(store.id, nextState);
  };

  const storeSlug = (store as any).slug || "trend-fashion-magazasi";

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow",
        className
      )}
    >
      {/* Top Store Banner & Logo Overlay */}
      <Link href={`/seller/${storeSlug}`} className="relative h-28 bg-slate-200 overflow-hidden block">
        <img
          src={store.bannerUrl}
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-3 left-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden shrink-0">
            <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-white">
            <h4 className="text-sm font-bold leading-tight flex items-center gap-1.5">
              <span>{store.name}</span>
              <Badge variant="seller" size="sm" className="bg-white/20 text-white border-0">
                {t("storeCard.verifiedSeller")}
              </Badge>
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-200 mt-0.5">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {store.followerCount} {t("storeCard.followers")}
              </span>
              <span>•</span>
              <Rating rating={store.rating} variant="compact" size="sm" />
            </div>
          </div>
        </div>
      </Link>

      {/* Featured Preview & Follow Action */}
      <div className="p-4 flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50">
        <Link href={`/seller/${storeSlug}`} className="flex items-center gap-2">
          <img
            src={store.featuredProductImage}
            alt={t("storeCard.featuredProduct")}
            className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">{t("storeCard.featuredProduct")}</span>
            <span className="text-xs font-bold text-text-main hover:text-primary flex items-center gap-1">
              {t("storeCard.visitStore")} <ArrowRight className="w-3 h-3 text-primary" />
            </span>
          </div>
        </Link>

        <Button
          variant={isFollowing ? "outline" : "primary"}
          size="sm"
          onClick={handleFollow}
          className="text-xs px-3"
        >
          {isFollowing ? t("storeCard.followingStore") : t("storeCard.followStore")}
        </Button>
      </div>
    </div>
  );
};
