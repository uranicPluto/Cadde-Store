"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import {
  ExternalLink,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  Package,
  Layers,
  Award,
  Tag,
  Sliders,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export const AdminHeader: React.FC = () => {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Generate dynamic breadcrumb from pathname
  const pathSegments = pathname.split("/").filter(Boolean);

  const getSegmentName = (seg: string) => {
    switch (seg.toLowerCase()) {
      case "admin":
        return isEn ? "Admin" : "Yönetim";
      case "cms":
        return isEn ? "Homepage Studio" : "Vitrin Stüdyosu";
      case "pages":
        return isEn ? "Pages" : "Sayfalar";
      case "sponsors":
        return isEn ? "Sponsors" : "Sponsorlar";
      case "products":
        return isEn ? "Products" : "Ürünler";
      case "orders":
        return isEn ? "Orders" : "Siparişler";
      case "categories":
        return isEn ? "Categories" : "Kategoriler";
      case "brands":
        return isEn ? "Brands" : "Markalar";
      case "sellers":
        return isEn ? "Sellers" : "Satıcılar";
      case "appearance":
        return isEn ? "Appearance" : "Görünüm";
      case "layouts":
        return isEn ? "Layouts" : "Düzenler";
      case "navigation":
        return isEn ? "Navigation" : "Menü";
      case "media":
        return isEn ? "Media Assets" : "Medya";
      case "health":
        return isEn ? "System Health" : "Site Sağlığı";
      case "roles":
        return isEn ? "Roles" : "Yetkiler";
      case "seo":
        return isEn ? "SEO" : "SEO Kontrol";
      case "audit":
        return isEn ? "Audit" : "Denetim";
      case "coupons":
        return isEn ? "Coupons" : "Kuponlar";
      case "marketing":
        return isEn ? "Marketing" : "Pazarlama";
      case "builder":
        return isEn ? "Visual Builder" : "Görsel Editör";
      default:
        return seg;
    }
  };

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200/90 py-2.5 px-6 shadow-2xs flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Dynamic Breadcrumb Path */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link
            href="/admin"
            className="hover:text-indigo-600 font-bold transition-colors"
          >
            Cadde Store
          </Link>
          {pathSegments.map((seg, idx) => {
            const isLast = idx === pathSegments.length - 1;
            const href = "/" + pathSegments.slice(0, idx + 1).join("/");

            return (
              <React.Fragment key={href}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {isLast ? (
                  <span className="font-extrabold text-slate-900 truncate">
                    {getSegmentName(seg)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-indigo-600 truncate transition-colors"
                  >
                    {getSegmentName(seg)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Live Marketplace Health Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-[10px] font-black text-emerald-700 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isEn ? "Live Sync Active" : "Canlı Senkronize"}</span>
        </div>
      </div>

      {/* Right: Quick Actions, Notifications, Storefront Link */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Create Action Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? "Create" : "Hızlı Ekle"}</span>
          </button>

          {isQuickActionsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-0.5">
              <Link
                href="/admin/products"
                onClick={() => setIsQuickActionsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? "New Product" : "Yeni Ürün"}</span>
              </Link>
              <Link
                href="/admin/pages"
                onClick={() => setIsQuickActionsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? "New Page" : "Yeni Sayfa"}</span>
              </Link>
              <Link
                href="/admin/sponsors"
                onClick={() => setIsQuickActionsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? "New Sponsor" : "Yeni Sponsor"}</span>
              </Link>
              <Link
                href="/admin/cms"
                onClick={() => setIsQuickActionsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? "Edit Homepage" : "Vitrini Düzenle"}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
            title={isEn ? "Marketplace Alerts" : "Pazaryeri Bildirimleri"}
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1 ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 flex flex-col gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {isEn ? "Notifications & Alerts" : "Bildirimler & Uyarılar"}
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Homepage Studio Aktif</span>
                    <span className="text-[11px] text-slate-500">Görsel vitrin düzenleyici yayında.</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">Tüm Sistemler Sağlıklı</span>
                    <span className="text-[11px] text-slate-500">Veritabanı & API uç noktaları %99.9 çalışıyor.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* View Live Storefront Button */}
        <Link
          href="/"
          target="_blank"
          className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">{isEn ? "Storefront" : "Canlı Mağaza"}</span>
        </Link>
      </div>
    </header>
  );
};
