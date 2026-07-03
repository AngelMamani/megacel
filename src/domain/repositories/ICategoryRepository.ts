import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { Category } from '../entities/Category.ts';

export interface ICategoryRepository {
  subscribe(
    onChange: (categories: Category[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getById(id: EntityId): Promise<Category | null>;
  create(category: Category): Promise<void>;
  update(id: EntityId, patch: Partial<Category>): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
