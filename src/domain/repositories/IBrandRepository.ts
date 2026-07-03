import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { Brand } from '../entities/Brand.ts';

export interface IBrandRepository {
  subscribe(
    onChange: (brands: Brand[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getById(id: EntityId): Promise<Brand | null>;
  create(brand: Brand): Promise<void>;
  update(id: EntityId, patch: Partial<Brand>): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
