import prisma from "@/lib/db/prisma";
import { CmsPage, CmsPageVersion } from "@prisma/client";

export type CmsPageType = "LANDING" | "STATIC" | "POLICY" | "CAMPAIGN" | "CUSTOM";
export type CmsPageStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export interface CmsPageInput {
  slug: string;
  titleTr: string;
  titleEn: string;
  type?: CmsPageType | string;
  status?: CmsPageStatus | string;
  sectionsJson?: string | any[];
  metaTitleTr?: string | null;
  metaTitleEn?: string | null;
  metaDescriptionTr?: string | null;
  metaDescriptionEn?: string | null;
  schedulePublishAt?: string | Date | null;
  scheduleUnpublishAt?: string | Date | null;
  authorId?: string | null;
}

export interface PageFilterOptions {
  type?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const DEFAULT_STATIC_PAGES: Array<{
  slug: string;
  titleTr: string;
  titleEn: string;
  type: CmsPageType;
  status: CmsPageStatus;
  metaTitleTr: string;
  metaTitleEn: string;
  metaDescriptionTr: string;
  metaDescriptionEn: string;
  sectionsJson: string;
}> = [
  {
    slug: "about",
    titleTr: "Hakkımızda",
    titleEn: "About Us",
    type: "STATIC",
    status: "PUBLISHED",
    metaTitleTr: "Hakkımızda | Cadde Store",
    metaTitleEn: "About Us | Cadde Store",
    metaDescriptionTr: "Cadde Store Türkiye'nin güvenilir ve yenilikçi pazaryeri platformu.",
    metaDescriptionEn: "Cadde Store is Turkey's trusted and innovative multi-vendor marketplace.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-about-hero",
        type: "RICH_CONTENT",
        titleTR: "Hikayemiz ve Değerlerimiz",
        titleEN: "Our Story and Values",
        orderIndex: 0,
        active: true,
        configJson: {
          subtitleTR: "Kaliteli ürünleri doğrudan güvenilir satıcılardan müşterilerimize ulaştırıyoruz.",
          subtitleEN: "Connecting customers directly with trusted sellers and premium quality products.",
          customHtmlTR: "<div class='prose max-w-none'><p>Cadde Store, modern e-ticaret deneyimini şeffaflık, güvenlik ve müşteri memnuniyeti odağında sunan yeni nesil bir pazaryeridir.</p></div>",
          customHtmlEN: "<div class='prose max-w-none'><p>Cadde Store is a next-generation marketplace delivering modern e-commerce with transparency, security, and top customer satisfaction.</p></div>",
        },
        banners: [],
      },
    ]),
  },
  {
    slug: "contact",
    titleTr: "İletişim & Destek",
    titleEn: "Contact & Support",
    type: "STATIC",
    status: "PUBLISHED",
    metaTitleTr: "İletişim | Cadde Store",
    metaTitleEn: "Contact Us | Cadde Store",
    metaDescriptionTr: "Cadde Store müşteri hizmetleri ve satıcı destek iletişim bilgileri.",
    metaDescriptionEn: "Get in touch with Cadde Store customer support and seller services.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-contact-hero",
        type: "RICH_CONTENT",
        titleTR: "Bizimle İletişime Geçin",
        titleEN: "Get in Touch With Us",
        orderIndex: 0,
        active: true,
        configJson: {
          subtitleTR: "Haftanın her günü 09:00 - 20:00 arası canlı destek hizmetinizdedir.",
          subtitleEN: "Customer support available daily from 09:00 to 20:00.",
          customHtmlTR: "<p>Destek E-posta: destek@cadde.store<br/>Telefon: +90 850 123 45 67<br/>Adres: Maslak Mah. Büyükdere Cad. No: 120 Sarıyer / İstanbul</p>",
          customHtmlEN: "<p>Support Email: destek@cadde.store<br/>Phone: +90 850 123 45 67<br/>Address: Maslak Mah. Buyukdere Cad. No: 120 Sariyer / Istanbul</p>",
        },
        banners: [],
      },
    ]),
  },
  {
    slug: "faq",
    titleTr: "Sıkça Sorulan Sorular",
    titleEn: "Frequently Asked Questions",
    type: "STATIC",
    status: "PUBLISHED",
    metaTitleTr: "Sıkça Sorulan Sorular (SSS) | Cadde Store",
    metaTitleEn: "FAQ | Cadde Store",
    metaDescriptionTr: "Sipariş, kargo, iade ve satıcı süreçleri hakkında en çok merak edilenler.",
    metaDescriptionEn: "Find answers to the most common questions about orders, shipping, and returns.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-faq-content",
        type: "RICH_CONTENT",
        titleTR: "En Çok Merak Edilenler",
        titleEN: "Top FAQ Topics",
        orderIndex: 0,
        active: true,
        configJson: {
          customHtmlTR: "<h3>Siparişim ne zaman kargolanır?</h3><p>Siparişleriniz 24-48 saat içinde kargoya teslim edilir.</p><h3>İade süreci nasıl işler?</h3><p>Teslimattan sonraki 14 gün içinde ücretsiz iade talebi oluşturabilirsiniz.</p>",
          customHtmlEN: "<h3>When will my order ship?</h3><p>Orders are dispatched within 24-48 hours.</p><h3>How does return work?</h3><p>You can create a free return request within 14 days of delivery.</p>",
        },
        banners: [],
      },
    ]),
  },
  {
    slug: "privacy-policy",
    titleTr: "Gizlilik Politikası",
    titleEn: "Privacy Policy",
    type: "POLICY",
    status: "PUBLISHED",
    metaTitleTr: "Gizlilik Politikası | Cadde Store",
    metaTitleEn: "Privacy Policy | Cadde Store",
    metaDescriptionTr: "Kişisel verilerinizin korunması ve gizlilik taahhüdümüz.",
    metaDescriptionEn: "Our commitment to protecting your personal data and privacy.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-privacy-content",
        type: "RICH_CONTENT",
        titleTR: "Kişisel Verilerin Korunması ve Gizlilik İlkeleri",
        titleEN: "Privacy Policy and Data Protection",
        orderIndex: 0,
        active: true,
        configJson: {
          customHtmlTR: "<p>Cadde Store olarak kullanıcılarımızın gizliliğine azami önem veriyoruz. Verileriniz 6698 sayılı KVKK kapsamında işlenmektedir.</p>",
          customHtmlEN: "<p>At Cadde Store, we value user privacy. Your data is processed securely under applicable privacy laws.</p>",
        },
        banners: [],
      },
    ]),
  },
  {
    slug: "terms-of-service",
    titleTr: "Kullanım Koşulları",
    titleEn: "Terms of Service",
    type: "POLICY",
    status: "PUBLISHED",
    metaTitleTr: "Kullanım Koşulları | Cadde Store",
    metaTitleEn: "Terms of Service | Cadde Store",
    metaDescriptionTr: "Cadde Store platform kullanım ve üyelik şartları.",
    metaDescriptionEn: "Terms and conditions for using Cadde Store platform.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-terms-content",
        type: "RICH_CONTENT",
        titleTR: "Platform Kullanım ve Üyelik Sözleşmesi",
        titleEN: "Terms of Service and Membership Agreement",
        orderIndex: 0,
        active: true,
        configJson: {
          customHtmlTR: "<p>Bu platformu kullanarak belirtilen kullanım koşullarını kabul etmiş sayılırsınız.</p>",
          customHtmlEN: "<p>By using this platform, you agree to these terms of service.</p>",
        },
        banners: [],
      },
    ]),
  },
  {
    slug: "kvkk",
    titleTr: "KVKK Aydınlatma Metni",
    titleEn: "KVKK Disclosure Statement",
    type: "POLICY",
    status: "PUBLISHED",
    metaTitleTr: "KVKK Aydınlatma Metni | Cadde Store",
    metaTitleEn: "KVKK Disclosure Statement | Cadde Store",
    metaDescriptionTr: "6698 Sayılı Kanun Kapsamında Kişisel Veri Aydınlatma Metni.",
    metaDescriptionEn: "Personal Data Protection Law disclosure notice.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-kvkk-content",
        type: "RICH_CONTENT",
        titleTR: "KVKK Kapsamında Aydınlatma",
        titleEN: "KVKK Compliance Notice",
        orderIndex: 0,
        active: true,
        configJson: {
          customHtmlTR: "<p>Kişisel verileriniz veri sorumlusu sıfatıyla Cadde Store tarafından güvenle işlenir.</p>",
          customHtmlEN: "<p>Your personal data is processed securely as data controller by Cadde Store.</p>",
        },
        banners: [],
      },
    ]),
  },
  {
    slug: "shipping-and-returns",
    titleTr: "Teslimat ve İade Politikası",
    titleEn: "Shipping & Return Policy",
    type: "POLICY",
    status: "PUBLISHED",
    metaTitleTr: "Teslimat ve İade Politikası | Cadde Store",
    metaTitleEn: "Shipping & Returns | Cadde Store",
    metaDescriptionTr: "Kargo teslimat süreleri ve 14 gün ücretsiz iade garantisi.",
    metaDescriptionEn: "Shipping details and 14-day free return guarantee.",
    sectionsJson: JSON.stringify([
      {
        id: "sec-shipping-content",
        type: "RICH_CONTENT",
        titleTR: "Kargo ve Kolay İade",
        titleEN: "Fast Delivery & Easy Returns",
        orderIndex: 0,
        active: true,
        configJson: {
          customHtmlTR: "<p>200 TL ve üzeri siparişlerde kargo ücretsizdir. Anlaşmalı kargo firmamız Yurtiçi Kargo'dur.</p>",
          customHtmlEN: "<p>Free shipping on orders over 200 TRY. Official carrier partner is Yurtici Kargo.</p>",
        },
        banners: [],
      },
    ]),
  },
];

export async function ensureDefaultStaticPages(): Promise<void> {
  try {
    for (const page of DEFAULT_STATIC_PAGES) {
      const existing = await prisma.cmsPage.findUnique({ where: { slug: page.slug } });
      if (!existing) {
        await prisma.cmsPage.create({
          data: {
            slug: page.slug,
            titleTr: page.titleTr,
            titleEn: page.titleEn,
            type: page.type,
            status: page.status,
            metaTitleTr: page.metaTitleTr,
            metaTitleEn: page.metaTitleEn,
            metaDescriptionTr: page.metaDescriptionTr,
            metaDescriptionEn: page.metaDescriptionEn,
            sectionsJson: page.sectionsJson,
          },
        });
      }
    }
  } catch (error) {
    console.warn("[PageRepository ensureDefaultStaticPages warning]:", error);
  }
}

export async function getAllPages(filters?: PageFilterOptions): Promise<CmsPage[]> {
  const where: any = {};
  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    where.OR = [
      { slug: { contains: search } },
      { titleTr: { contains: search } },
      { titleEn: { contains: search } },
      { metaTitleTr: { contains: search } },
      { metaTitleEn: { contains: search } },
    ];
  }
  return await prisma.cmsPage.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: filters?.limit,
    skip: filters?.offset,
  });
}

export async function getPageById(id: string, includeVersions = false): Promise<(CmsPage & { versions?: CmsPageVersion[] }) | null> {
  return await prisma.cmsPage.findUnique({
    where: { id },
    include: includeVersions ? { versions: { orderBy: { versionNumber: "desc" } } } : undefined,
  });
}

export async function getPageBySlug(slug: string, includeDraft = false): Promise<CmsPage | null> {
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) {
    const fallback = DEFAULT_STATIC_PAGES.find((p) => p.slug === slug);
    if (fallback) {
      const created = await prisma.cmsPage.create({
        data: {
          slug: fallback.slug,
          titleTr: fallback.titleTr,
          titleEn: fallback.titleEn,
          type: fallback.type,
          status: fallback.status,
          metaTitleTr: fallback.metaTitleTr,
          metaTitleEn: fallback.metaTitleEn,
          metaDescriptionTr: fallback.metaDescriptionTr,
          metaDescriptionEn: fallback.metaDescriptionEn,
          sectionsJson: fallback.sectionsJson,
        },
      });
      return created;
    }
    return null;
  }
  if (includeDraft) return page;
  const now = new Date();
  if (page.status === "PUBLISHED") {
    if (page.scheduleUnpublishAt && new Date(page.scheduleUnpublishAt) <= now) return null;
    return page;
  }
  if (page.status === "SCHEDULED") {
    if (page.schedulePublishAt && new Date(page.schedulePublishAt) <= now) {
      if (!page.scheduleUnpublishAt || new Date(page.scheduleUnpublishAt) > now) return page;
    }
  }
  return null;
}

export async function createPage(input: CmsPageInput, authorId?: string): Promise<CmsPage> {
  const sectionsJsonString = typeof input.sectionsJson === "string" ? input.sectionsJson : JSON.stringify(input.sectionsJson || []);
  return await prisma.cmsPage.create({
    data: {
      slug: input.slug.trim().toLowerCase(),
      titleTr: input.titleTr.trim(),
      titleEn: input.titleEn.trim(),
      type: input.type || "CUSTOM",
      status: input.status || "DRAFT",
      sectionsJson: sectionsJsonString,
      metaTitleTr: input.metaTitleTr || null,
      metaTitleEn: input.metaTitleEn || null,
      metaDescriptionTr: input.metaDescriptionTr || null,
      metaDescriptionEn: input.metaDescriptionEn || null,
      schedulePublishAt: input.schedulePublishAt ? new Date(input.schedulePublishAt) : null,
      scheduleUnpublishAt: input.scheduleUnpublishAt ? new Date(input.scheduleUnpublishAt) : null,
      authorId: authorId || input.authorId || null,
    },
  });
}

export async function updatePage(id: string, input: Partial<CmsPageInput>): Promise<CmsPage> {
  const data: any = {};
  if (input.slug !== undefined) data.slug = input.slug.trim().toLowerCase();
  if (input.titleTr !== undefined) data.titleTr = input.titleTr.trim();
  if (input.titleEn !== undefined) data.titleEn = input.titleEn.trim();
  if (input.type !== undefined) data.type = input.type;
  if (input.status !== undefined) data.status = input.status;
  if (input.sectionsJson !== undefined) {
    data.sectionsJson = typeof input.sectionsJson === "string" ? input.sectionsJson : JSON.stringify(input.sectionsJson);
  }
  if (input.metaTitleTr !== undefined) data.metaTitleTr = input.metaTitleTr;
  if (input.metaTitleEn !== undefined) data.metaTitleEn = input.metaTitleEn;
  if (input.metaDescriptionTr !== undefined) data.metaDescriptionTr = input.metaDescriptionTr;
  if (input.metaDescriptionEn !== undefined) data.metaDescriptionEn = input.metaDescriptionEn;
  if (input.schedulePublishAt !== undefined) {
    data.schedulePublishAt = input.schedulePublishAt ? new Date(input.schedulePublishAt) : null;
  }
  if (input.scheduleUnpublishAt !== undefined) {
    data.scheduleUnpublishAt = input.scheduleUnpublishAt ? new Date(input.scheduleUnpublishAt) : null;
  }
  return await prisma.cmsPage.update({ where: { id }, data });
}

export async function deletePage(id: string): Promise<boolean> {
  await prisma.cmsPage.delete({ where: { id } });
  return true;
}

export async function publishPage(id: string, publishedBy?: string, changeSummary?: string): Promise<{ page: CmsPage; version: CmsPageVersion }> {
  const page = await prisma.cmsPage.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (!page) throw new Error(`CmsPage with id ${id} not found.`);
  const nextVersionNumber = page.versions.length > 0 ? page.versions[0].versionNumber + 1 : 1;
  const snapshot = {
    id: page.id,
    slug: page.slug,
    titleTr: page.titleTr,
    titleEn: page.titleEn,
    type: page.type,
    sectionsJson: page.sectionsJson,
    metaTitleTr: page.metaTitleTr,
    metaTitleEn: page.metaTitleEn,
    metaDescriptionTr: page.metaDescriptionTr,
    metaDescriptionEn: page.metaDescriptionEn,
    schedulePublishAt: page.schedulePublishAt,
    scheduleUnpublishAt: page.scheduleUnpublishAt,
    snapshotTimestamp: new Date().toISOString(),
  };
  const version = await prisma.cmsPageVersion.create({
    data: {
      pageId: page.id,
      versionNumber: nextVersionNumber,
      snapshotJson: JSON.stringify(snapshot),
      publishedBy: publishedBy || null,
      changeSummary: changeSummary || `Published version ${nextVersionNumber}`,
    },
  });
  const updatedPage = await prisma.cmsPage.update({
    where: { id },
    data: { status: "PUBLISHED", publishedVersionId: version.id },
  });
  return { page: updatedPage, version };
}

export async function unpublishPage(id: string): Promise<CmsPage> {
  return await prisma.cmsPage.update({ where: { id }, data: { status: "DRAFT" } });
}

export async function duplicatePage(id: string, newSlug?: string, newTitleTr?: string, newTitleEn?: string): Promise<CmsPage> {
  const original = await prisma.cmsPage.findUnique({ where: { id } });
  if (!original) throw new Error(`Cannot duplicate: Page ${id} not found.`);
  const generatedSlug = newSlug || `${original.slug}-copy-${Date.now().toString().slice(-6)}`;
  const titleTr = newTitleTr || `${original.titleTr} (Kopya)`;
  const titleEn = newTitleEn || `${original.titleEn} (Copy)`;
  return await prisma.cmsPage.create({
    data: {
      slug: generatedSlug.toLowerCase(),
      titleTr,
      titleEn,
      type: original.type,
      status: "DRAFT",
      sectionsJson: original.sectionsJson,
      metaTitleTr: original.metaTitleTr,
      metaTitleEn: original.metaTitleEn,
      metaDescriptionTr: original.metaDescriptionTr,
      metaDescriptionEn: original.metaDescriptionEn,
    },
  });
}

export async function getPageVersions(pageId: string): Promise<CmsPageVersion[]> {
  return await prisma.cmsPageVersion.findMany({ where: { pageId }, orderBy: { versionNumber: "desc" } });
}

export async function rollbackPageVersion(pageId: string, versionId: string, revertedBy?: string): Promise<CmsPage> {
  const version = await prisma.cmsPageVersion.findUnique({ where: { id: versionId } });
  if (!version || version.pageId !== pageId) throw new Error(`Version ${versionId} for page ${pageId} not found.`);
  const snapshot = JSON.parse(version.snapshotJson || "{}");
  return await prisma.cmsPage.update({
    where: { id: pageId },
    data: {
      titleTr: snapshot.titleTr,
      titleEn: snapshot.titleEn,
      sectionsJson: snapshot.sectionsJson || "[]",
      metaTitleTr: snapshot.metaTitleTr,
      metaTitleEn: snapshot.metaTitleEn,
      metaDescriptionTr: snapshot.metaDescriptionTr,
      metaDescriptionEn: snapshot.metaDescriptionEn,
      status: "DRAFT",
    },
  });
}

