"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getFullCatalog, DetailedProductMock } from "@/lib/catalog/product-repository";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Package, Search, Check, X, Eye } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_PRODUCTS_KEY = "cadde-store-admin-products";

export default function AdminProductsPage() {
  const { language, currency, t } = useLanguage();
  const [products, setProducts] = useState<DetailedProductMock[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const catalog = getFullCatalog(language);
    try {
      const saved = localStorage.getItem(ADMIN_PRODUCTS_KEY);
      if (saved) {
        setProducts(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setProducts(catalog);
  }, [language]);

  const handleUpdateStatus = (id: string, isBestsellerMockFlag: boolean) => {
    const updated = products.map((p) => (p.id === id ? { ...p, badges: { ...p.badges, bestseller: isBestsellerMockFlag } } : p));
    setProducts(updated);
    try {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const countBadgeText = t("admin.products.countBadge").replace("{count}", String(filtered.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.products.title")}</span>
                    <span className="text-xs bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("admin.products.subtitle")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("admin.products.searchPlaceholder")}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.products.thProduct")}</th>
                      <th className="p-3">{t("admin.products.thSeller")}</th>
                      <th className="p-3">{t("admin.products.thCategory")}</th>
                      <th className="p-3">{t("admin.products.thPrice")}</th>
                      <th className="p-3">{t("admin.products.thStock")}</th>
                      <th className="p-3">{t("admin.products.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.products.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted">
                          {t("admin.products.noProductsFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img src={p.imageUrl} alt="" className="w-10 h-12 object-cover rounded border border-slate-200 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-primary text-[11px] uppercase">{p.brand}</span>
                                <span className="font-bold text-text-main line-clamp-1">{p.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{p.storeName || "Cadde Store"}</td>
                          <td className="p-3 font-semibold text-text-muted">{p.categoryName}</td>
                          <td className="p-3 font-black text-text-main">{formatCurrency(p.price, currency)}</td>
                          <td className="p-3 font-bold">{p.stock} Adet</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                              {t("admin.products.statusApproved")}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link href={`/admin/products/${p.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
