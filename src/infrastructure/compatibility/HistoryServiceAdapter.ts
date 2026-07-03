import type { HistoryChange } from '../../domain/entities/HistoryChange.ts';
import type { HistoryEntry } from '../../domain/entities/HistoryEntry.ts';
import { getInfrastructure } from '../index.ts';
import { compareHistoryObjects } from '../firebase/helpers/HistoryCompareHelpers.ts';

export type { HistoryChange, HistoryEntry };

export function compareObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fieldLabels?: Record<string, string>
): HistoryChange[] {
  return compareHistoryObjects(before, after, fieldLabels);
}

/** Adaptador de compatibilidad — delega al repositorio de historial. */
export const historyService = {
  async addAsync(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<string> {
    await getInfrastructure().application.history.log.execute(entry);
    return entry.itemId;
  },

  async migrateLegacyLocalHistory(): Promise<void> {
    return getInfrastructure().migrateLegacyLocalHistory();
  },

  subscribe(
    params: { limitCount?: number },
    onChange: (items: HistoryEntry[]) => void,
    onError?: (error: unknown) => void
  ) {
    void params;
    return getInfrastructure().repositories.history.subscribe(onChange, onError);
  },

  add(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
    void this.addAsync(entry).catch((error) => {
      console.error('Error guardando historial en Firestore:', error);
    });
  },
};
