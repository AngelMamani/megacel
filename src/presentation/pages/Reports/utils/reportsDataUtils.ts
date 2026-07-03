import type { Order } from '../../../../domain/entities/Order.ts';
import type { Product } from '../../../../domain/entities/Product.ts';
import type { Category } from '../../../../domain/entities/Category.ts';
import type { PlatformUser } from '../../../../domain/entities/PlatformUser.ts';
import {
  GetPeruCalendarDateKey,
  GetTimestampCalendarDateKeyInPeru,
  ParseOrderDateValue,
  PERU_TIME_ZONE,
} from '../../../../domain/value-objects/PeruDateTime.ts';
import {
  isPaymentSuccessfulOrder,
  isRejectedOrder,
  ORDER_STATUS,
} from '../../../../domain/value-objects/OrderStatus.ts';
import type { ReportData, ReportWeeklyDaySale } from '../types/ReportsPageTypes.ts';

type OrderDoc = Pick<Order, 'id' | 'total' | 'status' | 'date' | 'createdAt' | 'orderItems'>;
type ProductDoc = Pick<
  Product,
  'id' | 'name' | 'categoryId' | 'price' | 'finalPrice' | 'stock' | 'minStock' | 'status'
>;
type CategoryDoc = Pick<Category, 'id' | 'name'>;

const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
const WEEKDAY_FULL = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

const LOW_STOCK_DEFAULT = 10;

function ShiftCalendarDateKey(dateKey: string, days: number): string {
  const parsed = ParseOrderDateValue(dateKey);
  if (!parsed) return dateKey;
  parsed.setDate(parsed.getDate() + days);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function GetWeekdayIndexInPeru(dateKey: string): number {
  const parsed = ParseOrderDateValue(dateKey);
  if (!parsed) return 1;

  const weekday =
    new Intl.DateTimeFormat('en-US', {
      timeZone: PERU_TIME_ZONE,
      weekday: 'short',
    })
      .formatToParts(parsed)
      .find((part) => part.type === 'weekday')?.value ?? 'Mon';

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? 1;
}

function GetCurrentWeekDateKeysInPeru(): string[] {
  const todayKey = GetPeruCalendarDateKey();
  const daysFromMonday = (GetWeekdayIndexInPeru(todayKey) + 6) % 7;
  const mondayKey = ShiftCalendarDateKey(todayKey, -daysFromMonday);
  return Array.from({ length: 7 }, (_, index) => ShiftCalendarDateKey(mondayKey, index));
}

function FormatWeekRangeLabel(weekKeys: string[]): string {
  if (weekKeys.length === 0) return '';

  const first = ParseOrderDateValue(weekKeys[0]);
  const last = ParseOrderDateValue(weekKeys[weekKeys.length - 1]);
  if (!first || !last) return '';

  const formatter = new Intl.DateTimeFormat('es-PE', {
    timeZone: PERU_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(first)} – ${formatter.format(last)} · hora Perú`;
}

function GetOrderDateKeyInPeru(order: OrderDoc): string {
  if (order.createdAt) {
    const key = GetTimestampCalendarDateKeyInPeru(order.createdAt);
    if (key) return key;
  }
  if (order.date && /^\d{4}-\d{2}-\d{2}$/.test(order.date)) return order.date;
  return '';
}

function GetOrderItemQuantity(order: OrderDoc): number {
  const items = order.orderItems ?? [];
  if (items.length === 0) return 1;
  return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

function BuildWeeklyOrdersByDay(orders: OrderDoc[]): ReportWeeklyDaySale[] {
  const weekKeys = GetCurrentWeekDateKeysInPeru();

  return weekKeys.map((dateKey, index) => {
    const dayOrders = orders.filter(
      (order) =>
        GetOrderDateKeyInPeru(order) === dateKey && isPaymentSuccessfulOrder(order.status)
    );
    const parsed = ParseOrderDateValue(dateKey);
    const dateLabel = parsed
      ? `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}`
      : '';

    return {
      period: dateKey,
      label: WEEKDAY_SHORT[index],
      weekdayFull: WEEKDAY_FULL[index],
      dateLabel,
      quantity: dayOrders.length,
      orders: dayOrders.length,
    };
  });
}

function BuildWeeklySalesByDay(weekOrders: OrderDoc[]): ReportWeeklyDaySale[] {
  const weekKeys = GetCurrentWeekDateKeysInPeru();

  return weekKeys.map((dateKey, index) => {
    const dayOrders = weekOrders.filter(
      (order) =>
        GetOrderDateKeyInPeru(order) === dateKey && isPaymentSuccessfulOrder(order.status)
    );
    const quantity = dayOrders.reduce((sum, order) => sum + GetOrderItemQuantity(order), 0);
    const parsed = ParseOrderDateValue(dateKey);
    const dateLabel = parsed
      ? `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}`
      : '';

    return {
      period: dateKey,
      label: WEEKDAY_SHORT[index],
      weekdayFull: WEEKDAY_FULL[index],
      dateLabel,
      quantity,
      orders: dayOrders.length,
    };
  });
}

export function BuildReportData(
  orders: OrderDoc[],
  products: ProductDoc[],
  categories: CategoryDoc[],
  platformUsers: PlatformUser[]
): ReportData {
  const weekKeys = GetCurrentWeekDateKeysInPeru();
  const weekKeySet = new Set(weekKeys);

  const filteredOrders = orders.filter((order) => {
    const dateKey = GetOrderDateKeyInPeru(order);
    return dateKey && weekKeySet.has(dateKey);
  });

  const sales = {
    total: filteredOrders.length,
    completed: filteredOrders.filter((order) => isPaymentSuccessfulOrder(order.status)).length,
    pending: filteredOrders.filter((order) => order.status === ORDER_STATUS.Pending).length,
    cancelled: filteredOrders.filter((order) => isRejectedOrder(order.status)).length,
    revenue: filteredOrders
      .filter((order) => isPaymentSuccessfulOrder(order.status))
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0),
  };

  const productTotal = products.length;
  const activeProducts = products.filter((product) => (product.status ?? '') === 'activo').length;
  const lowStockCount = products.filter(
    (product) => (product.stock ?? 0) <= (product.minStock ?? LOW_STOCK_DEFAULT)
  ).length;
  const totalValue = products.reduce(
    (sum, product) =>
      sum + (product.stock ?? 0) * (Number(product.finalPrice ?? product.price ?? 0) || 0),
    0
  );

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const productByName = new Map(products.map((product) => [product.name, product]));
  const productAgg = new Map<string, { sales: number; revenue: number }>();
  const categoryAgg = new Map<string, { name: string; sales: number; revenue: number }>();

  for (const order of filteredOrders) {
    if (!isPaymentSuccessfulOrder(order.status)) continue;

    const items = order.orderItems ?? [];
    for (const item of items) {
      const name = item.productName ?? '';
      const qty = item.quantity ?? 0;
      const rev =
        Number(item.subtotal ?? item.price ?? 0) * (item.quantity ?? 0) ||
        Number(order.total) / Math.max(items.length, 1);

      if (name) {
        const current = productAgg.get(name) ?? { sales: 0, revenue: 0 };
        current.sales += qty;
        current.revenue += Number(item.subtotal ?? 0) || rev;
        productAgg.set(name, current);
      }

      const product = productByName.get(name);
      const categoryId = product?.categoryId ?? 'sin-categoria';
      const categoryName = categoryMap.get(categoryId) ?? 'Sin categoría';
      const currentCategory = categoryAgg.get(categoryId) ?? {
        name: categoryName,
        sales: 0,
        revenue: 0,
      };
      currentCategory.sales += qty;
      currentCategory.revenue += Number(item.subtotal ?? 0) || 0;
      categoryAgg.set(categoryId, currentCategory);
    }
  }

  const topProducts = Array.from(productAgg.entries())
    .map(([name, value]) => ({ id: name, name, sales: value.sales, revenue: value.revenue }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const topCategories = Array.from(categoryAgg.entries())
    .filter(([, category]) => category.sales > 0 || category.revenue > 0)
    .map(([id, category]) => ({
      id,
      name: category.name,
      sales: category.sales,
      revenue: category.revenue,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const adminCount = platformUsers.filter((user) => user.role === 'Administrador').length;
  const clientCount = platformUsers.filter((user) => user.role === 'Cliente').length;
  const activeUsers = platformUsers.filter((user) => user.status === 'activo').length;
  const inactiveUsers = platformUsers.filter((user) => user.status === 'inactivo').length;

  return {
    sales,
    products: {
      total: productTotal,
      active: activeProducts,
      inactive: Math.max(0, productTotal - activeProducts),
      lowStock: lowStockCount,
      totalValue,
    },
    users: {
      total: platformUsers.length,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminCount,
      clients: clientCount,
    },
    topProducts,
    topCategories,
    weeklySalesByDay: BuildWeeklySalesByDay(orders),
    weeklyOrdersByDay: BuildWeeklyOrdersByDay(orders),
    weekRangeLabel: FormatWeekRangeLabel(weekKeys),
  };
}
