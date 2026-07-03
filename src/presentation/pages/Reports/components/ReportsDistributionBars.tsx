import {
  FormatIntegerQuantity,
  GetChartScaleMax,
  GetRelativeBarPercent,
} from '../utils/reportsChartUtils.ts';

interface DistributionItem {
  label: string;
  value: number;
  tone: 'success' | 'muted' | 'warning' | 'primary' | 'accent';
}

interface ReportsDistributionBarsProps {
  Title: string;
  Items: DistributionItem[];
  UnitLabel?: string;
}

export const ReportsDistributionBars = ({
  Title,
  Items,
  UnitLabel = '',
}: ReportsDistributionBarsProps) => {
  const scaleMax = GetChartScaleMax(Items.map((item) => item.value));

  if (scaleMax <= 0) {
    return (
      <section className="reports-distribution">
        <h3 className="reports-panel__title">{Title}</h3>
        <p className="reports-chart__empty">Sin datos para comparar.</p>
      </section>
    );
  }

  return (
    <section className="reports-distribution">
      <div className="reports-distribution__header">
        <h3 className="reports-panel__title">{Title}</h3>
        <span className="reports-chart__legend">
          Máximo: {FormatIntegerQuantity(scaleMax)}{UnitLabel ? ` ${UnitLabel}` : ''}
        </span>
      </div>
      <div className="reports-distribution__list">
        {Items.map((item) => {
          const barWidth = GetRelativeBarPercent(item.value, scaleMax);
          const isMax = item.value === scaleMax && item.value > 0;

          return (
            <article key={item.label} className="reports-distribution__item">
              <div className="reports-distribution__track">
                <div
                  className={`reports-distribution__fill reports-distribution__fill--${item.tone}`}
                  style={{ width: `${Math.max(barWidth, item.value > 0 ? 4 : 0)}%` }}
                />
              </div>
              <div className="reports-distribution__meta">
                <span>
                  {item.label}: {FormatIntegerQuantity(item.value)}
                  {UnitLabel ? ` ${UnitLabel}` : ''}
                </span>
                <strong>{isMax ? 'Mayor valor' : `${FormatIntegerQuantity(item.value)} / ${FormatIntegerQuantity(scaleMax)}`}</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
