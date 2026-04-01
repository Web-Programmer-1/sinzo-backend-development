export type TProductPayload = {
  title: string;
  cardShortTitle?:string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  badge?: "SALE" | "BEST_SELLER" | "LOW_STOCK" | "OUT_OF_STOCK" | "NEW";
  categoryId: string;
  colorVariants?: any;

  sizes?: string[];
  sizeType?: string;
    productCardImage?: string;

  sizeGuideImage?: string;
  sizeGuideData?: any;


  averageRating?: number;
  totalReviews?: number;

  galleryImages?: string[];
};



 export type ColorVariant = {
  color: string;
  images: string[];
};
