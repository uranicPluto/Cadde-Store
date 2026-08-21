import React from "react";
import { OrderRecord } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { CheckCircle2, Package, MapPin, CreditCard, Store, Calendar, User, ShieldCheck } from "lucide-react";

export interface OrderReceiptProps {
  order: OrderRecord;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ order }) => {
  const { language, currency } = useLanguage();

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    language === "en" ? "en-US" : "tr-TR",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Receipt Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {language === "en" ? "Order Confirmed" : "Siparişiniz Alındı"}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-text-main">
              {order.orderNumber}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs text-text-muted">
          <div className="flex items-center gap-1 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-1">
            Ödeme Onaylandı (3D Secure)
          </span>
        </div>
      </div>

      {/* Customer & Address Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5 text-xs">
          <span className="font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wide">
            <User className="w-3.5 h-3.5" />
            Müşteri Bilgileri
          </span>
          <span className="font-bold text-text-main">{order.customerInfo.firstName} {order.customerInfo.lastName}</span>
          <span className="text-text-muted">{order.customerInfo.email}</span>
          <span className="text-text-muted">{order.customerInfo.phone}</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5 text-xs">
          <span className="font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5" />
            Teslimat Adresi ({order.shippingAddress.title})
          </span>
          <span className="font-bold text-text-main">{order.shippingAddress.addressLine}</span>
          <span className="text-text-muted">{order.shippingAddress.district} / {order.shippingAddress.city} - {order.shippingAddress.country}</span>
        </div>
      </div>

      {/* Seller Groups & Products */}
      <div className="flex flex-col gap-4 pt-2">
        <h2 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-primary" />
          Sipariş Edilen Ürünler
        </h2>

        {order.sellerGroups.map((g) => (
          <div key={g.storeName} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-extrabold">
              <span className="text-primary flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                Satıcı: {g.storeName}
              </span>
              <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                {g.isFreeShipping ? "Ücretsiz Kargo" : `Kargo: ${formatCurrency(g.shippingFee, currency)}`}
              </span>
            </div>

            <div className="divide-y divide-slate-100 p-3 flex flex-col gap-2">
              {g.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pt-2 first:pt-0">
                  <img src={item.product.imageUrl} alt="" className="w-12 h-14 object-cover rounded border border-slate-200 shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0 text-xs">
                    <span className="font-bold text-text-main truncate">{item.product.name}</span>
                    <span className="text-[11px] text-text-muted">{item.product.brand} • {item.quantity} Adet</span>
                  </div>
                  <span className="text-xs font-black text-text-main">{formatCurrency(item.product.price * item.quantity, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Totals Summary Footer */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>Ödeme: {order.paymentMethod === "credit_card" ? `Kredi Kartı (${order.cardMaskedNumber})` : "Kapıda Ödeme"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Toplam Ödenen:</span>
          <span className="text-xl font-black text-amber-400">
            {formatCurrency(order.calculation.grandTotal, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
