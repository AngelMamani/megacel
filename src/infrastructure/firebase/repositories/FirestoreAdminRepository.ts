import { deleteDoc, doc, getDoc, getDocs, collection, setDoc, updateDoc } from 'firebase/firestore';
import type { IAdminRepository } from '../../../domain/repositories/IAdminRepository.ts';
import type { Admin } from '../../../domain/entities/Admin.ts';
import { adminIdFromEmail } from '../../../domain/services/AdminIdGenerator.ts';
import { normalizeEmail } from '../../../domain/value-objects/Email.ts';
import { PRIMARY_ADMIN_EMAIL } from '../../../domain/constants/AdminConstants.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import { firestoreDb } from '../config/FirebaseConfig.ts';
import { subscribeCollection } from '../helpers/FirestoreHelpers.ts';

export function createFirestoreAdminRepository(): IAdminRepository {
  return {
    subscribe(onChange, onError) {
      return subscribeCollection<Admin>(
        COLLECTIONS.admins,
        (items) =>
          onChange(
            items.sort((a, b) => {
              if (a.isPrimary) return -1;
              if (b.isPrimary) return 1;
              return a.email.localeCompare(b.email);
            })
          ),
        onError
      );
    },
    async getByEmail(email) {
      const normalizedEmail = normalizeEmail(email);
      const adminId = adminIdFromEmail(normalizedEmail);
      const adminDoc = await getDoc(doc(firestoreDb, COLLECTIONS.admins, adminId));
      if (!adminDoc.exists()) return null;
      return { id: adminDoc.id, ...(adminDoc.data() as Omit<Admin, 'id'>) };
    },

    async getAll() {
      const snapshot = await getDocs(collection(firestoreDb, COLLECTIONS.admins));
      const admins = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Admin, 'id'>),
      }));
      return admins.sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return a.email.localeCompare(b.email);
      });
    },

    async isAdminEmail(email) {
      const normalizedEmail = normalizeEmail(email);
      const adminId = adminIdFromEmail(normalizedEmail);
      const adminDoc = await getDoc(doc(firestoreDb, COLLECTIONS.admins, adminId));
      return adminDoc.exists();
    },

    async isPrimaryAdmin(email) {
      const admin = await this.getByEmail(email);
      return admin?.isPrimary === true;
    },

    async initializePrimaryAdmin() {
      const adminId = adminIdFromEmail(PRIMARY_ADMIN_EMAIL);
      const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          email: PRIMARY_ADMIN_EMAIL.toLowerCase(),
          name: 'Administrador Principal',
          createdAt: new Date().toISOString(),
          isPrimary: true,
        });
      } else {
        await updateDoc(adminRef, { isPrimary: true });
      }
    },

    async add(admin) {
      const adminRef = doc(firestoreDb, COLLECTIONS.admins, admin.id);
      const existing = await getDoc(adminRef);
      if (existing.exists()) {
        throw new Error('Este correo ya es administrador');
      }
      const { id, ...data } = admin;
      await setDoc(adminRef, data);
    },

    async update(email, patch) {
      const normalizedEmail = normalizeEmail(email);
      const adminId = adminIdFromEmail(normalizedEmail);
      const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        throw new Error('Administrador no encontrado');
      }

      await updateDoc(adminRef, patch);
    },

    async remove(email) {
      const normalizedEmail = normalizeEmail(email);

      if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
        throw new Error('No se puede eliminar al administrador principal por defecto por seguridad.');
      }

      const adminId = adminIdFromEmail(normalizedEmail);
      const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        throw new Error('Este administrador no existe');
      }

      const adminData = adminDoc.data() as Admin;
      if (adminData.isPrimary) {
        const allAdmins = await this.getAll();
        const primaryAdmins = allAdmins.filter((a) => a.isPrimary && a.email !== normalizedEmail);
        if (primaryAdmins.length === 0) {
          throw new Error('No se puede eliminar el último administrador principal. Designa otro primero.');
        }
      }

      await deleteDoc(adminRef);
    },

    async togglePrimary(email) {
      const normalizedEmail = normalizeEmail(email);

      if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
        throw new Error(
          'No se puede quitar el estado de administrador principal al administrador por defecto por seguridad.'
        );
      }

      const adminId = adminIdFromEmail(normalizedEmail);
      const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        throw new Error('Este administrador no existe');
      }

      const adminData = adminDoc.data() as Admin;
      const newPrimaryStatus = !adminData.isPrimary;

      if (!newPrimaryStatus) {
        const allAdmins = await this.getAll();
        const primaryAdmins = allAdmins.filter((a) => a.isPrimary && a.email !== normalizedEmail);
        if (primaryAdmins.length === 0) {
          throw new Error('No se puede quitar el estado de principal. Debe haber al menos un administrador principal.');
        }
      }

      await updateDoc(adminRef, { isPrimary: newPrimaryStatus });
    },
  };
}
