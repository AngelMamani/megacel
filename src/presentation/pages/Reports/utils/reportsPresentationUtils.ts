import type { ReportType, ReportTypeTab } from '../types/ReportsPageTypes.ts';

export const REPORT_TYPE_TABS: ReportTypeTab[] = [
  { id: 'sales', label: 'Ventas', description: 'Cantidades e ingresos' },
  { id: 'products', label: 'Productos', description: 'Inventario y stock' },
  { id: 'users', label: 'Usuarios', description: 'Clientes y admins' },
  { id: 'categories', label: 'Categorías', description: 'Rendimiento por rubro' },
  { id: 'summary', label: 'Resumen', description: 'Vista general' },
];

export const FormatReportCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);

export const GetReportTypeLabel = (reportType: ReportType): string =>
  REPORT_TYPE_TABS.find((tab) => tab.id === reportType)?.label ?? 'Reporte';
