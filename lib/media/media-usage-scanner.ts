import prisma from "@/lib/db/prisma";

export interface MediaUsageRecord {
  entityType: "PRODUCT" | "CATEGORY" | "BRAND" | "BANNER" | "CMS_PAGE" | "APPEARANCE";
  entityId: string;
  entityName: string;
  fieldName: string;
}

export interface MediaScanResult {
  url: string;
  referenceCount: number;
  usages: MediaUsageRecord[];
  isUsed: boolean;
}

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.trim().toLowerCase();
}

function urlMatches(targetUrl: string, candidateUrl: string | null | undefined): boolean {
  if (!candidateUrl) return false;
  const targetNorm = normalizeUrl(targetUrl);
  const candNorm = normalizeUrl(candidateUrl);
  if (!targetNorm || !candNorm) return false;
  return candNorm === targetNorm || candNorm.includes(targetNorm) || targetNorm.includes(candNorm);
}

export async function scanMediaAssetUsage(targetUrl: string): Promise<MediaScanResult> {
  const usages: MediaUsageRecord[] = [];
  const normalizedTarget = normalizeUrl(targetUrl);

  if (!normalizedTarget) {
    return { url: targetUrl, referenceCount: 0, usages: [], isUsed: false };
  }

  // 1. Scan Products
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, imageUrl: true, images: true },
    });

    for (const p of products) {
      if (urlMatches(normalizedTarget, p.imageUrl)) {
        usages.push({
          entityType: "PRODUCT",
          entityId: p.id,
          entityName: p.name,
          fieldName: "imageUrl",
        });
      }
      if (p.images) {
        try {
          const imgs = JSON.parse(p.images);
          if (Array.isArray(imgs)) {
            for (const img of imgs) {
              if (urlMatches(normalizedTarget, typeof img === "string" ? img : img?.url)) {
                usages.push({
                  entityType: "PRODUCT",
                  entityId: p.id,
                  entityName: p.name,
                  fieldName: "images[]",
                });
                break;
              }
            }
          }
        } catch {
          if (typeof p.images === "string" && urlMatches(normalizedTarget, p.images)) {
            usages.push({
              entityType: "PRODUCT",
              entityId: p.id,
              entityName: p.name,
              fieldName: "images",
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("[MediaScanner scanMediaAssetUsage Products error]:", err);
  }

  // 2. Scan Categories
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, nameTR: true, imageUrl: true },
    });

    for (const c of categories) {
      if (urlMatches(normalizedTarget, c.imageUrl)) {
        usages.push({
          entityType: "CATEGORY",
          entityId: c.id,
          entityName: c.nameTR,
          fieldName: "imageUrl",
        });
      }
    }
  } catch (err) {
    console.warn("[MediaScanner scanMediaAssetUsage Categories error]:", err);
  }

  // 3. Scan Brands
  try {
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true, logoUrl: true, bannerUrl: true },
    });

    for (const b of brands) {
      if (urlMatches(normalizedTarget, b.logoUrl)) {
        usages.push({
          entityType: "BRAND",
          entityId: b.id,
          entityName: b.name,
          fieldName: "logoUrl",
        });
      }
      if (urlMatches(normalizedTarget, b.bannerUrl)) {
        usages.push({
          entityType: "BRAND",
          entityId: b.id,
          entityName: b.name,
          fieldName: "bannerUrl",
        });
      }
    }
  } catch (err) {
    console.warn("[MediaScanner scanMediaAssetUsage Brands error]:", err);
  }

  // 4. Scan Banners
  try {
    const banners = await prisma.banner.findMany({
      select: { id: true, titleTR: true, imageUrlDesktop: true, imageUrlMobile: true },
    });

    for (const bn of banners) {
      if (urlMatches(normalizedTarget, bn.imageUrlDesktop)) {
        usages.push({
          entityType: "BANNER",
          entityId: bn.id,
          entityName: bn.titleTR || "Banner Desktop",
          fieldName: "imageUrlDesktop",
        });
      }
      if (urlMatches(normalizedTarget, bn.imageUrlMobile)) {
        usages.push({
          entityType: "BANNER",
          entityId: bn.id,
          entityName: bn.titleTR || "Banner Mobile",
          fieldName: "imageUrlMobile",
        });
      }
    }
  } catch (err) {
    console.warn("[MediaScanner scanMediaAssetUsage Banners error]:", err);
  }

  // 5. Scan CMS Pages
  try {
    const pages = await prisma.cmsPage.findMany({
      select: { id: true, titleTr: true, slug: true, sectionsJson: true },
    });

    for (const page of pages) {
      if (page.sectionsJson && page.sectionsJson.includes(normalizedTarget)) {
        usages.push({
          entityType: "CMS_PAGE",
          entityId: page.id,
          entityName: `${page.titleTr} (/${page.slug})`,
          fieldName: "sectionsJson",
        });
      }
    }
  } catch (err) {
    console.warn("[MediaScanner scanMediaAssetUsage CMS Pages error]:", err);
  }

  // 6. Scan Appearance Settings
  try {
    const appearance = await prisma.appearanceSettings.findUnique({
      where: { id: "default" },
    });

    if (appearance) {
      if (urlMatches(normalizedTarget, appearance.logoUrl)) {
        usages.push({
          entityType: "APPEARANCE",
          entityId: "default",
          entityName: "Site Header Logo",
          fieldName: "logoUrl",
        });
      }
      if (urlMatches(normalizedTarget, appearance.faviconUrl)) {
        usages.push({
          entityType: "APPEARANCE",
          entityId: "default",
          entityName: "Site Favicon",
          fieldName: "faviconUrl",
        });
      }
    }
  } catch (err) {
    console.warn("[MediaScanner scanMediaAssetUsage Appearance error]:", err);
  }

  return {
    url: targetUrl,
    referenceCount: usages.length,
    usages,
    isUsed: usages.length > 0,
  };
}

export async function canDeleteMediaAsset(url: string): Promise<{
  canDelete: boolean;
  referenceCount: number;
  usageLocations: string[];
}> {
  const scan = await scanMediaAssetUsage(url);
  return {
    canDelete: scan.referenceCount === 0,
    referenceCount: scan.referenceCount,
    usageLocations: scan.usages.map((u) => `${u.entityType}: ${u.entityName} [${u.fieldName}]`),
  };
}

export async function scanAllMediaAssetsUsage(): Promise<Record<string, MediaScanResult>> {
  const results: Record<string, MediaScanResult> = {};
  try {
    const mediaAssets = await prisma.mediaAsset.findMany({
      select: { id: true, url: true },
    });

    for (const asset of mediaAssets) {
      results[asset.id] = await scanMediaAssetUsage(asset.url);
    }
  } catch (err) {
    console.warn("[MediaScanner scanAllMediaAssetsUsage error]:", err);
  }
  return results;
}

