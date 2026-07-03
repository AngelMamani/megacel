import type { IProductRepository } from '../../../domain/repositories/IProductRepository.ts';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { Order } from '../../../domain/entities/Order.ts';
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
import { GetPeruCalendarDateKey } from '../../../domain/value-objects/PeruDateTime.ts';
import type {
  RegisterStoreSaleInput,
  RegisterStoreSaleOutput,
} from '../../dto/sales/RegisterStoreSaleDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type RegisterStoreSaleDeps = {
  productRepository: IProductRepository;
  orderRepository: IOrderRepository;
  historyRepository: IHistoryRepository;
};

export function createRegisterStoreSaleUseCase(
  deps: RegisterStoreSaleDeps
): UseCase<RegisterStoreSaleInput, RegisterStoreSaleOutput> {
  return {
    async execute(input) {
      if (!input.productId) {
        throwApplicationError(createValidationError('Selecciona un producto válido de la tienda'));
      }

      if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
        throwApplicationError(createValidationError('Ingresa una cantidad de artículos válida'));
      }

      if (!input.paymentMethod || !isPaymentMethod(input.paymentMethod)) {
        throwApplicationError(createValidationError('Selecciona un método de pago'));
      }

      const product = await deps.productRepository.getById(input.productId);
      if (!product) {
        const error = createEntityNotFoundError('Producto', input.productId);
        throw new Error(error.message);
      }

      const stockError = validateStockForSale(product.stock, input.quantity);
      if (stockError) {
        throw new Error(stockError.message);
      }

      const unitPrice = Number(product.finalPrice ?? product.price ?? 0);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throwApplicationError(createValidationError('El producto seleccionado no tiene un precio válido'));
      }

      const total = unitPrice * input.quantity;
      const now = new Date();
      const orderNumber = buildNextOrderNumber(input.existingOrders);
      const orderId = buildSaleId(orderNumber);

      const order: Order = {
        id: orderId,
        customerName: input.customerName?.trim() || 'Venta en tienda',
        customerEmail: input.customerEmail?.trim() || undefined,
        customerPhone: input.customerPhone?.trim() || undefined,
        total,
        status: ORDER_STATUS.PaymentSuccessful,
        date: GetPeruCalendarDateKey(now),
        items: input.quantity,
        orderItems: [
          {
            id: product.id,
            productName: product.name,
            quantity: input.quantity,
            price: unitPrice,
            subtotal: total,
          },
        ],
        paymentMethod: input.paymentMethod,
        notes: input.notes?.trim() || undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        source: input.source,
        orderNumber,
      };

      await deps.orderRepository.create(order);
      await deps.productRepository.decrementStock(product.id, input.quantity);
      await deps.productRepository.incrementSoldCount(product.id, input.quantity);

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Create,
        section: HISTORY_SECTION.Orders,
        itemName: `${order.id} - ${product.name}`,
        itemId: order.id,
        details:
          input.source === SALE_SOURCE.Store
            ? `Venta registrada manualmente en tienda por ${formatMoney(order.total)}`
            : `Venta online registrada como completada por ${formatMoney(order.total)}`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });

      return { order };
    },
  };
}
