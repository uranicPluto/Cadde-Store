"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShieldCheck, Check, X, Users, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminRolesPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [roles, setRoles] = useState([
    {
      role: "SUPER_ADMIN",
      nameTr: "Süper Yönetici",
      description: "Tüm sistem, vitrin, sipariş, finans ve rol izinlerine tam erişim.",
      usersCount: 2,
    },
    {
      role: "CONTENT_MANAGER",
      nameTr: "İçerik & Vitrin Yöneticisi",
      description: "Homepage Studio, Sayfa oluşturucu, Medya kütüphanesi ve Menü yönetimi.",
      usersCount: 4,
    },
    {
      role: "MERCHANDISING_MANAGER",
      nameTr: "Ticaret & Kategori Yöneticisi",
      description: "Ürünler, Kategoriler, Markalar, Sponsorlar ve İndirimler.",
      usersCount: 3,
    },
    {
      role: "OPERATIONS_MANAGER",
      nameTr: "Operasyon & Sipariş Yöneticisi",
      description: "Siparişler, İadeler, Satıcı onayları ve Kargo takipleri.",
      usersCount: 5,
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
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Role-Based Access Control (RBAC)" : "Roller & Yetki Matrisi (RBAC)"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Manage administrative roles, granular permission matrices, and authorized user assignments."
                    : "Yönetici rollerini, modül bazlı yetki matrislerini ve kullanıcı atamalarını yönetin."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r) => (
              <div
                key={r.role}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-extrabold text-sm text-slate-900">{r.nameTr}</h3>
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{r.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {r.usersCount} Yetkili
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Aktif İzin Matrisi</span>
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
