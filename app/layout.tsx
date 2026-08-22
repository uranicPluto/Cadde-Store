import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { FavoritesProvider } from "@/lib/favorites/favorites-context";
import { RecentlyViewedProvider } from "@/lib/recently-viewed/recently-viewed-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cadde Store — Türkiye'nin Çok Satıcılı Pazaryeri",
  description: "Türkiye'nin en hızlı büyüyen çok satıcılı e-ticaret pazaryeri platformu. Milyonlarca ürün, hızlı teslimat ve güvenli ödeme.",
  manifest: "/manifest.json",
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-background text-text-main antialiased min-h-screen">
        <LanguageProvider>
          <CartProvider>
            <FavoritesProvider>
              <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
            </FavoritesProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
