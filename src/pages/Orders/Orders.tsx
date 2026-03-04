import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { type Order } from '../../types/index.ts';
import './Orders.css';
import { historyService } from '../../utils/historyService';
import { COLLECTIONS } from '../../firebase/collections';
import { deleteDocById, subscribeCollection, updateDocById } from '../../firebase/firestoreHelpers';

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    status: 'pending' as 'pending' | 'processing' | 'completed' | 'cancelled',
    notes: '',
  });

  useEffect(() => {
    const unsubscribe = subscribeCollection<Order>(
      COLLECTIONS.orders,
      (items) => {
        setOrders(items);
      },
      (error) => {
        console.error('Error al cargar pedidos:', error);
        toast.error('No se pudieron cargar los pedidos');
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'En proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.trim();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDate = !dateFilter || normalizeDate(order.date) === normalizeDate(dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const processing = orders.filter((o) => o.status === 'processing').length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    return { total, pending, processing, completed, cancelled, totalRevenue };
  }, [orders]);

  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string,
    duration: number = 3000
  ) => {
    const toastOptions = {
      duration,
      className: `toast-with-progress ${type}`,
      style: {
        '--toast-duration': `${duration}ms`,
      } as React.CSSProperties,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast(message, { ...toastOptions, icon: '⚠️' });
        break;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      status: order.status,
      notes: order.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
    setFormData({
      status: 'pending',
      notes: '',
    });
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await updateDocById<Order>(COLLECTIONS.orders, selectedOrder.id, {
        status: formData.status,
        notes: formData.notes,
        updatedAt: new Date().toISOString(),
      });

      historyService.add({
        action: 'update',
        section: 'orders',
        itemName: selectedOrder.id,
        itemId: selectedOrder.id,
        details: `Pedido ${selectedOrder.id} actualizado - Estado: ${getStatusLabel(formData.status)}`,
      });

      showToast('success', 'Pedido actualizado correctamente', 3000);
      handleCloseEditModal();
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      showToast('error', 'No se pudo actualizar el pedido. Intenta nuevamente.', 4000);
    }
  };

  const handleDeleteOrder = (order: Order) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el pedido ${order.id}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDocById(COLLECTIONS.orders, order.id);

          historyService.add({
            action: 'delete',
            section: 'orders',
            itemName: order.id,
            itemId: order.id,
            details: `Pedido ${order.id} eliminado`,
          });

          showToast('success', 'Pedido eliminado correctamente', 3000);
        } catch (error) {
          console.error('Error al eliminar pedido:', error);
          showToast('error', 'No se pudo eliminar el pedido. Intenta nuevamente.', 4000);
        }
      }
    });
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-description">
            Gestiona todos los pedidos de tu tienda
          </p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Total Pedidos</span>
          <span className="stat-badge-value">{stats.total}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Pendientes</span>
          <span className="stat-badge-value">{stats.pending}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">En Proceso</span>
          <span className="stat-badge-value">{stats.processing}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Completados</span>
          <span className="stat-badge-value">{stats.completed}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Ingresos</span>
          <span className="stat-badge-value">{formatCurrency(stats.totalRevenue)}</span>
        </div>
      </div>

      <div className="orders-filters-container">
        <div className="orders-filters">
          <div className="filter-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar pedidos..."
              className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">En proceso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
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
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de tabla"
          >
            📋
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista de cuadrícula"
          >
            ⊞
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="table-order-id">{order.id}</span>
                    </td>
                    <td>
                      <div className="table-customer-info">
                        <span className="table-customer">{order.customerName}</span>
                        {order.customerEmail && (
                          <span className="table-customer-email">{order.customerEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="table-date">{formatDate(order.date)}</span>
                    </td>
                    <td>
                      <span className="table-items">{order.items}</span>
                    </td>
                    <td>
                      <span className="table-price">{formatCurrency(order.total)}</span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action btn-view"
                          title="Ver detalles"
                          onClick={() => handleViewOrder(order)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn-action btn-edit"
                          title="Editar"
                          onClick={() => handleOpenEditModal(order)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-action btn-delete"
                          title="Eliminar"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="table-empty">
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h2>No se encontraron pedidos</h2>
                      <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="orders-grid-container">
          <div className="orders-grid">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <span className="order-card-id">{order.id}</span>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <h3 className="order-card-customer">{order.customerName}</h3>
                    <div className="order-card-details">
                      <p>
                        <span className="detail-label">Fecha:</span>
                        <span className="detail-value">{formatDate(order.date)}</span>
                      </p>
                      <p>
                        <span className="detail-label">Artículos:</span>
                        <span className="detail-value">{order.items}</span>
                      </p>
                      <p>
                        <span className="detail-label">Total:</span>
                        <span className="detail-value">{formatCurrency(order.total)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="order-card-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => handleViewOrder(order)}
                    >
                      Ver
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleOpenEditModal(order)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteOrder(order)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h2>No se encontraron pedidos</h2>
                <p>Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isViewModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseViewModal}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Detalles del Pedido</h2>
              <button className="modal-close" onClick={handleCloseViewModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details-section">
                <h3>Información del Pedido</h3>
                <div className="order-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID Pedido:</span>
                    <span className="detail-value">{selectedOrder.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estado:</span>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">{formatDate(selectedOrder.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="order-details-section">
                <h3>Información del Cliente</h3>
                <div className="order-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{selectedOrder.customerName}</span>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                  {selectedOrder.customerPhone && (
                    <div className="detail-item">
                      <span className="detail-label">Teléfono:</span>
                      <span className="detail-value">{selectedOrder.customerPhone}</span>
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="detail-item">
                      <span className="detail-label">Dirección:</span>
                      <span className="detail-value">{selectedOrder.shippingAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="order-details-section">
                  <h3>Artículos del Pedido</h3>
                  <div className="order-items-list">
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="total-label">
                            <strong>Total:</strong>
                          </td>
                          <td className="total-value">
                            <strong>{formatCurrency(selectedOrder.total)}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {selectedOrder.paymentMethod && (
                <div className="order-details-section">
                  <h3>Información de Pago</h3>
                  <div className="order-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Método de pago:</span>
                      <span className="detail-value">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="order-details-section">
                  <h3>Notas</h3>
                  <p className="order-notes">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.createdAt && (
                <div className="order-details-section">
                  <div className="order-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Creado:</span>
                      <span className="detail-value">{formatDateTime(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.updatedAt && (
                      <div className="detail-item">
                        <span className="detail-label">Actualizado:</span>
                        <span className="detail-value">{formatDateTime(selectedOrder.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleCloseViewModal();
                  handleOpenEditModal(selectedOrder);
                }}
              >
                Editar Pedido
              </button>
              <button type="button" className="btn btn-cancel" onClick={handleCloseViewModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Pedido {selectedOrder.id}</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="modal-body">
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Estado del Pedido
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Order['status'] })
                  }
                  required
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">En proceso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Agregar notas sobre el pedido..."
                />
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={handleCloseEditModal}
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
