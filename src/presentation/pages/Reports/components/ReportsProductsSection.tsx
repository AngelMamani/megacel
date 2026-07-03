import type { ReportData } from '../types/ReportsPageTypes.ts';
import { ReportsDistributionBars } from './ReportsDistributionBars.tsx';
import { ReportsStatGrid } from './ReportsStatGrid.tsx';
import { ReportsWeeklyQuantityChart } from './ReportsWeeklyQuantityChart.tsx';
import { FormatReportCurrency } from '../utils/reportsPresentationUtils.ts';

interface ReportsProductsSectionProps {
  Data: ReportData;
}

export const ReportsProductsSection = ({ Data }: ReportsProductsSectionProps) => (
  <div className="reports-section">
    <header className="reports-section__header">
      <h2 className="reports-section__title">Reporte de productos · Semana actual</h2>
      <p className="reports-section__subtitle">{Data.weekRangeLabel}</p>
    </header>

    <article className="reports-panel">
      <h3 className="reports-panel__title">Resumen de inventario</h3>
      <ReportsStatGrid
        Items={[
          { label: 'Total productos', value: Data.products.total },
          { label: 'Activos', value: Data.products.active, tone: 'success' },
          { label: 'Inactivos', value: Data.products.inactive, tone: 'muted' },
          { label: 'Stock bajo', value: Data.products.lowStock, tone: 'warning' },
          {
            label: 'Valor total',
            value: FormatReportCurrency(Data.products.totalValue),
            tone: 'highlight',
          },
        ]}
      />
    </article>

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
      <ReportsDistributionBars
        Title="Comparativo de inventario"
        UnitLabel="productos"
        Items={[
          { label: 'Activos', value: Data.products.active, tone: 'success' },
          { label: 'Inactivos', value: Data.products.inactive, tone: 'muted' },
          { label: 'Stock bajo', value: Data.products.lowStock, tone: 'warning' },
        ]}
      />
    </article>
  </div>
);
