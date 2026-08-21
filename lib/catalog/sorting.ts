import { DetailedProductMock } from "./product-repository";

export type SortOption =
  | "recommended"
  | "bestselling"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating";

export function sortProducts(products: DetailedProductMock[], option: SortOption): DetailedProductMock[] {
  const sorted = [...products];

  switch (option) {
    case "bestselling":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort((a, b) => (b.badges?.bestseller ? 1 : -1));
    case "recommended":
    default:
      return sorted;
  }
}
