import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import type { IHistoryRepository, LogHistoryParams } from '../../../domain/repositories/IHistoryRepository.ts';
import type { HistoryEntry } from '../../../domain/entities/HistoryEntry.ts';
import type { HistoryChange } from '../../../domain/entities/HistoryChange.ts';
import { COLLECTIONS } from '../config/Collections.ts';
import { firestoreDb, firebaseAuth } from '../config/FirebaseConfig.ts';
import { compareHistoryObjects } from '../helpers/HistoryCompareHelpers.ts';
import { setDocById, stripUndefined } from '../helpers/FirestoreHelpers.ts';

const LEGACY_STORAGE_KEY = 'mega_cel_history';

function sanitizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const safe = normalized
    .replace(/\//g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safe || 'item';
}

function formatDateKey(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}-${pad(date.getMilliseconds(), 3)}`;
}

function buildHistoryDocId(params: {
  section: LogHistoryParams['section'];
  itemId: string;
  timestamp?: string;
  nonce?: string;
}): string {
  const baseItemId = sanitizeIdPart(params.itemId);
  const date = params.timestamp ? new Date(params.timestamp) : new Date();
  const dateKey = Number.isFinite(date.getTime()) ? formatDateKey(date) : formatDateKey(new Date());
  const nonce = params.nonce ? sanitizeIdPart(params.nonce) : Math.random().toString(36).slice(2, 6);
  return `${dateKey}-${params.section}-${baseItemId}-${nonce}`;
}

export function createFirestoreHistoryRepository(): IHistoryRepository {
  return {
    subscribe(onChange, onError) {
      const colRef = collection(firestoreDb, COLLECTIONS.history);
      const q = query(colRef, orderBy('createdAt', 'desc'), limit(2000));

      return onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => {
            const data = d.data() as {
              action: HistoryEntry['action'];
              section: HistoryEntry['section'];
              itemName: string;
              itemId: string;
              details?: string;
              changes?: HistoryChange[];
              actorEmail?: string;
              actorName?: string;
              actorType?: HistoryEntry['actorType'];
              createdAt?: { toDate?: () => Date };
            };
            const ts = data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString();
            return {
              id: d.id,
              action: data.action,
              section: data.section,
              itemName: data.itemName,
              itemId: data.itemId,
              timestamp: ts,
              details: data.details,
              changes: data.changes,
              actorEmail: data.actorEmail,
              actorName: data.actorName,
            } satisfies HistoryEntry;
          });
          onChange(items);
        },
        (error) => {
          if (onError) onError(error);
        }
      );
    },

    async log(params) {
      const currentUser = firebaseAuth.currentUser;
      const id = buildHistoryDocId({ section: params.section, itemId: params.itemId });

      await setDocById(COLLECTIONS.history, id, {
        action: params.action,
        section: params.section,
        itemName: params.itemName,
        itemId: params.itemId,
        details: params.details,
        changes: params.changes,
        actorEmail: params.actorEmail ?? currentUser?.email,
        actorName: params.actorName ?? currentUser?.displayName,
        actorType: params.actorType,
        createdAt: serverTimestamp(),
      });
    },

    compareObjects(before, after, fieldLabels) {
      return compareHistoryObjects(before, after, fieldLabels);
    },
  };
}

export async function migrateLegacyLocalHistory(): Promise<void> {
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    const historyCol = collection(firestoreDb, COLLECTIONS.history);
    const existing = await getDocs(query(historyCol, limit(1)));
    if (!existing.empty) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }

    const entries = parsed as HistoryEntry[];
    const batch = writeBatch(firestoreDb);
    const usedIds = new Set<string>();
    const slice = entries.slice(0, 1000);

    for (const entry of slice) {
      const ts = new Date(entry.timestamp);
      const createdAt = Number.isFinite(ts.getTime())
        ? Timestamp.fromDate(ts)
        : Timestamp.fromDate(new Date());

      let docId = buildHistoryDocId({
        section: entry.section,
        itemId: entry.itemId,
        timestamp: entry.timestamp,
        nonce: entry.id || undefined,
      });

      let i = 2;
      while (usedIds.has(docId)) {
        docId = `${docId}-${i++}`;
      }
      usedIds.add(docId);

      batch.set(
        doc(historyCol, docId),
        stripUndefined({
          action: entry.action,
          section: entry.section,
          itemName: entry.itemName,
          itemId: entry.itemId,
          details: entry.details,
          changes: entry.changes,
          actorEmail: entry.actorEmail,
          actorName: entry.actorName,
          createdAt,
        }) as object
      );
    }

    await batch.commit();
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.error('Error migrando historial local a Firestore:', error);
  }
}
