import type { ProductReview } from '../../../domain/entities/ProductReview.ts';

export interface CreateProductReviewInput {
  productId: string;
  platformUserId: string;
  authorName: string;
  orderId?: string;
  rating: number;
  body: string;
  images?: string[];
}

export interface CreateProductReviewOutput {
  review: ProductReview;
}
