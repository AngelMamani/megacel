import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { NotificationType } from '../value-objects/NotificationType.ts';

/** Notificación del sistema para el panel administrativo. */
export interface Notification {
  id: EntityId;
  type: NotificationType;
  title: string;
  message: string;
  time: Timestamp;
  read: boolean;
}
