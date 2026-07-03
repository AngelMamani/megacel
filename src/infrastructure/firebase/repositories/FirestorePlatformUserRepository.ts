import type { IPlatformUserRepository } from '../../../domain/repositories/IPlatformUserRepository.ts';
import type { PlatformUser } from '../../../domain/entities/PlatformUser.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import {
  deleteDocById,
  getDocById,
  getFirstDocByField,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../helpers/FirestoreHelpers.ts';

export function createFirestorePlatformUserRepository(): IPlatformUserRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<PlatformUser>(COLLECTIONS.platformUsers, onChange, onError);
    },
    getById(id) {
      return getDocById<PlatformUser>(COLLECTIONS.platformUsers, id);
    },
    getByEmail(email) {
      return getFirstDocByField<PlatformUser>(
        COLLECTIONS.platformUsers,
        'email',
        email.trim().toLowerCase()
      );
    },
    getByAuthUid(authUid) {
      return getFirstDocByField<PlatformUser>(COLLECTIONS.platformUsers, 'authUid', authUid);
    },
    create(user) {
      const { id, ...data } = user;
      return setDocById(COLLECTIONS.platformUsers, id, data);
    },
    update(id, patch) {
      return updateDocById<PlatformUser>(COLLECTIONS.platformUsers, id, patch);
    },
    delete(id) {
      return deleteDocById(COLLECTIONS.platformUsers, id);
    },
  };
}
