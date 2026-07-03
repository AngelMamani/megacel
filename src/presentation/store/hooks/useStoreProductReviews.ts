import { useEffect, useMemo, useState } from 'react';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { ProductReview } from '../../../domain/entities/ProductReview.ts';
import {
  buildProductReviewSummary,
  sortProductReviewsForDisplay,
} from '../../../domain/services/ProductReviewPolicy.ts';

export const useStoreProductReviews = (productId?: string) => {
  const { repositories } = useInfrastructure();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = repositories.productReview.subscribeByProductId(
      productId,
      (items) => {
        setReviews(sortProductReviewsForDisplay(items));
        setIsLoading(false);
      },
      () => {
        setReviews([]);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [repositories.productReview, productId]);

  const summary = useMemo(() => buildProductReviewSummary(reviews), [reviews]);

  return {
    reviews,
    summary,
    isLoading,
  };
};
