import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestoreDb } from './firebase';

export type FirestoreId = string;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function stripUndefined(value: unknown): unknown {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    const sanitized = value
      .map(stripUndefined)
      .filter((v) => v !== undefined);
    return sanitized;
  }

  if (!isPlainObject(value)) {
    return value;
  }

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


