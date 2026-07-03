import type { HistoryEntry } from '../../../../domain/entities/HistoryEntry.ts';

export interface HistoryStats {
  Total: number;
  Today: number;
  Creates: number;
  Modifications: number;
}

export interface HistoryDayGroup {
  key: string;
  label: string;
  entries: HistoryEntry[];
}

export interface HistoryMonthGroup {
  key: string;
  label: string;
  days: HistoryDayGroup[];
}

export interface HistoryWeekdayTab {
  key: string;
  weekdayLabel: string;
  weekdayFull: string;
  dateLabel: string;
  isToday: boolean;
  entryCount: number;
}

export type HistoryFeedCategory = 'admin' | 'client' | 'login';
