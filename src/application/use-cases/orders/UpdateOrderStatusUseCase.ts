import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.ts';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import { createEntityNotFoundError } from '../../../domain/errors/EntityNotFoundError.ts';
import {
  ShouldApplySaleInventory,
  ShouldReverseSaleInventory,
} from '../../../domain/services/OrderFulfillmentPolicy.ts';
import { validateStockForSale } from '../../../domain/value-objects/Stock.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  isOrderStatus,
} from '../../../domain/value-objects/OrderStatus.ts';
import { createValidationError, throwApplicationError } from '../../errors/ApplicationError.ts';
import type {
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
} from '../../dto/orders/UpdateOrderStatusDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type UpdateOrderStatusDeps = {
  orderRepository: IOrderRepository;
  productRepository: IProductRepository;
  historyRepository: IHistoryRepository;
};

async function ApplyOrderItemInventoryChanges(
  orderItems: { id?: string; quantity: number }[] | undefined,
  action: (productId: string, quantity: number) => Promise<void>
) {
  for (const item of orderItems ?? []) {
    if (!item.id || !Number.isFinite(item.quantity) || item.quantity <= 0) continue;
    await action(item.id, item.quantity);
  }
}

async function ValidateOrderStock(
  productRepository: IProductRepository,
  orderItems: { id?: string; quantity: number; productName?: string }[] | undefined
) {
  for (const item of orderItems ?? []) {
    if (!item.id || !Number.isFinite(item.quantity) || item.quantity <= 0) continue;

    const product = await productRepository.getById(item.id);
    if (!product) {
      throw new Error(`El producto "${item.productName ?? item.id}" ya no existe`);
    }

    const stockError = validateStockForSale(product.stock, item.quantity);
    if (stockError) {
      throw new Error(`${product.name}: ${stockError.message}`);
    }
  }
}

export function createUpdateOrderStatusUseCase(
  deps: UpdateOrderStatusDeps
): UseCase<UpdateOrderStatusInput, UpdateOrderStatusOutput> {
  return {
    async execute(input) {
      if (!isOrderStatus(input.status)) {
        throwApplicationError(createValidationError('Estado de pedido inválido'));
      }

      if (input.status === ORDER_STATUS.Rejected) {
        const reason = input.rejectionReason?.trim();
        if (!reason) {
          throwApplicationError(createValidationError('Ingresa el motivo del rechazo'));
        }
      }

      const order = await deps.orderRepository.getById(input.orderId);
      if (!order) {
        const error = createEntityNotFoundError('Pedido', input.orderId);
        throw new Error(error.message);
      }

      const previousStatus = order.status;
      const rejectionReason =
        input.status === ORDER_STATUS.Rejected ? input.rejectionReason!.trim() : '';

      if (ShouldApplySaleInventory(previousStatus, input.status)) {
        await ValidateOrderStock(deps.productRepository, order.orderItems);
      }

      await deps.orderRepository.update(input.orderId, {
        status: input.status,
        rejectionReason,
        updatedAt: new Date().toISOString(),
      });

      if (ShouldApplySaleInventory(previousStatus, input.status)) {
        await ApplyOrderItemInventoryChanges(order.orderItems, async (productId, quantity) => {
          await deps.productRepository.decrementStock(productId, quantity);
          await deps.productRepository.incrementSoldCount(productId, quantity);
        });
      }

      if (ShouldReverseSaleInventory(previousStatus, input.status)) {
        await ApplyOrderItemInventoryChanges(order.orderItems, async (productId, quantity) => {
          await deps.productRepository.incrementStock(productId, quantity);
          await deps.productRepository.decrementSoldCount(productId, quantity);
        });
      }

      const rejectionDetail =
        input.status === ORDER_STATUS.Rejected
          ? ` — Motivo: ${input.rejectionReason!.trim()}`
          : '';

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Update,
        section: HISTORY_SECTION.Orders,
        itemName: input.orderLabel,
        itemId: input.orderId,
        details: `Pedido ${input.orderId} actualizado - Estado: ${ORDER_STATUS_LABELS[input.status]}${rejectionDetail}`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });

      return { orderId: input.orderId, status: input.status };
    },
  };
}
