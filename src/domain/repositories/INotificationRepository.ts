import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { Notification } from '../entities/Notification.ts';

export interface INotificationRepository {
  subscribe(
    onChange: (notifications: Notification[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  markAsRead(id: EntityId): Promise<void>;
}
