import { useEffect, useMemo, useState } from 'react';
import { COLLECTIONS } from '../../firebase/collections';
import { subscribeCollection } from '../../firebase/firestoreHelpers';
import './Reports.css';

type PeriodType = 'daily' | 'monthly' | 'yearly';

interface ReportData {
  sales: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    revenue: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    totalValue: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    clients: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  periodSales: Array<{
    period: string;
    label: string;
    sales: number;
    revenue: number;
  }>;
}

interface OrderDoc {
  id: string;
  customerName?: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date?: string;
  createdAt?: string;
  orderItems?: Array<{
    id?: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface ProductDoc {
  id: string;
  name: string;
  categoryId?: string;
  price?: number;
  finalPrice?: number;
  stock: number;
  minStock?: number;
  status?: string;
}

interface CategoryDoc {
  id: string;
  name: string;
}

interface AdminDoc {
  id: string;
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const LOW_STOCK_DEFAULT = 10;

function getOrderDate(o: OrderDoc): string {
  if (o.date && /^\d{4}-\d{2}-\d{2}$/.test(o.date)) return o.date;
  if (o.createdAt) return o.createdAt.split('T')[0];
  return '';
}

function orderInRange(orderDate: string, period: PeriodType, selectedDate: string, selectedMonth: number, selectedYear: number): boolean {
  if (!orderDate) return false;
  const [y, m] = orderDate.split('-').map(Number);
  if (period === 'daily') return orderDate === selectedDate;
  if (period === 'monthly') return y === selectedYear && m === selectedMonth + 1;
  if (period === 'yearly') return y === selectedYear;
  return false;
}

function buildReportData(
  orders: OrderDoc[],
  products: ProductDoc[],
  categories: CategoryDoc[],
  admins: AdminDoc[],
  period: PeriodType,
  selectedDate: string,
  selectedMonth: number,
  selectedYear: number
): ReportData {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const filteredOrders = orders.filter((o) => {
    const d = getOrderDate(o);
    return d && orderInRange(d, period, selectedDate, selectedMonth, selectedYear);
  });

  const sales = {
    total: filteredOrders.length,
    completed: filteredOrders.filter((o) => o.status === 'completed').length,
    pending: filteredOrders.filter((o) => o.status === 'pending').length,
    cancelled: filteredOrders.filter((o) => o.status === 'cancelled').length,
    revenue: filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
  };

  const productTotal = products.length;
  const activeProducts = products.filter((p) => (p.status ?? '') === 'activo').length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= (p.minStock ?? LOW_STOCK_DEFAULT)).length;
  const totalValue = products.reduce(
    (sum, p) => sum + (p.stock ?? 0) * (Number(p.finalPrice ?? p.price ?? 0) || 0),
    0
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const productByName = new Map(products.map((p) => [p.name, p]));

  const productAgg = new Map<string, { sales: number; revenue: number }>();
  const categoryAgg = new Map<string, { name: string; sales: number; revenue: number }>();

  for (const order of filteredOrders) {
    const items = order.orderItems ?? [];
    for (const item of items) {
      const name = item.productName ?? '';
      const qty = item.quantity ?? 0;
      const rev = Number(item.subtotal ?? item.price ?? 0) * (item.quantity ?? 0) || Number(order.total) / Math.max(items.length, 1);
      if (name) {
        const cur = productAgg.get(name) ?? { sales: 0, revenue: 0 };
        cur.sales += qty;
        cur.revenue += Number(item.subtotal ?? 0) || rev;
        productAgg.set(name, cur);
      }
      const prod = productByName.get(name);
      const catId = prod?.categoryId ?? 'sin-categoria';
      const catName = categoryMap.get(catId) ?? 'Sin categoría';
      const curCat = categoryAgg.get(catId) ?? { name: catName, sales: 0, revenue: 0 };
      curCat.sales += qty;
      curCat.revenue += Number(item.subtotal ?? 0) || 0;
      categoryAgg.set(catId, curCat);
    }
  }

  const topProducts = Array.from(productAgg.entries())
    .map(([name, v]) => ({ id: name, name, sales: v.sales, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const topCategories = Array.from(categoryAgg.entries())
    .filter(([, c]) => c.sales > 0 || c.revenue > 0)
    .map(([id, c]) => ({ id, name: c.name, sales: c.sales, revenue: c.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  let periodSales: Array<{ period: string; label: string; sales: number; revenue: number }> = [];

  if (period === 'daily' && selectedDate) {
    const date = new Date(selectedDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayName = DAY_NAMES[date.getDay()];
    const dayOrders = filteredOrders.filter((o) => getOrderDate(o) === selectedDate);
    periodSales = [{
      period: selectedDate,
      label: `${dayName} ${day}/${month}/${date.getFullYear()}`,
      sales: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
    }];
  } else if (period === 'monthly') {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const isCurrent = selectedYear === currentYear && selectedMonth === currentMonth;
    const maxDay = isCurrent ? today.getDate() : lastDay;
    for (let day = 1; day <= maxDay; day++) {
      const d = new Date(selectedYear, selectedMonth, day);
      const periodStr = d.toISOString().split('T')[0];
      const dayOrders = filteredOrders.filter((o) => getOrderDate(o) === periodStr);
      periodSales.push({
        period: periodStr,
        label: `${DAY_NAMES_SHORT[d.getDay()]} ${String(day).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')}`,
        sales: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
      });
    }
  } else if (period === 'yearly') {
    const maxMonth = selectedYear === currentYear ? currentMonth : 11;
    for (let month = 0; month <= maxMonth; month++) {
      const periodStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}`;
      const monthOrders = filteredOrders.filter((o) => {
        const d = getOrderDate(o);
        if (!d) return false;
        const [y, m] = d.split('-').map(Number);
        return y === selectedYear && m === month + 1;
      });
      periodSales.push({
        period: periodStr,
        label: `${MONTH_NAMES[month]} ${selectedYear}`,
        sales: monthOrders.length,
        revenue: monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
      });
    }
  }

  const adminCount = admins.length;

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
      total: adminCount,
      active: adminCount,
      inactive: 0,
      admins: adminCount,
      clients: 0,
    },
    topProducts,
    topCategories,
    periodSales,
  };
}

export const Reports = () => {
  const [reportType, setReportType] = useState<string>('sales');
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [admins, setAdmins] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const unsubOrders = subscribeCollection<OrderDoc>(
      COLLECTIONS.orders,
      (items) => {
        setOrders(items);
        setLoading(false);
      },
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    );
    const unsubProducts = subscribeCollection<ProductDoc>(
      COLLECTIONS.products,
      (items) => setProducts(items),
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar productos')
    );
    const unsubCategories = subscribeCollection<CategoryDoc>(
      COLLECTIONS.categories,
      (items) => setCategories(items),
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar categorías')
    );
    const unsubAdmins = subscribeCollection<AdminDoc>(
      COLLECTIONS.admins,
      (items) => setAdmins(items),
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar admins')
    );
    return () => {
      unsubOrders();
      unsubProducts();
      unsubCategories();
      unsubAdmins();
    };
  }, []);

  const reportData = useMemo(
    () => buildReportData(orders, products, categories, admins, period, selectedDate, selectedMonth, selectedYear),
    [orders, products, categories, admins, period, selectedDate, selectedMonth, selectedYear]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };



  const getPeriodLabel = () => {
    const labels: Record<PeriodType, string> = {
      daily: 'Diario',
      monthly: 'Mensual',
      yearly: 'Anual',
    };
    return labels[period];
  };

  const getPeriodDescription = () => {
    const descriptions: Record<PeriodType, string> = {
      daily: 'Selecciona un día específico para ver el reporte detallado',
      monthly: 'Selecciona un mes completo (Enero, Febrero, Marzo, etc.) para ver todos los días del mes hasta la fecha actual',
      yearly: 'Selecciona un año completo para ver todos los meses del año hasta el mes actual',
    };
    return descriptions[period];
  };

  const handleGenerateReport = () => {
    // Los datos se actualizan en tiempo real por filtros (period/date/month/year)
  };

  const handleExportReport = () => {
    const rows: string[] = [];
    rows.push('Reporte;Valor');
    rows.push(`Ventas totales;${reportData.sales.total}`);
    rows.push(`Ingresos;${reportData.sales.revenue}`);
    rows.push(`Productos;${reportData.products.total}`);
    rows.push(`Usuarios;${reportData.users.total}`);
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${period}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxRevenue = useMemo(() => {
    return Math.max(...reportData.periodSales.map((p) => p.revenue), 0) || 1;
  }, [reportData.periodSales]);

  const productsTotalSafe = reportData.products.total || 1;
  const usersTotalSafe = reportData.users.total || 1;

  if (error) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1 className="page-title">Reportes</h1>
        </div>
        <div className="reports-period-info" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="reports-page">
        <div className="page-header">
          <h1 className="page-title">Reportes</h1>
        </div>
        <div className="reports-period-info">
          <p style={{ margin: 0 }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-description">
            Visualiza y analiza los datos de tu negocio
          </p>
        </div>
      </div>

      <div className="reports-filters-container">
        <div className="reports-filters">
          <select
            className="filter-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="sales">Reporte de Ventas</option>
            <option value="products">Reporte de Productos</option>
            <option value="users">Reporte de Usuarios</option>
            <option value="categories">Reporte de Categorías</option>
            <option value="summary">Resumen General</option>
          </select>
          
           <select
             className="filter-select"
             value={period}
             onChange={(e) => setPeriod(e.target.value as PeriodType)}
           >
             <option value="daily">Diario</option>
             <option value="monthly">Mensual</option>
             <option value="yearly">Anual</option>
           </select>

           {period === 'monthly' ? (
            <>
              <select
                className="filter-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                <option value="0">Enero</option>
                <option value="1">Febrero</option>
                <option value="2">Marzo</option>
                <option value="3">Abril</option>
                <option value="4">Mayo</option>
                <option value="5">Junio</option>
                <option value="6">Julio</option>
                <option value="7">Agosto</option>
                <option value="8">Septiembre</option>
                <option value="9">Octubre</option>
                <option value="10">Noviembre</option>
                <option value="11">Diciembre</option>
              </select>
              <input
                type="number"
                className="filter-input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                min="2020"
                max="2100"
                placeholder="Año"
               />
             </>
           ) : period === 'yearly' ? (
             <input
               type="number"
               className="filter-input"
               value={selectedYear}
               onChange={(e) => setSelectedYear(Number(e.target.value))}
               min="2020"
               max="2100"
               placeholder="Año"
             />
           ) : (
            <div className="filter-date-wrapper">
              <input
                type="date"
                className="filter-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' || e.key === 'Delete') {
                    setSelectedDate('');
                  }
                }}
                placeholder={period === 'daily' ? 'Seleccionar día' : 'Fecha de inicio'}
              />
              {selectedDate && (
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={() => setSelectedDate('')}
                  aria-label="Limpiar fecha"
                >
                  ×
                </button>
              )}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleGenerateReport}>
          Generar Reporte
        </button>
          <button className="btn btn-secondary" onClick={handleExportReport}>
            Exportar
          </button>
        </div>
      </div>

      <div className="reports-period-info">
        <div className="period-info-content">
          <span className="period-badge">Período: {getPeriodLabel()}</span>
          {period === 'daily' && selectedDate && (
            <span className="period-count">
              {formatDate(selectedDate)}
            </span>
          )}
           {period === 'monthly' && (
             <span className="period-count">
               {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][selectedMonth]} {selectedYear}
             </span>
           )}
           {period === 'yearly' && (
             <span className="period-count">
               Año {selectedYear} - {reportData.periodSales.length} meses
             </span>
           )}
        </div>
        <p className="period-description">{getPeriodDescription()}</p>
      </div>

      <div className="reports-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Ventas Totales</span>
          <span className="stat-badge-value">{reportData.sales.total}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Ingresos</span>
          <span className="stat-badge-value">{formatCurrency(reportData.sales.revenue)}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Productos</span>
          <span className="stat-badge-value">{reportData.products.total}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Usuarios</span>
          <span className="stat-badge-value">{reportData.users.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="reports-content">
        {reportType === 'sales' && (
          <div className="report-section">
            <h2 className="report-section-title">Reporte de Ventas - {getPeriodLabel()}</h2>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Resumen de Ventas</h3>
              <div className="report-card-content">
                <div className="report-stats-grid">
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Total Ventas</span>
                    <span className="report-stat-box-value">{reportData.sales.total}</span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Completadas</span>
                    <span className="report-stat-box-value" style={{ color: '#10b981' }}>
                      {reportData.sales.completed}
                    </span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Pendientes</span>
                    <span className="report-stat-box-value" style={{ color: '#f59e0b' }}>
                      {reportData.sales.pending}
                    </span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Canceladas</span>
                    <span className="report-stat-box-value" style={{ color: '#ef4444' }}>
                      {reportData.sales.cancelled}
                    </span>
                  </div>
                  <div className="report-stat-box report-stat-box-highlight">
                    <span className="report-stat-box-label">Ingresos Totales</span>
                    <span className="report-stat-box-value">{formatCurrency(reportData.sales.revenue)}</span>
                  </div>
                </div>
              </div>
            </div>

             <div className="report-card report-card-full">
               <div className="chart-header-section">
                 <h3 className="report-card-title">Ventas por {getPeriodLabel()}</h3>
                 <div className="chart-legend">
                   <span className="chart-legend-item">
                     <span className="chart-legend-dot"></span>
                     {reportData.periodSales.length} {period === 'daily' ? 'día' : period === 'monthly' ? 'días' : 'meses'}
                   </span>
                 </div>
               </div>
               <div className="report-card-content">
                 {reportData.periodSales.length > 0 ? (
                   <div className="improved-chart-container">
                     <div className="improved-chart-y-axis">
                       <div className="improved-chart-y-label">{formatCurrency(maxRevenue)}</div>
                       <div className="improved-chart-y-label">{formatCurrency(maxRevenue * 0.75)}</div>
                       <div className="improved-chart-y-label">{formatCurrency(maxRevenue * 0.5)}</div>
                       <div className="improved-chart-y-label">{formatCurrency(maxRevenue * 0.25)}</div>
                       <div className="improved-chart-y-label">S/ 0</div>
                     </div>
                     <div className="improved-chart-main">
                       <div className="improved-chart-grid">
                         <div className="improved-chart-grid-line"></div>
                         <div className="improved-chart-grid-line"></div>
                         <div className="improved-chart-grid-line"></div>
                         <div className="improved-chart-grid-line"></div>
                         <div className="improved-chart-grid-line"></div>
                       </div>
                       <div className="improved-chart-bars">
                         {reportData.periodSales.map((periodData, index) => (
                           <div key={periodData.period} className="improved-chart-bar-item">
                             <div className="improved-chart-bar-wrapper">
                               <div
                                 className="improved-chart-bar"
                                 style={{
                                   height: `${Math.max((periodData.revenue / maxRevenue) * 100, 3)}%`,
                                   animationDelay: `${index * 0.05}s`,
                                 }}
                                 title={`${periodData.label}: ${formatCurrency(periodData.revenue)} - ${periodData.sales} ventas`}
                               >
                                 <div className="improved-chart-bar-value">
                                   {formatCurrency(periodData.revenue)}
                                 </div>
                               </div>
                             </div>
                             <div className="improved-chart-bar-label">
                               <span className="improved-chart-label-date">{periodData.label}</span>
                               <span className="improved-chart-label-sales">{periodData.sales} ventas</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 ) : (
        <div className="empty-state">
                     <div className="empty-icon">📊</div>
                     <h2>No hay datos</h2>
                     <p>
                       {period === 'daily' 
                         ? 'Por favor selecciona un día para ver el reporte' 
                         : period === 'yearly'
                         ? 'Por favor selecciona un año para ver el reporte'
                         : 'Por favor selecciona un rango de fechas para ver el reporte'}
                     </p>
                   </div>
                 )}
               </div>
             </div>

            <div className="report-card report-card-full">
              <h3 className="report-card-title">Productos Más Vendidos</h3>
              <div className="report-card-content">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Ventas</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sales}</td>
                        <td>{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'products' && (
          <div className="report-section">
            <h2 className="report-section-title">Reporte de Productos</h2>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Resumen de Productos</h3>
              <div className="report-card-content">
                <div className="report-stats-grid">
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Total Productos</span>
                    <span className="report-stat-box-value">{reportData.products.total}</span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Activos</span>
                    <span className="report-stat-box-value" style={{ color: '#10b981' }}>
                      {reportData.products.active}
                    </span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Inactivos</span>
                    <span className="report-stat-box-value" style={{ color: '#64748b' }}>
                      {reportData.products.inactive}
                    </span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Stock Bajo</span>
                    <span className="report-stat-box-value" style={{ color: '#f59e0b' }}>
                      {reportData.products.lowStock}
                    </span>
                  </div>
                  <div className="report-stat-box report-stat-box-highlight">
                    <span className="report-stat-box-label">Valor Total</span>
                    <span className="report-stat-box-value">{formatCurrency(reportData.products.totalValue)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Distribución de Productos</h3>
              <div className="report-card-content">
                <div className="products-chart">
                  <div className="products-chart-item">
                    <div className="products-chart-bar-container">
                      <div
                        className="products-chart-bar products-chart-bar-active"
                        style={{
                          width: `${(reportData.products.active / productsTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="products-chart-label">
                      <span>Activos: {reportData.products.active}</span>
                      <span>{((reportData.products.active / productsTotalSafe) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="products-chart-item">
                    <div className="products-chart-bar-container">
                      <div
                        className="products-chart-bar products-chart-bar-inactive"
                        style={{
                          width: `${(reportData.products.inactive / productsTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="products-chart-label">
                      <span>Inactivos: {reportData.products.inactive}</span>
                      <span>{((reportData.products.inactive / productsTotalSafe) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="products-chart-item">
                    <div className="products-chart-bar-container">
                      <div
                        className="products-chart-bar products-chart-bar-lowstock"
                        style={{
                          width: `${(reportData.products.lowStock / productsTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="products-chart-label">
                      <span>Stock Bajo: {reportData.products.lowStock}</span>
                      <span>{((reportData.products.lowStock / productsTotalSafe) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'users' && (
          <div className="report-section">
            <h2 className="report-section-title">Reporte de Usuarios</h2>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Resumen de Usuarios</h3>
              <div className="report-card-content">
                <div className="report-stats-grid">
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Total Usuarios</span>
                    <span className="report-stat-box-value">{reportData.users.total.toLocaleString()}</span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Activos</span>
                    <span className="report-stat-box-value" style={{ color: '#10b981' }}>
                      {reportData.users.active.toLocaleString()}
                    </span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Inactivos</span>
                    <span className="report-stat-box-value" style={{ color: '#64748b' }}>
                      {reportData.users.inactive}
                    </span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Administradores</span>
                    <span className="report-stat-box-value">{reportData.users.admins}</span>
                  </div>
                  <div className="report-stat-box">
                    <span className="report-stat-box-label">Clientes</span>
                    <span className="report-stat-box-value">{reportData.users.clients.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Distribución de Usuarios</h3>
              <div className="report-card-content">
                <div className="users-chart">
                  <div className="users-chart-item">
                    <div className="users-chart-bar-container">
                      <div
                        className="users-chart-bar users-chart-bar-active"
                        style={{
                          width: `${(reportData.users.active / usersTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="users-chart-label">
                      <span>Activos: {reportData.users.active.toLocaleString()}</span>
                      <span>{((reportData.users.active / usersTotalSafe) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="users-chart-item">
                    <div className="users-chart-bar-container">
                      <div
                        className="users-chart-bar users-chart-bar-inactive"
                        style={{
                          width: `${(reportData.users.inactive / usersTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="users-chart-label">
                      <span>Inactivos: {reportData.users.inactive}</span>
                      <span>{((reportData.users.inactive / usersTotalSafe) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="users-chart-item">
                    <div className="users-chart-bar-container">
                      <div
                        className="users-chart-bar users-chart-bar-admins"
                        style={{
                          width: `${(reportData.users.admins / usersTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="users-chart-label">
                      <span>Administradores: {reportData.users.admins}</span>
                      <span>{((reportData.users.admins / usersTotalSafe) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="users-chart-item">
                    <div className="users-chart-bar-container">
                      <div
                        className="users-chart-bar users-chart-bar-clients"
                        style={{
                          width: `${(reportData.users.clients / usersTotalSafe) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="users-chart-label">
                      <span>Clientes: {reportData.users.clients.toLocaleString()}</span>
                      <span>{((reportData.users.clients / usersTotalSafe) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'categories' && (
          <div className="report-section">
            <h2 className="report-section-title">Reporte de Categorías</h2>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Categorías Más Vendidas</h3>
              <div className="report-card-content">
                <div className="categories-chart">
                  {reportData.topCategories.map((category) => {
                    const maxSales = reportData.topCategories.length
                      ? Math.max(1, ...reportData.topCategories.map((c) => c.sales))
                      : 1;
                    return (
                      <div key={category.id} className="categories-chart-item">
                        <div className="categories-chart-header">
                          <span className="categories-chart-name">{category.name}</span>
                          <span className="categories-chart-sales">{category.sales} ventas</span>
                        </div>
                        <div className="categories-chart-bar-container">
                          <div
                            className="categories-chart-bar"
                            style={{
                              width: `${(category.sales / maxSales) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="categories-chart-footer">
                          <span className="categories-chart-revenue">{formatCurrency(category.revenue)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="report-card report-card-full">
              <h3 className="report-card-title">Detalle de Categorías</h3>
              <div className="report-card-content">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Ventas</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topCategories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.sales}</td>
                        <td>{formatCurrency(category.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportType === 'summary' && (
          <div className="report-section">
            <h2 className="report-section-title">Resumen General - {getPeriodLabel()}</h2>
            <div className="report-grid">
              <div className="report-card">
                <h3 className="report-card-title">Ventas</h3>
                <div className="report-card-content">
                  <div className="report-stat-item">
                    <span className="report-stat-label">Total:</span>
                    <span className="report-stat-value">{reportData.sales.total}</span>
                  </div>
                  <div className="report-stat-item">
                    <span className="report-stat-label">Ingresos:</span>
                    <span className="report-stat-value">{formatCurrency(reportData.sales.revenue)}</span>
                  </div>
                </div>
              </div>
              <div className="report-card">
                <h3 className="report-card-title">Productos</h3>
                <div className="report-card-content">
                  <div className="report-stat-item">
                    <span className="report-stat-label">Total:</span>
                    <span className="report-stat-value">{reportData.products.total}</span>
                  </div>
                  <div className="report-stat-item">
                    <span className="report-stat-label">Valor:</span>
                    <span className="report-stat-value">{formatCurrency(reportData.products.totalValue)}</span>
                  </div>
                </div>
              </div>
              <div className="report-card">
                <h3 className="report-card-title">Usuarios</h3>
                <div className="report-card-content">
                  <div className="report-stat-item">
                    <span className="report-stat-label">Total:</span>
                    <span className="report-stat-value">{reportData.users.total.toLocaleString()}</span>
                  </div>
                  <div className="report-stat-item">
                    <span className="report-stat-label">Activos:</span>
                    <span className="report-stat-value">{reportData.users.active}</span>
                  </div>
                </div>
        </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
