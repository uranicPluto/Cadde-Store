import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Star, Settings, Store, PlusCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export const SellerSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/seller/dashboard", icon: LayoutDashboard, label: t("seller.navigation.overview") },
    { href: "/seller/dashboard/products", icon: Package, label: t("seller.navigation.products") },
    { href: "/seller/dashboard/orders", icon: ShoppingCart, label: t("seller.navigation.orders") },
    { href: "/seller/dashboard/reviews", icon: Star, label: t("seller.navigation.reviews") },
    { href: "/seller/dashboard/settings", icon: Settings, label: t("seller.navigation.settings") },
  ];

  return (
    <aside className={cn("bg-slate-900 text-white rounded-xl p-4 shadow-md flex flex-col gap-5", className)}>
      {/* Seller Store Header Badge */}
      <div className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">
          TF
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-extrabold text-xs text-white truncate">Trend Fashion Mağazası</span>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{t("seller.sidebar.verifiedBadge")}</span>
        </div>
      </div>

      {/* Quick Action Button */}
      <Link
        href="/seller/dashboard/products/new"
        className="w-full py-2.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        <span>{t("seller.sidebar.addProduct")}</span>
      </Link>

      {/* Navigation List */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/seller/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-xs font-bold transition-all",
                isActive
                  ? "bg-slate-800 text-primary border-l-4 border-primary pl-2 shadow-xs"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Public Storefront Link */}
        <div className="pt-3 border-t border-slate-800 mt-2">
          <Link
            href="/seller/trend-fashion-magazasi"
            className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>{t("seller.navigation.viewStorefront")}</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("seller.navigation.backToMarketplace")}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};
