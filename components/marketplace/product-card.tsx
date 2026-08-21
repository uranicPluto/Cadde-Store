import React, { useState } from "react";
import Link from "next/link";
import { ProductMock } from "@/lib/mock-data";
import { createSlug } from "@/lib/catalog/slug-utils";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
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
  const { language, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

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
    
    // Find detailed product or build minimal mock for cart
    const fullCatalog = getFullCatalog(language);
    const fullItem = fullCatalog.find((p) => p.id === product.id) || {
      id: product.id,
      slug: productSlug,
      name: product.name,
      brand: product.brand,
      categorySlug: "general",
      categoryName: "General",
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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      aria-label={`Product card: ${product.name}`}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-slate-300 hover:shadow-md",
        className
      )}
    >
      {/* Top Badges & Image Overlay */}
      <div className="relative w-full aspect-3/4 bg-slate-100 overflow-hidden">
        {/* Product Image Link */}
        <Link href={`/product/${productSlug}`} className="block w-full h-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Favorite Icon Button */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="favorite"
            size="sm"
            isFavoriteActive={favActive}
            onClick={handleFavoriteClick}
            aria-label={favActive ? t("productCard.removeFavorite") : t("productCard.addFavorite")}
          />
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start max-w-[80%] pointer-events-none">
          {product.badges?.bestseller && (
            <Badge variant="bestseller" size="sm">{t("badges.bestseller")}</Badge>
          )}
          {product.badges?.campaign && (
            <Badge variant="campaign" size="sm">
              {product.badges.campaign === "Spor Festivali" || product.badges.campaign === "Sports Festival"
                ? t("badges.sportsFestival")
                : product.badges.campaign}
            </Badge>
          )}
          {product.badges?.coupon && (
            <Badge variant="coupon" size="sm">{product.badges.coupon}</Badge>
          )}
        </div>

        {/* Quick View Button on Hover */}
        {isHovered && (
          <div className="absolute inset-x-2 bottom-2 z-10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150 hidden sm:block">
            <Button
              variant="secondary"
              size="sm"
              className="w-full bg-white/95 backdrop-blur-xs text-xs font-semibold shadow-md hover:bg-white text-text-main"
              onClick={handleQuickView}
            >
              <Eye className="w-3.5 h-3.5 text-text-muted" />
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
            <span className="font-bold text-text-main hover:text-primary transition-colors line-clamp-1">
              {product.brand}
            </span>
            <span className="text-[10px] text-text-subtle line-clamp-1">
              {product.storeName}
            </span>
          </div>

          {/* Product Name Title */}
          <Link href={`/product/${productSlug}`}>
            <h3 className="text-xs text-text-main font-normal leading-snug line-clamp-2 min-h-[32px] group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-0.5">
            <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>

          {/* Delivery & Shipping Badges */}
          <div className="flex flex-wrap gap-1 mt-1">
            {product.badges?.fastDelivery && (
              <Badge variant="fast-delivery" size="sm">{t("badges.fastDelivery")}</Badge>
            )}
            {product.badges?.freeShipping && (
              <Badge variant="free-shipping" size="sm">{t("badges.freeShipping")}</Badge>
            )}
          </div>
        </div>

        {/* Bottom Price & Add-to-cart */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <Price
            price={product.price}
            originalPrice={product.originalPrice}
            size="md"
          />

          <Button
            variant="add-to-cart"
            size="sm"
            onClick={handleAddToCart}
            className="w-full text-xs font-semibold py-1.5 min-h-[34px]"
          >
            {t("productCard.addToCart")}
          </Button>
        </div>
      </div>
    </div>
  );
};
