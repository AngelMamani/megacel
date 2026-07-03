import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { ProductReview } from '../entities/ProductReview.ts';

export interface IProductReviewRepository {
  subscribePublished(
    onChange: (reviews: ProductReview[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  subscribeByProductId(
    productId: EntityId,
    onChange: (reviews: ProductReview[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getById(id: EntityId): Promise<ProductReview | null>;
  create(review: ProductReview): Promise<void>;
  update(id: EntityId, patch: Partial<ProductReview>): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
