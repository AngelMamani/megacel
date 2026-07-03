export type ReportPeriodType = 'daily' | 'monthly' | 'yearly';

export type ReportType = 'sales' | 'products' | 'users' | 'categories' | 'summary';

export interface ReportSalesStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  revenue: number;
}

export interface ReportProductStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  totalValue: number;
}

export interface ReportUserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  clients: number;
}

export interface ReportRankItem {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface ReportWeeklyDaySale {
  period: string;
  label: string;
  weekdayFull: string;
  dateLabel: string;
  quantity: number;
  orders: number;
}

export interface ReportData {
  sales: ReportSalesStats;
  products: ReportProductStats;
  users: ReportUserStats;
  topProducts: ReportRankItem[];
  topCategories: ReportRankItem[];
  weeklySalesByDay: ReportWeeklyDaySale[];
  weeklyOrdersByDay: ReportWeeklyDaySale[];
  weekRangeLabel: string;
}

export interface ReportTypeTab {
  id: ReportType;
  label: string;
  description: string;
}
