import type { HistoryEntry } from '../../../../domain/entities/HistoryEntry.ts';
import { HistoryEntryCard } from './HistoryEntryCard.tsx';

interface HistoryDayViewProps {
  DayLabel: string;
  Entries: HistoryEntry[];
}

export const HistoryDayView = ({ DayLabel, Entries }: HistoryDayViewProps) => (
  <section className="history-day-view">
    <header className="history-day-view__header">
      <h2 className="history-day-view__title">{DayLabel}</h2>
      <span className="history-day-view__count">
        {Entries.length} {Entries.length === 1 ? 'acción' : 'acciones'}
      </span>
    </header>

    <div className="history-day-view__entries">
      {Entries.map((entry, index) => (
        <HistoryEntryCard
          key={entry.id}
          Entry={entry}
          Index={index}
          IsLast={index === Entries.length - 1}
        />
      ))}
    </div>
  </section>
);
