import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Orders.css';
import { useApplication, useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { Order } from '../../../domain/entities/Order.ts';
import type { OrderStatus } from '../../../domain/value-objects/OrderStatus.ts';
import {
  ORDER_STATUS,
  matchesOrderStatusFilter,
  normalizeToWritableOrderStatus,
} from '../../../domain/value-objects/OrderStatus.ts';
import type { OrderEditFormData, OrderViewMode } from './types/OrderPageTypes.ts';
import {
  CalculateOrderStats,
  FormatCurrency,
  GetOrderLabel,
  SortOrders,
} from './utils/orderPresentationUtils.ts';
import { OrderPageHeader } from './components/OrderPageHeader.tsx';
import { OrderKpiStrip } from './components/OrderKpiStrip.tsx';
import { OrderCommandBar } from './components/OrderCommandBar.tsx';
import { OrderCard } from './components/OrderCard.tsx';
import { OrderTableView } from './components/OrderTableView.tsx';
import { OrderViewModal } from './components/OrderViewModal.tsx';
import { OrderEditModal } from './components/OrderEditModal.tsx';

export const Orders = () => {
  const { repositories } = useInfrastructure();
  const application = useApplication();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrderIds, setPendingOrderIds] = useState<Set<string>>(() => new Set());
  const deletingOrderIdsRef = useRef<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<OrderViewMode>('table');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderEditFormData>({
    status: ORDER_STATUS.Pending,
    rejectionReason: '',
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = repositories.order.subscribe(
      (items) => {
        const server = items.filter((item) => !deletingOrderIdsRef.current.has(item.id));
        const serverIds = new Set(server.map((item) => item.id));

        setPendingOrderIds((prev) => {
          const next = new Set(prev);
          let changed = false;
          serverIds.forEach((id) => {
            if (next.delete(id)) changed = true;
          });
          return changed ? next : prev;
        });

        deletingOrderIdsRef.current.forEach((id) => {
          if (!serverIds.has(id)) deletingOrderIdsRef.current.delete(id);
        });

        setOrders(server);
      },
      (error) => {
        console.error('Error al cargar pedidos:', error);
        toast.error('No se pudieron cargar los pedidos');
      }
    );

    return () => unsubscribe();
  }, [repositories.order]);

  useEffect(() => {
    const HandleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', HandleKeyDown);
    return () => window.removeEventListener('keydown', HandleKeyDown);
  }, [searchQuery]);

  const stats = useMemo(() => CalculateOrderStats(orders), [orders]);
  const isSearching = searchQuery !== deferredSearch;

  const displayedOrders = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    const filtered = orders.filter((order) => {
      const orderLabel = GetOrderLabel(order);
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        orderLabel.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query) ||
        order.customerPhone?.includes(query);

      const matchesStatus = matchesOrderStatusFilter(order.status, statusFilter);

      return matchesSearch && matchesStatus;
    });

    return SortOrders(filtered, 'recent');
  }, [orders, deferredSearch, statusFilter]);

  const hasFilters = Boolean(deferredSearch.trim() || statusFilter !== 'all');

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order.id);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenEditModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order.id);
    setFormData({
      status: normalizeToWritableOrderStatus(order.status),
      rejectionReason: order.rejectionReason || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
    setFormData({ status: ORDER_STATUS.Pending, rejectionReason: '' });
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (formData.status === ORDER_STATUS.Rejected && !formData.rejectionReason.trim()) {
      toast.error('Ingresa el motivo del rechazo para que el cliente lo vea.');
      return;
    }

    const orderId = selectedOrder.id;
    const orderLabel = GetOrderLabel(selectedOrder);
    const rollbackSnapshot: Order = { ...selectedOrder };
    const patch = {
      status: formData.status as OrderStatus,
      rejectionReason:
        formData.status === ORDER_STATUS.Rejected ? formData.rejectionReason.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };

    const optimisticOrder: Order = {
      ...selectedOrder,
      status: patch.status,
      rejectionReason: patch.rejectionReason,
      updatedAt: patch.updatedAt,
    };

    setPendingOrderIds((prev) => new Set(prev).add(orderId));
    setOrders((prev) => prev.map((order) => (order.id === orderId ? optimisticOrder : order)));
    handleCloseEditModal();
    toast.success(`Pedido ${orderLabel} actualizado — sincronizando en segundo plano`);

    void (async () => {
      try {
        await application.orders.updateStatus.execute({
          orderId,
          orderLabel,
          status: formData.status as OrderStatus,
          rejectionReason: formData.rejectionReason,
        });
      } catch (error) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? rollbackSnapshot : order)));
        setPendingOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
        toast.error(
          error instanceof Error ? error.message : 'No se pudo actualizar el pedido. Intenta nuevamente.'
        );
      }
    })();
  };

  const handleDeleteOrder = async (order: Order) => {
    const result = await Swal.fire({
      title: '¿Eliminar pedido?',
      html: `
        <div style="text-align:center;">
          <p style="font-size:1.05rem;margin-bottom:0.75rem;">
            El pedido <strong style="color:#ef4444;">${GetOrderLabel(order)}</strong> será eliminado permanentemente.
          </p>
          <p style="color:#991b1b;font-size:0.88rem;background:#fef2f2;padding:0.75rem;border-radius:0.5rem;">
            Esta acción no se puede deshacer.
          </p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const rollbackOrders = orders;
    deletingOrderIdsRef.current.add(order.id);
    setOrders((prev) => prev.filter((item) => item.id !== order.id));
    toast.success(`Pedido ${GetOrderLabel(order)} eliminado — sincronizando en segundo plano`);

    void (async () => {
      try {
        await application.orders.delete.execute({ orderId: order.id });
      } catch (error) {
        deletingOrderIdsRef.current.delete(order.id);
        setOrders(rollbackOrders);
        toast.error('No se pudo eliminar el pedido. Intenta nuevamente.');
      }
    })();
  };

  return (
    <div className="orders-page">
      <OrderPageHeader />

      <OrderKpiStrip Stats={stats} FormatCurrency={FormatCurrency} />

      <OrderCommandBar
        SearchQuery={searchQuery}
        OnSearchChange={setSearchQuery}
        OnClearSearch={() => setSearchQuery('')}
        IsSearching={isSearching}
        StatusFilter={statusFilter}
        OnStatusFilterChange={setStatusFilter}
        ViewMode={viewMode}
        OnViewModeChange={setViewMode}
        ResultCount={displayedOrders.length}
        SearchInputRef={searchInputRef}
      />

      {viewMode === 'table' ? (
        <OrderTableView
          Orders={displayedOrders}
          PendingOrderIds={pendingOrderIds}
          SelectedOrderId={selectedOrderId}
          FormatCurrency={FormatCurrency}
          OnSelect={handleSelectOrder}
          OnView={handleViewOrder}
          OnEdit={handleOpenEditModal}
          OnDelete={handleDeleteOrder}
          HasFilters={hasFilters}
        />
      ) : (
        <div className="orders-grid">
          {displayedOrders.length > 0 ? (
            displayedOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                Order={order}
                Index={index}
                IsPending={pendingOrderIds.has(order.id)}
                IsSelected={selectedOrderId === order.id}
                FormatCurrency={FormatCurrency}
                OnSelect={handleSelectOrder}
                OnView={handleViewOrder}
                OnEdit={handleOpenEditModal}
                OnDelete={handleDeleteOrder}
              />
            ))
          ) : (
            <div className="orders-empty orders-empty--full">
              <span className="orders-empty__icon" aria-hidden>
                📦
              </span>
              <h3>Sin resultados</h3>
              <p>
                {hasFilters
                  ? 'No hay pedidos que coincidan con los filtros aplicados.'
                  : 'Aún no hay pedidos registrados.'}
              </p>
            </div>
          )}
        </div>
      )}

      {isViewModalOpen && selectedOrder && (
        <OrderViewModal
          Order={selectedOrder}
          OnClose={handleCloseViewModal}
          OnEdit={() => {
            handleCloseViewModal();
            handleOpenEditModal(selectedOrder);
          }}
        />
      )}

      {isEditModalOpen && selectedOrder && (
        <OrderEditModal
          Order={selectedOrder}
          FormData={formData}
          OnChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          OnClose={handleCloseEditModal}
          OnSubmit={handleUpdateStatus}
        />
      )}
    </div>
  );
};
