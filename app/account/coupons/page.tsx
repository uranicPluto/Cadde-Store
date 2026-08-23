"use client";

import React from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { CouponCard } from "@/components/account/coupon-card";
import { MOCK_COUPONS } from "@/lib/cart/coupon-utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Tag } from "lucide-react";

export default function CouponWalletPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: language === "en" ? "My Account" : "Hesabım", href: "/account" },
            { label: language === "en" ? "My Coupons" : "Kupon Cüzdanım" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{language === "en" ? "My Coupons" : "Kupon Cüzdanım"}</span>
                    <span className="text-xs bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {MOCK_COUPONS.length} {language === "en" ? "Active Coupons" : "Aktif Kupon"}
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    {language === "en"
                      ? "Special discount coupons ready to apply at checkout."
                      : "Sipariş verirken sepetinizde kullanabileceğiniz indirim kuponları."}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupons List */}
            <div className="flex flex-col gap-4">
              {MOCK_COUPONS.map((coupon) => (
                <CouponCard key={coupon.code} coupon={coupon} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
