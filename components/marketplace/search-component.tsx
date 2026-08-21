import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, Clock, TrendingUp, Tag, Store, ArrowRight } from "lucide-react";
import { getMockProducts, getMockBrands, getMockCategories } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface SearchComponentProps {
  placeholder?: string;
  className?: string;
  onSearchSubmit?: (query: string) => void;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder,
  className,
  onSearchSubmit,
}) => {
  const { language, currency, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const products = getMockProducts(language);
  const brands = getMockBrands(language);
  const categories = getMockCategories(language);

  const searchPlaceholderText = placeholder || t("common.searchPlaceholder");

  const recentSearches = language === "en"
    ? ["Black T-Shirt", "Nike Sports Shoes", "Bluetooth Headphones", "Coffee Maker"]
    : ["Siyah Tişört", "Nike Spor Ayakkabı", "Bluetooth Kulaklık", "Kahve Makinesi"];

  const popularSearches = language === "en"
    ? ["Autumn Sale", "Women's Dress", "iPhone 15 Screen Protector", "Air Fryer", "Gaming Chair"]
    : ["Sonbahar İndirimi", "Kadın Elbise", "iPhone 15 Ekran Koruyucu", "Air Fryer", "Oyuncu Koltuğu"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (val.trim()) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit?.(query);
      setIsOpen(false);
    }
  };

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredBrands = query.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredCategories = query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className={cn("relative w-full max-w-2xl", className)} ref={containerRef}>
      {/* Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          placeholder={searchPlaceholderText}
          className="w-full h-11 pl-4 pr-24 text-sm bg-slate-50 border-2 border-primary/20 rounded-lg text-text-main placeholder:text-text-subtle focus:outline-none focus:border-primary focus:bg-white transition-all shadow-xs"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin mr-1" />}

          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white p-2 rounded-md transition-colors flex items-center justify-center"
            aria-label={t("common.search")}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Suggestions Modal Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden text-sm animate-in fade-in-50 duration-150">
          {!query.trim() ? (
            /* Recent & Popular Searches when query is empty */
            <div className="p-4 flex flex-col gap-4">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{t("search.recentSearches")}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(term);
                        onSearchSubmit?.(term);
                        setIsOpen(false);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-primary-light hover:text-primary text-text-main text-xs rounded-full font-medium transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t("search.popularSearches")}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {popularSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(term);
                        onSearchSubmit?.(term);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-50 text-left text-xs text-text-main group"
                    >
                      <span>{term}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live Query Search Suggestions */
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {/* Category / Brand Suggestions */}
              {(filteredCategories.length > 0 || filteredBrands.length > 0) && (
                <div className="p-3 bg-slate-50/50 flex flex-col gap-1.5">
                  {filteredCategories.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSearchSubmit?.(c.name);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer text-xs font-semibold text-primary"
                    >
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span>{t("search.categoryLabel")}: {c.name}</span>
                    </div>
                  ))}
                  {filteredBrands.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        onSearchSubmit?.(b.name);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer text-xs font-semibold text-amber-700"
                    >
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t("search.brandLabel")}: {b.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Product Matches */}
              <div className="p-3">
                <div className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">
                  {t("search.productResults", { count: filteredProducts.length })}
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-text-muted">
                    {t("search.noResults", { query })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredProducts.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSearchSubmit?.(p.name);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded border border-slate-200"
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-bold text-text-main">{p.brand}</span>
                          <span className="text-xs text-text-muted truncate">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0">
                          {formatCurrency(p.price, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
