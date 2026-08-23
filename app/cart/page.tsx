"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { groupCartBySeller, calculateOrderTotals } from "@/lib/orders/order-calculator";
import { Coupon } from "@/lib/cart/coupon-utils";
import { CartSellerGroup } from "@/components/cart/cart-seller-group";
import { CartSummary } from "@/components/cart/cart-summary";
import { CouponBox } from "@/components/cart/coupon-box";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/marketplace/empty-state";
import { Toast } from "@/components/ui/toast";
import { ShoppingBag } from "lucide-react";
import { CartItem } from "@/lib/cart/cart-types";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalCount, subtotal, appliedCoupon, setAppliedCoupon } = useCart();
  const { toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const sellerGroups = groupCartBySeller(items);
  const calculation = calculateOrderTotals(items, appliedCoupon);

  const handleSaveForLater = (item: CartItem) => {
    toggleFavorite(item.product.id);
    removeFromCart(item.id);
    setToastMsg(language === "en" ? "Product saved to favorites." : "Ürün favorilere eklendi.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="success" title={language === "en" ? "Wishlist" : "Favoriler"} message={toastMsg} onClose={() => setToastMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t("common.allProducts"), href: "/" },
            { label: `${t("common.cart")} (${totalCount})` },
          ]}
        />

        {/* Page Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                <span>{t("common.cart")}</span>
                <span className="text-xs bg-primary text-white font-extrabold px-2 py-0.5 rounded-full">
                  {totalCount} {language === "en" ? "items" : "ürün"}
                </span>
              </h1>
              <span className="text-xs text-text-muted">
                {language === "en"
                  ? "Items from different sellers are grouped by store for transparent fulfillment."
                  : "Farklı mağazalardan eklediğiniz ürünler satıcı bazlı gruplanmıştır."}
              </span>
            </div>
          </div>
        </div>

        {/* Cart Main Content or Empty State */}
        {items.length === 0 ? (
          <EmptyState
            type="empty-cart"
            title={language === "en" ? "Your Cart Is Empty" : "Sepetiniz Boş"}
            description={
              language === "en"
                ? "Continue shopping and add your favorite products to your cart."
                : "Alışverişe devam ederek favori ürünlerinizi sepetinize ekleyin."
            }
            actionText={language === "en" ? "Continue Shopping" : "Alışverişe Devam Et"}
            onActionClick={() => router.push("/")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Multi-Seller Cart Groups & Coupon (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              {sellerGroups.map((group) => (
                <CartSellerGroup
                  key={group.storeName}
                  group={group}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onSaveForLater={handleSaveForLater}
                />
              ))}

              <CouponBox
                subtotal={subtotal}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
              />
            </div>

            {/* Right Column: Order Summary (4 Cols) */}
            <div className="lg:col-span-4">
              <CartSummary
                calculation={calculation}
                appliedCoupon={appliedCoupon}
                onProceedToCheckout={handleProceedToCheckout}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
