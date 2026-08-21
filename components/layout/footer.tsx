import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import { ShieldCheck, Truck, Lock, Headset, Smartphone, Store, Globe } from "lucide-react";

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { t } = useLanguage();

  return (
    <footer className={cn("bg-slate-900 text-slate-300 text-xs border-t border-slate-800", className)}>
      {/* 1. Trust Badges Highlight Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6">
        <div className="max-w-wide mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs">{t("trust.originalGuarantee")}</span>
              <span className="text-[11px] text-slate-400 leading-tight">{t("trust.originalGuaranteeDesc")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs">{t("trust.fastDelivery")}</span>
              <span className="text-[11px] text-slate-400 leading-tight">{t("trust.fastDeliveryDesc")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs">{t("trust.securePayment")}</span>
              <span className="text-[11px] text-slate-400 leading-tight">{t("trust.securePaymentDesc")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Headset className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs">{t("trust.customerSupport")}</span>
              <span className="text-[11px] text-slate-400 leading-tight">{t("trust.customerSupportDesc")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Multi-Column Links Section */}
      <div className="max-w-wide mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1: Brand Info & Callout */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg shadow-sm">
              C
            </div>
            <span className="font-black text-lg tracking-tight text-white">CADDE STORE</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {t("footer.aboutCompany")}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">
              <Store className="w-4 h-4" /> {t("footer.becomeSeller")}
            </a>
          </div>
        </div>

        {/* Col 2: Cadde Store Corporate */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider">{t("footer.caddeStoreGroup")}</h4>
          <ul className="flex flex-col gap-2 text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.aboutUs")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.careers")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.corporate")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.press")}</a></li>
          </ul>
        </div>

        {/* Col 3: Customer Services */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider">{t("footer.customerServiceGroup")}</h4>
          <ul className="flex flex-col gap-2 text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.helpFaq")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.orderTracking")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.returns")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.shippingInfo")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.liveSupport")}</a></li>
          </ul>
        </div>

        {/* Col 4: For Sellers & Popular Categories */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white uppercase text-xs tracking-wider">{t("footer.sellerGroup")}</h4>
          <ul className="flex flex-col gap-2 text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.becomeSeller")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.sellerLogin")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.commissionRates")}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t("footer.fulfillment")}</a></li>
          </ul>
        </div>
      </div>

      {/* 3. Payment Methods & Partners Bar */}
      <div className="border-t border-slate-800 bg-slate-950/40 py-6">
        <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold mr-2">{t("footer.securePaymentPartner")}:</span>
            <span className="px-2 py-1 bg-slate-800 text-slate-200 rounded font-bold text-[10px] border border-slate-700">VISA</span>
            <span className="px-2 py-1 bg-slate-800 text-slate-200 rounded font-bold text-[10px] border border-slate-700">Mastercard</span>
            <span className="px-2 py-1 bg-slate-800 text-slate-200 rounded font-bold text-[10px] border border-slate-700">TROY</span>
            <span className="px-2 py-1 bg-slate-800 text-slate-200 rounded font-bold text-[10px] border border-slate-700">3D Secure</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold mr-2">{t("footer.deliveryPartner")}:</span>
            <span className="px-2 py-1 bg-slate-800 text-amber-400 rounded font-bold text-[10px] border border-slate-700">Yurtiçi Kargo</span>
            <span className="px-2 py-1 bg-slate-800 text-rose-400 rounded font-bold text-[10px] border border-slate-700">Aras Kargo</span>
            <span className="px-2 py-1 bg-slate-800 text-orange-400 rounded font-bold text-[10px] border border-slate-700">Trendyol Express</span>
          </div>
        </div>
      </div>

      {/* 4. Legal & Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-4 text-[11px] text-slate-400">
        <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{t("footer.copyright")}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">{t("footer.termsOfUse")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.kvkk")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.cookieSettings")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
