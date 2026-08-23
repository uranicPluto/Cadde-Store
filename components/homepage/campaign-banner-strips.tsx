import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { ArrowRight, Sparkles, Clock, Tag, Flame } from "lucide-react";

interface CampaignItem {
  id: string;
  dateRange: string;
  title: string;
  subtitle: string;
  link: string;
  bgGradient: string;
  img1: string;
  img2: string;
}

export const CampaignBannerStrips: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const defaultCampaigns: CampaignItem[] = [
    {
      id: "c1",
      dateRange: "17 Jul – 31 Dec",
      title: isEn ? "Fast Delivery in Men's Fashion" : "Erkek Modasında Hızlı Teslimat",
      subtitle: isEn ? "Men's Summer Styles & Basic Tees" : "Erkek Yaz Sezonu & Tişört Fırsatları",
      link: "/category/men",
      bgGradient: "bg-gradient-to-r from-amber-500 to-orange-600",
      img1: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
      img2: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "c2",
      dateRange: "14 Apr – 31 Aug",
      title: isEn ? "Seasonal Picks for Men's Shirts" : "Sezonun En Çok Satan Gömlekleri",
      subtitle: isEn ? "Don't miss out on extra 20% deals" : "Sepette ekstra %20 indirim fırsatını kaçırmayın",
      link: "/category/men",
      bgGradient: "bg-gradient-to-r from-amber-600 to-yellow-600",
      img1: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80",
      img2: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "c3",
      dateRange: "01 Jun – 31 Oct",
      title: isEn ? "Refurbished Tech & Audio Deals" : "Yenilenmiş Teknoloji & Kulaklık Fırsatları",
      subtitle: isEn ? "Discover trending wireless headphones" : "En popüler kablosuz kulaklıkları keşfedin",
      link: "/category/electronics",
      bgGradient: "bg-gradient-to-r from-indigo-600 to-blue-700",
      img1: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
      img2: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "c4",
      dateRange: "01 Jun – 01 Sep",
      title: isEn ? "Women's Chic Evening Dresses" : "Kadın Şık Gece & Midi Elbiseler",
      subtitle: isEn ? "Must-grab items for autumn events" : "Sonbahar davetleri için kaçırılmayacak elbiseler",
      link: "/category/women",
      bgGradient: "bg-gradient-to-r from-rose-500 to-pink-600",
      img1: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80",
      img2: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "c5",
      dateRange: "10 Jul – 31 Aug",
      title: isEn ? "Airfryer & Kitchen Super Deals" : "Airfryer & Mutfak Süper Fırsatları",
      subtitle: isEn ? "Buy 2 get 10% instant checkout discount" : "2 ürün alana sepette anında %10 indirim",
      link: "/category/home-living",
      bgGradient: "bg-gradient-to-r from-rose-600 to-red-700",
      img1: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=300&q=80",
      img2: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: "c6",
      dateRange: "04 Jul – 30 Sep",
      title: isEn ? "Original Sneakers & Running Shoes" : "Orijinal Spor Ayakkabı & Sneaker Fırsatları",
      subtitle: isEn ? "Free shipping on top global brands" : "Dünya markalarında ücretsiz kargo fırsatı",
      link: "/category/shoes-bags",
      bgGradient: "bg-gradient-to-r from-cyan-600 to-teal-700",
      img1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
      img2: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const [campaigns, setCampaigns] = useState<CampaignItem[]>(defaultCampaigns);

  useEffect(() => {
    async function fetchCampaignSections() {
      try {
        const res = await fetch("/api/cms/sections");
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          const stripSection = data.sections.find(
            (s: any) => s.type === "BANNER_STRIP" || s.type === "CAMPAIGN_STRIP"
          );
          if (stripSection && stripSection.banners && stripSection.banners.length > 0) {
            const gradients = [
              "bg-gradient-to-r from-amber-500 to-orange-600",
              "bg-gradient-to-r from-amber-600 to-yellow-600",
              "bg-gradient-to-r from-indigo-600 to-blue-700",
              "bg-gradient-to-r from-rose-500 to-pink-600",
              "bg-gradient-to-r from-rose-600 to-red-700",
              "bg-gradient-to-r from-cyan-600 to-teal-700",
            ];

            const dynamicCampaigns: CampaignItem[] = stripSection.banners.map(
              (b: any, idx: number) => ({
                id: b.id,
                dateRange: isEn
                  ? b.badgeTextEN || b.badgeTextTR || "Limited Time"
                  : b.badgeTextTR || b.badgeTextEN || "Sınırlı Süre",
                title: isEn ? b.titleEN || b.titleTR || "Special Offer" : b.titleTR || b.titleEN || "Özel Fırsat",
                subtitle: isEn ? b.subtitleEN || b.subtitleTR || "" : b.subtitleTR || b.subtitleEN || "",
                link: b.targetValue || "/category/women",
                bgGradient: gradients[idx % gradients.length],
                img1: b.imageUrlDesktop,
                img2: b.imageUrlMobile || b.imageUrlDesktop,
              })
            );

            setCampaigns(dynamicCampaigns);
            return;
          }
        }
        setCampaigns(defaultCampaigns);
      } catch (err) {
        setCampaigns(defaultCampaigns);
      }
    }

    fetchCampaignSections();
  }, [language, isEn]);

  return (
    <section className="w-full bg-slate-100 py-8 border-b border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600 fill-rose-600" />
              <span>{isEn ? "Special Campaign Highlights" : "Özel Kampanya Fırsatları"}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isEn ? "Exclusive brand promotions, bundle discounts, and seasonal campaigns." : "Sınırlı süreye özel marka indirimleri, sepet fırsatları ve sezon kampanyaları."}
            </p>
          </div>
        </div>

        {/* Multi-Column Visual Campaign Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={c.link}
              className={`relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${c.bgGradient} text-white flex items-center justify-between p-4 group select-none cursor-pointer`}
            >
              {/* Top Date Range Badge */}
              <div className="absolute top-2 right-3 bg-black/40 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded text-white/90 flex items-center gap-1 z-10">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{c.dateRange}</span>
              </div>

              {/* Dual Product Thumbnail Preview */}
              <div className="flex items-center gap-2 shrink-0 z-10">
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white p-1 shadow-md transform -rotate-2 group-hover:rotate-0 transition-transform">
                  <img src={c.img1} alt="" className="w-full h-full object-cover rounded" />
                </div>
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-white p-1 shadow-md transform rotate-2 group-hover:rotate-0 transition-transform">
                  <img src={c.img2} alt="" className="w-full h-full object-cover rounded" />
                </div>
              </div>

              {/* Campaign Content */}
              <div className="flex flex-col items-start justify-center gap-1.5 flex-1 pl-4 z-10">
                <h3 className="text-sm font-extrabold leading-tight tracking-tight text-white group-hover:underline">
                  {c.title}
                </h3>
                <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-tight">
                  {c.subtitle}
                </p>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-black bg-white/20 hover:bg-white text-white hover:text-slate-900 px-2.5 py-1 rounded-md transition-colors">
                  <span>{isEn ? "Shop Now" : "Fırsatı İncele"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
