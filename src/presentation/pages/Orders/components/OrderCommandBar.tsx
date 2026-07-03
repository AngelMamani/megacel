import type { RefObject } from 'react';
import type { OrderViewMode } from '../types/OrderPageTypes.ts';
import { IconClose, IconGrid, IconSearch, IconTable } from './OrderIcons.tsx';

interface OrderCommandBarProps {
  SearchQuery: string;
  OnSearchChange: (value: string) => void;
  OnClearSearch: () => void;
  IsSearching: boolean;
  StatusFilter: string;
  OnStatusFilterChange: (value: string) => void;
  ViewMode: OrderViewMode;
  OnViewModeChange: (mode: OrderViewMode) => void;
  ResultCount: number;
  SearchInputRef?: RefObject<HTMLInputElement | null>;
}

export const OrderCommandBar = ({
  SearchQuery,
  OnSearchChange,
  OnClearSearch,
  IsSearching,
  StatusFilter,
  OnStatusFilterChange,
  ViewMode,
  OnViewModeChange,
  ResultCount,
  SearchInputRef,
}: OrderCommandBarProps) => (
  <section className="orders-command" aria-label="Controles de pedidos">
    <div className="orders-command__search">
      <IconSearch className="orders-command__search-icon" />
      <input
        ref={SearchInputRef}
        type="search"
        className="orders-command__search-input"
        placeholder="Buscar pedidos... (Ctrl+K)"
        value={SearchQuery}
        onChange={(e) => OnSearchChange(e.target.value)}
        aria-label="Buscar pedidos"
      />
      {SearchQuery && (
        <button
          type="button"
          className="orders-command__search-clear"
          onClick={OnClearSearch}
          aria-label="Limpiar búsqueda"
        >
          <IconClose size={14} />
        </button>
      )}
      {IsSearching && <span className="orders-command__search-pulse" aria-hidden="true" />}
    </div>

    <div className="orders-command__actions">
      <select
        className="orders-command__filter"
        value={StatusFilter}
        onChange={(e) => OnStatusFilterChange(e.target.value)}
        aria-label="Filtrar por estado"
      >
        <option value="all">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="verifying_payment">Verificando pago</option>
        <option value="payment_successful">Pago exitoso</option>
        <option value="rejected">Pedido rechazado</option>
      </select>

      <div className="orders-command__view" role="group" aria-label="Modo de vista">
        <button
          type="button"
          className={`orders-command__view-btn${ViewMode === 'grid' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('grid')}
          title="Vista tarjetas"
        >
          <IconGrid />
        </button>
        <button
          type="button"
          className={`orders-command__view-btn${ViewMode === 'table' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('table')}
          title="Vista tabla"
        >
          <IconTable />
        </button>
      </div>
    </div>

    <p className="orders-command__count">
      {ResultCount} {ResultCount === 1 ? 'pedido' : 'pedidos'}
      {SearchQuery.trim() || StatusFilter !== 'all' ? ' · filtrados' : ''}
    </p>
  </section>
);
