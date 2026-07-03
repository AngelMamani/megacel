import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { Product } from '../entities/Product.ts';

export interface IProductRepository {
  subscribe(
    onChange: (products: Product[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getById(id: EntityId): Promise<Product | null>;
  create(product: Product): Promise<void>;
  update(id: EntityId, patch: Partial<Product>): Promise<void>;
  delete(id: EntityId): Promise<void>;
  decrementStock(id: EntityId, quantity: number): Promise<void>;
  incrementStock(id: EntityId, quantity: number): Promise<void>;
  incrementSoldCount(id: EntityId, quantity: number): Promise<void>;
  decrementSoldCount(id: EntityId, quantity: number): Promise<void>;
}
