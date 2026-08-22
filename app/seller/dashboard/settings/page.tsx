"use client";

import React, { useState } from "react";
import { SellerHeader } from "@/components/seller/seller-header";
import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useLanguage } from "@/lib/i18n/language-context";
import { Settings, Store, Truck, Save } from "lucide-react";
import { Footer } from "@/components/layout/footer";

export default function SellerSettingsPage() {
  const { t } = useLanguage();
  const [storeName, setStoreName] = useState("Trend Fashion Mağazası");
  const [phone, setPhone] = useState("0850 123 45 67");
  const [email, setEmail] = useState("destek@trendfashion.com");
  const [freeShipThreshold, setFreeShipThreshold] = useState("200");
  const [handlingDays, setHandlingDays] = useState("1");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg(t("seller.settings.successToastMessage"));
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <SellerHeader />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title={t("seller.settings.successToastTitle")} message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-20">
            <SellerSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">{t("seller.settings.title")}</h1>
                  <span className="text-xs text-text-muted">
                    {t("seller.settings.subtitle")}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-3xl">
              {/* Store Profile Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Store className="w-4 h-4 text-primary" />
                  <span>{t("seller.settings.sectionIdentity")}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="font-bold text-text-muted">{t("seller.settings.storeName")}</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("seller.settings.phone")}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("seller.settings.email")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Rules */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>{t("seller.settings.sectionShipping")}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("seller.settings.freeShippingThreshold")}</label>
                    <input
                      type="number"
                      value={freeShipThreshold}
                      onChange={(e) => setFreeShipThreshold(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">{t("seller.settings.handlingDays")}</label>
                    <input
                      type="number"
                      value={handlingDays}
                      onChange={(e) => setHandlingDays(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="md" type="submit" className="font-bold px-8 bg-emerald-600 hover:bg-emerald-700 shadow-md">
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>{t("seller.settings.saveSettings")}</span>
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
