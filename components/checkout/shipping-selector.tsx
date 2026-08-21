import React from "react";
import { ShippingMethod } from "@/lib/orders/order-types";
import { Truck, Zap, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export const MOCK_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "std-shipping",
    name: { tr: "Standart Teslimat", en: "Standard Delivery" },
    deliveryDays: { tr: "2–4 İş Günü", en: "2–4 Business Days" },
    price: 0,
  },
  {
    id: "express-shipping",
    name: { tr: "Hızlı Express Kargo", en: "Express Fast Shipping" },
    deliveryDays: { tr: "1–2 İş Günü (Yarın Kargo)", en: "1–2 Business Days" },
    price: 59.9,
  },
];

export interface ShippingSelectorProps {
  selectedMethodId: string;
  onSelectMethod: (method: ShippingMethod) => void;
}

export const ShippingSelector: React.FC<ShippingSelectorProps> = ({
  selectedMethodId,
  onSelectMethod,
}) => {
  const { language, currency, t } = useLanguage();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
        <Truck className="w-4 h-4 text-primary" />
        <span>{language === "en" ? "Shipping Method" : "Kargo Teslimat Seçeneği"}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MOCK_SHIPPING_METHODS.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const isExpress = method.id.includes("express");

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-primary-light/30 border-primary shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isExpress ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {isExpress ? <Zap className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                </div>

                <div className="flex flex-col text-xs">
                  <span className="font-extrabold text-text-main">{method.name[language]}</span>
                  <span className="text-text-muted font-medium">{method.deliveryDays[language]}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-text-main">
                  {method.price === 0 ? (
                    <span className="text-emerald-600 font-extrabold">{t("header.freeShippingBadge")}</span>
                  ) : (
                    `+${formatCurrency(method.price, currency)}`
                  )}
                </span>

                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
