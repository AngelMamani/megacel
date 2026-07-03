import type { CSSProperties } from 'react';
import type { HistoryEntry } from '../../../../domain/entities/HistoryEntry.ts';
import { FormatHistoryDateTime } from '../utils/historyPresentationUtils.ts';
import { HistoryActionBadge, HistoryActorBadge, HistorySectionBadge } from './HistoryBadges.tsx';

interface HistoryEntryCardProps {
  Entry: HistoryEntry;
  Index: number;
  IsLast: boolean;
}

export const HistoryEntryCard = ({ Entry, Index, IsLast }: HistoryEntryCardProps) => (
  <article
    className="history-entry"
    style={{ '--entry-delay': `${Math.min(Index * 35, 280)}ms` } as CSSProperties}
  >
    <div className="history-entry__rail" aria-hidden="true">
      <span className={`history-entry__dot history-entry__dot--${Entry.action}`} />
      {!IsLast && <span className="history-entry__line" />}
    </div>

    <div className="history-entry__body">
      <header className="history-entry__header">
        <div className="history-entry__title-row">
          <HistoryActionBadge Action={Entry.action} />
          <HistoryActorBadge Entry={Entry} />
          <strong className="history-entry__item">{Entry.itemName}</strong>
          <HistorySectionBadge Section={Entry.section} />
        </div>
        <time className="history-entry__time" dateTime={Entry.timestamp}>
          {FormatHistoryDateTime(Entry.timestamp)}
        </time>
      </header>

      {(Entry.actorName || Entry.actorEmail) && (
        <p className="history-entry__actor">
          Por {Entry.actorName || Entry.actorEmail}
          {Entry.actorName && Entry.actorEmail ? ` · ${Entry.actorEmail}` : ''}
        </p>
      )}

      {Entry.details && <p className="history-entry__details">{Entry.details}</p>}

      {Entry.changes && Entry.changes.length > 0 && (
        <div className="history-entry__changes">
          <span className="history-entry__changes-title">Cambios realizados</span>
          <ul className="history-entry__changes-list">
            {Entry.changes.map((change, idx) => (
              <li key={idx} className="history-change">
                <span className="history-change__field">{change.field}</span>
                <div className="history-change__values">
                  <span className="history-change__before">
                    <span className="history-change__label">Antes</span>
                    <span className="history-change__value">{change.before}</span>
                  </span>
                  <span className="history-change__arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="history-change__after">
                    <span className="history-change__label">Después</span>
                    <span className="history-change__value">{change.after}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="history-entry__footer">
        <span className="history-entry__ref">ID: {Entry.itemId}</span>
      </footer>
    </div>
  </article>
);
