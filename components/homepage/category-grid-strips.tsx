import React from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getMockCategories } from "@/lib/mock-data";
import { Shirt, User, Footprints, Smartphone, Home, Sparkles, Activity, ShoppingBag, ArrowRight } from "lucide-react";

export const CategoryGridStrips: React.FC = () => {
  const { language, t } = useLanguage();
  const categories = getMockCategories(language);

  const categoryIcons: Record<string, React.ReactNode> = {
    Shirt: <Shirt className="w-5 h-5 text-rose-500" />,
    User: <User className="w-5 h-5 text-indigo-500" />,
    Footprints: <Footprints className="w-5 h-5 text-amber-500" />,
    Smartphone: <Smartphone className="w-5 h-5 text-purple-500" />,
    Home: <Home className="w-5 h-5 text-emerald-500" />,
    Sparkles: <Sparkles className="w-5 h-5 text-pink-500" />,
    Activity: <Activity className="w-5 h-5 text-blue-500" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5 text-orange-500" />,
  };

  return (
    <section className="w-full bg-white py-8 border-b border-slate-200">
      <div className="max-w-wide mx-auto px-4 sm:px-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            {t("homepage.categoryStripsTitle")}
          </h2>
          <a href="#" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span>{t("homepage.viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((c) => (
            <a
              key={c.id}
              href="#"
              className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all text-center gap-2 group shadow-2xs"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                {categoryIcons[c.icon] || <Shirt className="w-5 h-5 text-primary" />}
              </div>
              <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">
                {c.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
