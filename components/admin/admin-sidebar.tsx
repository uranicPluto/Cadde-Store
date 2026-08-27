"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  Grid,
  Award,
  Sliders,
  Tag,
  Star,
  FileText,
  Settings,
  ShieldCheck,
  Megaphone,
  Compass,
  Image as ImageIcon,
  TrendingUp,
  RotateCcw,
  Layers,
  Palette,
  Globe,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface NavGroup {
  titleTr: string;
  titleEn: string;
  items: Array<{
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    labelTr: string;
    labelEn: string;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }>;
}

export const AdminSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const isEn = language === "en";

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const navGroups: Record<string, NavGroup> = {
    COMMERCE: {
      titleTr: "TİCARET & KATALOG",
      titleEn: "COMMERCE & CATALOG",
      items: [
        { href: "/admin", icon: LayoutDashboard, labelTr: "Genel Bakış", labelEn: "Overview" },
        { href: "/admin/orders", icon: ShoppingCart, labelTr: "Siparişler", labelEn: "Orders", badge: "Live", badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
        { href: "/admin/products", icon: Package, labelTr: "Ürünler", labelEn: "Products" },
        { href: "/admin/categories", icon: Grid, labelTr: "Kategoriler", labelEn: "Categories" },
        { href: "/admin/brands", icon: Award, labelTr: "Markalar", labelEn: "Brands" },
        { href: "/admin/sellers", icon: Store, labelTr: "Satıcılar", labelEn: "Sellers" },
        { href: "/admin/returns", icon: RotateCcw, labelTr: "İade & Değişim", labelEn: "Returns & Refunds" },
        { href: "/admin/customers", icon: Users, labelTr: "Müşteriler", labelEn: "Customers" },
      ],
    },
    STOREFRONT: {
      titleTr: "VİTRİN & CMS YÖNETİMİ",
      titleEn: "STOREFRONT & CMS",
      items: [
        { href: "/admin/cms", icon: Sliders, labelTr: "Vitrin Stüdyosu", labelEn: "Homepage Studio", badge: "PRO", badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", highlight: true },
        { href: "/admin/pages", icon: Layers, labelTr: "Sayfa Oluşturucu", labelEn: "Pages & CMS" },
        { href: "/admin/sponsors", icon: Award, labelTr: "Sponsorlar & Partnerler", labelEn: "Sponsors & Partners" },
        { href: "/admin/appearance", icon: Palette, labelTr: "Global Görünüm", labelEn: "Global Appearance" },
        { href: "/admin/layouts", icon: Layers, labelTr: "Sayfa Düzenleri", labelEn: "Page Layouts" },
        { href: "/admin/navigation", icon: Compass, labelTr: "Menü & Navigasyon", labelEn: "Visual Navigation" },
        { href: "/admin/media", icon: ImageIcon, labelTr: "Görsel Kütüphanesi", labelEn: "Media Assets" },
      ],
    },
    MARKETING: {
      titleTr: "BÜYÜME & PAZARLAMA",
      titleEn: "GROWTH & MARKETING",
      items: [
        { href: "/admin/marketing", icon: Megaphone, labelTr: "Kampanyalar & Reklam", labelEn: "Marketing & Ads" },
        { href: "/admin/coupons", icon: Tag, labelTr: "Kuponlar & Fırsatlar", labelEn: "Coupons & Deals" },
        { href: "/admin/research", icon: TrendingUp, labelTr: "Pazar Araştırması", labelEn: "Market Research" },
        { href: "/admin/ai-assistant", icon: Sparkles, labelTr: "AI Vitrin Asistanı", labelEn: "AI Merchandising", badge: "AI", badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
        { href: "/admin/reviews", icon: Star, labelTr: "Müşteri Değerlendirmeleri", labelEn: "Customer Reviews" },
      ],
    },
    SYSTEM: {
      titleTr: "SİSTEM & GÜVENLİK",
      titleEn: "SYSTEM & GOVERNANCE",
      items: [
        { href: "/admin/roles", icon: ShieldCheck, labelTr: "Roller & Yetkiler", labelEn: "Roles & Permissions" },
        { href: "/admin/seo", icon: Globe, labelTr: "SEO Kontrol Merkezi", labelEn: "SEO Studio" },
        { href: "/admin/health", icon: Activity, labelTr: "Sistem & Site Sağlığı", labelEn: "Website Health", badge: "99.9%", badgeColor: "bg-emerald-500/20 text-emerald-300" },
        { href: "/admin/audit", icon: FileText, labelTr: "Denetim Günlüğü", labelEn: "Audit Logs" },
        { href: "/admin/settings", icon: Settings, labelTr: "Sistem Ayarları", labelEn: "System Settings" },
      ],
    },
  };

  return (
    <aside
      className={cn(
        "bg-[#0b0f19] text-slate-200 border-r border-slate-800/80 flex flex-col h-full select-none",
        className
      )}
    >
      {/* Platform Branding Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-950/50 group-hover:scale-105 transition-transform">
              CS
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight leading-none group-hover:text-indigo-400 transition-colors">
                  Cadde Store
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                Türkiye • Production Live
              </span>
            </div>
          </Link>

          <Link
            href="/"
            target="_blank"
            title={isEn ? "Open Live Storefront" : "Canlı Vitrini Aç"}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grouped Hierarchical Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 no-scrollbar">
        {Object.entries(navGroups).map(([groupKey, group]) => {
          const isCollapsed = collapsedGroups[groupKey];

          return (
            <div key={groupKey} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors group cursor-pointer"
              >
                <span>{isEn ? group.titleEn : group.titleTr}</span>
                <span className="text-slate-600 group-hover:text-slate-400">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </button>

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group",
                          isActive
                            ? "bg-indigo-600/15 text-white border border-indigo-500/30 font-bold shadow-xs"
                            : item.highlight
                            ? "text-slate-300 hover:bg-indigo-500/10 hover:text-white"
                            : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0 transition-colors",
                              isActive
                                ? "text-indigo-400"
                                : item.highlight
                                ? "text-indigo-400/70 group-hover:text-indigo-400"
                                : "text-slate-500 group-hover:text-slate-300"
                            )}
                          />
                          <span className="truncate">
                            {isEn ? item.labelEn : item.labelTr}
                          </span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md leading-none tracking-tight",
                              item.badgeColor || "bg-slate-800 text-slate-400"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Footer Profile & Language Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-extrabold text-indigo-400">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">Admin User</span>
              <span className="text-[9px] text-emerald-400 font-extrabold uppercase">SUPER_ADMIN</span>
            </div>
          </div>

          {/* Quick Bilingual Switcher */}
          <button
            type="button"
            onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
            className="px-2 py-1 text-[10px] font-black rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors uppercase"
            title="Dili Değiştir / Switch Language"
          >
            {language === "tr" ? "TR / EN" : "EN / TR"}
          </button>
        </div>
      </div>
    </aside>
  );
};
