"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getCategoryBySlug, isCategorySlugMatch } from "@/lib/catalog/category-repository";
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
import { Filter as FilterIcon, ArrowUpDown } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { language, t } = useLanguage();
  const categoryInfo = getCategoryBySlug(slug, language);

  const fullCatalog = getFullCatalog(language);
  
  // STRICT CATEGORY FILTERING: Only include products that match this specific category
  const categoryProducts = fullCatalog.filter((p) => isCategorySlugMatch(p.categorySlug, slug));

  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFilterChange = (f: FilterState) => {
    setFilterCriteria({
      categories: f.categories,
      subcategories: f.subcategories,
      brands: f.brands,
      minPrice: f.minPrice ? parseFloat(f.minPrice) : undefined,
      maxPrice: f.maxPrice ? parseFloat(f.maxPrice) : undefined,
      minRating: f.minRating,
      fastDeliveryOnly: f.fastDeliveryOnly,
      freeShippingOnly: f.freeShippingOnly,
      selectedSizes: f.selectedSizes,
      selectedColors: f.selectedColors,
      selectedMaterials: f.selectedMaterials,
    });
  };

  const filtered = filterProducts(categoryProducts, filterCriteria);
  const finalProducts = sortProducts(filtered, sortOption);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/category/kadin" },
            { label: categoryInfo?.name || slug },
          ]}
        />

        {/* Category Header Banner */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 text-white p-6 sm:p-10 border border-slate-200 shadow-md">
          <div className="absolute inset-0 z-0 opacity-30">
            <img src={categoryInfo?.bannerImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-transparent" />
          </div>
          <div className="relative z-10 flex flex-col gap-2 max-w-xl">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Kategori</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{categoryInfo?.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {categoryInfo?.description}
            </p>
          </div>
        </div>

        {/* Subcategory Filter Chips */}
        {categoryInfo?.subcategories && categoryInfo.subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryInfo.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/category/${slug}/${sub.slug}`}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-primary hover:text-primary text-xs font-bold rounded-full transition-colors shrink-0 shadow-2xs"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Controls & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Filter Sidebar (3 Cols) with Category-Specific Configuration */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterSidebar categorySlug={slug} onFilterChange={handleFilterChange} />
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
        <FilterSidebar categorySlug={slug} onFilterChange={handleFilterChange} />
      </Drawer>

      <Footer />
    </div>
  );
}
