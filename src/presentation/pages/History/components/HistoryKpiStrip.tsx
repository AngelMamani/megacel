import type { HistoryStats } from '../types/HistoryPageTypes.ts';

interface HistoryKpiStripProps {
  Stats: HistoryStats;
}

export const HistoryKpiStrip = ({ Stats }: HistoryKpiStripProps) => (
  <section className="history-kpi" aria-label="Métricas del historial">
    <article className="history-kpi__card history-kpi__card--primary">
      <span className="history-kpi__label">Total registros</span>
      <strong className="history-kpi__value">{Stats.Total}</strong>
      <span className="history-kpi__meta">Según filtros activos</span>
    </article>

    <article className="history-kpi__card history-kpi__card--today">
      <span className="history-kpi__label">Hoy</span>
      <strong className="history-kpi__value">{Stats.Today}</strong>
      <span className="history-kpi__meta">Acciones del día</span>
    </article>

    <article className="history-kpi__card history-kpi__card--create">
      <span className="history-kpi__label">Creaciones</span>
      <strong className="history-kpi__value">{Stats.Creates}</strong>
      <span className="history-kpi__meta">Nuevos elementos</span>
    </article>

    <article className="history-kpi__card history-kpi__card--modify">
      <span className="history-kpi__label">Modificaciones</span>
      <strong className="history-kpi__value">{Stats.Modifications}</strong>
      <span className="history-kpi__meta">Ediciones y bajas</span>
    </article>
  </section>
);
