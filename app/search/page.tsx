"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getFullCatalog, fetchDbProducts, DetailedProductMock } from "@/lib/catalog/product-repository";
import { filterProducts, FilterCriteria } from "@/lib/catalog/filters";
import { sortProducts, SortOption } from "@/lib/catalog/sorting";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/marketplace/product-card";
import { FilterSidebar, FilterState } from "@/components/marketplace/filter-sidebar";
import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Search, Filter as FilterIcon, ArrowUpDown } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const { language, t } = useLanguage();
  const [products, setProducts] = useState<DetailedProductMock[]>(() => getFullCatalog(language));

  useEffect(() => {
    let isMounted = true;
    fetchDbProducts(language).then((dbProds) => {
      if (isMounted && Array.isArray(dbProds) && dbProds.length > 0) {
        setProducts(dbProds);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const qLower = query.toLowerCase().trim();
  const matched = qLower
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.brand.toLowerCase().includes(qLower) ||
          p.categoryName.toLowerCase().includes(qLower) ||
          (p.categorySlug && p.categorySlug.toLowerCase().includes(qLower)) ||
          (p.description && p.description.toLowerCase().includes(qLower))
      )
    : products;

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

  const filtered = filterProducts(matched, filterCriteria);
  const finalProducts = sortProducts(filtered, sortOption);

  return (
    <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: t("common.allProducts"), href: "/" },
          { label: `${t("common.search")}: ${query || "Tüm Ürünler"}` },
        ]}
      />

      {/* Query Title Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-text-main">
              {query ? `"${query}" arama sonuçları` : t("common.allProducts")}
            </h1>
            <span className="text-xs text-text-muted">
              {t("search.productResults", { count: finalProducts.length })}
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24">
          <FilterSidebar onFilterChange={handleFilterChange} />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 shadow-2xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden text-xs font-bold"
            >
              <FilterIcon className="w-4 h-4 mr-1 text-primary" />
              <span>{t("filters.openMobileFilters")}</span>
            </Button>

            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted ml-auto">
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

          {finalProducts.length === 0 ? (
            <EmptyState type="no-search" onActionClick={() => setFilterCriteria({})} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {finalProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        position="bottom"
        title={t("filters.mobileFilterTitle")}
      >
        <FilterSidebar onFilterChange={handleFilterChange} />
      </Drawer>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />
      <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading search results...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
