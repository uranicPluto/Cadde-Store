"use client";

import React from "react";
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
  ArrowLeft,
  ShieldCheck,
  Megaphone,
  Compass,
  Image as ImageIcon,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export const AdminSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("admin.navigation.overview") },
    { href: "/admin/sellers", icon: Store, label: t("admin.navigation.sellers") },
    { href: "/admin/products", icon: Package, label: t("admin.navigation.products") },
    { href: "/admin/orders", icon: ShoppingCart, label: t("admin.navigation.orders") },
    { href: "/admin/returns", icon: RotateCcw, label: isEn ? "Returns & Refunds" : "İade & Geri Ödeme" },
    { href: "/admin/customers", icon: Users, label: t("admin.navigation.customers") },
    { href: "/admin/categories", icon: Grid, label: t("admin.navigation.categories") },
    { href: "/admin/brands", icon: Award, label: t("admin.navigation.brands") },
    { href: "/admin/cms", icon: Sliders, label: t("admin.navigation.cms") },
    { href: "/admin/marketing", icon: Megaphone, label: isEn ? "Marketing & Ads" : "Pazarlama & Reklam" },
    { href: "/admin/navigation", icon: Compass, label: isEn ? "Menu & Navigation" : "Menü & Navigasyon" },
    { href: "/admin/media", icon: ImageIcon, label: isEn ? "Media Assets" : "Görsel Kütüphanesi" },
    { href: "/admin/research", icon: TrendingUp, label: isEn ? "Market Research" : "Pazar Araştırması" },
    { href: "/admin/coupons", icon: Tag, label: t("admin.navigation.coupons") },
    { href: "/admin/reviews", icon: Star, label: t("admin.navigation.reviews") },
    { href: "/admin/audit", icon: FileText, label: t("admin.navigation.audit") },
    { href: "/admin/settings", icon: Settings, label: t("admin.navigation.settings") },
  ];

  return (
    <aside className={cn("bg-slate-950 text-slate-100 rounded-xl p-4 shadow-lg flex flex-col gap-4 border border-slate-800", className)}>
      {/* Admin Identity Header */}
      <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-extrabold text-xs text-white truncate">{t("admin.sidebar.adminTitle")}</span>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">admin@cadde.store</span>
        </div>
      </div>

      {/* Navigation Links List */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                isActive
                  ? "bg-slate-800 text-indigo-400 border-l-3 border-indigo-500 pl-2 shadow-xs"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Back to Public Marketplace Link */}
        <div className="pt-2 border-t border-slate-900 mt-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{t("admin.navigation.viewMarketplace")}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};
