"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { Settings, User, Globe, Bell, Shield } from "lucide-react";

export default function AccountSettingsPage() {
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();

  const [fullName, setFullName] = useState("Ahmet Yılmaz");
  const [email, setEmail] = useState("ahmet.yilmaz@example.com");
  const [phone, setPhone] = useState("0532 123 4567");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg(language === "en" ? "Account settings updated." : "Hesap ayarları güncellendi.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title="Ayarlar" message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: language === "en" ? "My Account" : "Hesabım", href: "/account" },
            { label: language === "en" ? "Settings" : "Ayarlar" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main">
                    {language === "en" ? "Account Settings" : "Hesap Ayarları"}
                  </h1>
                  <span className="text-xs text-text-muted">
                    Kişisel bilgilerinizi, dil ve para birimi tercihlerinizi yönetin.
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4 h-4 text-primary" />
                  <span>Kişisel Bilgiler</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">Ad Soyad:</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">E-posta:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted">Telefon:</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>Dil ve Para Birimi Tercihleri</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-muted">Varsayılan Dil (Language):</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLanguage("tr")}
                        className={`flex-1 py-2 px-3 rounded-lg border font-extrabold text-xs transition-colors ${
                          language === "tr" ? "bg-primary text-white border-primary" : "bg-slate-50 text-text-main border-slate-200"
                        }`}
                      >
                        🇹🇷 Türkçe (TR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage("en")}
                        className={`flex-1 py-2 px-3 rounded-lg border font-extrabold text-xs transition-colors ${
                          language === "en" ? "bg-primary text-white border-primary" : "bg-slate-50 text-text-main border-slate-200"
                        }`}
                      >
                        🇬🇧 English (EN)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-muted">Varsayılan Para Birimi (Currency):</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrency("TRY")}
                        className={`flex-1 py-2 px-3 rounded-lg border font-extrabold text-xs transition-colors ${
                          currency === "TRY" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-text-main border-slate-200"
                        }`}
                      >
                        TRY (₺)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrency("USD")}
                        className={`flex-1 py-2 px-3 rounded-lg border font-extrabold text-xs transition-colors ${
                          currency === "USD" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-text-main border-slate-200"
                        }`}
                      >
                        USD ($)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>Bildirim Tercihleri</span>
                </h2>

                <div className="flex flex-col gap-3 text-xs">
                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                    <span className="font-bold text-text-main">Sipariş güncellemeleri ve kargo bildirimleri</span>
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                    <span className="font-bold text-text-main">Kampanya ve kupon fırsat bildirimleri</span>
                    <input
                      type="checkbox"
                      checked={smsNotif}
                      onChange={(e) => setSmsNotif(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="md" type="submit" className="font-bold px-6 bg-primary hover:bg-primary-hover shadow-md">
                  Değişiklikleri Kaydet
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
