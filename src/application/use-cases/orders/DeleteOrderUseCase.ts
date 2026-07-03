import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.ts';
import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import { HISTORY_ACTION } from '../../../domain/value-objects/HistoryAction.ts';
import { HISTORY_ACTOR_TYPE } from '../../../domain/value-objects/HistoryActorType.ts';
import { HISTORY_SECTION } from '../../../domain/value-objects/HistorySection.ts';
import type { DeleteOrderInput, DeleteOrderOutput } from '../../dto/orders/DeleteOrderDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type DeleteOrderDeps = {
  orderRepository: IOrderRepository;
  historyRepository: IHistoryRepository;
};

export function createDeleteOrderUseCase(
  deps: DeleteOrderDeps
): UseCase<DeleteOrderInput, DeleteOrderOutput> {
  return {
    async execute(input) {
      await deps.orderRepository.delete(input.orderId);

      await deps.historyRepository.log({
        action: HISTORY_ACTION.Delete,
        section: HISTORY_SECTION.Orders,
        itemName: input.orderId,
        itemId: input.orderId,
        details: `Pedido ${input.orderId} eliminado`,
        actorEmail: input.actorEmail,
        actorName: input.actorName,
        actorType: HISTORY_ACTOR_TYPE.Admin,
      });

      return { orderId: input.orderId };
    },
  };
}
