import { DetailedProductMock } from "../catalog/product-repository";

export interface SellerReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
  reply?: string;
  replyDate?: string;
}

export interface SellerProfile {
  id: string;
  slug: string;
  name: string;
  logo: string;
  banner: string;
  description: { tr: string; en: string };
  rating: number;
  reviewCount: number;
  verified: boolean;
  location: string;
  responseRate: string;
  followers: number;
  productCount: number;
  joinedDate: string;
  shippingPolicy: { tr: string; en: string };
  returnPolicy: { tr: string; en: string };
  contactPhone: string;
  contactEmail: string;
  categories: string[];
  reviews: SellerReview[];
}
