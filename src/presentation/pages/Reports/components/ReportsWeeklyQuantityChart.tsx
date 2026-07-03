import type { ReportWeeklyDaySale } from '../types/ReportsPageTypes.ts';
import {
  BuildIntegerYAxisTicks,
  FormatIntegerQuantity,
  GetChartScaleMax,
  GetRelativeBarPercent,
} from '../utils/reportsChartUtils.ts';

interface ReportsWeeklyQuantityChartProps {
  Data: ReportWeeklyDaySale[];
  Title: string;
  MetricLabel: string;
  UnitSuffix?: string;
  WeekLabel: string;
}

export const ReportsWeeklyQuantityChart = ({
  Data,
  Title,
  MetricLabel,
  UnitSuffix = 'uds.',
  WeekLabel,
}: ReportsWeeklyQuantityChartProps) => {
  const scaleMax = GetChartScaleMax(Data.map((item) => item.quantity));
  const yAxisTicks = BuildIntegerYAxisTicks(scaleMax);

  if (scaleMax <= 0) {
    return (
      <div className="reports-histogram">
        <div className="reports-chart__header">
          <div>
            <h3 className="reports-panel__title">{Title}</h3>
            <p className="reports-chart__subtitle">Histograma · Lunes a domingo · {WeekLabel}</p>
          </div>
        </div>
        <p className="reports-chart__empty">Sin {MetricLabel.toLowerCase()} registradas esta semana.</p>
      </div>
    );
  }

  return (
    <div className="reports-histogram">
      <div className="reports-chart__header">
        <div>
          <h3 className="reports-panel__title">{Title}</h3>
          <p className="reports-chart__subtitle">Histograma · Lunes a domingo · {WeekLabel}</p>
        </div>
        <span className="reports-chart__legend">
          Máximo: {FormatIntegerQuantity(scaleMax)} {UnitSuffix}
        </span>
      </div>

      <div className="reports-histogram__plot" role="img" aria-label={`Histograma de ${MetricLabel.toLowerCase()} por día`}>
        <div className="reports-histogram__y-axis" aria-hidden="true">
          {yAxisTicks.map((tick) => (
            <span key={tick}>{FormatIntegerQuantity(tick)}</span>
          ))}
        </div>

        <div className="reports-histogram__chart-area">
          <div className="reports-histogram__grid" aria-hidden="true">
            {yAxisTicks.map((tick) => (
              <span key={tick} />
            ))}
          </div>

          <div className="reports-histogram__bars">
            {Data.map((item, index) => {
              const barHeight = GetRelativeBarPercent(item.quantity, scaleMax);

              return (
                <div
                  key={item.period}
                  className="reports-histogram__bin"
                  title={`${item.weekdayFull} ${item.dateLabel}: ${item.quantity} ${UnitSuffix}`}
                >
                  <div className="reports-histogram__bin-inner">
                    {item.quantity > 0 && (
                      <span className="reports-histogram__bin-value">
                        {FormatIntegerQuantity(item.quantity)}
                      </span>
                    )}
                    <div
                      className="reports-histogram__bar"
                      style={{
                        height: `${Math.max(barHeight, item.quantity > 0 ? 4 : 0)}%`,
                        animationDelay: `${index * 0.05}s`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="reports-histogram__x-axis" aria-hidden="true">
          {Data.map((item) => (
            <div key={`${item.period}-axis`} className="reports-histogram__x-tick">
              <span className="reports-histogram__x-day">{item.label}</span>
              <span className="reports-histogram__x-date">{item.dateLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
