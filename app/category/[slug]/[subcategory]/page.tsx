"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getCategoryBySlug } from "@/lib/catalog/category-repository";
import { getFullCatalog } from "@/lib/catalog/product-repository";
import { filterProducts, FilterCriteria } from "@/lib/catalog/filters";
import { sortProducts, SortOption } from "@/lib/catalog/sorting";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { FilterSidebar, FilterState } from "@/components/marketplace/filter-sidebar";
import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Filter as FilterIcon, ArrowUpDown, Tag } from "lucide-react";

export default function SubcategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const subcategory = params?.subcategory as string;

  const { language, t } = useLanguage();
  const categoryInfo = getCategoryBySlug(slug, language);

  const subInfo = categoryInfo?.subcategories?.find(
    (s) => s.slug.toLowerCase() === subcategory.toLowerCase()
  );
  const subName = subInfo?.name || subcategory.toUpperCase();

  const fullCatalog = getFullCatalog(language);
  
  // Filter products by category AND subcategory
  const subProducts = fullCatalog.filter((p) => {
    const catMatch = p.categorySlug.toLowerCase() === slug.toLowerCase();
    const subMatch =
      p.subcategorySlug?.toLowerCase() === subcategory.toLowerCase() ||
      p.slug.toLowerCase().includes(subcategory.toLowerCase()) ||
      p.name.toLowerCase().includes(subName.toLowerCase());
    return catMatch && subMatch;
  });

  // Fallback to category products if specific subcategory has fewer items
  const displayProducts = subProducts.length > 0 ? subProducts : fullCatalog.filter((p) => p.categorySlug === slug);

  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFilterChange = (f: FilterState) => {
    setFilterCriteria({
      categories: f.categories,
      brands: f.brands,
      minPrice: f.minPrice ? parseFloat(f.minPrice) : undefined,
      maxPrice: f.maxPrice ? parseFloat(f.maxPrice) : undefined,
      minRating: f.minRating,
      fastDeliveryOnly: f.fastDeliveryOnly,
      freeShippingOnly: f.freeShippingOnly,
      selectedSizes: f.selectedSizes,
      selectedColors: f.selectedColors,
    });
  };

  const filtered = filterProducts(displayProducts, filterCriteria);
  const finalProducts = sortProducts(filtered, sortOption);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/category/women" },
            { label: categoryInfo?.name || slug, href: `/category/${slug}` },
            { label: subName },
          ]}
        />

        {/* Subcategory Header Banner */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-200 shadow-md">
          <div className="relative z-10 flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs w-fit">
              <Tag className="w-3.5 h-3.5" />
              <span>{categoryInfo?.name} / {subName}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{subName}</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {categoryInfo?.name} kategorisi altındaki en popüler {subName} modelleri, özel indirimler ve aynı gün kargo fırsatıyla.
            </p>
          </div>
        </div>

        {/* Controls & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Filter Sidebar (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterSidebar onFilterChange={handleFilterChange} />
          </div>

          {/* Main Product Listing Area (9 Cols) */}
          <div className="lg:col-span-9 flex flex-col gap-4">
            {/* Top Toolbar */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden text-xs font-bold"
                >
                  <FilterIcon className="w-4 h-4 mr-1 text-primary" />
                  <span>{t("filters.openMobileFilters")}</span>
                </Button>
                <span className="text-xs font-bold text-text-main">
                  {finalProducts.length} {t("search.productResults", { count: finalProducts.length })}
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-text-main font-bold outline-none focus:border-primary"
                >
                  <option value="recommended">Önerilen Sıralama</option>
                  <option value="bestselling">En Çok Satanlar</option>
                  <option value="price_asc">Fiyat: Düşükten Yüksek</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşük</option>
                  <option value="rating">En Yüksek Puanlılar</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {finalProducts.length === 0 ? (
              <EmptyState type="no-products" onActionClick={() => setFilterCriteria({})} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {finalProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer Overlay */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        position="bottom"
        title={t("filters.mobileFilterTitle")}
      >
        <FilterSidebar onFilterChange={handleFilterChange} />
      </Drawer>

      <Footer />
    </div>
  );
}
