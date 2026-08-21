import React from "react";
import { CategoryData } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { ArrowRight, Flame, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export interface MegaMenuProps {
  category: CategoryData;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  isOpen,
  onClose,
  className,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const categoryName = t(`categories.${category.slug}`);

  return (
    <div
      onMouseLeave={onClose}
      className={cn(
        "absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150 py-6 px-6 sm:px-12",
        className
      )}
    >
      <div className="max-w-wide mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Column 1 to 3: Subcategory Groups */}
        <div className="md:col-span-3 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {category.subcategories.map((sub, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-main border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>{sub.name}</span>
              </h4>
              <ul className="flex flex-col gap-1 text-xs text-text-muted">
                {sub.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <a
                      href="#"
                      className="hover:text-primary hover:font-semibold transition-colors leading-relaxed block py-0.5"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Column 4: Popular Brands & Quick Tags */}
        {category.popularBrands && (
          <div className="flex flex-col gap-3 border-l border-slate-100 pl-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-text-main border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("megaMenu.featuredBrands")}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {category.popularBrands.map((brand, bIdx) => (
                <a
                  key={bIdx}
                  href="#"
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-primary-light hover:text-primary rounded font-semibold text-text-main transition-colors"
                >
                  {brand}
                </a>
              ))}
            </div>
            <div className="mt-2 pt-3 border-t border-slate-100 text-xs text-text-muted flex flex-col gap-1">
              <span className="font-semibold text-text-main flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {t("megaMenu.originalGuarantee")}
              </span>
              <span>{t("megaMenu.guaranteeDesc")}</span>
            </div>
          </div>
        )}

        {/* Column 5: Promotional Campaign Card */}
        {category.promotionalBanner ? (
          <div className="relative rounded-lg overflow-hidden p-5 text-white flex flex-col justify-between shadow-md bg-gradient-to-br from-slate-900 to-primary">
            <img
              src={category.promotionalBanner.imageUrl}
              alt={category.promotionalBanner.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded w-fit flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" /> {t("megaMenu.specialCampaign")}
              </span>
              <h5 className="font-extrabold text-base leading-tight">
                {category.promotionalBanner.title}
              </h5>
              <p className="text-xs text-slate-200">
                {category.promotionalBanner.subtitle}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="relative z-10 bg-white text-text-main hover:bg-slate-100 font-bold text-xs mt-4 w-full"
            >
              <span>{category.promotionalBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-primary" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-text-main">{t("megaMenu.opportunityCategory")}</span>
              <span className="text-text-muted">{t("megaMenu.opportunityDesc")}</span>
            </div>
            <a href="#" className="font-bold text-primary flex items-center gap-1 hover:underline">
              {t("megaMenu.viewAllProducts", { category: categoryName })} <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
