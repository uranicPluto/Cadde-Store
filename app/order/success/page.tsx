"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { getLastOrder } from "@/lib/orders/order-utils";
import { OrderRecord } from "@/lib/orders/order-types";
import { OrderReceipt } from "@/components/order/order-receipt";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  const { language, t } = useLanguage();
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const loaded = getLastOrder();
    if (loaded) setOrder(loaded);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/" },
            { label: language === "en" ? "Order Confirmation" : "Sipariş Onayı" },
          ]}
        />

        {order ? (
          <div className="flex flex-col gap-6">
            <OrderReceipt order={order} />

            <div className="flex items-center justify-center gap-4 pt-2">
              <Link href="/">
                <Button variant="primary" size="lg" className="font-extrabold px-8 py-3 bg-primary hover:bg-primary-hover shadow-md">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  <span>{language === "en" ? "Continue Shopping" : "Alışverişe Devam Et"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto flex flex-col items-center gap-4">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
            <h2 className="text-lg font-bold text-text-main">Sipariş Kaydı Bulunamadı</h2>
            <p className="text-xs text-text-muted">Son verilen sipariş bilgisi yüklenemedi.</p>
            <Link href="/">
              <Button variant="primary" size="md" className="font-bold">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
