import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DetailedProductMock } from "@/lib/catalog/product-repository";
import { createSlug } from "@/lib/catalog/slug-utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { Image as ImageIcon, Save, ArrowLeft, Tag, Truck, Box } from "lucide-react";

export interface ProductFormProps {
  initialProduct?: DetailedProductMock;
  onSubmit: (product: DetailedProductMock) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
}) => {
  const router = useRouter();
  const { t } = useLanguage();

  const [name, setName] = useState(initialProduct?.name || "");
  const [brand, setBrand] = useState(initialProduct?.brand || "Trend Fashion");
  const [categorySlug, setCategorySlug] = useState(initialProduct?.categorySlug || "men");
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : "299.90");
  const [originalPrice, setOriginalPrice] = useState(initialProduct?.originalPrice ? String(initialProduct.originalPrice) : "399.90");
  const [stock, setStock] = useState(initialProduct?.stock ? String(initialProduct.stock) : "50");
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [freeShipping, setFreeShipping] = useState<boolean>(initialProduct?.badges?.freeShipping ?? true);
  const [fastDelivery, setFastDelivery] = useState<boolean>(initialProduct?.badges?.fastDelivery ?? true);
  const [colorsText, setColorsText] = useState(initialProduct?.attributes?.color?.join(", ") || "Siyah, Beyaz, Mavi");
  const [sizesText, setSizesText] = useState(initialProduct?.attributes?.sizes?.join(", ") || "S, M, L, XL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = parseFloat(price) || 0;
    const numOrig = parseFloat(originalPrice) || undefined;
    const numStock = parseInt(stock, 10) || 0;
    const slug = initialProduct?.slug || createSlug(name);

    const colors = colorsText.split(",").map((s) => s.trim()).filter(Boolean);
    const sizes = sizesText.split(",").map((s) => s.trim()).filter(Boolean);

    const updatedProduct: DetailedProductMock = {
      id: initialProduct?.id || `sp-${Date.now()}`,
      slug,
      name,
      brand,
      categorySlug,
      categoryName: categorySlug === "men" ? "Erkek Giyim" : categorySlug === "women" ? "Kadın Giyim" : "Elektronik",
      storeName: "Trend Fashion Mağazası",
      price: numPrice,
      originalPrice: numOrig,
      rating: initialProduct?.rating || 5.0,
      reviewCount: initialProduct?.reviewCount || 1,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      galleryImages: [imageUrl],
      badges: {
        freeShipping,
        fastDelivery,
        bestseller: initialProduct?.badges?.bestseller || false,
      },
      attributes: { color: colors, sizes: sizes },
      description: description || name,
      specifications: { "Kumaş Tipi": "%100 Pamuk", Menşei: "Türkiye" },
      stock: numStock,
      reviews: initialProduct?.reviews || [],
    };

    onSubmit(updatedProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("seller.productForm.cancel")}</span>
        </button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={() => router.back()} className="font-bold text-xs">
            {t("seller.productForm.saveDraft")}
          </Button>
          <Button variant="primary" size="sm" type="submit" className="font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-1.5" />
            <span>{t("seller.productForm.publishProduct")}</span>
          </Button>
        </div>
      </div>

      {/* 1. Basic Information Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
          <Box className="w-4 h-4 text-primary" />
          <span>{t("seller.productForm.basicInfo")}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-bold text-text-muted">{t("seller.productForm.productName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("seller.productForm.productNamePlaceholder")}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.brand")}</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.category")}</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
            >
              <option value="men">Erkek Giyim (men)</option>
              <option value="women">Kadın Giyim (women)</option>
              <option value="electronics">Elektronik (electronics)</option>
              <option value="shoes-bags">Ayakkabı & Çanta (shoes-bags)</option>
              <option value="home-living">Ev & Yaşam (home-living)</option>
              <option value="beauty-care">Kozmetik & Bakım (beauty-care)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-bold text-text-muted">{t("seller.productForm.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("seller.productForm.descriptionPlaceholder")}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white min-h-[90px]"
            />
          </div>
        </div>
      </div>

      {/* 2. Media & Image Upload */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span>{t("seller.productForm.media")}</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-center text-xs">
          <div className="w-24 h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 w-full">
            <label className="font-bold text-text-muted">{t("seller.productForm.imageUrl")}</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold text-xs"
            />
            <span className="text-[11px] text-text-subtle">{t("seller.productForm.imageUrlHelp")}</span>
          </div>
        </div>
      </div>

      {/* 3. Pricing & Inventory */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
          <Tag className="w-4 h-4 text-primary" />
          <span>{t("seller.productForm.pricingAndStock")}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.sellingPrice")}</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.originalPrice")}</label>
            <input
              type="number"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.stockQuantity")}</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
              required
            />
          </div>
        </div>

        {/* Variants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.colorVariants")}</label>
            <input
              type="text"
              value={colorsText}
              onChange={(e) => setColorsText(e.target.value)}
              placeholder="Siyah, Beyaz, Mavi"
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-text-muted">{t("seller.productForm.sizeVariants")}</label>
            <input
              type="text"
              value={sizesText}
              onChange={(e) => setSizesText(e.target.value)}
              placeholder="S, M, L, XL"
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Shipping Options */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
          <Truck className="w-4 h-4 text-primary" />
          <span>{t("seller.productForm.shippingAndBadges")}</span>
        </h2>

        <div className="flex flex-wrap gap-6 text-xs font-bold">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={freeShipping}
              onChange={(e) => setFreeShipping(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>{t("seller.productForm.showFreeShipping")}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fastDelivery}
              onChange={(e) => setFastDelivery(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>{t("seller.productForm.showFastDelivery")}</span>
          </label>
        </div>
      </div>
    </form>
  );
};
