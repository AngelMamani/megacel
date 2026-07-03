import { useEffect, useRef } from 'react';
import type { HistoryWeekdayTab } from '../types/HistoryPageTypes.ts';

interface HistoryWeekdayTabsProps {
  Tabs: HistoryWeekdayTab[];
  SelectedKey: string;
  WeekLabel: string;
  OnSelect: (dateKey: string) => void;
}

export const HistoryWeekdayTabs = ({
  Tabs,
  SelectedKey,
  WeekLabel,
  OnSelect,
}: HistoryWeekdayTabsProps) => {
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [SelectedKey]);

  return (
    <nav className="history-weekdays" aria-label="Días de la semana">
      <div className="history-weekdays__head">
        <p className="history-weekdays__range">{WeekLabel}</p>
        <span className="history-weekdays__hint history-weekdays__hint--desktop">
          Lunes a domingo · hora Perú
        </span>
        <span className="history-weekdays__hint history-weekdays__hint--mobile">
          Lun–Dom · hora Perú · desliza para ver más
        </span>
      </div>

      <div className="history-weekdays__list" role="tablist">
        {Tabs.map((tab) => {
          const isActive = tab.key === SelectedKey;

          return (
            <button
              key={tab.key}
              ref={isActive ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                'history-weekdays__tab',
                isActive ? 'is-active' : '',
                tab.isToday ? 'is-today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => OnSelect(tab.key)}
            >
              <span className="history-weekdays__tab-day">{tab.weekdayLabel}</span>
              <span className="history-weekdays__tab-date">{tab.dateLabel}</span>
              {tab.isToday && <span className="history-weekdays__tab-badge">Hoy</span>}
              <span className="history-weekdays__tab-count">
                {tab.entryCount} {tab.entryCount === 1 ? 'reg.' : 'regs.'}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
