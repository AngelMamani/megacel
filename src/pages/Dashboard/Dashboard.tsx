import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../../firebase/collections';
import { subscribeCollection } from '../../firebase/firestoreHelpers';
import type { DashboardStats, Order, Product } from '../../types/index';
import './Dashboard.css';

const LOW_STOCK_THRESHOLD = 10;
const RECENT_ORDERS_LIMIT = 10;
const LOW_STOCK_LIMIT = 10;

interface ProductDoc {
  id: string;
  name: string;
  categoryId?: string;
  price?: number;
  finalPrice?: number;
  stock: number;
  minStock?: number;
}

interface OrderDoc {
  id: string;
  customerName: string;
  total: number;
  status: Order['status'];
  date?: string;
  createdAt?: string;
  items?: number;
  orderItems?: unknown[];
}

interface CategoryDoc {
  id: string;
  name: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
  };
  return colors[status] || '#64748b';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'En proceso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function orderDate(order: OrderDoc): string {
  return order.date ?? (order.createdAt ? order.createdAt.split('T')[0] : '') ?? '';
}

function orderSortKey(order: OrderDoc): string {
  return order.createdAt ?? order.date ?? '';
}

export const Dashboard = () => {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const unsubProducts = subscribeCollection<ProductDoc>(
      COLLECTIONS.products,
      (items) => {
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      }
    );
    const unsubOrders = subscribeCollection<OrderDoc>(
      COLLECTIONS.orders,
      (items) => setOrders(items),
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
      }
    );
    const unsubCategories = subscribeCollection<CategoryDoc>(
      COLLECTIONS.categories,
      (items) => setCategories(items),
      (err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      }
    );
    return () => {
      unsubProducts();
      unsubOrders();
      unsubCategories();
    };
  }, []);

  const stats: DashboardStats = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const sortedOrders = [...orders].sort(
      (a, b) => (orderSortKey(b).localeCompare(orderSortKey(a)))
    );
    const recentOrders: Order[] = sortedOrders.slice(0, RECENT_ORDERS_LIMIT).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: Number(o.total),
      status: o.status,
      date: orderDate(o),
      items: o.items ?? o.orderItems?.length ?? 0,
    }));
    const lowStock = products.filter(
      (p) => (p.stock ?? 0) <= (p.minStock ?? LOW_STOCK_THRESHOLD)
    );
    const sortedLowStock = [...lowStock].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
    const lowStockProducts: Product[] = sortedLowStock.slice(0, LOW_STOCK_LIMIT).map((p) => ({
      id: p.id,
      name: p.name,
      category: categoryMap.get(p.categoryId ?? '') ?? '—',
      price: Number(p.finalPrice ?? p.price ?? 0),
      stock: p.stock ?? 0,
    }));

    return {
      totalProducts: products.length,
      totalUsers: 0,
      totalOrders: orders.length,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    };
  }, [products, orders, categories]);

  const {
    totalProducts,
    totalUsers,
    totalOrders,
    totalRevenue,
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
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel Principal</h1>
          <p className="dashboard-description">
            Resumen general de tu negocio en tiempo real
          </p>
        </div>
        <div className="dashboard-header-date">
          <span className="date-icon">📅</span>
          <span className="date-text">{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-background" />
          <div className="stat-card-icon">📱</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Productos</h3>
            <p className="stat-card-value">{totalProducts}</p>
            <p className="stat-card-change positive">Tiempo real</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-background" />
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Usuarios</h3>
            <p className="stat-card-value">{totalUsers.toLocaleString()}</p>
            <p className="stat-card-change positive">Sin colección</p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-background" />
          <div className="stat-card-icon">🛒</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Pedidos</h3>
            <p className="stat-card-value">{totalOrders}</p>
            <p className="stat-card-change positive">Tiempo real</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-card-background" />
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <h3 className="stat-card-label">Ingresos</h3>
            <p className="stat-card-value">{formatCurrency(totalRevenue)}</p>
            <p className="stat-card-change positive">Total pedidos</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card dashboard-card-large">
          <div className="dashboard-card-header">
            <div>
              <h2 className="dashboard-card-title">Pedidos Recientes</h2>
              <p className="dashboard-card-subtitle">Últimos pedidos registrados</p>
            </div>
            <Link to="/pedidos" className="dashboard-card-link">
              Ver todos →
            </Link>
          </div>
          <div className="dashboard-card-content">
            {recentOrders.length > 0 ? (
              <div className="orders-list">
                {recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-item-icon">
                      <span className="order-icon">🛒</span>
                    </div>
                    <div className="order-item-info">
                      <h4 className="order-item-customer">{order.customerName}</h4>
                      <p className="order-item-details">
                        <span className="detail-item">
                          {order.items} artículo{order.items !== 1 ? 's' : ''}
                        </span>
                        <span className="detail-separator">•</span>
                        <span className="detail-item">{formatCurrency(order.total)}</span>
                        <span className="detail-separator">•</span>
                        <span className="detail-item">{formatDate(order.date)}</span>
                      </p>
                    </div>
                    <div className="order-item-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card dashboard-card-large">
          <div className="dashboard-card-header">
            <div>
              <h2 className="dashboard-card-title">Stock Bajo</h2>
              <p className="dashboard-card-subtitle">Productos que requieren atención</p>
            </div>
            <Link to="/productos" className="dashboard-card-link">
              Ver todos →
            </Link>
          </div>
          <div className="dashboard-card-content">
            {lowStockProducts.length > 0 ? (
              <div className="products-list">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="product-item">
                    <div className="product-item-icon">
                      <span className="product-icon">📱</span>
                    </div>
                    <div className="product-item-info">
                      <h4 className="product-item-name">{product.name}</h4>
                      <p className="product-item-category">
                        <span>{product.category}</span>
                        <span className="product-price">{formatCurrency(product.price)}</span>
                      </p>
                    </div>
                    <div className="product-item-stock">
                      <span className="stock-badge stock-badge-low">
                        ⚠️ {product.stock} unidades
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>Todo el stock está en orden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
