import React from "react";
import Link from "next/link";
import { OrderRecord, OrderStatusType } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { Package, ArrowRight, RefreshCw, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface OrderCardProps {
  order: OrderRecord;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { language, currency, t } = useLanguage();
  const { addToCart } = useCart();

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    language === "en" ? "en-US" : "tr-TR",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const totalItemsCount = order.sellerGroups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  const statusBadges: Record<OrderStatusType, { labelTr: string; labelEn: string; variant: "bestseller" | "fast-delivery" | "free-shipping" | "coupon" }> = {
    confirmed: { labelTr: "Sipariş Alındı", labelEn: "Confirmed", variant: "coupon" },
    processing: { labelTr: "Hazırlanıyor", labelEn: "Processing", variant: "fast-delivery" },
    shipped: { labelTr: "Kargoya Verildi", labelEn: "Shipped", variant: "bestseller" },
    out_for_delivery: { labelTr: "Dağıtımda", labelEn: "Out for Delivery", variant: "bestseller" },
    delivered: { labelTr: "Teslim Edildi", labelEn: "Delivered", variant: "free-shipping" },
    cancelled: { labelTr: "İptal Edildi", labelEn: "Cancelled", variant: "coupon" },
  };

  const badgeInfo = statusBadges[order.status] || statusBadges.confirmed;

  const handleReorder = () => {
    order.sellerGroups.forEach((g) => {
      g.items.forEach((item) => {
        addToCart(item.product, item.quantity, item.selectedColor, item.selectedSize);
      });
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4 hover:border-slate-300 transition-all">
      {/* Top Order Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-black text-text-main text-sm">{order.orderNumber}</span>
          <span className="text-text-subtle">•</span>
          <span className="text-text-muted font-medium">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={badgeInfo.variant} size="sm">
            {language === "en" ? badgeInfo.labelEn : badgeInfo.labelTr}
          </Badge>
        </div>
      </div>

      {/* Product Thumbnails Preview */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {order.sellerGroups.flatMap((g) => g.items).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100 shrink-0">
            <img src={item.product.imageUrl} alt="" className="w-12 h-14 object-cover rounded border border-slate-200" />
            <div className="flex flex-col text-xs min-w-0 max-w-[140px]">
              <span className="font-bold text-text-main truncate">{item.product.name}</span>
              <span className="text-[11px] text-text-muted">{item.quantity} Adet</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-text-muted">
          <span>{totalItemsCount} Ürün</span>
          <span>•</span>
          <span>Toplam: <strong className="text-primary text-sm font-extrabold">{formatCurrency(order.calculation.grandTotal, currency)}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReorder}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-text-main font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tekrar Sipariş Et</span>
          </button>

          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
          >
            <span>Sipariş Detayı</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
