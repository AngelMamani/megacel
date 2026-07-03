import type { Unsubscribe } from '../types/CommonTypes.ts';
import type { HistoryEntry } from '../entities/HistoryEntry.ts';
import type { HistoryChange } from '../entities/HistoryChange.ts';
import type { HistoryAction } from '../value-objects/HistoryAction.ts';
import type { HistoryActorType } from '../value-objects/HistoryActorType.ts';
import type { HistorySection } from '../value-objects/HistorySection.ts';

export interface LogHistoryParams {
  action: HistoryAction;
  section: HistorySection;
  itemName: string;
  itemId: string;
  details?: string;
  changes?: HistoryChange[];
  actorEmail?: string;
  actorName?: string;
  actorType?: HistoryActorType;
}

export interface IHistoryRepository {
  subscribe(
    onChange: (entries: HistoryEntry[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe;

  log(params: LogHistoryParams): Promise<void>;
  compareObjects(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    fieldLabels?: Record<string, string>
  ): HistoryChange[];
}
