import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { firestoreDb, firebaseAuth } from '../firebase/firebase';
import { COLLECTIONS } from '../firebase/collections';

export interface HistoryChange {
  field: string;
  before: string | number | boolean | null | undefined;
  after: string | number | boolean | null | undefined;
}

export interface HistoryEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'deactivate' | 'reactivate';
  section: 'products' | 'categories' | 'brands' | 'orders' | 'users';
  itemName: string;
  itemId: string;
  timestamp: string;
  details?: string;
  changes?: HistoryChange[];
  actorEmail?: string;
  actorName?: string;
}

const LEGACY_STORAGE_KEY = 'mega_cel_history';

function sanitizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Firestore doc IDs cannot contain '/'
  const safe = normalized
    .replace(/\//g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return safe || 'item';
}

function formatDateKey(date: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);
  // Ej: 20260126-204530-123
  return `${y}${m}${d}-${hh}${mm}${ss}-${ms}`;
}

function buildHistoryDocId(params: {
  section: HistoryEntry['section'];
  itemId: string;
  timestamp?: string;
  nonce?: string;
}): string {
  const baseItemId = sanitizeIdPart(params.itemId);
  const date = params.timestamp ? new Date(params.timestamp) : new Date();
  const dateKey = Number.isFinite(date.getTime()) ? formatDateKey(date) : formatDateKey(new Date());
  const nonce = params.nonce ? sanitizeIdPart(params.nonce) : Math.random().toString(36).slice(2, 6);
  // Fecha primero: ordenable rápidamente por ID
  return `${dateKey}-${params.section}-${baseItemId}-${nonce}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') {
    // Si es un precio, formatear como moneda
    if (value > 100) {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      }).format(value);
    }
    return value.toString();
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Ninguno';
    return `${value.length} elemento${value.length > 1 ? 's' : ''}`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return 'Ninguno';
    return `${keys.length} campo${keys.length > 1 ? 's' : ''}`;
  }
  return String(value);
}

export function compareObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fieldLabels?: Record<string, string>
): HistoryChange[] {
  const changes: HistoryChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  // Campos a ignorar (metadatos que no son relevantes para el usuario)
  const ignoredFields = new Set(['editedAt', 'createdAt', 'id', 'images']);
  
  for (const key of allKeys) {
    if (ignoredFields.has(key)) continue;
    
    const beforeValue = before[key];
    const afterValue = after[key];
    
    // Comparar valores (considerando null/undefined como iguales)
    const beforeNormalized = beforeValue === null || beforeValue === undefined ? null : beforeValue;
    const afterNormalized = afterValue === null || afterValue === undefined ? null : afterValue;
    
    // Si son iguales, continuar
    if (JSON.stringify(beforeNormalized) === JSON.stringify(afterNormalized)) {
      continue;
    }
    
    const fieldLabel = fieldLabels?.[key] || key.charAt(0).toUpperCase() + key.slice(1);
    
    changes.push({
      field: fieldLabel,
      before: formatValue(beforeValue),
      after: formatValue(afterValue),
    });
  }
  
  return changes;
}

export const historyService = {
  async addAsync(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const currentUser = firebaseAuth.currentUser;
    const actorEmail = currentUser?.email || undefined;
    const actorName = currentUser?.displayName || undefined;

    const id = buildHistoryDocId({
      section: entry.section,
      itemId: entry.itemId,
    });

    await setDoc(doc(firestoreDb, COLLECTIONS.history, id), {
      ...entry,
      actorEmail,
      actorName,
      createdAt: serverTimestamp(),
    });

    return id;
  },

  async migrateLegacyLocalHistory(): Promise<void> {
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
        // Ya hay datos en Firestore; evitamos duplicar y limpiamos el legacy local.
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return;
      }

      const entries = parsed as HistoryEntry[];
      const batch = writeBatch(firestoreDb);
      const usedIds = new Set<string>();

      // Para no exceder límites, migramos como máximo 1000 entradas.
      const slice = entries.slice(0, 1000);
      for (const entry of slice) {
        const ts = new Date(entry.timestamp);
        const createdAt = Number.isFinite(ts.getTime()) ? Timestamp.fromDate(ts) : Timestamp.fromDate(new Date());
        let docId = buildHistoryDocId({
          section: entry.section,
          itemId: entry.itemId,
          timestamp: entry.timestamp,
          nonce: entry.id || undefined,
        });

        // Evitar colisiones dentro del mismo batch.
        let i = 2;
        while (usedIds.has(docId)) {
          docId = `${docId}-${i++}`;
        }
        usedIds.add(docId);

        const ref = doc(historyCol, docId);
        batch.set(ref, {
          action: entry.action,
          section: entry.section,
          itemName: entry.itemName,
          itemId: entry.itemId,
          details: entry.details,
          changes: entry.changes,
          actorEmail: entry.actorEmail,
          actorName: entry.actorName,
          createdAt,
        });
      }

      await batch.commit();
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Error migrando historial local a Firestore:', error);
    }
  },

  subscribe(
    params: { limitCount?: number },
    onChange: (items: HistoryEntry[]) => void,
    onError?: (error: unknown) => void
  ) {
    const limitCount = params.limitCount ?? 2000;
    const colRef = collection(firestoreDb, COLLECTIONS.history);
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));

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
            createdAt?: { toDate?: () => Date };
          };
          const ts = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
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

  add(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
    void this.addAsync(entry).catch((error) => {
      console.error('Error guardando historial en Firestore:', error);
    });
  },
};

