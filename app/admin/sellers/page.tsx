"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MOCK_SELLERS } from "@/lib/sellers/seller-repository";
import { SellerProfile } from "@/lib/sellers/seller-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { Store, Search, ShieldCheck, Check, Ban, RefreshCw, Eye } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_SELLERS_KEY = "cadde-store-admin-sellers";

export default function AdminSellersPage() {
  const { t } = useLanguage();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SELLERS_KEY);
      if (saved) {
        setSellers(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setSellers(MOCK_SELLERS);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: boolean) => {
    const updated = sellers.map((s) => (s.id === id ? { ...s, verified: newStatus } : s));
    setSellers(updated);
    try {
      localStorage.setItem(ADMIN_SELLERS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const filtered = sellers.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === "active") return matchesSearch && s.verified;
    if (statusFilter === "pending") return matchesSearch && !s.verified;
    return matchesSearch;
  });

  const countBadgeText = t("admin.sellers.countBadge").replace("{count}", String(filtered.length));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.sellers.title")}</span>
                    <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("admin.sellers.subtitle")}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.sellers.searchPlaceholder")}
                    className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                    }`}
                  >
                    {t("admin.sellers.filterAll")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      statusFilter === "active" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-main border-slate-200"
                    }`}
                  >
                    {t("admin.sellers.filterActive")}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.sellers.thSeller")}</th>
                      <th className="p-3">{t("admin.sellers.thLocation")}</th>
                      <th className="p-3">{t("admin.sellers.thRating")}</th>
                      <th className="p-3">{t("admin.sellers.thProducts")}</th>
                      <th className="p-3">{t("admin.sellers.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.sellers.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {t("admin.sellers.noSellersFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img src={s.logo} alt="" className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-text-main text-xs">{s.name}</span>
                                <span className="text-[10px] text-text-subtle">{s.contactEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-text-muted font-semibold">{s.location}</td>
                          <td className="p-3 font-extrabold text-amber-600">{s.rating} ★</td>
                          <td className="p-3 font-bold">{s.productCount}</td>
                          <td className="p-3">
                            {s.verified ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                {t("admin.sellers.statusActive")}
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                                {t("admin.sellers.statusPending")}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!s.verified ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(s.id, true)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                                >
                                  {t("admin.sellers.btnApprove")}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(s.id, false)}
                                  className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-colors"
                                >
                                  {t("admin.sellers.btnSuspend")}
                                </button>
                              )}
                              <Link
                                href={`/admin/sellers/${s.slug}`}
                                className="p-1.5 text-slate-400 hover:text-indigo-600"
                                title={t("admin.sellers.btnViewDetails")}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
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
