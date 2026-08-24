"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { useAppearance } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Truck,
  Lock,
  Headset,
  Store,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  CheckCircle2,
} from "lucide-react";

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { t, language } = useLanguage();
  const { settings, footerConfig } = useAppearance();
  const isEn = language === "en";

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const showTrustBadges = footerConfig?.showTrustBadges !== false;
  const showPaymentBadges = footerConfig?.showPaymentBadges !== false;
  const showNewsletter = footerConfig?.showNewsletter !== false;
  const marketplaceName = settings?.marketplaceName || "CADDE STORE";
  const copyrightText = isEn
    ? (footerConfig?.copyrightTextEn || t("footer.copyright"))
    : (footerConfig?.copyrightTextTr || t("footer.copyright"));

  const socialIcons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <footer className={cn("bg-slate-900 text-slate-300 text-xs border-t border-slate-800", className)}>
      {/* 1. Trust Badges Highlight Bar */}
      {showTrustBadges && (
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
      )}

      {/* 2. Optional Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-slate-800 bg-slate-900/90 py-8 px-4 sm:px-6">
          <div className="max-w-wide mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {isEn
                  ? (footerConfig?.newsletterTitleEn || "Subscribe to Our Newsletter")
                  : (footerConfig?.newsletterTitleTr || "E-Bültenimize Katılın")}
              </h3>
              <p className="text-xs text-slate-400 max-w-lg">
                {isEn
                  ? (footerConfig?.newsletterSubtitleEn || "Be the first to know about exclusive deals, coupons, and new arrivals.")
                  : (footerConfig?.newsletterSubtitleTr || "Özel fırsatlar, indirim kuponları ve yeniliklerden ilk siz haberdar olun.")}
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex items-center w-full md:w-auto max-w-md gap-2">
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold py-2 px-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEn ? "Thank you for subscribing!" : "Aboneliğiniz başarıyla kaydedildi!"}</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    placeholder={isEn ? "Your email address..." : "E-posta adresiniz..."}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 min-w-[220px] bg-slate-950 border border-slate-700 text-white rounded-lg px-3.5 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>{isEn ? "Subscribe" : "Abone Ol"}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 3. Main Multi-Column Links Section */}
      <div className="max-w-wide mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1: Brand Info & Callout */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            {settings?.logoUrl && settings.logoUrl !== "/logo.svg" && !settings.logoUrl.endsWith(".svg") ? (
              <img src={settings.logoUrl} alt={marketplaceName} className="h-9 w-auto object-contain rounded" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-primary-hover transition-colors">
                {marketplaceName ? marketplaceName.charAt(0).toUpperCase() : "C"}
              </div>
            )}
            <span className="font-black text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
              {marketplaceName}
            </span>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {settings?.tagline || t("footer.aboutCompany")}
          </p>

          {/* Social Links */}
          {footerConfig?.socialLinks && footerConfig.socialLinks.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              {footerConfig.socialLinks.map((s, idx) => {
                const Icon = socialIcons[s.platform] || null;
                if (!Icon) return null;
                return (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link href="/seller" className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 px-3 py-1.5 rounded-md font-bold text-xs transition-colors">
              <Store className="w-4 h-4" /> {t("footer.becomeSeller")}
            </Link>
          </div>
        </div>

        {/* Dynamic / Fallback Columns */}
        {footerConfig?.columns && footerConfig.columns.length > 0 ? (
          footerConfig.columns.slice(0, 3).map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">
                {isEn ? col.titleEn : col.titleTr}
              </h4>
              <ul className="flex flex-col gap-2 text-slate-400">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.url}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className="hover:text-white transition-colors"
                    >
                      {isEn ? link.titleEn : link.titleTr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <>
            {/* Col 2: Cadde Store Corporate */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">{t("footer.caddeStoreGroup")}</h4>
              <ul className="flex flex-col gap-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.aboutUs")}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.careers")}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.corporate")}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.press")}</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Services */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">{t("footer.customerServiceGroup")}</h4>
              <ul className="flex flex-col gap-2 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">{t("footer.helpFaq")}</Link></li>
                <li><Link href="/account/orders" className="hover:text-white transition-colors">{t("footer.orderTracking")}</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">{t("footer.returns")}</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">{t("footer.shippingInfo")}</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">{t("footer.liveSupport")}</Link></li>
              </ul>
            </div>

            {/* Col 4: For Sellers */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">{t("footer.sellerGroup")}</h4>
              <ul className="flex flex-col gap-2 text-slate-400">
                <li><Link href="/seller" className="hover:text-white transition-colors">{t("footer.becomeSeller")}</Link></li>
                <li><Link href="/seller" className="hover:text-white transition-colors">{t("footer.sellerLogin")}</Link></li>
                <li><Link href="/seller" className="hover:text-white transition-colors">{t("footer.commissionRates")}</Link></li>
                <li><Link href="/seller" className="hover:text-white transition-colors">{t("footer.fulfillment")}</Link></li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* 4. Payment Methods & Partners Bar */}
      {showPaymentBadges && (
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
      )}

      {/* 5. Legal & Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-4 text-[11px] text-slate-400">
        <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{copyrightText}</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">{t("footer.termsOfUse")}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link>
            <Link href="/kvkk" className="hover:text-white transition-colors">{t("footer.kvkk")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
