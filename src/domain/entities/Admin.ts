import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { DocumentType } from '../value-objects/DocumentType.ts';

/** Perfil extendido del administrador en el panel. */
export interface AdminProfile {
  phone?: string;
  code?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  address?: string;
  region?: string;
  avatarUrl?: string;
}

/** Preferencias de interfaz y notificaciones del administrador. */
export interface AdminPreferences {
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

/**
 * Administrador autorizado para acceder al panel.
 * Whitelist en Firestore (colección admins).
 */
export interface Admin {
  id: EntityId;
  email: string;
  name?: string;
  createdAt: Timestamp;
  createdBy?: string;
  isPrimary?: boolean;
  profile?: AdminProfile;
  preferences?: AdminPreferences;
  updatedAt?: Timestamp;
}
