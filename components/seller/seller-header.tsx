import React from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Store, Bell, Search, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export const SellerHeader: React.FC = () => {
  const { language } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-6 shadow-2xs flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link href="/seller/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
            CS
          </div>
          <span className="font-extrabold text-base text-text-main hidden sm:inline">
            Cadde Store <span className="text-xs text-primary font-bold uppercase tracking-wider">Satıcı Portalı</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <Link
          href="/seller/trend-fashion-magazasi"
          className="text-xs font-bold text-slate-700 hover:text-primary flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <Store className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Canlı Vitrin</span>
        </Link>
      </div>
    </header>
  );
};
