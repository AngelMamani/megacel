import {
  GetActionLabel,
  GetActionTone,
  GetActorTypeLabel,
  GetSectionLabel,
  GetSectionTone,
  ResolveHistoryFeedCategory,
} from '../utils/historyPresentationUtils.ts';
import { HistoryActionIcon } from './HistoryIcons.tsx';

interface HistoryActionBadgeProps {
  Action: string;
}

export const HistoryActionBadge = ({ Action }: HistoryActionBadgeProps) => (
  <span className={`history-action-badge history-action-badge--${GetActionTone(Action)}`}>
    <span className="history-action-badge__icon" aria-hidden="true">
      <HistoryActionIcon Action={Action} size={14} />
    </span>
    {GetActionLabel(Action)}
  </span>
);

interface HistorySectionBadgeProps {
  Section: string;
}

export const HistorySectionBadge = ({ Section }: HistorySectionBadgeProps) => (
  <span className={`history-section-badge history-section-badge--${GetSectionTone(Section)}`}>
    {GetSectionLabel(Section)}
  </span>
);

interface HistoryActorBadgeProps {
  Entry: import('../../../../domain/entities/HistoryEntry.ts').HistoryEntry;
}

export const HistoryActorBadge = ({ Entry }: HistoryActorBadgeProps) => {
  const category = ResolveHistoryFeedCategory(Entry);
  return (
    <span className={`history-actor-badge history-actor-badge--${category}`}>
      {GetActorTypeLabel(Entry)}
    </span>
  );
};
