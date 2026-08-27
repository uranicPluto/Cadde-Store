import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShieldCheck, Truck, Lock, Headset } from "lucide-react";

export interface CustomerTrustBadgesProps {
  config?: any;
}

export const CustomerTrustBadges: React.FC<CustomerTrustBadgesProps> = ({ config }) => {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-slate-50 py-8 border-t border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-text-main">{t("trust.originalGuarantee")}</span>
            <span className="text-[11px] text-text-subtle leading-tight">{t("trust.originalGuaranteeDesc")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-text-main">{t("trust.fastDelivery")}</span>
            <span className="text-[11px] text-text-subtle leading-tight">{t("trust.fastDeliveryDesc")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-text-main">{t("trust.securePayment")}</span>
            <span className="text-[11px] text-text-subtle leading-tight">{t("trust.securePaymentDesc")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Headset className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-text-main">{t("trust.customerSupport")}</span>
            <span className="text-[11px] text-text-subtle leading-tight">{t("trust.customerSupportDesc")}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
