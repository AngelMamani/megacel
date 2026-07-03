import type { EntityId } from '../types/CommonTypes.ts';

/** Línea de detalle dentro de un pedido o venta. */
export interface OrderItem {
  id: EntityId;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}
