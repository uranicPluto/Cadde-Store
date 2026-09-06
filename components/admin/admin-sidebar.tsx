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
  Layers,
  Palette,
  Globe,
  Activity,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export const AdminSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isEn = language === "en";

  const groups = [
    { label: isEn ? "Command center" : "Kontrol merkezi", items: [{ href: "/admin", icon: LayoutDashboard, label: t("admin.navigation.overview") }] },
    { label: isEn ? "Commerce" : "Ticaret", items: [{ href: "/admin/orders", icon: ShoppingCart, label: t("admin.navigation.orders") }, { href: "/admin/returns", icon: RotateCcw, label: isEn ? "Returns & refunds" : "İade & geri ödeme" }, { href: "/admin/sellers", icon: Store, label: t("admin.navigation.sellers") }, { href: "/admin/customers", icon: Users, label: t("admin.navigation.customers") }] },
    { label: isEn ? "Catalog" : "Katalog", items: [{ href: "/admin/products", icon: Package, label: t("admin.navigation.products") }, { href: "/admin/categories", icon: Grid, label: t("admin.navigation.categories") }, { href: "/admin/brands", icon: Award, label: t("admin.navigation.brands") }, { href: "/admin/reviews", icon: Star, label: t("admin.navigation.reviews") }] },
    { label: isEn ? "Content & growth" : "İçerik ve büyüme", items: [{ href: "/admin/cms", icon: Sparkles, label: isEn ? "Homepage studio" : "Vitrin stüdyosu" }, { href: "/admin/marketing", icon: Megaphone, label: isEn ? "Marketing & ads" : "Pazarlama & reklam" }, { href: "/admin/media", icon: ImageIcon, label: isEn ? "Media assets" : "Görsel kütüphanesi" }, { href: "/admin/coupons", icon: Tag, label: t("admin.navigation.coupons") }, { href: "/admin/seo", icon: Globe, label: isEn ? "SEO studio" : "SEO kontrolü" }] },
    { label: isEn ? "Governance" : "Yönetişim", items: [{ href: "/admin/roles", icon: ShieldCheck, label: isEn ? "Roles & permissions" : "Roller & yetkiler" }, { href: "/admin/audit", icon: FileText, label: t("admin.navigation.audit") }, { href: "/admin/health", icon: Activity, label: isEn ? "Website health" : "Site sağlığı" }, { href: "/admin/settings", icon: Settings, label: t("admin.navigation.settings") }] },
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
      <nav className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return <Link key={item.href} href={item.href} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all", isActive ? "bg-slate-800 text-indigo-400 shadow-xs" : "text-slate-400 hover:bg-slate-900 hover:text-white")}><Icon className={cn("size-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} /><span className="truncate">{item.label}</span></Link>;
            })}
          </div>
        ))}

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
