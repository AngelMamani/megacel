import type { ReportData } from '../types/ReportsPageTypes.ts';
import {
  FormatIntegerQuantity,
  GetChartScaleMax,
  GetRelativeBarPercent,
} from '../utils/reportsChartUtils.ts';
import { ReportsDataTable } from './ReportsDataTable.tsx';
import { ReportsWeeklyQuantityChart } from './ReportsWeeklyQuantityChart.tsx';

interface ReportsCategoriesSectionProps {
  Data: ReportData;
  FormatCurrency: (amount: number) => string;
}

export const ReportsCategoriesSection = ({
  Data,
  FormatCurrency,
}: ReportsCategoriesSectionProps) => {
  const maxCategorySales = GetChartScaleMax(Data.topCategories.map((category) => category.sales));

  return (
    <div className="reports-section">
      <header className="reports-section__header">
        <h2 className="reports-section__title">Reporte de categorías · Semana actual</h2>
        <p className="reports-section__subtitle">{Data.weekRangeLabel}</p>
      </header>

      <article className="reports-panel">
        <ReportsWeeklyQuantityChart
          Data={Data.weeklySalesByDay}
          Title="Unidades vendidas por día"
          MetricLabel="Unidades vendidas"
          UnitSuffix="uds."
          WeekLabel={Data.weekRangeLabel}
        />
      </article>

      <article className="reports-panel">
        <div className="reports-distribution__header">
          <h3 className="reports-panel__title">Categorías más vendidas</h3>
          {maxCategorySales > 0 && (
            <span className="reports-chart__legend">
              Máximo: {FormatIntegerQuantity(maxCategorySales)} uds.
            </span>
          )}
        </div>
        {Data.topCategories.length === 0 ? (
          <p className="reports-table-panel__empty">No hay ventas por categoría en esta semana.</p>
        ) : (
          <div className="reports-category-list">
            {Data.topCategories.map((category) => {
              const barWidth = GetRelativeBarPercent(category.sales, maxCategorySales);
              const isMax = category.sales === maxCategorySales && category.sales > 0;

              return (
                <article key={category.id} className="reports-category-card">
                  <div className="reports-category-card__head">
                    <strong>{category.name}</strong>
                    <span>{FormatIntegerQuantity(category.sales)} uds.</span>
                  </div>
                  <div className="reports-category-card__track">
                    <div
                      className="reports-category-card__fill"
                      style={{ width: `${Math.max(barWidth, category.sales > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <div className="reports-category-card__foot">
                    <span>{FormatCurrency(category.revenue)}</span>
                    <strong>{isMax ? 'Mayor venta' : `${FormatIntegerQuantity(category.sales)} / ${FormatIntegerQuantity(maxCategorySales)}`}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </article>

      <ReportsDataTable
        Title="Detalle por categoría"
        Rows={Data.topCategories}
        FormatCurrency={FormatCurrency}
      />
    </div>
  );
};
