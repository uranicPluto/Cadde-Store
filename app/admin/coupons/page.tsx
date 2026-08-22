"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MOCK_COUPONS, Coupon } from "@/lib/cart/coupon-utils";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Tag, Plus, Check, Ban } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function AdminCouponsPage() {
  const { language, currency, t } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);

  const countBadgeText = t("admin.coupons.countBadge").replace("{count}", String(coupons.length));

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
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{t("admin.coupons.title")}</span>
                    <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {countBadgeText}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">{t("admin.coupons.subtitle")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
                      <th className="p-3">{t("admin.coupons.thCode")}</th>
                      <th className="p-3">{t("admin.coupons.thDiscount")}</th>
                      <th className="p-3">{t("admin.coupons.thMinSubtotal")}</th>
                      <th className="p-3">{t("admin.coupons.thStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {coupons.map((c) => (
                      <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-extrabold text-indigo-600 uppercase tracking-wider">{c.code}</td>
                        <td className="p-3 text-slate-700 font-bold">{c.description[language]}</td>
                        <td className="p-3 font-bold text-text-main">
                          {c.minSubtotal ? formatCurrency(c.minSubtotal, currency) : "Yok"}
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-extrabold">
                            {t("admin.coupons.statusActive")}
                          </span>
                        </td>
                      </tr>
                    ))}
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
