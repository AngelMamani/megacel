import type { Order } from '../../../domain/entities/Order.ts';

export interface PlaceOnlineOrderItemInput {
  productId: string;
  quantity: number;
}

export interface PlaceOnlineOrderInput {
  platformUserId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
  items: PlaceOnlineOrderItemInput[];
  existingOrders: Order[];
}

export interface PlaceOnlineOrderOutput {
  order: Order;
}
