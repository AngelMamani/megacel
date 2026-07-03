import { IconChart } from './ReportsIcons.tsx';

interface ReportsEmptyStateProps {
  Title: string;
  Message: string;
}

export const ReportsEmptyState = ({ Title, Message }: ReportsEmptyStateProps) => (
  <div className="reports-empty">
    <div className="reports-empty__icon" aria-hidden="true">
      <IconChart />
    </div>
    <h2 className="reports-empty__title">{Title}</h2>
    <p className="reports-empty__text">{Message}</p>
  </div>
);
