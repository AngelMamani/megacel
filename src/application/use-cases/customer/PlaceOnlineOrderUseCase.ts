import type { IProductRepository } from '../../../domain/repositories/IProductRepository.ts';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { Order } from '../../../domain/entities/Order.ts';
import type { OrderItem } from '../../../domain/entities/OrderItem.ts';
import { validateStockForSale } from '../../../domain/value-objects/Stock.ts';
import { createEntityNotFoundError } from '../../../domain/errors/EntityNotFoundError.ts';
import { ORDER_STATUS } from '../../../domain/value-objects/OrderStatus.ts';
import { SALE_SOURCE } from '../../../domain/value-objects/SaleSource.ts';
import { formatMoney } from '../../../domain/value-objects/Money.ts';
import { buildNextOrderNumber, buildSaleId } from '../../../domain/services/OrderNumberGenerator.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import { createValidationError, throwApplicationError } from '../../errors/ApplicationError.ts';
import { isPaymentMethod } from '../../../domain/value-objects/PaymentMethod.ts';
import { ValidatePeruPhone, NormalizePeruPhoneInput } from '../../../domain/value-objects/PeruPhone.ts';
import { GetPeruCalendarDateKey } from '../../../domain/value-objects/PeruDateTime.ts';
import type {
  PlaceOnlineOrderInput,
  PlaceOnlineOrderOutput,
} from '../../dto/customer/PlaceOnlineOrderDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type PlaceOnlineOrderDeps = {
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  historyRepository: IHistoryRepository;
};

export function createPlaceOnlineOrderUseCase(
  deps: PlaceOnlineOrderDeps
): UseCase<PlaceOnlineOrderInput, PlaceOnlineOrderOutput> {
  return {
    async execute(input) {
      if (!input.items.length) {
        throwApplicationError(createValidationError('Tu carrito está vacío'));
      }

      if (!input.customerName.trim()) {
        throwApplicationError(createValidationError('Ingresa tu nombre completo'));
      }

      if (!input.customerPhone.trim()) {
        throwApplicationError(createValidationError('Ingresa tu número de celular'));
      }

      const phoneError = ValidatePeruPhone(input.customerPhone);
      if (phoneError) {
        throwApplicationError(createValidationError(phoneError));
      }

      const customerPhone = NormalizePeruPhoneInput(input.customerPhone);

      if (!input.shippingAddress.trim()) {
        throwApplicationError(createValidationError('Ingresa tu dirección de entrega en Puerto Maldonado'));
      }

      if (!input.paymentMethod || !isPaymentMethod(input.paymentMethod)) {
        throwApplicationError(createValidationError('Selecciona un método de pago'));
      }

      const orderItems: OrderItem[] = [];
      let total = 0;
      let totalItems = 0;

      for (const line of input.items) {
        if (!line.productId || !Number.isFinite(line.quantity) || line.quantity <= 0) {
          throwApplicationError(createValidationError('Hay productos con cantidad inválida en el carrito'));
        }

        const product = await deps.productRepository.getById(line.productId);
        if (!product) {
          const error = createEntityNotFoundError('Producto', line.productId);
          throw new Error(error.message);
        }

        if (product.status !== 'activo') {
          throw new Error(`"${product.name}" ya no está disponible en la tienda`);
        }

        const stockError = validateStockForSale(product.stock, line.quantity);
        if (stockError) {
          throw new Error(`${product.name}: ${stockError.message}`);
        }

        const unitPrice = Number(product.finalPrice ?? product.price ?? 0);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new Error(`"${product.name}" no tiene un precio válido`);
        }

        const subtotal = unitPrice * line.quantity;
        total += subtotal;
        totalItems += line.quantity;

        orderItems.push({
          id: product.id,
          productName: product.name,
          quantity: line.quantity,
          price: unitPrice,
          subtotal,
        });
      }

      const now = new Date();
      const orderNumber = buildNextOrderNumber(input.existingOrders);
      const orderId = buildSaleId(orderNumber);

      const order: Order = {
        id: orderId,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim() || undefined,
        customerPhone,
        platformUserId: input.platformUserId,
        total,
        status: ORDER_STATUS.Pending,
        date: GetPeruCalendarDateKey(now),
        items: totalItems,
        orderItems,
        shippingAddress: input.shippingAddress.trim(),
        paymentMethod: input.paymentMethod,
        notes: input.notes?.trim() || undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        source: SALE_SOURCE.Online,
        orderNumber,
      };

      await deps.orderRepository.create(order);

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Orders,
        itemName: `${order.id} - Pedido online`,
        itemId: order.id,
        details: `Pedido online de ${input.customerName} por ${formatMoney(order.total)} — entrega Puerto Maldonado`,
        actorEmail: input.customerEmail,
        actorName: input.customerName,
        actorType: HISTORY_ACTOR_TYPE.Client,
      });

      return { order };
    },
  };
}
