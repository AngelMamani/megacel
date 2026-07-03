import type { Order } from '../../../domain/entities/Order.ts';
import {
  getCompletedOrders,
  filterOrdersBySource,
} from '../../../domain/services/OrderNumberGenerator.ts';
import type {
  CalculateSalesStatsInput,
  SalesStatsOutput,
} from '../../dto/sales/SalesStatsDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr.trim();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function filterSales(orders: Order[], input: CalculateSalesStatsInput): Order[] {
  const completed = getCompletedOrders(orders);
  const term = input.searchTerm?.trim().toLowerCase() ?? '';

  return completed.filter((order) => {
    const matchesSource =
      !input.sourceFilter || input.sourceFilter === 'all' || order.source === input.sourceFilter;

    const matchesDate =
      !input.dateFilter || normalizeDate(order.date) === normalizeDate(input.dateFilter);

    const matchesSearch =
      !term ||
      order.id.toLowerCase().includes(term) ||
      order.customerName.toLowerCase().includes(term) ||
      (order.customerEmail?.toLowerCase().includes(term) ?? false) ||
      (order.customerPhone?.includes(term) ?? false);

    return matchesSource && matchesDate && matchesSearch;
  });
}

/** Calcula estadísticas de ventas aplicando filtros activos. */
export function createCalculateSalesStatsUseCase(): UseCase<
  CalculateSalesStatsInput,
  SalesStatsOutput
> {
  return {
    async execute(input) {
      const filtered = filterSales(input.orders, input);
      const totalSales = filtered.length;
      const storeSales = filtered.filter((o) => o.source === 'store').length;
      const onlineSales = totalSales - storeSales;
      const totalRevenue = filtered.reduce((sum, o) => sum + o.total, 0);

      return {
        totalSales,
        onlineSales,
        storeSales,
        totalRevenue,
      };
    },
  };
}

/** Filtra y ordena ventas completadas para la tabla (más recientes primero). */
export function createFilterCompletedSalesUseCase(): UseCase<
  CalculateSalesStatsInput,
  Order[]
> {
  return {
    async execute(input) {
      const filtered = filterSales(input.orders, input);
      return filterOrdersBySource(filtered, input.sourceFilter ?? 'all')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  };
}
