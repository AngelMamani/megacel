import type { OrderStats } from '../types/OrderPageTypes.ts';

interface OrderKpiStripProps {
  Stats: OrderStats;
  FormatCurrency: (amount: number) => string;
}

export const OrderKpiStrip = ({ Stats, FormatCurrency }: OrderKpiStripProps) => (
  <section className="orders-kpi" aria-label="Métricas de pedidos">
    <article className="orders-kpi__card orders-kpi__card--primary">
      <span className="orders-kpi__label">Total pedidos</span>
      <strong className="orders-kpi__value">{Stats.Total}</strong>
      <span className="orders-kpi__meta">Registrados en el sistema</span>
    </article>

    <article className="orders-kpi__card orders-kpi__card--warn">
      <span className="orders-kpi__label">Por revisar</span>
      <strong className="orders-kpi__value">{Stats.PendingReview}</strong>
      <span className="orders-kpi__meta">Pendientes y verificando pago</span>
    </article>

    <article className="orders-kpi__card orders-kpi__card--accent">
      <span className="orders-kpi__label">Pago exitoso</span>
      <strong className="orders-kpi__value">{Stats.PaymentSuccessful}</strong>
      <span className="orders-kpi__meta">Pedidos confirmados</span>
    </article>

    <article className="orders-kpi__card orders-kpi__card--neutral">
      <span className="orders-kpi__label">Ingresos</span>
      <strong className="orders-kpi__value orders-kpi__value--compact">
        {FormatCurrency(Stats.TotalRevenue)}
      </strong>
      <span className="orders-kpi__meta">
        {Stats.Rejected > 0 ? `${Stats.Rejected} rechazados` : 'Solo pagos confirmados'}
      </span>
    </article>
  </section>
);
