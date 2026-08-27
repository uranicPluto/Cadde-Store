"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { FileText, ShieldCheck, User, Clock } from "lucide-react";

export default function AdminAuditPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [logs, setLogs] = useState([
    {
      id: "log_1",
      action: "HOMEPAGE_PUBLISHED",
      user: "admin@cadde-store.com",
      role: "SUPER_ADMIN",
      details: "Ana sayfa vitrin blokları canlıya yayınlandı.",
      timestamp: "2026-08-27 19:30:15",
    },
    {
      id: "log_2",
      action: "MEDIA_UPLOADED",
      user: "content@cadde-store.com",
      role: "CONTENT_MANAGER",
      details: "Yeni sponsor görseli yüklendi: brand-logo.png",
      timestamp: "2026-08-27 18:45:00",
    },
    {
      id: "log_3",
      action: "PRODUCT_UPDATED",
      user: "merchandiser@cadde-store.com",
      role: "MERCHANDISING_MANAGER",
      details: "Nike Air Max Pulse fiyatı güncellendi.",
      timestamp: "2026-08-27 17:12:44",
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
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "Audit Logs & Governance" : "Denetim & Güvenlik Günlüğü"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Immutable audit trail tracking admin actions, content updates, role permissions, and logins."
                    : "Yönetici işlemlerini, vitrin güncellemelerini ve güvenlik olaylarını takip edin."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-4">İşlem / Eylem</th>
                  <th className="py-3 px-4">Kullanıcı</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Açıklama</th>
                  <th className="py-3 px-4 text-right">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{l.action}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{l.user}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-500 text-[10px] uppercase">{l.role}</td>
                    <td className="py-3.5 px-4 text-slate-700">{l.details}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">{l.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
