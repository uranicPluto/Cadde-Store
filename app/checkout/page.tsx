"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useCart } from "@/lib/cart/cart-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { calculateOrderTotals } from "@/lib/orders/order-calculator";
import { getSavedAddresses, saveAddress } from "@/lib/checkout/address-utils";
import { Address, ShippingMethod, OrderRecord } from "@/lib/orders/order-types";
import { CardPaymentDetails } from "@/lib/payments/payment-types";
import { paymentAdapter } from "@/lib/payments/mock-payment-adapter";
import { generateOrderNumber, saveOrderToHistory } from "@/lib/orders/order-utils";
import { CheckoutProgress, CheckoutStep } from "@/components/checkout/checkout-progress";
import { CustomerForm, CustomerFormData } from "@/components/checkout/customer-form";
import { AddressSelector } from "@/components/checkout/address-selector";
import { ShippingSelector, MOCK_SHIPPING_METHODS } from "@/components/checkout/shipping-selector";
import { PaymentMethodSection } from "@/components/checkout/payment-method";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Toast } from "@/components/ui/toast";
import { EmptyState } from "@/components/marketplace/empty-state";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, appliedCoupon } = useCart();
  const { language, currency, t } = useLanguage();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("delivery");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(MOCK_SHIPPING_METHODS[0]);
  const [paymentType, setPaymentType] = useState<"credit_card" | "cash_on_delivery">("credit_card");

  const [customerData, setCustomerData] = useState<CustomerFormData>({
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: "0532 123 4567",
  });

  const [cardDetails, setCardDetails] = useState<CardPaymentDetails>({
    cardHolderName: "AHMET YILMAZ",
    cardNumber: "5400 0000 0000 0000",
    expiryMonth: "12",
    expiryYear: "28",
    cvv: "123",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getSavedAddresses();
    setAddresses(loaded);
    if (loaded.length > 0) {
      const def = loaded.find((a) => a.isDefault) || loaded[0];
      setSelectedAddressId(def.id);
      setCustomerData({
        firstName: def.firstName,
        lastName: def.lastName,
        email: def.email,
        phone: def.phone,
      });
    }
  }, []);

  const calculation = calculateOrderTotals(items, appliedCoupon, selectedShipping);

  const handleSaveAddress = (newAddr: Address) => {
    const updated = saveAddress(newAddr);
    setAddresses(updated);
  };

  const handlePlaceOrder = async () => {
    setErrorMsg(null);

    // Basic Form validation
    if (!customerData.firstName || !customerData.lastName || !customerData.email || !customerData.phone) {
      setErrorMsg(language === "en" ? "Please fill in all customer information." : "Lütfen tüm müşteri bilgilerini doldurunuz.");
      return;
    }

    const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!activeAddress) {
      setErrorMsg(language === "en" ? "Please select a delivery address." : "Lütfen teslimat adresi seçiniz.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send Order to Server API for DB Transaction & Stock Validation
      const apiRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            product: i.product,
          })),
          shippingAddress: activeAddress,
          customerInfo: customerData,
          couponCode: appliedCoupon?.code,
        }),
      });

      const apiData = await apiRes.json();
      if (!apiRes.ok || !apiData.success) {
        setErrorMsg(apiData.error || (language === "en" ? "Order placement failed." : "Sipariş işlenirken hata oluştu."));
        setIsSubmitting(false);
        return;
      }

      // 2. Payment Adapter Simulation
      const paymentRes = await paymentAdapter.processPayment({
        orderId: apiData.order.orderNumber,
        amount: calculation.grandTotal,
        currency,
        paymentMethod: paymentType,
        cardDetails: paymentType === "credit_card" ? cardDetails : undefined,
      });

      if (!paymentRes.success) {
        setErrorMsg(paymentRes.statusMessage);
        setIsSubmitting(false);
        return;
      }

      // 3. Save Order to Client History & Clear Cart
      const orderRecord: OrderRecord = {
        orderId: apiData.order.id,
        orderNumber: apiData.order.orderNumber,
        createdAt: new Date().toISOString(),
        customerInfo: customerData,
        shippingAddress: activeAddress,
        shippingMethod: selectedShipping,
        sellerGroups: calculation.sellerGroups,
        appliedCoupon: appliedCoupon,
        paymentMethod: paymentType,
        cardMaskedNumber: paymentType === "credit_card" ? `**** **** **** ${cardDetails.cardNumber.slice(-4)}` : undefined,
        calculation,
        status: "confirmed",
      };

      saveOrderToHistory(orderRecord);
      clearCart();
      router.push("/order/success");
    } catch (e) {
      console.error("Order processing failed", e);
      setErrorMsg(language === "en" ? "Order processing failed. Please try again." : "Sipariş işlenirken hata oluştu.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast type="error" title={language === "en" ? "Checkout Error" : "Sipariş Hatası"} message={errorMsg} onClose={() => setErrorMsg(null)} />
        </div>
      )}

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t("common.cart"), href: "/cart" },
            { label: language === "en" ? "Checkout" : "Güvenli Ödeme" },
          ]}
        />

        {/* Step Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} />

        {/* Empty Cart Guard */}
        {items.length === 0 ? (
          <EmptyState
            type="empty-cart"
            title={language === "en" ? "Your Cart Is Empty" : "Sepetinizde Ürün Bulunmuyor"}
            description={
              language === "en"
                ? "Please add products to your cart before proceeding to checkout."
                : "Ödemeye geçebilmek için lütfen sepetinize ürün ekleyiniz."
            }
            actionText={language === "en" ? "Return to Shopping" : "Alışverişe Dön"}
            onActionClick={() => router.push("/")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Forms & Controls (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <CustomerForm data={customerData} onChange={setCustomerData} />

              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onSaveAddress={handleSaveAddress}
              />

              <ShippingSelector
                selectedMethodId={selectedShipping.id}
                onSelectMethod={setSelectedShipping}
              />

              <PaymentMethodSection
                selectedPaymentType={paymentType}
                onSelectPaymentType={setPaymentType}
                cardDetails={cardDetails}
                onCardDetailsChange={setCardDetails}
              />
            </div>

            {/* Right Column: Order Preview Sidebar (4 Cols) */}
            <div className="lg:col-span-4">
              <CheckoutSummary
                calculation={calculation}
                appliedCoupon={appliedCoupon}
                selectedAddress={addresses.find((a) => a.id === selectedAddressId)}
                selectedShippingMethod={selectedShipping}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
