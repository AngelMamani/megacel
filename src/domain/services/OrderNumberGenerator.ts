import type { Order } from '../entities/Order.ts';
import { isCompletedOrder } from '../value-objects/OrderStatus.ts';
import { SALE_SOURCE, type SaleSource } from '../value-objects/SaleSource.ts';

/** Número de pedido visible: 6 dígitos (ej. 482910, 012726). */
export const ORDER_NUMBER_DISPLAY_DIGITS = 6;

const ORDER_NUMBER_MAX = 1_000_000;
const UNIQUE_NUMBER_MAX_ATTEMPTS = 200;

/** Muestra el número con ceros a la izquierda (ej. 012726). */
export function formatOrderNumber(orderNumber: number | undefined): string {
  if (orderNumber === undefined || orderNumber === null) return '';
  return String(orderNumber).padStart(ORDER_NUMBER_DISPLAY_DIGITS, '0');
}

/** ID de documento: ORD-482910 */
export function buildSaleId(orderNumber: number): string {
  return `ORD-${formatOrderNumber(orderNumber)}`;
}

const CollectUsedOrderNumbers = (existingOrders: Order[]) => {
  const used = new Set<string>();

  for (const order of existingOrders) {
    if (order.orderNumber === undefined || order.orderNumber === null) continue;
    used.add(formatOrderNumber(order.orderNumber));
  }

  return used;
};

/** Genera un número aleatorio de 6 dígitos, único entre los pedidos existentes. */
export function buildNextOrderNumber(existingOrders: Order[]): number {
  const used = CollectUsedOrderNumbers(existingOrders);

  for (let attempt = 0; attempt < UNIQUE_NUMBER_MAX_ATTEMPTS; attempt++) {
    const candidate = Math.floor(Math.random() * ORDER_NUMBER_MAX);
    const label = formatOrderNumber(candidate);

    if (!used.has(label)) {
      return candidate;
    }
  }

  throw new Error('No se pudo generar un número de pedido único. Intenta nuevamente.');
}

/** Filtra solo ventas completadas. */
export function getCompletedOrders(orders: Order[]): Order[] {
  return orders.filter((order) => isCompletedOrder(order.status));
}

/** Filtra ventas por origen (online / tienda). */
export function filterOrdersBySource(orders: Order[], source: SaleSource | 'all'): Order[] {
  if (source === 'all') return orders;
  return orders.filter((order) => order.source === source);
}

/** Calcula ingresos totales de pedidos completados. */
export function calculateTotalRevenue(orders: Order[]): number {
  return getCompletedOrders(orders).reduce((sum, order) => sum + order.total, 0);
}

/** Cuenta ventas por canal. */
export function countSalesBySource(orders: Order[]): Record<SaleSource, number> {
  const completed = getCompletedOrders(orders);

  return {
    [SALE_SOURCE.Online]: completed.filter((o) => o.source === SALE_SOURCE.Online).length,
    [SALE_SOURCE.Store]: completed.filter((o) => o.source === SALE_SOURCE.Store).length,
  };
}
