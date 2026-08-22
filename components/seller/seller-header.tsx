import React from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Store, ExternalLink, Star, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export const SellerHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 py-3 px-6 shadow-md flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/seller/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base leading-tight tracking-tight text-white flex items-center gap-2">
              Cadde Store <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest">SELLER PRO</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Satıcı ve Mağaza Yönetim Paneli</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-extrabold text-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>9.8 Süper Mağaza Statüsü</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        <Link
          href="/seller/trend-fashion-magazasi"
          className="text-xs font-black text-slate-200 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700 transition-colors shadow-sm"
        >
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{t("seller.header.liveStorefront")}</span>
        </Link>
      </div>
    </header>
  );
};
