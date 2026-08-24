import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getPageBySlug } from "@/lib/cms/page-repository";
import { StorefrontPageRenderer } from "@/components/cms/storefront-page-renderer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return {
      title: "Sayfa Bulunamadı | Cadde Store",
      description: "Aradığınız sayfa bulunamadı.",
    };
  }

  return {
    title: page.metaTitleTr || `${page.titleTr} | Cadde Store`,
    description: page.metaDescriptionTr || `${page.titleTr} - Cadde Store Türkiye Pazaryeri`,
  };
}

export default async function DynamicCmsStorefrontPage({ params }: PageProps) {
  const { slug } = params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: page.titleTr },
          ]}
        />

        <StorefrontPageRenderer
          page={{
            id: page.id,
            slug: page.slug,
            titleTr: page.titleTr,
            titleEn: page.titleEn,
            type: page.type,
            status: page.status,
            sectionsJson: page.sectionsJson,
            metaTitleTr: page.metaTitleTr,
            metaTitleEn: page.metaTitleEn,
            metaDescriptionTr: page.metaDescriptionTr,
            metaDescriptionEn: page.metaDescriptionEn,
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
