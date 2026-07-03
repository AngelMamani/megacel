import type { OrderStatus } from '../../../domain/value-objects/OrderStatus.ts';

export interface UpdateOrderStatusInput {
  orderId: string;
  orderLabel: string;
  status: OrderStatus;
  rejectionReason?: string;
  actorEmail?: string;
  actorName?: string;
}

export interface UpdateOrderStatusOutput {
  orderId: string;
  status: OrderStatus;
}
