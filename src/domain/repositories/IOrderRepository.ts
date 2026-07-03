import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { Order } from '../entities/Order.ts';

export interface IOrderRepository {
  subscribe(
    onChange: (orders: Order[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getById(id: EntityId): Promise<Order | null>;
  subscribeByCustomerEmail(
    email: string,
    onChange: (orders: Order[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;
  create(order: Order): Promise<void>;
  update(id: EntityId, patch: Partial<Order>): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
