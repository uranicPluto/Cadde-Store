import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PackageSearch, ShoppingBag, Heart, Search, ClipboardList } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export type EmptyStateType =
  | "no-products"
  | "no-search"
  | "empty-cart"
  | "no-favorites"
  | "no-orders";

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = "no-products",
  title,
  description,
  actionText,
  onActionClick,
  className,
}) => {
  const { t } = useLanguage();

  const presets = {
    "no-products": {
      icon: <PackageSearch className="w-12 h-12 text-slate-300 stroke-[1.5]" />,
      defaultTitle: t("emptyStates.noProductsTitle"),
      defaultDesc: t("emptyStates.noProductsDesc"),
      defaultCta: t("emptyStates.noProductsCta"),
    },
    "no-search": {
      icon: <Search className="w-12 h-12 text-slate-300 stroke-[1.5]" />,
      defaultTitle: t("emptyStates.noSearchTitle"),
      defaultDesc: t("emptyStates.noSearchDesc"),
      defaultCta: t("emptyStates.noSearchCta"),
    },
    "empty-cart": {
      icon: <ShoppingBag className="w-12 h-12 text-slate-300 stroke-[1.5]" />,
      defaultTitle: t("emptyStates.emptyCartTitle"),
      defaultDesc: t("emptyStates.emptyCartDesc"),
      defaultCta: t("emptyStates.emptyCartCta"),
    },
    "no-favorites": {
      icon: <Heart className="w-12 h-12 text-slate-300 stroke-[1.5]" />,
      defaultTitle: t("emptyStates.noFavoritesTitle"),
      defaultDesc: t("emptyStates.noFavoritesDesc"),
      defaultCta: t("emptyStates.noFavoritesCta"),
    },
    "no-orders": {
      icon: <ClipboardList className="w-12 h-12 text-slate-300 stroke-[1.5]" />,
      defaultTitle: t("header.myOrders"),
      defaultDesc: t("header.emptyCartMessage"),
      defaultCta: t("common.allProducts"),
    },
  };

  const currentPreset = presets[type];

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto shadow-xs",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
        {currentPreset.icon}
      </div>

      <h3 className="text-lg font-bold text-text-main mb-1">
        {title || currentPreset.defaultTitle}
      </h3>
      <p className="text-sm text-text-muted leading-relaxed mb-6">
        {description || currentPreset.defaultDesc}
      </p>

      <Button variant="primary" size="md" onClick={onActionClick}>
        {actionText || currentPreset.defaultCta}
      </Button>
    </div>
  );
};
