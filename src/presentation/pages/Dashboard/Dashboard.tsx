import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { Order } from '../../../domain/entities/Order.ts';
import type { Product } from '../../../domain/entities/Product.ts';
import type { Category } from '../../../domain/entities/Category.ts';
import { formatMoney } from '../../../domain/value-objects/Money.ts';
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from '../../../domain/value-objects/OrderStatus.ts';
import {
  FormatPeruDateTime,
  FormatPeruTodayLabel,
  GetOrderSortTimestamp,
  GetPeruCalendarDateKey,
  IsOrderFromTodayInPeru,
} from '../../../domain/value-objects/PeruDateTime.ts';
import { formatOrderNumber } from '../../../domain/services/OrderNumberGenerator.ts';
import './Dashboard.css';

const LOW_STOCK_THRESHOLD = 10;
const TODAY_ORDERS_LIMIT = 12;
const LOW_STOCK_LIMIT = 12;

interface DashboardOrderRow extends Order {
  items: number;
  timeLabel: string;
}

interface DashboardLowStockRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
}

function formatCurrency(amount: number): string {
  return formatMoney(amount);
}

function isLowStockProduct(product: Product): boolean {
  return (product.stock ?? 0) <= (product.minStock ?? LOW_STOCK_THRESHOLD);
}

export const Dashboard = () => {
  const { repositories } = useInfrastructure();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platformUserCount, setPlatformUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const todayLabel = useMemo(() => FormatPeruTodayLabel(), []);

  useEffect(() => {
    setError(null);
    const unsubProducts = repositories.product.subscribe(
      (items) => {
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      }
    );
    const unsubOrders = repositories.order.subscribe(
      (items) => setOrders(items),
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
      }
    );
    const unsubCategories = repositories.category.subscribe(
      (items) => setCategories(items),
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      }
    );
    const unsubUsers = repositories.platformUser.subscribe(
      (items) => setPlatformUserCount(items.length),
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      }
    );
    return () => {
      unsubProducts();
      unsubOrders();
      unsubCategories();
      unsubUsers();
    };
  }, [repositories.product, repositories.order, repositories.category, repositories.platformUser]);

  const stats = useMemo(() => {
    const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
    const todayOrders = orders.filter(IsOrderFromTodayInPeru);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    const recentOrders: DashboardOrderRow[] = [...todayOrders]
      .sort((left, right) => GetOrderSortTimestamp(right) - GetOrderSortTimestamp(left))
      .slice(0, TODAY_ORDERS_LIMIT)
      .map((order) => ({
        ...order,
        items: order.orderItems?.length ?? order.items ?? 0,
        timeLabel: FormatPeruDateTime(order.createdAt ?? order.date ?? ''),
      }));

    const lowStockToday = products.filter(isLowStockProduct);
    const lowStockProducts: DashboardLowStockRow[] = [...lowStockToday]
      .sort((left, right) => (left.stock ?? 0) - (right.stock ?? 0))
      .slice(0, LOW_STOCK_LIMIT)
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: categoryMap.get(product.categoryId ?? '') ?? '—',
        price: Number(product.finalPrice ?? product.price ?? 0),
        stock: product.stock ?? 0,
        minStock: product.minStock ?? LOW_STOCK_THRESHOLD,
      }));

    return {
      totalProducts: products.length,
      totalUsers: platformUserCount,
      todayOrdersCount: todayOrders.length,
      todayRevenue,
      lowStockCount: lowStockToday.length,
      recentOrders,
      lowStockProducts,
    };
  }, [products, orders, categories, platformUserCount]);

  const {
    totalProducts,
    totalUsers,
    todayOrdersCount,
    todayRevenue,
    lowStockCount,
    recentOrders,
    lowStockProducts,
  } = stats;

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Panel Principal</h1>
        </div>
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading && products.length === 0 && orders.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Panel Principal</h1>
        </div>
        <div className="dashboard-loading">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header__copy">
          <p className="dashboard-eyebrow">MEGA CEL · Admin</p>
          <h1 className="dashboard-title">Panel Principal</h1>
          <p className="dashboard-description">
            Resumen del día en tiempo real
          </p>
        </div>
        <div className="dashboard-header-date" aria-label="Fecha actual en Perú">
          <span className="dashboard-header-date__label">Hoy</span>
          <span className="dashboard-header-date__value">{todayLabel}</span>
        </div>
      </header>

      <div className="dashboard-stats">
        <article className="stat-card stat-card-primary">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden />
            <span className="stat-card__tag">Catálogo</span>
          </div>
          <p className="stat-card-label">Productos</p>
          <p className="stat-card-value">{totalProducts}</p>
        </article>

        <article className="stat-card stat-card-success">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden />
            <span className="stat-card__tag">Clientes</span>
          </div>
          <p className="stat-card-label">Usuarios</p>
          <p className="stat-card-value">{totalUsers.toLocaleString()}</p>
        </article>

        <article className="stat-card stat-card-warning">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden />
            <span className="stat-card__tag">Hoy</span>
          </div>
          <p className="stat-card-label">Pedidos del día</p>
          <p className="stat-card-value">{todayOrdersCount}</p>
        </article>

        <article className="stat-card stat-card-info">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden />
            <span className="stat-card__tag">Hoy</span>
          </div>
          <p className="stat-card-label">Ingresos del día</p>
          <p className="stat-card-value stat-card-value--money">{formatCurrency(todayRevenue)}</p>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-card-title-row">
                <h2 className="dashboard-card-title">Pedidos de hoy</h2>
                <span className="dashboard-count-badge">{todayOrdersCount}</span>
              </div>
              <p className="dashboard-card-subtitle">
                Pedidos registrados el {GetPeruCalendarDateKey().split('-').reverse().join('/')}
              </p>
            </div>
            <Link to="/admin/pedidos" className="dashboard-card-link">
              Ver pedidos
            </Link>
          </div>
          <div className="dashboard-card-content">
            {recentOrders.length > 0 ? (
              <ul className="dashboard-orders-list">
                {recentOrders.map((order) => (
                  <li key={order.id} className="dashboard-order-item">
                    <div className="dashboard-order-item__main">
                      <p className="dashboard-order-item__customer">{order.customerName}</p>
                      <p className="dashboard-order-item__meta">
                        {order.orderNumber
                          ? `#${formatOrderNumber(order.orderNumber)}`
                          : order.id.slice(0, 8)}
                        <span>·</span>
                        {order.items} artículo{order.items !== 1 ? 's' : ''}
                        <span>·</span>
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="dashboard-order-item__side">
                      <time className="dashboard-order-item__time">{order.timeLabel}</time>
                      <span
                        className="dashboard-status-badge"
                        style={{ backgroundColor: getOrderStatusColor(order.status) }}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty">
                <p>No hay pedidos registrados hoy</p>
                <span>Los nuevos pedidos aparecerán aquí automáticamente.</span>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <div className="dashboard-card-title-row">
                <h2 className="dashboard-card-title">Stock bajo hoy</h2>
                <span className="dashboard-count-badge dashboard-count-badge--danger">
                  {lowStockCount}
                </span>
              </div>
              <p className="dashboard-card-subtitle">
                Productos con stock bajo al día de hoy
              </p>
            </div>
            <Link to="/admin/productos" className="dashboard-card-link">
              Ver productos
            </Link>
          </div>
          <div className="dashboard-card-content">
            {lowStockProducts.length > 0 ? (
              <ul className="dashboard-stock-list">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="dashboard-stock-item">
                    <div className="dashboard-stock-item__main">
                      <p className="dashboard-stock-item__name">{product.name}</p>
                      <p className="dashboard-stock-item__meta">
                        <span>{product.category}</span>
                        <span>·</span>
                        <span>{formatCurrency(product.price)}</span>
                      </p>
                    </div>
                    <div className="dashboard-stock-item__side">
                      <span className="dashboard-stock-badge">
                        {product.stock} / {product.minStock}
                      </span>
                      <span className="dashboard-stock-badge__label">unidades</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty dashboard-empty--success">
                <p>Sin alertas de stock bajo hoy</p>
                <span>Todos los productos están dentro del stock mínimo.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
