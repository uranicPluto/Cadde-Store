import React, { useState } from "react";
import { DetailedProductMock } from "@/lib/catalog/product-repository";
import { Modal } from "@/components/ui/modal";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { ShoppingBag, Heart, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DetailedProductMock | null;
  onToastMessage?: (msg: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  onClose,
  product,
  onToastMessage,
}) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const favActive = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor || product.attributes?.color?.[0], selectedSize || product.attributes?.sizes?.[0]);
    onToastMessage?.(t("header.cartSummary", { count: 1 }) + `: ${product.name}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("designSystem.modalTitle")} size="lg">
      <div className="flex flex-col md:flex-row gap-6 p-1 text-text-main">
        {/* Product Image Preview */}
        <div className="w-full md:w-1/2 aspect-3/4 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges?.bestseller && <Badge variant="bestseller" size="sm">{t("badges.bestseller")}</Badge>}
            {product.badges?.fastDelivery && <Badge variant="fast-delivery" size="sm">{t("badges.fastDelivery")}</Badge>}
          </div>
        </div>

        {/* Product Details & Selection */}
        <div className="w-full md:w-1/2 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-primary uppercase tracking-wider">{product.brand}</span>
              <span className="text-[11px] text-text-subtle font-medium">{product.storeName}</span>
            </div>

            <h2 className="text-base font-bold leading-snug text-text-main">{product.name}</h2>

            <div className="flex items-center gap-2 mt-1">
              <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-slate-100">
              <Price price={product.price} originalPrice={product.originalPrice} size="lg" />
            </div>

            {/* Colors */}
            {product.attributes?.color && product.attributes.color.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-xs font-semibold text-text-muted">{t("filters.size")} / Color</span>
                <div className="flex flex-wrap gap-2">
                  {product.attributes.color.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`text-xs px-2.5 py-1 rounded border font-semibold transition-colors ${
                        (selectedColor || product.attributes?.color?.[0]) === col
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-text-main border-slate-200"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.attributes?.sizes && product.attributes.sizes.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2">
                <span className="text-xs font-semibold text-text-muted">{t("filters.size")}</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.attributes.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs px-3 py-1 rounded border font-bold transition-colors ${
                        (selectedSize || product.attributes?.sizes?.[0]) === sz
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-text-main border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="add-to-cart"
                size="md"
                onClick={handleAddToCart}
                className="flex-1 font-bold shadow-md"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                <span>{t("productCard.addToCart")}</span>
              </Button>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`p-3 rounded-md border transition-colors ${
                  favActive ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
                }`}
                title={favActive ? t("productCard.removeFavorite") : t("productCard.addFavorite")}
              >
                <Heart className={`w-5 h-5 ${favActive ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="text-xs font-bold text-primary hover:underline text-center flex items-center justify-center gap-1 py-1"
            >
              <span>View Full Product Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
