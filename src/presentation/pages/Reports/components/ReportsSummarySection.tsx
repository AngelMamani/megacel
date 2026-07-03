import type { ReportData } from '../types/ReportsPageTypes.ts';

interface ReportsSummarySectionProps {
  Data: ReportData;
  FormatCurrency: (amount: number) => string;
}

export const ReportsSummarySection = ({ Data, FormatCurrency }: ReportsSummarySectionProps) => (
  <div className="reports-section">
    <header className="reports-section__header">
      <h2 className="reports-section__title">Resumen general · Semana actual</h2>
      <p className="reports-section__subtitle">{Data.weekRangeLabel}</p>
    </header>

    <div className="reports-summary-grid">
      <article className="reports-summary-card">
        <span className="reports-summary-card__label">Ventas</span>
        <strong className="reports-summary-card__value">{Data.sales.total}</strong>
        <span className="reports-summary-card__meta">
          Ingresos {FormatCurrency(Data.sales.revenue)}
        </span>
      </article>

      <article className="reports-summary-card">
        <span className="reports-summary-card__label">Productos</span>
        <strong className="reports-summary-card__value">{Data.products.total}</strong>
        <span className="reports-summary-card__meta">
          Valor {FormatCurrency(Data.products.totalValue)}
        </span>
      </article>

      <article className="reports-summary-card">
        <span className="reports-summary-card__label">Usuarios</span>
        <strong className="reports-summary-card__value">
          {Data.users.total.toLocaleString('es-PE')}
        </strong>
        <span className="reports-summary-card__meta">
          {Data.users.active.toLocaleString('es-PE')} activos
        </span>
      </article>
    </div>
  </div>
);
