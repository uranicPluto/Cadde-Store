"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Star, Check, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminReviewsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [reviews, setReviews] = useState([
    {
      id: "rev_1",
      customer: "Zeynep K.",
      product: "Nike Air Max Pulse",
      rating: 5,
      comment: "Kargo inanılmaz hızlı geldi, ürün %100 orijinal ve çok rahat. Teşekkürler!",
      status: "APPROVED",
      date: "2026-08-26",
    },
    {
      id: "rev_2",
      customer: "Burak T.",
      product: "Oversize Pamuklu Gömlek",
      rating: 4,
      comment: "Kumaş kalitesi çok güzel fakat bir beden küçük alınabilir.",
      status: "APPROVED",
      date: "2026-08-25",
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
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Star className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Customer Reviews & Feedback" : "Müşteri Değerlendirmeleri & Yorumlar"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Moderate customer product ratings, verified purchase reviews, and seller feedback."
                    : "Ürün ve satıcı değerlendirmelerini, onaylı alıcı yorumlarını denetleyin."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-slate-900">{r.customer}</span>
                    <span className="text-xs text-slate-500 font-medium">Ürün: {r.product}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic">"{r.comment}"</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400">{r.date}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {r.status}
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
