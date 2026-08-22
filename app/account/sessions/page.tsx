"use client";

import React, { useState } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/i18n/language-context";
import { Smartphone, Laptop, Globe, Shield, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ActiveSessionsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [sessions, setSessions] = useState<DeviceSession[]>([
    {
      id: "sess-1",
      deviceName: "Windows 11 PC",
      deviceType: "desktop",
      browser: "Google Chrome 127.0",
      location: "Istanbul, Türkiye",
      ipAddress: "88.241.142.18",
      lastActive: isEn ? "Active Now" : "Şu An Aktif",
      isCurrent: true,
    },
    {
      id: "sess-2",
      deviceName: "iPhone 15 Pro Max",
      deviceType: "mobile",
      browser: "Cadde Store iOS App v2.4",
      location: "Istanbul, Türkiye",
      ipAddress: "88.241.142.18",
      lastActive: "15 dakika önce",
      isCurrent: false,
    },
    {
      id: "sess-3",
      deviceName: "MacBook Pro 14\"",
      deviceType: "desktop",
      browser: "Safari 17.4",
      location: "Ankara, Türkiye",
      ipAddress: "212.156.40.92",
      lastActive: "Dün 22:15",
      isCurrent: false,
    },
  ]);

  const handleRevokeSession = (sessionId: string) => {
    if (window.confirm(isEn ? "Terminate this session?" : "Bu cihazdaki oturumu sonlandırmak istiyor musunuz?")) {
      setSessions(sessions.filter((s) => s.id !== sessionId));
    }
  };

  const handleRevokeAllOther = () => {
    if (
      window.confirm(
        isEn
          ? "Are you sure you want to sign out from all other devices?"
          : "Mevcut cihazınız hariç diğer tüm cihazlardaki oturumları kapatmak istediğinize emin misiniz?"
      )
    ) {
      setSessions(sessions.filter((s) => s.isCurrent));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
            { label: isEn ? "My Account" : "Hesabım", href: "/account" },
            { label: isEn ? "Active Sessions" : "Aktif Oturumlar" },
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
                  <Smartphone className="w-4 h-4" />
                  <span>{isEn ? "Device Management" : "Cihaz ve Oturum Yönetimi"}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {isEn ? "Active Logged-In Sessions" : "Giriş Yapılan Aktif Cihazlar"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEn
                    ? "See all devices currently signed into your Cadde Store account and revoke access anytime."
                    : "Hesabınıza bağlı tüm bilgisayar, telefon ve tablet oturumlarını inceleyin, tanımadığınız cihazların erişimini tek tıkla sonlandırın."}
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOther}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isEn ? "Sign Out All Other Devices" : "Diğer Tüm Cihazlardan Çıkış Yap"}</span>
                </button>
              )}
            </div>

            {/* Sessions List */}
            <div className="flex flex-col gap-4">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={cn(
                    "bg-white border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                    sess.isCurrent ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200/90"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs",
                        sess.isCurrent ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {sess.deviceType === "desktop" ? <Laptop className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900">{sess.deviceName}</h3>
                        {sess.isCurrent && (
                          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Bu Cihaz (Şu Anda Aktif)</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                        <span>{sess.browser}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sess.location}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-400">IP: {sess.ipAddress}</span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        Son hareket: <span className="text-slate-600 font-bold">{sess.lastActive}</span>
                      </span>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-4 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer w-fit"
                    >
                      {isEn ? "Sign Out" : "Oturumu Kapat"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
