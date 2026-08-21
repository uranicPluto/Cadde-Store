import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cadde Store — Turkish Multi-Vendor Marketplace",
  description: "Turkish Multi-Vendor E-Commerce Marketplace Frontend & Reusable Design System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-background text-text-main antialiased min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
