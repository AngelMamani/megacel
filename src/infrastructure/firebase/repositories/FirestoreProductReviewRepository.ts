import type { IProductReviewRepository } from '../../../domain/repositories/IProductReviewRepository.ts';
import type { ProductReview } from '../../../domain/entities/ProductReview.ts';
import { REVIEW_STATUS } from '../../../domain/value-objects/ReviewStatus.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import {
  deleteDocById,
  getDocById,
  setDocById,
  subscribeCollectionWhere,
  updateDocById,
} from '../helpers/FirestoreHelpers.ts';

export function createFirestoreProductReviewRepository(): IProductReviewRepository {
  return {
    subscribePublished(onChange, onError) {
      return subscribeCollectionWhere<ProductReview>(
        COLLECTIONS.productReviews,
        'status',
        REVIEW_STATUS.Published,
        onChange,
        onError
      );
    },
    subscribeByProductId(productId, onChange, onError) {
      return subscribeCollectionWhere<ProductReview>(
        COLLECTIONS.productReviews,
        'productId',
        productId,
        (reviews) => {
          onChange(reviews.filter((review) => review.status === REVIEW_STATUS.Published));
        },
        onError
      );
    },
    getById(id) {
      return getDocById<ProductReview>(COLLECTIONS.productReviews, id);
    },
    create(review) {
      const { id, ...data } = review;
      return setDocById(COLLECTIONS.productReviews, id, data);
    },
    update(id, patch) {
      return updateDocById<ProductReview>(COLLECTIONS.productReviews, id, patch);
    },
    delete(id) {
      return deleteDocById(COLLECTIONS.productReviews, id);
    },
  };
}
