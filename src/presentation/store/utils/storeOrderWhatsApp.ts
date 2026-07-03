import type { CartItem } from '../types/CartTypes.ts';
import { formatOrderNumber } from '../../../domain/services/OrderNumberGenerator.ts';
import { FormatStoreCurrency } from './storePresentationUtils.ts';

export const STORE_WHATSAPP_NUMBER = '51983444417';

export interface PendingCheckoutSnapshot {
  CustomerName: string;
  CustomerEmail: string;
  Phone: string;
  Address: string;
  Reference: string;
  Total: number;
  Items: CartItem[];
}

export interface OrderWhatsAppSnapshot {
  OrderId: string;
  OrderNumber?: number;
  CustomerName: string;
  Phone: string;
  Address: string;
  Reference: string;
  Total: number;
  Items: CartItem[];
}

export const BuildOrderWhatsAppMessage = (snapshot: OrderWhatsAppSnapshot) => {
  const orderLabel = snapshot.OrderNumber
    ? `#${formatOrderNumber(snapshot.OrderNumber)}`
    : snapshot.OrderId;

  const itemsLines = BuildItemsLines(snapshot.Items);

  const referenceLine = snapshot.Reference.trim()
    ? `\nReferencia: ${snapshot.Reference.trim()}`
    : '';

  return [
    `Hola MEGA CEL, mi pedido ${orderLabel} ya fue registrado.`,
    '',
    'Resumen del pedido:',
    itemsLines,
    '',
    `Total a pagar: ${FormatStoreCurrency(snapshot.Total)}`,
    '',
    'Datos de entrega:',
    `Cliente: ${snapshot.CustomerName}`,
    `Celular: ${snapshot.Phone}`,
    `Dirección: ${snapshot.Address}${referenceLine}`,
    '',
    'Realicé el pago por Yape y adjunto la captura en este chat.',
  ].join('\n');
};

export const BuildStoreWhatsAppUrl = (message: string) =>
  `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const BuildDeliveryLines = (snapshot: {
  CustomerName: string;
  Phone: string;
  Address: string;
  Reference: string;
}) => {
  const referenceLine = snapshot.Reference.trim()
    ? `\nReferencia: ${snapshot.Reference.trim()}`
    : '';

  return [
    `Cliente: ${snapshot.CustomerName}`,
    `Celular: ${snapshot.Phone}`,
    `Dirección: ${snapshot.Address}${referenceLine}`,
  ].join('\n');
};

const BuildItemsLines = (items: CartItem[]) =>
  items
    .map((item) => `• ${item.name} x${item.quantity} — ${FormatStoreCurrency(item.price * item.quantity)}`)
    .join('\n');

/** Mensaje antes de registrar el pedido: pago + captura por WhatsApp. */
export const BuildPendingPaymentWhatsAppMessage = (snapshot: PendingCheckoutSnapshot) =>
  [
    'Hola MEGA CEL, quiero confirmar mi compra y adjunto la captura de pago por Yape.',
    '',
    'Resumen:',
    BuildItemsLines(snapshot.Items),
    '',
    `Total pagado: ${FormatStoreCurrency(snapshot.Total)}`,
    '',
    'Datos de entrega:',
    BuildDeliveryLines(snapshot),
    '',
    'Adjunto la captura del pago en este chat.',
  ].join('\n');

export interface RejectedOrderWhatsAppSnapshot {
  OrderId: string;
  OrderNumber?: number;
  CustomerName: string;
  CustomerPhone?: string;
  ShippingAddress?: string;
  Notes?: string;
  RejectionReason: string;
  Total: number;
  Items: Array<{
    productName: string;
    quantity: number;
    subtotal: number;
  }>;
}

const BuildOrderItemLines = (
  items: RejectedOrderWhatsAppSnapshot['Items']
) =>
  items
    .map(
      (item) =>
        `• ${item.productName} x${item.quantity} — ${FormatStoreCurrency(item.subtotal)}`
    )
    .join('\n');

/** Mensaje para pedido rechazado: motivo + resumen hacia el administrador. */
export const BuildRejectedOrderWhatsAppMessage = (snapshot: RejectedOrderWhatsAppSnapshot) => {
  const orderLabel = snapshot.OrderNumber
    ? `#${formatOrderNumber(snapshot.OrderNumber)}`
    : snapshot.OrderId;

  const contactLines = [
    `Cliente: ${snapshot.CustomerName}`,
    snapshot.CustomerPhone ? `Celular: ${snapshot.CustomerPhone}` : '',
    snapshot.ShippingAddress ? `Dirección: ${snapshot.ShippingAddress}` : '',
    snapshot.Notes?.trim() ? `Notas: ${snapshot.Notes.trim()}` : '',
  ].filter(Boolean);

  return [
    'Hola MEGA CEL, mi pedido fue rechazado y quiero comunicarme con el administrador.',
    '',
    `Pedido: ${orderLabel}`,
    '',
    'Motivo del rechazo:',
    snapshot.RejectionReason.trim() || 'No se indicó un motivo específico.',
    '',
    'Resumen del pedido:',
    BuildOrderItemLines(snapshot.Items),
    '',
    `Total: ${FormatStoreCurrency(snapshot.Total)}`,
    '',
    'Mis datos:',
    ...contactLines,
    '',
    'Quedo atento a su respuesta. Gracias.',
  ].join('\n');
};
