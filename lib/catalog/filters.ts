import { DetailedProductMock } from "./product-repository";

export interface FilterCriteria {
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  fastDeliveryOnly?: boolean;
  freeShippingOnly?: boolean;
  selectedSizes?: string[];
  selectedColors?: string[];
}

export function filterProducts(products: DetailedProductMock[], criteria: FilterCriteria): DetailedProductMock[] {
  return products.filter((p) => {
    // Brand filter
    if (criteria.brands && criteria.brands.length > 0) {
      if (!criteria.brands.includes(p.brand)) return false;
    }

    // Min / Max Price
    if (criteria.minPrice !== undefined && criteria.minPrice > 0) {
      if (p.price < criteria.minPrice) return false;
    }
    if (criteria.maxPrice !== undefined && criteria.maxPrice > 0) {
      if (p.price > criteria.maxPrice) return false;
    }

    // Rating
    if (criteria.minRating !== undefined && criteria.minRating > 0) {
      if (p.rating < criteria.minRating) return false;
    }

    // Fast Delivery
    if (criteria.fastDeliveryOnly) {
      if (!p.badges?.fastDelivery) return false;
    }

    // Free Shipping
    if (criteria.freeShippingOnly) {
      if (!p.badges?.freeShipping) return false;
    }

    // Size filter
    if (criteria.selectedSizes && criteria.selectedSizes.length > 0) {
      const pSizes = p.attributes?.sizes || [];
      const matchesSize = criteria.selectedSizes.some((sz) => pSizes.includes(sz));
      if (!matchesSize) return false;
    }

    return true;
  });
}
