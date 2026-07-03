import type { Order } from '../../../domain/entities/Order.ts';
import type { SaleSource } from '../../../domain/value-objects/SaleSource.ts';

export interface CalculateSalesStatsInput {
  orders: Order[];
  sourceFilter?: SaleSource | 'all';
  dateFilter?: string;
  searchTerm?: string;
}

export interface SalesStatsOutput {
  totalSales: number;
  onlineSales: number;
  storeSales: number;
  totalRevenue: number;
}
