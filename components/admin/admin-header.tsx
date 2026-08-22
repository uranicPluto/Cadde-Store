import React from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export const AdminHeader: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-6 shadow-2xs flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
            CS
          </div>
          <span className="font-extrabold text-base text-text-main hidden sm:inline flex items-center gap-2">
            Cadde Store <span className="text-xs bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">{t("admin.header.platformControl")}</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <Link
          href="/"
          className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">{t("admin.header.viewMarketplace")}</span>
        </Link>
      </div>
    </header>
  );
};
