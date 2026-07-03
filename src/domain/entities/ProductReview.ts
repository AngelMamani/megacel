import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { ReviewStatus } from '../value-objects/ReviewStatus.ts';

/** Valoración publicada por un cliente sobre un producto recibido. */
export interface ProductReview {
  id: EntityId;
  productId: EntityId;
  productName: string;
  productImage: string;
  authorName: string;
  platformUserId?: EntityId;
  orderId?: EntityId;
  rating: number;
  body: string;
  /** Fotos subidas por el cliente junto a la valoración. */
  images?: string[];
  publishedAt: Timestamp;
  isVerified: boolean;
  status: ReviewStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
