import type { ProductReview } from '../entities/ProductReview.ts';
import { isPublishedReviewStatus } from '../value-objects/ReviewStatus.ts';

export const MIN_REVIEW_BODY_LENGTH = 10;
export const MAX_REVIEW_BODY_LENGTH = 1000;
export const MAX_REVIEW_IMAGES = 5;
export const MAX_REVIEW_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const REVIEW_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export function validateReviewImages(images?: string[]): string | null {
  if (!images || images.length === 0) return null;
  if (images.length > MAX_REVIEW_IMAGES) {
    return `Puedes subir hasta ${MAX_REVIEW_IMAGES} imágenes`;
  }
  if (images.some((url) => !url.trim())) {
    return 'Una de las imágenes no es válida';
  }
  return null;
}

export function validateReviewRating(rating: number): string | null {
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return 'La calificación debe ser entre 1 y 5 estrellas';
  }
  return null;
}

export function validateReviewBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length < MIN_REVIEW_BODY_LENGTH) {
    return `El comentario debe tener al menos ${MIN_REVIEW_BODY_LENGTH} caracteres`;
  }
  if (trimmed.length > MAX_REVIEW_BODY_LENGTH) {
    return `El comentario no puede superar ${MAX_REVIEW_BODY_LENGTH} caracteres`;
  }
  return null;
}

export function isVisibleProductReview(review: ProductReview): boolean {
  return isPublishedReviewStatus(review.status);
}

export function sortProductReviewsForDisplay(reviews: ProductReview[], productId?: string) {
  return [...reviews].sort((left, right) => {
    if (productId) {
      const leftMatches = left.productId === productId ? 1 : 0;
      const rightMatches = right.productId === productId ? 1 : 0;
      if (leftMatches !== rightMatches) return rightMatches - leftMatches;
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}

export function buildProductReviewSummary(reviews: ProductReview[]) {
  if (reviews.length === 0) {
    return { average: 0, total: 0 };
  }

  const total = reviews.length;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / total;

  return {
    average: Math.round(average * 10) / 10,
    total,
  };
}
