import { increment } from 'firebase/firestore';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository.ts';
import type { Product } from '../../../domain/entities/Product.ts';
import type { EntityId } from '../../../domain/types/CommonTypes.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import {
  deleteDocById,
  getDocById,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../helpers/FirestoreHelpers.ts';

export function createFirestoreProductRepository(): IProductRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<Product>(COLLECTIONS.products, onChange, onError);
    },

    getById(id) {
      return getDocById<Product>(COLLECTIONS.products, id);
    },

    create(product) {
      const { id, ...data } = product;
      return setDocById(COLLECTIONS.products, id, data);
    },

    update(id, patch) {
      return updateDocById<Product>(COLLECTIONS.products, id, patch);
    },

    delete(id) {
      return deleteDocById(COLLECTIONS.products, id);
    },

    decrementStock(id: EntityId, quantity: number) {
      return updateDocById<Product>(COLLECTIONS.products, id, {
        stock: increment(-quantity),
      } as unknown as Partial<Product>);
    },

    incrementStock(id: EntityId, quantity: number) {
      return updateDocById<Product>(COLLECTIONS.products, id, {
        stock: increment(quantity),
      } as unknown as Partial<Product>);
    },

    incrementSoldCount(id: EntityId, quantity: number) {
      return updateDocById<Product>(COLLECTIONS.products, id, {
        soldCount: increment(quantity),
      } as unknown as Partial<Product>);
    },

    decrementSoldCount(id: EntityId, quantity: number) {
      return updateDocById<Product>(COLLECTIONS.products, id, {
        soldCount: increment(-quantity),
      } as unknown as Partial<Product>);
    },
  };
}
