import { IconHistory } from './HistoryIcons.tsx';

export const HistoryPageHeader = () => (
  <header className="history-hero">
    <div className="history-hero__mesh" aria-hidden="true">
      <span className="history-hero__blob history-hero__blob--1" />
      <span className="history-hero__blob history-hero__blob--2" />
      <span className="history-hero__blob history-hero__blob--3" />
    </div>

    <div className="history-hero__content">
      <div className="history-hero__badge">
        <IconHistory size={16} />
        <span>Auditoría · Historial</span>
      </div>
      <h1 className="history-hero__title">Historial de Actividad</h1>
      <p className="history-hero__subtitle">
        Línea de tiempo de creaciones, ediciones y eliminaciones en productos, pedidos, usuarios y más.
      </p>
    </div>
  </header>
);
