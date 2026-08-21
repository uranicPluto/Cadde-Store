import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, MapPin, Tag, Settings, LogOut, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export const ACCOUNT_NAV_ITEMS = [
  { href: "/account", icon: User, labelKey: "account.dashboard", fallbackTr: "Hesabım", fallbackEn: "My Account" },
  { href: "/account/orders", icon: Package, labelKey: "account.myOrders", fallbackTr: "Siparişlerim", fallbackEn: "My Orders" },
  { href: "/favorites", icon: Heart, labelKey: "account.myFavorites", fallbackTr: "Favorilerim", fallbackEn: "My Favorites" },
  { href: "/account/addresses", icon: MapPin, labelKey: "account.myAddresses", fallbackTr: "Adreslerim", fallbackEn: "My Addresses" },
  { href: "/account/coupons", icon: Tag, labelKey: "account.myCoupons", fallbackTr: "Kuponlarım", fallbackEn: "My Coupons" },
  { href: "/account/settings", icon: Settings, labelKey: "account.settings", fallbackTr: "Ayarlar", fallbackEn: "Settings" },
];

export const AccountSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <aside className={cn("bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-4", className)}>
      {/* Profile Summary Badge */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shadow-xs">
          AY
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-extrabold text-xs text-text-main truncate">Ahmet Yılmaz</span>
          <span className="text-[11px] text-text-subtle truncate">ahmet.yilmaz@example.com</span>
        </div>
      </div>

      {/* Account Navigation Links */}
      <nav className="flex flex-col gap-1">
        {ACCOUNT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href));
          const label = language === "en" ? item.fallbackEn : item.fallbackTr;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg text-xs font-bold transition-all",
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-main hover:bg-slate-50 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                <span>{label}</span>
              </div>
              <ChevronRight className={cn("w-3.5 h-3.5 opacity-60", isActive && "text-white opacity-100")} />
            </Link>
          );
        })}

        <button
          type="button"
          className="flex items-center justify-between p-3 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all mt-2"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{language === "en" ? "Sign Out" : "Çıkış Yap"}</span>
          </div>
        </button>
      </nav>
    </aside>
  );
};
