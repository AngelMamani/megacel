import { useEffect, useMemo, useState } from 'react';
import type { Order } from '../../../domain/entities/Order.ts';
import type { Product } from '../../../domain/entities/Product.ts';
import type { Category } from '../../../domain/entities/Category.ts';
import type { PlatformUser } from '../../../domain/entities/PlatformUser.ts';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import { ReportsCategoriesSection } from './components/ReportsCategoriesSection.tsx';
import { ReportsKpiStrip } from './components/ReportsKpiStrip.tsx';
import { ReportsPageHeader } from './components/ReportsPageHeader.tsx';
import { ReportsProductsSection } from './components/ReportsProductsSection.tsx';
import { ReportsSalesSection } from './components/ReportsSalesSection.tsx';
import { ReportsSummarySection } from './components/ReportsSummarySection.tsx';
import { ReportsTypeTabs } from './components/ReportsTypeTabs.tsx';
import { ReportsUsersSection } from './components/ReportsUsersSection.tsx';
import './Reports.css';
import type { ReportType } from './types/ReportsPageTypes.ts';
import { BuildReportData } from './utils/reportsDataUtils.ts';
import { FormatReportCurrency } from './utils/reportsPresentationUtils.ts';

type OrderDoc = Pick<Order, 'id' | 'total' | 'status' | 'date' | 'createdAt' | 'orderItems'>;
type ProductDoc = Pick<
  Product,
  'id' | 'name' | 'categoryId' | 'price' | 'finalPrice' | 'stock' | 'minStock' | 'status'
>;
type CategoryDoc = Pick<Category, 'id' | 'name'>;

export const Reports = () => {
  const { repositories } = useInfrastructure();

  const [reportType, setReportType] = useState<ReportType>('sales');

  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const unsubOrders = repositories.order.subscribe(
      (items) => {
        setOrders(items);
        setLoading(false);
      },
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    );
    const unsubProducts = repositories.product.subscribe(
      (items) => setProducts(items),
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar productos')
    );
    const unsubCategories = repositories.category.subscribe(
      (items) => setCategories(items),
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar categorías')
    );
    const unsubUsers = repositories.platformUser.subscribe(
      (items) => setPlatformUsers(items),
      (err) => setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    );

    return () => {
      unsubOrders();
      unsubProducts();
      unsubCategories();
      unsubUsers();
    };
  }, [repositories.order, repositories.product, repositories.category, repositories.platformUser]);

  const reportData = useMemo(
    () => BuildReportData(orders, products, categories, platformUsers),
    [orders, products, categories, platformUsers]
  );

  if (error) {
    return (
      <div className="reports-page">
        <ReportsPageHeader />
        <div className="reports-alert reports-alert--error">{error}</div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="reports-page">
        <ReportsPageHeader />
        <div className="reports-alert">Cargando datos del reporte...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <ReportsPageHeader />

      <ReportsKpiStrip Data={reportData} FormatCurrency={FormatReportCurrency} />

      <ReportsTypeTabs SelectedType={reportType} OnSelect={setReportType} />

      <main className="reports-content">
        {reportType === 'sales' && (
          <ReportsSalesSection Data={reportData} FormatCurrency={FormatReportCurrency} />
        )}

        {reportType === 'products' && <ReportsProductsSection Data={reportData} />}

        {reportType === 'users' && <ReportsUsersSection Data={reportData} />}

        {reportType === 'categories' && (
          <ReportsCategoriesSection Data={reportData} FormatCurrency={FormatReportCurrency} />
        )}

        {reportType === 'summary' && (
          <ReportsSummarySection Data={reportData} FormatCurrency={FormatReportCurrency} />
        )}
      </main>
    </div>
  );
};
