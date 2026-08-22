"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MOCK_ADMIN_CUSTOMERS } from "@/lib/admin/admin-repository";
import { AdminCustomer } from "@/lib/admin/admin-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Users, Search, Ban, CheckCircle2, Eye } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_CUSTOMERS_KEY = "cadde-store-admin-customers";

export default function AdminCustomersPage() {
  const { currency, t } = useLanguage();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_CUSTOMERS_KEY);
      if (saved) {
        setCustomers(JSON.parse(saved));
        return;
      }
    } catch (e) {}
    setCustomers(MOCK_ADMIN_CUSTOMERS);
  }, []);

  const handleToggleBlock = (id: string) => {
    const updated: AdminCustomer[] = customers.map((c) =>
      c.id === id
        ? { ...c, status: c.status === "blocked" ? ("active" as const) : ("blocked" as const) }
        : c
    );
    setCustomers(updated);
    try {
      localStorage.setItem(ADMIN_CUSTOMERS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const countBadgeText = t("admin.customers.countBadge").replace("{count}", String(filtered.length));

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
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.customers.title")}</span>
                    <span className="text-xs bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {t("admin.customers.subtitle")}
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
                  placeholder={t("admin.customers.searchPlaceholder")}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.customers.thCustomer")}</th>
                      <th className="p-3">{t("admin.customers.thEmail")}</th>
                      <th className="p-3">{t("admin.customers.thOrdersCount")}</th>
                      <th className="p-3">{t("admin.customers.thTotalSpent")}</th>
                      <th className="p-3">{t("admin.customers.thStatus")}</th>
                      <th className="p-3 text-right">{t("admin.customers.thActions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-text-muted">
                          {t("admin.customers.noCustomersFound")}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-extrabold text-text-main">{c.name}</td>
                          <td className="p-3 text-text-muted">{c.email}</td>
                          <td className="p-3 font-bold">{c.ordersCount} Sipariş</td>
                          <td className="p-3 font-extrabold text-indigo-600">{formatCurrency(c.totalSpent, currency)}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                c.status === "blocked"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {c.status === "blocked" ? t("admin.customers.statusBlocked") : t("admin.customers.statusActive")}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(c.id)}
                                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-colors ${
                                  c.status === "blocked"
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                }`}
                              >
                                {c.status === "blocked" ? t("admin.customers.btnUnblock") : t("admin.customers.btnBlock")}
                              </button>
                              <Link href={`/admin/customers/${c.id}`} className="p-1.5 text-slate-400 hover:text-indigo-600">
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
