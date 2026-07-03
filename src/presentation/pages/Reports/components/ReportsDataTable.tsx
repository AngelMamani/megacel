import type { ReportRankItem } from '../types/ReportsPageTypes.ts';

interface ReportsDataTableProps {
  Title: string;
  Rows: ReportRankItem[];
  FormatCurrency: (amount: number) => string;
  EmptyMessage?: string;
}

export const ReportsDataTable = ({
  Title,
  Rows,
  FormatCurrency,
  EmptyMessage = 'No hay datos para mostrar en este periodo.',
}: ReportsDataTableProps) => (
  <section className="reports-table-panel">
    <h3 className="reports-panel__title">{Title}</h3>
    {Rows.length === 0 ? (
      <p className="reports-table-panel__empty">{EmptyMessage}</p>
    ) : (
      <div className="reports-table-wrap">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ventas</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {Rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.sales}</td>
                <td>{FormatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);
