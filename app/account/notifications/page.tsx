"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Bell, Mail, Smartphone, MessageSquare, Package, Tag, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  email: boolean;
  sms: boolean;
  push: boolean;
}

export default function NotificationPreferencesPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: "orders",
      title: isEn ? "Order & Delivery Tracking" : "Sipariş ve Kargo Takibi",
      description: isEn
        ? "Instant updates on order preparation, shipping dispatch, cargo tracking numbers, and delivery confirmation."
        : "Siparişinizin onaylanması, kargoya verilişi, kargo takip numarası ve teslimat anlık bildirimleri.",
      icon: Package,
      email: true,
      sms: true,
      push: true,
    },
    {
      id: "deals",
      title: isEn ? "Price Drops & Flash Deals" : "Fiyat Düşüşleri & Flaş Kampanyalar",
      description: isEn
        ? "Get notified when items in your favorites drop in price or when limited-time flash discount windows open."
        : "Favoriye aldığınız ürünlerin fiyatı düştüğünde veya sınırlı süreli flaş indirimler başladığında haber ver.",
      icon: Tag,
      email: true,
      sms: false,
      push: true,
    },
    {
      id: "questions",
      title: isEn ? "Seller Question & Review Replies" : "Satıcı Soruları & Yorum Yanıtları",
      description: isEn
        ? "Notifications when store owners answer your product questions or when your review receives helpful votes."
        : "Satıcılara sorduğunuz sorular yanıtlandığında veya yorumunuz faydalı bulunduğunda bilgilendirme.",
      icon: MessageSquare,
      email: true,
      sms: false,
      push: true,
    },
    {
      id: "marketing",
      title: isEn ? "Special Perks & Birthday Vouchers" : "Özel Kuponlar & Doğum Günü Fırsatları",
      description: isEn
        ? "Loyalty club benefits, personalized coupon codes, and anniversary celebration gifts."
        : "Size özel tanımlanan hediye kuponlar, doğum günü sürprizleri ve Cadde Plus avantajları.",
      icon: Bell,
      email: true,
      sms: true,
      push: false,
    },
  ]);

  const handleToggle = (id: string, channel: "email" | "sms" | "push") => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === id) {
          return { ...cat, [channel]: !cat[channel] };
        }
        return cat;
      })
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Notification Preferences" : "Duyuru Tercihlerim" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Header Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <Bell className="w-4 h-4" />
                  <span>{isEn ? "Communications" : "İletişim Tercihleri"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Notification Preferences" : "Duyuru & Bildirim Tercihlerim"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "Control which updates you receive via Email, SMS text messaging, or Mobile Push Notifications."
                    : "E-posta, SMS ve mobil anlık bildirim kanalları üzerinden hangi bildirimleri almak istediğinizi özelleştirin."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className={cn(
                  "font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer shrink-0",
                  savedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-[#f27a1a] hover:bg-[#d9660d] text-white"
                )}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEn ? "Preferences Saved!" : "Tercihler Kaydedildi!"}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEn ? "Save Preferences" : "Tercihleri Kaydet"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Notification Matrix Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              {/* Header Titles */}
              <div className="grid grid-cols-12 gap-4 p-4 sm:p-5 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider">
                <div className="col-span-6 sm:col-span-7">Bildirim Türü</div>
                <div className="col-span-2 sm:col-span-1 text-center flex items-center justify-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">E-Posta</span>
                </div>
                <div className="col-span-2 sm:col-span-2 text-center flex items-center justify-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>SMS</span>
                </div>
                <div className="col-span-2 sm:col-span-2 text-center flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mobil Push</span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      className="grid grid-cols-12 gap-4 p-4 sm:p-5 items-center hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="col-span-6 sm:col-span-7 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">{cat.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      {/* Email Toggle */}
                      <div className="col-span-2 sm:col-span-1 flex justify-center">
                        <input
                          type="checkbox"
                          checked={cat.email}
                          onChange={() => handleToggle(cat.id, "email")}
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                      </div>

                      {/* SMS Toggle */}
                      <div className="col-span-2 sm:col-span-2 flex justify-center">
                        <input
                          type="checkbox"
                          checked={cat.sms}
                          onChange={() => handleToggle(cat.id, "sms")}
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                      </div>

                      {/* Push Toggle */}
                      <div className="col-span-2 sm:col-span-2 flex justify-center">
                        <input
                          type="checkbox"
                          checked={cat.push}
                          onChange={() => handleToggle(cat.id, "push")}
                          className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
