import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository.ts';
import type { EntityId } from '../../../domain/types/CommonTypes.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type MarkNotificationAsReadDeps = {
  notificationRepository: INotificationRepository;
};

export function createMarkNotificationAsReadUseCase(
  deps: MarkNotificationAsReadDeps
): UseCase<{ notificationId: EntityId }, { notificationId: EntityId }> {
  return {
    async execute(input) {
      await deps.notificationRepository.markAsRead(input.notificationId);
      return { notificationId: input.notificationId };
    },
  };
}
