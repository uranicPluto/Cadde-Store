"use client";

import React from "react";
import { StatusHistoryStep, OrderStatusType } from "@/lib/orders/order-types";
import { Check, Truck, Package, Home, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface OrderTrackingProps {
  statusHistory: StatusHistoryStep[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  statusHistory,
  trackingNumber,
  estimatedDelivery,
}) => {
  const { language } = useLanguage();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-text-main">
          <Truck className="w-4 h-4 text-primary" />
          <span>Kargo Takip No: <strong className="text-primary">{trackingNumber || "YRT-948201948"}</strong></span>
        </div>

        {estimatedDelivery && (
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-extrabold border border-emerald-200">
            Tahmini Teslimat: {estimatedDelivery}
          </span>
        )}
      </div>

      {/* Timeline Steps */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative max-w-3xl mx-auto w-full">
        {statusHistory.map((step, idx) => {
          const isDone = step.completed;
          const isActive = step.active;

          return (
            <div key={step.status} className="flex md:flex-col items-center gap-3 flex-1 w-full md:w-auto relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all shrink-0 z-10 ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isActive
                    ? "bg-primary text-white ring-4 ring-primary/20 shadow-md"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : idx + 1}
              </div>

              <div className="flex flex-col md:items-center md:text-center text-xs">
                <span className={`font-extrabold ${isActive ? "text-primary" : isDone ? "text-text-main" : "text-slate-400"}`}>
                  {step.title[language]}
                </span>
                {step.date && <span className="text-[11px] text-text-subtle font-medium">{step.date}</span>}
              </div>

              {/* Progress Line */}
              {idx < statusHistory.length - 1 && (
                <div
                  className={`hidden md:block absolute top-5 left-1/2 w-full h-0.5 -z-0 transition-all ${
                    isDone ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
