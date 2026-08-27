"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Megaphone, Plus, Trash2, Check, TrendingUp, Sparkles } from "lucide-react";

export default function AdminMarketingPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [campaigns, setCampaigns] = useState([
    {
      id: "camp_1",
      title: "Büyük Yaz Sezonu İndirimi",
      discount: "%40'a Varan İndirim",
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      status: "ACTIVE",
    },
    {
      id: "camp_2",
      title: "Okula Dönüş Kampanyası",
      discount: "Sepette 150 TL İndirim",
      startDate: "2026-08-15",
      endDate: "2026-09-15",
      status: "SCHEDULED",
    },
  ]);

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Megaphone className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Marketing & Campaign Center" : "Pazarlama & Kampanya Yönetimi"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage promotional events, featured seller campaigns, and marketplace-wide discounts."
                    : "Pazaryeri geneli indirim kampanyalarını ve vitrin etkinliklerini yönetin."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                      {c.discount}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-2">{c.title}</h3>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {c.startDate} — {c.endDate}
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
