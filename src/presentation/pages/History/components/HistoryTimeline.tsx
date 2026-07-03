import type { HistoryMonthGroup } from '../types/HistoryPageTypes.ts';
import { HistoryEntryCard } from './HistoryEntryCard.tsx';

interface HistoryTimelineProps {
  Groups: HistoryMonthGroup[];
}

export const HistoryTimeline = ({ Groups }: HistoryTimelineProps) => (
  <div className="history-timeline">
    {Groups.map((month) => (
      <section key={month.key} className="history-month">
        <div className="history-month__header">
          <span className="history-month__line" aria-hidden="true" />
          <h2 className="history-month__title">{month.label}</h2>
          <span className="history-month__line" aria-hidden="true" />
        </div>

        {month.days.map((day) => (
          <div key={day.key} className="history-day">
            <div className="history-day__header">
              <h3 className="history-day__title">{day.label}</h3>
              <span className="history-day__count">
                {day.entries.length} {day.entries.length === 1 ? 'acción' : 'acciones'}
              </span>
            </div>

            <div className="history-day__entries">
              {day.entries.map((entry, index) => (
                <HistoryEntryCard
                  key={entry.id}
                  Entry={entry}
                  Index={index}
                  IsLast={index === day.entries.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    ))}
  </div>
);
