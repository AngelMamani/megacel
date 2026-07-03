import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestoreDb } from '../config/FirebaseConfig.ts';

export type FirestoreId = string;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function stripUndefined(value: unknown): unknown {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((v) => v !== undefined);
  }

  if (!isPlainObject(value)) return value;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    const sanitized = stripUndefined(v);
    if (sanitized !== undefined) out[k] = sanitized;
  }
  return out;
}

export function subscribeCollection<T extends { id: FirestoreId }>(
  collectionName: string,
  onChange: (items: T[]) => void,
  onError?: (error: unknown) => void
) {
  const colRef = collection(firestoreDb, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
      onChange(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function getDocById<T extends { id: FirestoreId }>(
  collectionName: string,
  id: FirestoreId
): Promise<T | null> {
  const snap = await getDoc(doc(firestoreDb, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as object) } as T;
}

export async function setDocById<T extends object>(
  collectionName: string,
  id: FirestoreId,
  data: T
) {
  const sanitized = stripUndefined(data) as T;
  await setDoc(doc(firestoreDb, collectionName, id), sanitized, { merge: false });
}

export async function updateDocById<T extends object>(
  collectionName: string,
  id: FirestoreId,
  patch: Partial<T>
) {
  const sanitized = stripUndefined(patch) as Partial<T>;
  await updateDoc(doc(firestoreDb, collectionName, id), sanitized as object);
}

export async function deleteDocById(collectionName: string, id: FirestoreId) {
  await deleteDoc(doc(firestoreDb, collectionName, id));
}

export async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  const colRef = collection(firestoreDb, collectionName);
  const snap = await getDocs(query(colRef, limit(1)));
  return snap.empty;
}

export async function getFirstDocByField<T extends { id: FirestoreId }>(
  collectionName: string,
  field: string,
  value: string
): Promise<T | null> {
  const colRef = collection(firestoreDb, collectionName);
  const snap = await getDocs(query(colRef, where(field, '==', value), limit(1)));
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as object) } as T;
}

export function subscribeCollectionWhere<T extends { id: FirestoreId }>(
  collectionName: string,
  field: string,
  value: string,
  onChange: (items: T[]) => void,
  onError?: (error: unknown) => void
) {
  const colRef = collection(firestoreDb, collectionName);
  const q = query(colRef, where(field, '==', value));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
      onChange(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
