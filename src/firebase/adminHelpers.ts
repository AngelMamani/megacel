import { COLLECTIONS } from './collections';
import { getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';

export interface Admin {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  createdBy?: string;
  isPrimary?: boolean;
}

const PRIMARY_ADMIN_EMAIL = 'amamanim@unamad.edu.pe';

export function adminIdFromEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.replace(/[^a-z0-9]/g, '-');
}

export async function initializePrimaryAdmin(): Promise<void> {
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
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(adminRef, {
      isPrimary: true,
    });
  }
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminId = adminIdFromEmail(normalizedEmail);
  const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
  
  const adminDoc = await getDoc(adminRef);
  return adminDoc.exists();
}

export async function isPrimaryAdmin(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminId = adminIdFromEmail(normalizedEmail);
  const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
  
  const adminDoc = await getDoc(adminRef);
  if (!adminDoc.exists()) return false;
  
  const adminData = adminDoc.data() as Admin;
  return adminData.isPrimary === true;
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminId = adminIdFromEmail(normalizedEmail);
  const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
  
  const adminDoc = await getDoc(adminRef);
  if (!adminDoc.exists()) return null;
  
  return {
    id: adminDoc.id,
    ...(adminDoc.data() as Omit<Admin, 'id'>),
  };
}

export async function getAllAdmins(): Promise<Admin[]> {
  const { getDocs, collection } = await import('firebase/firestore');
  const { firestoreDb } = await import('./firebase');
  
  const adminsRef = collection(firestoreDb, COLLECTIONS.admins);
  const snapshot = await getDocs(adminsRef);
  
  const admins = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Admin, 'id'>),
  }));
  
  return admins.sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.email.localeCompare(b.email);
  });
}

export async function addAdmin(email: string, name: string, createdBy: string, isPrimary: boolean = false): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  
  const adminId = adminIdFromEmail(normalizedEmail);
  const adminRef = doc(firestoreDb, COLLECTIONS.admins, adminId);
  
  const adminDoc = await getDoc(adminRef);
  if (adminDoc.exists()) {
    throw new Error('Este correo ya es administrador');
  }
  
  await setDoc(adminRef, {
    email: normalizedEmail,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    createdBy,
    isPrimary,
  });
}

export async function removeAdmin(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  
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
    const allAdmins = await getAllAdmins();
    const primaryAdmins = allAdmins.filter(a => a.isPrimary && a.email !== normalizedEmail);
    
    if (primaryAdmins.length === 0) {
      throw new Error('No se puede eliminar el último administrador principal. Designa otro primero.');
    }
  }
  
  await deleteDoc(adminRef);
}

export async function togglePrimaryAdmin(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('No se puede quitar el estado de administrador principal al administrador por defecto por seguridad.');
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
    const allAdmins = await getAllAdmins();
    const primaryAdmins = allAdmins.filter(a => a.isPrimary && a.email !== normalizedEmail);
    
    if (primaryAdmins.length === 0) {
      throw new Error('No se puede quitar el estado de principal. Debe haber al menos un administrador principal.');
    }
  }

  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(adminRef, {
    isPrimary: newPrimaryStatus,
  });
}

