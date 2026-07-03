import type { EntityId, Timestamp } from '../types/CommonTypes.ts';
import type { HistoryChange } from './HistoryChange.ts';
import type { HistoryAction } from '../value-objects/HistoryAction.ts';
import type { HistoryActorType } from '../value-objects/HistoryActorType.ts';
import type { HistorySection } from '../value-objects/HistorySection.ts';

/** Entrada de auditoría: quién cambió qué y cuándo. */
export interface HistoryEntry {
  id: EntityId;
  action: HistoryAction;
  section: HistorySection;
  itemName: string;
  itemId: EntityId;
  timestamp: Timestamp;
  details?: string;
  changes?: HistoryChange[];
  actorEmail?: string;
  actorName?: string;
  actorType?: HistoryActorType;
}
