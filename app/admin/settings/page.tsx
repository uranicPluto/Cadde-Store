"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/admin/admin-repository";
import { AdminPlatformSettings } from "@/lib/admin/admin-types";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useLanguage } from "@/lib/i18n/language-context";
import { Settings, Store, Percent, Truck, Save } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const ADMIN_SETTINGS_KEY = "cadde-store-admin-settings";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AdminPlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PLATFORM_SETTINGS;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {}
    setToastMsg(t("admin.settings.successToastMessage"));
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <AdminHeader />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title={t("admin.settings.successToastTitle")} message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <AdminSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">{t("admin.settings.title")}</h1>
                  <span className="text-xs text-text-muted">{t("admin.settings.subtitle")}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-3xl">
              {/* Marketplace Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span>{t("admin.settings.sectionMarketplace")}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.marketplaceName")}</label>
                    <input
                      type="text"
                      value={settings.marketplaceName}
                      onChange={(e) => setSettings({ ...settings, marketplaceName: e.target.value })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.supportEmail")}</label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Commission & Rules */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Percent className="w-4 h-4 text-indigo-600" />
                  <span>{t("admin.settings.sectionCommission")}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.defaultCommission")}</label>
                    <input
                      type="number"
                      value={settings.defaultCommissionRate}
                      onChange={(e) => setSettings({ ...settings, defaultCommissionRate: Number(e.target.value) })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.cancelWindowDays")}</label>
                    <input
                      type="number"
                      value={settings.orderCancellationWindowDays}
                      onChange={(e) => setSettings({ ...settings, orderCancellationWindowDays: Number(e.target.value) })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.returnWindowDays")}</label>
                    <input
                      type="number"
                      value={settings.returnWindowDays}
                      onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Rules */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>{t("admin.settings.sectionShipping")}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.defaultShippingFee")}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.defaultShippingFee}
                      onChange={(e) => setSettings({ ...settings, defaultShippingFee: Number(e.target.value) })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("admin.settings.freeShippingThreshold")}</label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="md" type="submit" className="font-bold px-8 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>{t("admin.settings.saveSettings")}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
