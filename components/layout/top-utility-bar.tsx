import React from "react";
import { Store, HelpCircle, PhoneCall } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

export interface TopUtilityBarProps {
  className?: string;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({ className }) => {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "w-full bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800 transition-all",
        className
      )}
    >
      <div className="max-w-wide mx-auto flex items-center justify-between gap-4">
        {/* Left Announcement / Merchant Callout */}
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[11px]">
            <Store className="w-3 h-3" />
            {t("common.becomeSeller")}
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300 text-[11px] truncate">
            {t("header.sellerCallout")}
          </span>
        </div>

        {/* Right Links & Language Selector */}
        <div className="flex items-center gap-4 shrink-0 text-[11px]">
          <a
            href="#"
            className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>{t("common.help")}</span>
          </a>

          <a
            href="#"
            className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-slate-400" />
            <span>{t("common.customerService")}</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-1 text-amber-400 font-semibold hover:underline"
          >
            <span>{t("common.sellerPortal")}</span>
          </a>

          {/* Interactive Language & Currency Switcher */}
          <div className="pl-2 border-l border-slate-700">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};
