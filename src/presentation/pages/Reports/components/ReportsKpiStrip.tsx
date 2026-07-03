import type { ReportData } from '../types/ReportsPageTypes.ts';

interface ReportsKpiStripProps {
  Data: ReportData;
  FormatCurrency: (amount: number) => string;
}

export const ReportsKpiStrip = ({ Data, FormatCurrency }: ReportsKpiStripProps) => (
  <section className="reports-kpi" aria-label="Métricas generales">
    <article className="reports-kpi__card reports-kpi__card--sales">
      <span className="reports-kpi__label">Ventas totales</span>
      <strong className="reports-kpi__value">{Data.sales.total}</strong>
      <span className="reports-kpi__meta">Pedidos del periodo</span>
    </article>

    <article className="reports-kpi__card reports-kpi__card--revenue">
      <span className="reports-kpi__label">Ingresos</span>
      <strong className="reports-kpi__value reports-kpi__value--compact">
        {FormatCurrency(Data.sales.revenue)}
      </strong>
      <span className="reports-kpi__meta">Pagos confirmados</span>
    </article>

    <article className="reports-kpi__card reports-kpi__card--products">
      <span className="reports-kpi__label">Productos</span>
      <strong className="reports-kpi__value">{Data.products.total}</strong>
      <span className="reports-kpi__meta">
        {Data.products.lowStock > 0
          ? `${Data.products.lowStock} con stock bajo`
          : 'Catálogo activo'}
      </span>
    </article>

    <article className="reports-kpi__card reports-kpi__card--users">
      <span className="reports-kpi__label">Usuarios</span>
      <strong className="reports-kpi__value">{Data.users.total.toLocaleString('es-PE')}</strong>
      <span className="reports-kpi__meta">
        {Data.users.clients.toLocaleString('es-PE')} clientes
      </span>
    </article>
  </section>
);
