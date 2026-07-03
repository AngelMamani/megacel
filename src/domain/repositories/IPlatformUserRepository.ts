import type { EntityId, Unsubscribe } from '../types/CommonTypes.ts';
import type { PlatformUser } from '../entities/PlatformUser.ts';

export interface IPlatformUserRepository {
  subscribe(
    onChange: (users: PlatformUser[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  getById(id: EntityId): Promise<PlatformUser | null>;
  getByEmail(email: string): Promise<PlatformUser | null>;
  getByAuthUid(authUid: string): Promise<PlatformUser | null>;
  create(user: PlatformUser): Promise<void>;
  update(id: EntityId, patch: Partial<PlatformUser>): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
