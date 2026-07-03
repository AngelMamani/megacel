import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.ts';
import type { Order } from '../../../domain/entities/Order.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import {
  deleteDocById,
  getDocById,
  setDocById,
  subscribeCollection,
  subscribeCollectionWhere,
  updateDocById,
} from '../helpers/FirestoreHelpers.ts';

export function createFirestoreOrderRepository(): IOrderRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<Order>(COLLECTIONS.orders, onChange, onError);
    },
    getById(id) {
      return getDocById<Order>(COLLECTIONS.orders, id);
    },
    subscribeByCustomerEmail(email, onChange, onError) {
      return subscribeCollectionWhere<Order>(
        COLLECTIONS.orders,
        'customerEmail',
        email.trim().toLowerCase(),
        onChange,
        onError
      );
    },
    create(order) {
      const { id, ...data } = order;
      return setDocById(COLLECTIONS.orders, id, data);
    },
    update(id, patch) {
      return updateDocById<Order>(COLLECTIONS.orders, id, patch);
    },
    delete(id) {
      return deleteDocById(COLLECTIONS.orders, id);
    },
  };
}
