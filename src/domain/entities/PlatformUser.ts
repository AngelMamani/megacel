import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { PlatformUserRole } from '../value-objects/PlatformUserRole.ts';
import type { PlatformUserStatus } from '../value-objects/PlatformUserStatus.ts';
import type { DocumentType } from '../value-objects/DocumentType.ts';

/**
 * Usuario de la plataforma (cliente o administrador de tienda).
 * Distinto del Admin de panel: este vive en platform_users y representa
 * a quien compra o gestiona desde la tienda web.
 */
export interface PlatformUser {
  id: EntityId;
  code: string;
  name: string;
  email: string;
  phone?: string;
  role: PlatformUserRole;
  status: PlatformUserStatus;
  authUid?: string;
  avatar?: string;
  address?: string;
  region?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  createdAt?: Timestamp;
  editedAt?: Timestamp;
  lastLogin?: Timestamp;
}
