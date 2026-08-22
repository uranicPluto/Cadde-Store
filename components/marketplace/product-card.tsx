import React, { useState } from "react";
import Link from "next/link";
import { ProductMock } from "@/lib/mock-data";
import { createSlug } from "@/lib/catalog/slug-utils";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Eye, Flame, Rocket, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { useCart } from "@/lib/cart/cart-context";
import { DetailedProductMock, getFullCatalog } from "@/lib/catalog/product-repository";

export interface ProductCardProps {
  product: ProductMock | DetailedProductMock;
  onAddToCart?: (product: any) => void;
  onFavoriteToggle?: (productId: string, isFav: boolean) => void;
  onQuickView?: (product: any) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onFavoriteToggle,
  onQuickView,
  className,
}) => {
  const { language, currency, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const isEn = language === "en";
  const productSlug = (product as DetailedProductMock).slug || createSlug(product.name);
  const favActive = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product.id);
    onFavoriteToggle?.(product.id, !favActive);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const fullCatalog = getFullCatalog(language);
    const fullItem = fullCatalog.find((p) => p.id === product.id) || {
      id: product.id,
      slug: productSlug,
      name: product.name,
      brand: product.brand,
      categorySlug: "women",
      categoryName: "Kadın Giyim",
      storeName: product.storeName,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      imageUrl: product.imageUrl,
      galleryImages: [product.imageUrl],
      badges: product.badges,
      description: "",
      specifications: {},
      stock: 20,
      reviews: [],
    };

    addToCart(fullItem);
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onQuickView?.(product);
  };

  // Trendyol campaign price calculation
  const checkoutPrice = product.originalPrice ? product.price : Math.round(product.price * 0.92 * 100) / 100;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Product card: ${product.name}`}
      className={cn(
        "group relative bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-primary/50 hover:shadow-lg select-none",
        className
      )}
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-3/4 bg-slate-100 overflow-hidden">
        {/* Main Product Image Link */}
        <Link href={`/product/${productSlug}`} className="block w-full h-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Favorite Round Button Top-Right */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="favorite"
            size="sm"
            isFavoriteActive={favActive}
            onClick={handleFavoriteClick}
            aria-label={favActive ? t("productCard.removeFavorite") : t("productCard.addFavorite")}
            className="w-8 h-8 rounded-full shadow-md bg-white/90 hover:bg-white text-slate-700"
          />
        </div>

        {/* Trendyol-Style BEST SELLER Round Badge Overlay Top-Left */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
          {product.rating >= 4.8 && (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-[9px] uppercase leading-tight flex flex-col items-center justify-center text-center shadow-md rotate-[-6deg] border border-white/40">
              <span>BEST</span>
              <span>SELLER</span>
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-primary text-white font-black text-[9px] uppercase leading-tight flex flex-col items-center justify-center text-center shadow-md rotate-[4deg] border border-white/40">
              <span>GREAT</span>
              <span>PRICE</span>
            </div>
          )}
        </div>

        {/* Free Shipping Strip at Bottom of Image */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2 text-center tracking-wide uppercase">
          {isEn ? "Free Shipping" : "Kargo Bedava"}
        </div>

        {/* Quick View Button on Hover */}
        {isHovered && (
          <div className="absolute inset-x-2 bottom-8 z-10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150 hidden sm:block">
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-white/95 backdrop-blur-xs text-xs font-bold shadow-lg hover:bg-white text-slate-900 border border-slate-200"
              onClick={handleQuickView}
            >
              <Eye className="w-3.5 h-3.5 text-primary mr-1" />
              <span>{t("productCard.quickView")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
        <div className="flex flex-col gap-1">
          {/* Brand & Store Name */}
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="font-extrabold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
              {product.brand}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 line-clamp-1">
              {product.storeName}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${productSlug}`}>
            <h3 className="text-xs text-slate-800 font-medium leading-snug line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Social Proof Purchase Badge */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 w-fit mt-0.5">
            <Rocket className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{isEn ? "10K+ bought in last 3 days" : "Son 3 günde 10 bin+ satıldı!"}</span>
          </div>

          {/* Rating */}
          <div className="mt-1">
            <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>
        </div>

        {/* Pricing Block with At-Checkout Special Highlight */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isEn ? "Cadde Plus Price:" : "Sepette Son Fiyat:"}</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-rose-600">
                {formatCurrency(checkoutPrice, currency)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  {formatCurrency(product.originalPrice, currency)}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="add-to-cart"
            size="sm"
            onClick={handleAddToCart}
            className="w-full text-xs font-bold py-2 min-h-[36px] bg-primary hover:bg-primary/90 text-white shadow-xs rounded-lg mt-1"
          >
            {t("productCard.addToCart")}
          </Button>
        </div>
      </div>
    </div>
  );
};
