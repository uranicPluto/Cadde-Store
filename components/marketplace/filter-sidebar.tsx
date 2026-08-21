import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Filter, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface FilterState {
  categories: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  minRating: number;
  fastDeliveryOnly: boolean;
  freeShippingOnly: boolean;
  selectedColors: string[];
  selectedSizes: string[];
}

export interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange, className }) => {
  const { t, currency } = useLanguage();
  const currLabel = currency === "USD" ? "$" : "TL";

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    fastDeliveryOnly: false,
    freeShippingOnly: false,
    selectedColors: [],
    selectedSizes: [],
  });

  const categories = [
    t("categories.kadin"),
    t("categories.erkek"),
    t("categories.ayakkabi-canta"),
    t("categories.elektronik"),
    t("categories.ev-yasam"),
    t("categories.kozmetik"),
  ];

  const brands = ["Nike", "Zara", "Apple", "Samsung", "Karaca", "Mango", "Polo Club", "L'Oreal"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42"];

  const handleCategoryToggle = (cat: string) => {
    const updated = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    const newFilters = { ...filters, categories: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const updated = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    const newFilters = { ...filters, brands: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      categories: [],
      brands: [],
      minPrice: "",
      maxPrice: "",
      minRating: 0,
      fastDeliveryOnly: false,
      freeShippingOnly: false,
      selectedColors: [],
      selectedSizes: [],
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  return (
    <div className={cn("w-full bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-6 text-sm", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-text-main">
          <Filter className="w-4 h-4 text-primary" />
          <span>{t("filters.filtersTitle")}</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-text-muted hover:text-primary flex items-center gap-1 font-semibold transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> {t("filters.reset")}
        </button>
      </div>

      {/* Category Section */}
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-xs uppercase tracking-wide text-text-muted">{t("filters.categories")}</h4>
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
          {categories.map((cat) => (
            <Checkbox
              key={cat}
              label={cat}
              checked={filters.categories.includes(cat)}
              onChange={() => handleCategoryToggle(cat)}
            />
          ))}
        </div>
      </div>

      {/* Brand Section */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-text-muted">{t("filters.brands")}</h4>
        <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto no-scrollbar">
          {brands.map((b) => (
            <Checkbox
              key={b}
              label={b}
              checked={filters.brands.includes(b)}
              onChange={() => handleBrandToggle(b)}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-text-muted">
          {t("filters.priceRange", { currency: currLabel })}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("filters.minPrice", { currency: currLabel })}
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="w-full text-xs p-2 border border-slate-200 rounded outline-none focus:border-primary"
          />
          <span className="text-slate-300">-</span>
          <input
            type="number"
            placeholder={t("filters.maxPrice", { currency: currLabel })}
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="w-full text-xs p-2 border border-slate-200 rounded outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Delivery Options */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-text-muted">{t("filters.deliveryOptions")}</h4>
        <Checkbox
          label={t("filters.fastDelivery")}
          checked={filters.fastDeliveryOnly}
          onChange={(e) => setFilters({ ...filters, fastDeliveryOnly: e.target.checked })}
        />
        <Checkbox
          label={t("filters.freeShipping")}
          checked={filters.freeShippingOnly}
          onChange={(e) => setFilters({ ...filters, freeShippingOnly: e.target.checked })}
        />
      </div>

      {/* Size Selector */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-text-muted">{t("filters.size")}</h4>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((sz) => {
            const isSelected = filters.selectedSizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => {
                  const updated = isSelected
                    ? filters.selectedSizes.filter((s) => s !== sz)
                    : [...filters.selectedSizes, sz];
                  setFilters({ ...filters, selectedSizes: updated });
                }}
                className={cn(
                  "text-xs px-2.5 py-1 rounded border font-semibold transition-colors",
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text-main border-slate-200 hover:border-slate-300"
                )}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
