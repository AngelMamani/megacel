import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { TrendDirection } from '../value-objects/TrendDirection.ts';

/** Categoría de productos tecnológicos. */
export interface Category {
  id: EntityId;
  name: string;
  description: string;
  productCount: number;
  image: string;
  color: string;
  gradient: string;
  trend: TrendDirection;
  trendValue: number;
  isActive: boolean;
  createdAt: Timestamp;
  editedAt?: Timestamp;
}
