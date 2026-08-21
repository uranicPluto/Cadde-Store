import React from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export type CheckoutStep = "delivery" | "payment" | "confirmation";

export interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

export const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ currentStep }) => {
  const { language } = useLanguage();

  const steps = [
    { id: "cart", label: language === "en" ? "Cart" : "Sepet", completed: true },
    { id: "delivery", label: language === "en" ? "Delivery" : "Teslimat", completed: currentStep === "payment" || currentStep === "confirmation" },
    { id: "payment", label: language === "en" ? "Payment" : "Ödeme", completed: currentStep === "confirmation" },
    { id: "confirmation", label: language === "en" ? "Confirmation" : "Onay", completed: currentStep === "confirmation" },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {steps.map((step, idx) => {
          const isCurrent = currentStep === step.id;
          const isPast = step.completed;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isPast
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "bg-primary text-white ring-4 ring-primary/20 shadow-md"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? "text-primary" : isPast ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-all ${
                    isPast ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
