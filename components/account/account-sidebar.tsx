import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, MapPin, Tag, Settings, LogOut, ChevronRight, Crown, MessageSquare, History, Store, CreditCard, ShieldCheck, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export const AccountSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isEn = language === "en";

  const navGroups = [
    {
      title: isEn ? "My Orders" : "Siparişlerim",
      items: [
        { href: "/account/orders", icon: Package, label: isEn ? "My Orders" : "Siparişlerim" },
        { href: "/account/reviews", icon: MessageSquare, label: isEn ? "My Reviews" : "Değerlendirmelerim" },
        { href: "/account/coupons", icon: Tag, label: isEn ? "My Coupons" : "Kuponlarım" },
      ],
    },
    {
      title: isEn ? "Just For You" : "Sadece Sana Özel",
      items: [
        { href: "/favorites", icon: Heart, label: isEn ? "Favorites" : "Favorilerim" },
        { href: "/account/history", icon: History, label: isEn ? "Browsing History" : "Gezinme Geçmişim" },
        { href: "/account/stores", icon: Store, label: isEn ? "Followed Stores" : "Takip Edilen Mağazalar" },
      ],
    },
    {
      title: isEn ? "Account & Help" : "Hesap & Yardım",
      items: [
        { href: "/account/settings", icon: User, label: isEn ? "Personal Details" : "Kişisel Bilgilerim" },
        { href: "/account/addresses", icon: MapPin, label: isEn ? "My Addresses" : "Adreslerim" },
        { href: "/help", icon: HelpCircle, label: isEn ? "Help & Support" : "Yardım & Destek" },
      ],
    },
  ];

  return (
    <aside className={cn("bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-4", className)}>
      {/* Competitor Screenshot 26 Promo Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-black">
            <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-xs uppercase tracking-wider text-amber-200">Cadde Plus</span>
            <span className="font-bold text-xs leading-tight">10'lu Ücretsiz Kargo Paketi</span>
          </div>
        </div>
      </div>

      {/* Account Profile Summary Badge */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
          AY
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-black text-xs text-slate-900 truncate">Ahmet Yılmaz</span>
          <span className="text-[10px] text-slate-400 truncate">ahmet.yilmaz@cadde-store.com</span>
        </div>
      </div>

      {/* Grouped Account Navigation */}
      <div className="flex flex-col gap-4 pt-1">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
              {grp.title}
            </span>
            <nav className="flex flex-col gap-0.5">
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all",
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 opacity-60", isActive && "text-white opacity-100")} />
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-all mt-2 border border-rose-100"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{isEn ? "Sign Out" : "Çıkış Yap"}</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
