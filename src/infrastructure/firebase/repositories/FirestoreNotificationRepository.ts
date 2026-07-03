import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository.ts';
import type { Notification } from '../../../domain/entities/Notification.ts';
import type { EntityId } from '../../../domain/types/CommonTypes.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import { subscribeCollection, updateDocById } from '../helpers/FirestoreHelpers.ts';

export function createFirestoreNotificationRepository(): INotificationRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<Notification>(COLLECTIONS.notifications, onChange, onError);
    },

    markAsRead(id: EntityId) {
      return updateDocById<Notification>(COLLECTIONS.notifications, id, { read: true });
    },
  };
}
