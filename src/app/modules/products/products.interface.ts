export type TProductPayload = {
  title: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  badge?: "SALE" | "BEST_SELLER" | "LOW_STOCK" | "OUT_OF_STOCK" | "NEW";
  categoryId: string;

  colors?: string[];
  sizes?: string[];
  sizeType?: string;
    productCardImage?: string;

  sizeGuideImage?: string;
  sizeGuideData?: any;

  averageRating?: number;
  totalReviews?: number;

  galleryImages?: string[];
};