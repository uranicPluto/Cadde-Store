import React, { useState } from "react";
import { CreditCard, Banknote, ShieldCheck, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { CardPaymentDetails } from "@/lib/payments/payment-types";

export interface PaymentMethodSectionProps {
  selectedPaymentType: "credit_card" | "cash_on_delivery";
  onSelectPaymentType: (type: "credit_card" | "cash_on_delivery") => void;
  cardDetails: CardPaymentDetails;
  onCardDetailsChange: (details: CardPaymentDetails) => void;
  errors?: Partial<Record<keyof CardPaymentDetails, string>>;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  selectedPaymentType,
  onSelectPaymentType,
  cardDetails,
  onCardDetailsChange,
  errors = {},
}) => {
  const { language } = useLanguage();

  const handleCardFieldChange = (field: keyof CardPaymentDetails, value: string) => {
    let formatted = value;
    if (field === "cardNumber") {
      formatted = value
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    } else if (field === "expiryMonth" || field === "expiryYear" || field === "cvv") {
      formatted = value.replace(/\D/g, "");
    }
    onCardDetailsChange({ ...cardDetails, [field]: formatted });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span>{language === "en" ? "Payment Options" : "Ödeme Yöntemi"}</span>
        </h2>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-bold">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>{language === "en" ? "256-Bit SSL Encrypted" : "256-Bit iyzico Altyapısı"}</span>
        </div>
      </div>

      {/* Payment Type Selection Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelectPaymentType("credit_card")}
          className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            selectedPaymentType === "credit_card"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-slate-50 text-text-main border-slate-200 hover:border-slate-300"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{language === "en" ? "Credit / Debit Card" : "Kredi / Banka Kartı"}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPaymentType("cash_on_delivery")}
          className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            selectedPaymentType === "cash_on_delivery"
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-slate-50 text-text-main border-slate-200 hover:border-slate-300"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>{language === "en" ? "Cash on Delivery" : "Kapıda Ödeme"}</span>
        </button>
      </div>

      {/* Credit Card Input Form */}
      {selectedPaymentType === "credit_card" ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4 mt-1">
          {/* Cardholder Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-muted">
              {language === "en" ? "Name on Card" : "Kart Üzerindeki İsim"} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={cardDetails.cardHolderName}
              onChange={(e) => handleCardFieldChange("cardHolderName", e.target.value)}
              placeholder="AHMET YILMAZ"
              className={`h-10 px-3 text-xs bg-white border rounded-lg outline-none uppercase font-bold text-text-main ${
                errors.cardHolderName ? "border-rose-400" : "border-slate-200 focus:border-primary"
              }`}
            />
          </div>

          {/* Card Number */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-muted">
              {language === "en" ? "Card Number" : "Kart Numarası"} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={cardDetails.cardNumber}
              onChange={(e) => handleCardFieldChange("cardNumber", e.target.value)}
              placeholder="5400 0000 0000 0000"
              maxLength={19}
              className={`h-10 px-3 text-xs bg-white border rounded-lg outline-none font-extrabold tracking-widest text-text-main ${
                errors.cardNumber ? "border-rose-400" : "border-slate-200 focus:border-primary"
              }`}
            />
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-text-muted">{language === "en" ? "Month (MM)" : "Ay (MM)"}</label>
              <input
                type="text"
                value={cardDetails.expiryMonth}
                onChange={(e) => handleCardFieldChange("expiryMonth", e.target.value)}
                placeholder="12"
                maxLength={2}
                className="h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none font-bold text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-text-muted">{language === "en" ? "Year (YY)" : "Yıl (YY)"}</label>
              <input
                type="text"
                value={cardDetails.expiryYear}
                onChange={(e) => handleCardFieldChange("expiryYear", e.target.value)}
                placeholder="28"
                maxLength={2}
                className="h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none font-bold text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-text-muted">CVV</label>
              <input
                type="password"
                value={cardDetails.cvv}
                onChange={(e) => handleCardFieldChange("cvv", e.target.value)}
                placeholder="***"
                maxLength={4}
                className="h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none font-bold text-center tracking-widest"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium leading-relaxed">
          {language === "en"
            ? "You have selected cash or card on delivery. A service fee of 19.90 TL will be added upon courier handover."
            : "Kapıda nakit veya kredi kartı ile ödemeyi seçtiniz. Kargo teslimatı sırasında 19.90 TL kapıda ödeme hizmet bedeli yansıtılacaktır."}
        </div>
      )}
    </div>
  );
};
