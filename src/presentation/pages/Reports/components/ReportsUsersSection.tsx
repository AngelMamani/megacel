import type { ReportData } from '../types/ReportsPageTypes.ts';
import { ReportsDistributionBars } from './ReportsDistributionBars.tsx';
import { ReportsStatGrid } from './ReportsStatGrid.tsx';
import { ReportsWeeklyQuantityChart } from './ReportsWeeklyQuantityChart.tsx';

interface ReportsUsersSectionProps {
  Data: ReportData;
}

export const ReportsUsersSection = ({ Data }: ReportsUsersSectionProps) => (
  <div className="reports-section">
    <header className="reports-section__header">
      <h2 className="reports-section__title">Reporte de usuarios · Semana actual</h2>
      <p className="reports-section__subtitle">{Data.weekRangeLabel}</p>
    </header>

    <article className="reports-panel">
      <h3 className="reports-panel__title">Resumen de cuentas</h3>
      <ReportsStatGrid
        Items={[
          { label: 'Total usuarios', value: Data.users.total.toLocaleString('es-PE') },
          { label: 'Activos', value: Data.users.active.toLocaleString('es-PE'), tone: 'success' },
          { label: 'Inactivos', value: Data.users.inactive, tone: 'muted' },
          { label: 'Administradores', value: Data.users.admins, tone: 'primary' },
          { label: 'Clientes', value: Data.users.clients.toLocaleString('es-PE'), tone: 'accent' },
        ]}
      />
    </article>

    <article className="reports-panel">
      <ReportsWeeklyQuantityChart
        Data={Data.weeklyOrdersByDay}
        Title="Pedidos completados por día"
        MetricLabel="Pedidos completados"
        UnitSuffix="pedidos"
        WeekLabel={Data.weekRangeLabel}
      />
    </article>

    <article className="reports-panel">
      <ReportsDistributionBars
        Title="Comparativo de usuarios"
        UnitLabel="usuarios"
        Items={[
          { label: 'Activos', value: Data.users.active, tone: 'success' },
          { label: 'Inactivos', value: Data.users.inactive, tone: 'muted' },
          { label: 'Administradores', value: Data.users.admins, tone: 'primary' },
          { label: 'Clientes', value: Data.users.clients, tone: 'accent' },
        ]}
      />
    </article>
  </div>
);
