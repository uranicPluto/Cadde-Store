import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  Tag,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  MessageSquare,
  History,
  Store,
  CreditCard,
  Bell,
  Lock,
  Smartphone,
  HelpCircle,
  MessageCircleQuestion,
  Headphones,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
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
        { href: "/account/questions", icon: MessageCircleQuestion, label: isEn ? "My Questions" : "Satıcı Sorularım" },
        { href: "/account/buy-again", icon: Sparkles, label: isEn ? "Buy Again" : "Tekrar Satın Al" },
      ],
    },
    {
      title: isEn ? "Just For You" : "Sana Özel",
      items: [
        { href: "/account/coupons", icon: Tag, label: isEn ? "My Coupons" : "Kuponlarım" },
        { href: "/account/history", icon: History, label: isEn ? "Browsing History" : "Gezinme Geçmişim" },
        { href: "/account/stores", icon: Store, label: isEn ? "Followed Stores" : "Takip Edilen Mağazalar" },
        { href: "/favorites", icon: Heart, label: isEn ? "Favorites" : "Favorilerim" },
      ],
    },
    {
      title: isEn ? "Account & Security" : "Hesap & Güvenlik",
      items: [
        { href: "/account/settings", icon: User, label: isEn ? "Personal Details" : "Kişisel Bilgilerim" },
        { href: "/account/addresses", icon: MapPin, label: isEn ? "My Addresses" : "Adreslerim" },
        { href: "/account/cards", icon: CreditCard, label: isEn ? "Saved Cards" : "Kayıtlı Kartlarım" },
        { href: "/account/notifications", icon: Bell, label: isEn ? "Notification Preferences" : "Duyuru Tercihlerim" },
        { href: "/account/security", icon: Lock, label: isEn ? "Password & Security" : "Şifre ve Güvenlik" },
        { href: "/account/sessions", icon: Smartphone, label: isEn ? "Active Sessions" : "Aktif Oturumlar" },
      ],
    },
    {
      title: isEn ? "Support" : "Destek",
      items: [
        { href: "/help", icon: HelpCircle, label: isEn ? "Help Center" : "Yardım Merkezi" },
        { href: "/account/assistant", icon: Headphones, label: isEn ? "Cadde Assistant 24/7" : "Cadde Asistanı 24/7" },
      ],
    },
  ];

  return (
    <aside className={cn("bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col gap-4 text-slate-800", className)}>
      {/* 1. User Header Badge with Email Verification */}
      <div className="flex flex-col gap-2 p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm">
            AY
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-extrabold text-xs text-slate-900 truncate">Ahmet Yılmaz</span>
            <span className="text-[11px] text-slate-500 truncate">ahmet.yilmaz@cadde-store.com</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px]">
          <span className="flex items-center gap-1 font-bold text-emerald-600">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isEn ? "Email Verified" : "E-posta Onaylı"}</span>
          </span>
          <span className="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-md">
            VIP Müşteri
          </span>
        </div>
      </div>

      {/* 2. Premium Cadde Plus Subscription Card (Matches Screenshot 1 & 2) */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 p-4 text-white shadow-md group cursor-pointer">
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-20 h-20 rounded-full bg-white/10 blur-md pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-black text-[10px] uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-amber-200 flex items-center gap-1">
              <Crown className="w-3 h-3 fill-amber-200" />
              SADECE 1 TL
            </span>
            <span className="text-[10px] font-bold underline">Keşfet &gt;</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-black text-sm leading-tight text-white">Cadde Plus Üyesi Ol!</h4>
            <p className="text-[11px] text-white/90 font-medium leading-tight mt-0.5">
              10'lu Ücretsiz Kargo Paketi &amp; Özel Sepet İndirimleri!
            </p>
          </div>
          <button
            type="button"
            className="w-full bg-white text-slate-900 font-black text-xs py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors mt-1"
          >
            Hemen Katıl
          </button>
        </div>
      </div>

      {/* 3. Categorized Portal Sidebar Links */}
      <div className="flex flex-col gap-4 pt-1 divide-y divide-slate-100">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className={cn("flex flex-col gap-1.5", gIdx > 0 && "pt-3")}>
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
                        ? "bg-primary text-white shadow-xs font-black"
                        : "text-slate-700 hover:bg-amber-50/60 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={cn("w-3.5 h-3.5 opacity-40", isActive && "text-white opacity-100")} />
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* 4. Assistant Callout Box (Competitor Screenshot 2) */}
        <div className="pt-3 flex flex-col gap-2">
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs text-slate-900">Cadde Asistanı'na Sor</span>
              <span className="text-[10px] text-slate-500 font-medium">Sorularınızı 7/24 yanıtlıyor</span>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-all border border-rose-100 mt-1"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>{isEn ? "Sign Out" : "Çıkış Yap"}</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};
