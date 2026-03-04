import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import './Sales.css';
import type { Order } from '../../types/index.ts';
import { COLLECTIONS } from '../../firebase/collections';
import { setDocById, subscribeCollection } from '../../firebase/firestoreHelpers';
import { historyService } from '../../utils/historyService';

type SaleSource = 'online' | 'store';

interface SaleFormState {
  source: SaleSource;
  productId: string;
  quantity: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: 'Efectivo' | 'Yape' | '';
  notes: string;
}

interface ProductDoc {
  id: string;
  name: string;
  finalPrice?: number;
  price?: number;
  stock?: number;
}

export const Sales = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | SaleSource>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SaleFormState>({
    source: 'store',
    productId: '',
    quantity: '1',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: '',
    notes: '',
  });

  useEffect(() => {
    const unsubscribeOrders = subscribeCollection<Order>(
      COLLECTIONS.orders,
      (items) => {
        setOrders(items);
      },
      (error) => {
        console.error('Error al cargar ventas:', error);
        toast.error('No se pudieron cargar las ventas');
      }
    );

    const unsubscribeProducts = subscribeCollection<ProductDoc>(
      COLLECTIONS.products,
      (items) => {
        setProducts(items);
      },
      (error) => {
        console.error('Error al cargar productos:', error);
        toast.error('No se pudieron cargar los productos');
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const completedSales = useMemo(
    () => orders.filter((order) => order.status === 'completed'),
    [orders]
  );

  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.trim();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const filteredSales = useMemo(() => {
    return completedSales.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource =
        sourceFilter === 'all' || (order.source ?? 'online') === sourceFilter;

      const matchesDate =
        !dateFilter || normalizeDate(order.date) === normalizeDate(dateFilter);

      return matchesSearch && matchesSource && matchesDate;
    });
  }, [completedSales, searchTerm, sourceFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalSales = completedSales.length;
    const storeSales = completedSales.filter((o) => o.source === 'store').length;
    const onlineSales = completedSales.length - storeSales;
    const totalRevenue = completedSales.reduce((sum, o) => sum + o.total, 0);

    return { totalSales, storeSales, onlineSales, totalRevenue };
  }, [completedSales]);

  const resetForm = () => {
    setFormData({
      source: 'store',
      productId: '',
      quantity: '1',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      paymentMethod: '',
      notes: '',
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isCreating) return;
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSelectedProduct = (): ProductDoc | undefined =>
    products.find((p) => p.id === formData.productId);

  const getNumericQuantity = () => {
    const quantityNumber = Number(formData.quantity);
    return Number.isFinite(quantityNumber) && quantityNumber > 0 ? quantityNumber : NaN;
  };

  const getComputedTotal = () => {
    const product = getSelectedProduct();
    const quantityNumber = getNumericQuantity();
    if (!product || !Number.isFinite(quantityNumber)) return 0;
    const unitPrice = Number(product.finalPrice ?? product.price ?? 0);
    return unitPrice * quantityNumber;
  };

  const buildNextOrderNumber = () => {
    const currentMax = orders.reduce((max, order) => {
      const n = order.orderNumber ?? 0;
      return n > max ? n : max;
    }, 0);
    return currentMax + 1;
  };

  const buildSaleId = (orderNumber: number) => {
    return `ORD-${String(orderNumber).padStart(6, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    const product = getSelectedProduct();
    if (!product) {
      toast.error('Selecciona un producto válido de la tienda');
      return;
    }

    const quantityNumber = getNumericQuantity();
    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      toast.error('Ingresa una cantidad de artículos válida');
      return;
    }

    const unitPrice = Number(product.finalPrice ?? product.price ?? 0);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      toast.error('El producto seleccionado no tiene un precio válido');
      return;
    }

    if (!formData.paymentMethod) {
      toast.error('Selecciona un método de pago');
      return;
    }

    const totalNumber = unitPrice * quantityNumber;

    setIsCreating(true);

    try {
      const now = new Date();
      const orderNumber = buildNextOrderNumber();
      const id = buildSaleId(orderNumber);
      const date = now.toISOString().split('T')[0];

      const order: Order = {
        id,
        customerName: formData.customerName || 'Venta en tienda',
        customerEmail: formData.customerEmail || undefined,
        customerPhone: formData.customerPhone || undefined,
        total: totalNumber,
        status: 'completed',
        date,
        items: quantityNumber,
        orderItems: [
          {
            id: product.id,
            productName: product.name,
            quantity: quantityNumber,
            price: unitPrice,
            subtotal: totalNumber,
          },
        ],
        shippingAddress: undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        source: formData.source,
        orderNumber,
      };

      await setDocById<Order>(COLLECTIONS.orders, id, order);

      historyService.add({
        action: 'create',
        section: 'orders',
        itemName: `${order.id} - ${product.name}`,
        itemId: order.id,
        details:
          formData.source === 'store'
            ? `Venta registrada manualmente en tienda por ${formatCurrency(order.total)}`
            : `Venta online registrada como completada por ${formatCurrency(order.total)}`,
      });

      toast.success('Venta registrada correctamente');
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error al registrar venta:', error);
      toast.error('No se pudo registrar la venta. Intenta nuevamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de Ventas</h1>
          <p className="page-description">
            Visualiza todas las ventas completadas y registra ventas en tienda manualmente
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-primary" onClick={handleOpenModal}>
            Registrar venta en tienda
          </button>
        </div>
      </div>

      <div className="sales-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Ventas completadas</span>
          <span className="stat-badge-value">{stats.totalSales}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Ventas online</span>
          <span className="stat-badge-value">{stats.onlineSales}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Ventas en tienda</span>
          <span className="stat-badge-value">{stats.storeSales}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Ingresos totales</span>
          <span className="stat-badge-value">{formatCurrency(stats.totalRevenue)}</span>
        </div>
      </div>

      <div className="sales-filters-container">
        <div className="sales-filters">
          <div className="filter-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por ID o cliente..."
              className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as 'all' | SaleSource)}
          >
            <option value="all">Todas las fuentes</option>
            <option value="online">Ventas online</option>
            <option value="store">Ventas en tienda</option>
          </select>
          <div className="filter-date-wrapper">
            <input
              type="date"
              className="filter-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                  setDateFilter('');
                }
              }}
              placeholder="Filtrar por fecha"
            />
            {dateFilter && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => setDateFilter('')}
                title="Limpiar filtro de fecha"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Fuente</th>
              <th>Artículos</th>
              <th>Total</th>
              <th>Método de pago</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span className="table-order-id">{sale.id}</span>
                  </td>
                  <td>{sale.customerName}</td>
                  <td>{formatDate(sale.date)}</td>
                  <td>
                    <span className={`source-badge source-${sale.source ?? 'online'}`}>
                      {sale.source === 'store' ? 'Tienda' : 'Online'}
                    </span>
                  </td>
                  <td>{sale.items}</td>
                  <td>{formatCurrency(sale.total)}</td>
                  <td>{sale.paymentMethod}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="table-empty">
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h2>No hay ventas</h2>
                    <p>No se encontraron ventas con los filtros aplicados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content sale-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Registrar venta en tienda</h2>
              <button className="modal-close" onClick={handleCloseModal} disabled={isCreating}>
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="source">
                    Tipo de venta
                  </label>
                  <select
                    id="source"
                    name="source"
                    className="form-select"
                    value={formData.source}
                    onChange={handleInputChange}
                  >
                    <option value="store">Venta en tienda</option>
                    <option value="online">Venta online</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="productId">
                    Producto
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    className="form-select"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerName">
                    Cliente
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    className="form-input"
                    type="text"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Nombre del cliente (opcional)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerEmail">
                    Email
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    className="form-input"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="Correo del cliente (opcional)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerPhone">
                    Teléfono
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    className="form-input"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="Teléfono del cliente (opcional)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="quantity">
                    Cantidad de artículos
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    className="form-input"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Monto total</label>
                  <div className="form-input readonly">
                    {formatCurrency(getComputedTotal())}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="paymentMethod">
                    Método de pago
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-textarea"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Detalles adicionales de la venta (opcional)"
                />
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Guardando...' : 'Registrar venta'}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={handleCloseModal}
                  disabled={isCreating}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

