"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/language-context";
import { Settings, Check, Shield, Globe, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [settings, setSettings] = useState({
    siteName: "Cadde Store",
    supportEmail: "destek@cadde-store.com",
    taxRate: 20,
    currencyDefault: "TRY",
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <AdminSidebar className="w-64 shrink-0 hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 text-slate-900">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEn ? "General Platform Settings" : "Sistem & Platform Ayarları"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isEn
                    ? "Configure store variables, support contacts, tax defaults, and operational switches."
                    : "Pazaryeri değişkenlerini, destek iletişimini, KDV oranlarını ve çalışma modlarını yönetin."}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{saved ? (isEn ? "Saved!" : "Kaydedildi!") : isEn ? "Save Settings" : "Ayarları Kaydet"}</span>
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Platform Adı</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Müşteri Destek E-Postası</label>
                <Input
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Varsayılan KDV Oranı (%)</label>
                <Input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Varsayılan Para Birimi</label>
                <Input
                  value={settings.currencyDefault}
                  onChange={(e) => setSettings({ ...settings, currencyDefault: e.target.value })}
                  className="text-xs font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
