import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository.ts';
import type { Category } from '../../../domain/entities/Category.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import {
  deleteDocById,
  getDocById,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../helpers/FirestoreHelpers.ts';

export function createFirestoreCategoryRepository(): ICategoryRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<Category>(COLLECTIONS.categories, onChange, onError);
    },
    getById(id) {
      return getDocById<Category>(COLLECTIONS.categories, id);
    },
    create(category) {
      const { id, ...data } = category;
      return setDocById(COLLECTIONS.categories, id, data);
    },
    update(id, patch) {
      return updateDocById<Category>(COLLECTIONS.categories, id, patch);
    },
    delete(id) {
      return deleteDocById(COLLECTIONS.categories, id);
    },
  };
}
