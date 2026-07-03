interface ReportStatItem {
  label: string;
  value: string | number;
  tone?: 'success' | 'warning' | 'danger' | 'muted' | 'highlight' | 'primary' | 'accent';
}

interface ReportsStatGridProps {
  Items: ReportStatItem[];
}

export const ReportsStatGrid = ({ Items }: ReportsStatGridProps) => (
  <div className="reports-stat-grid">
    {Items.map((item) => (
      <article
        key={item.label}
        className={[
          'reports-stat-grid__item',
          item.tone ? `reports-stat-grid__item--${item.tone}` : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="reports-stat-grid__label">{item.label}</span>
        <strong className="reports-stat-grid__value">{item.value}</strong>
      </article>
    ))}
  </div>
);
