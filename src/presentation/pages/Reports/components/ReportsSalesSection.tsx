import type { ReportData } from '../types/ReportsPageTypes.ts';
import { ReportsDataTable } from './ReportsDataTable.tsx';
import { ReportsStatGrid } from './ReportsStatGrid.tsx';
import { ReportsWeeklyQuantityChart } from './ReportsWeeklyQuantityChart.tsx';

interface ReportsSalesSectionProps {
  Data: ReportData;
  FormatCurrency: (amount: number) => string;
}

export const ReportsSalesSection = ({
  Data,
  FormatCurrency,
}: ReportsSalesSectionProps) => (
  <div className="reports-section">
    <header className="reports-section__header">
      <h2 className="reports-section__title">Reporte de ventas · Semana actual</h2>
      <p className="reports-section__subtitle">{Data.weekRangeLabel}</p>
    </header>

    <article className="reports-panel">
      <h3 className="reports-panel__title">Resumen de ventas</h3>
      <ReportsStatGrid
        Items={[
          { label: 'Total ventas', value: Data.sales.total },
          { label: 'Completadas', value: Data.sales.completed, tone: 'success' },
          { label: 'Pendientes', value: Data.sales.pending, tone: 'warning' },
          { label: 'Canceladas', value: Data.sales.cancelled, tone: 'danger' },
          { label: 'Ingresos totales', value: FormatCurrency(Data.sales.revenue), tone: 'highlight' },
        ]}
      />
    </article>

    <article className="reports-panel">
      <ReportsWeeklyQuantityChart
        Data={Data.weeklySalesByDay}
        Title="Cantidad vendida por día"
        MetricLabel="Unidades vendidas"
        UnitSuffix="uds."
        WeekLabel={Data.weekRangeLabel}
      />
    </article>

    <ReportsDataTable
      Title="Productos más vendidos"
      Rows={Data.topProducts}
      FormatCurrency={FormatCurrency}
    />
  </div>
);
