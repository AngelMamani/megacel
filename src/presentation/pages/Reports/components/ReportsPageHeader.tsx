import { IconReports } from './ReportsIcons.tsx';

export const ReportsPageHeader = () => (
  <header className="reports-hero">
    <div className="reports-hero__mesh" aria-hidden="true">
      <span className="reports-hero__blob reports-hero__blob--1" />
      <span className="reports-hero__blob reports-hero__blob--2" />
      <span className="reports-hero__blob reports-hero__blob--3" />
    </div>

    <div className="reports-hero__content">
      <div className="reports-hero__badge">
        <IconReports size={16} />
        <span>Analítica · Reportes</span>
      </div>
      <h1 className="reports-hero__title">Centro de Reportes</h1>
      <p className="reports-hero__subtitle">
        Analiza ventas, inventario, usuarios y categorías con filtros por día, mes o año en tiempo real.
      </p>
    </div>
  </header>
);
