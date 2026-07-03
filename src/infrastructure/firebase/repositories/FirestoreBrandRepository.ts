import type { IBrandRepository } from '../../../domain/repositories/IBrandRepository.ts';
import type { Brand } from '../../../domain/entities/Brand.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import {
  deleteDocById,
  getDocById,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../helpers/FirestoreHelpers.ts';

export function createFirestoreBrandRepository(): IBrandRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<Brand>(COLLECTIONS.brands, onChange, onError);
    },
    getById(id) {
      return getDocById<Brand>(COLLECTIONS.brands, id);
    },
    create(brand) {
      const { id, ...data } = brand;
      return setDocById(COLLECTIONS.brands, id, data);
    },
    update(id, patch) {
      return updateDocById<Brand>(COLLECTIONS.brands, id, patch);
    },
    delete(id) {
      return deleteDocById(COLLECTIONS.brands, id);
    },
  };
}
