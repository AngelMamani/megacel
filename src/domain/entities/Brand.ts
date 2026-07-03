import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { TrendDirection } from '../value-objects/TrendDirection.ts';

/** Marca comercial asociada a una o más categorías. */
export interface Brand {
  id: EntityId;
  name: string;
  description: string;
  categoryIds: EntityId[];
  productCount: number;
  image: string;
  imageFit?: 'cover' | 'contain';
  color: string;
  gradient: string;
  trend: TrendDirection;
  trendValue: number;
  isActive: boolean;
  createdAt: Timestamp;
  editedAt?: Timestamp;
}
