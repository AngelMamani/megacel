import type { RefObject } from 'react';
import { IconClose, IconSearch } from './HistoryIcons.tsx';

interface HistoryCommandBarProps {
  SearchQuery: string;
  OnSearchChange: (value: string) => void;
  OnClearSearch: () => void;
  IsSearching: boolean;
  ActionFilter: string;
  OnActionFilterChange: (value: string) => void;
  SectionFilter: string;
  OnSectionFilterChange: (value: string) => void;
  ResultCount: number;
  SearchInputRef?: RefObject<HTMLInputElement | null>;
}

export const HistoryCommandBar = ({
  SearchQuery,
  OnSearchChange,
  OnClearSearch,
  IsSearching,
  ActionFilter,
  OnActionFilterChange,
  SectionFilter,
  OnSectionFilterChange,
  ResultCount,
  SearchInputRef,
}: HistoryCommandBarProps) => (
  <section className="history-command" aria-label="Controles del historial">
    <div className="history-command__search">
      <IconSearch className="history-command__search-icon" />
      <input
        ref={SearchInputRef}
        type="search"
        className="history-command__search-input"
        placeholder="Buscar por ítem, ID o detalle... (Ctrl+K)"
        value={SearchQuery}
        onChange={(e) => OnSearchChange(e.target.value)}
        aria-label="Buscar en historial"
      />
      {SearchQuery && (
        <button
          type="button"
          className="history-command__search-clear"
          onClick={OnClearSearch}
          aria-label="Limpiar búsqueda"
        >
          <IconClose size={14} />
        </button>
      )}
      {IsSearching && <span className="history-command__search-pulse" aria-hidden="true" />}
    </div>

    <div className="history-command__actions">
      <select
        className="history-command__filter"
        value={ActionFilter}
        onChange={(e) => OnActionFilterChange(e.target.value)}
        aria-label="Filtrar por acción"
      >
        <option value="all">Todas las acciones</option>
        <option value="create">Creaciones</option>
        <option value="update">Ediciones</option>
        <option value="delete">Eliminaciones</option>
        <option value="deactivate">Desactivaciones</option>
        <option value="reactivate">Reactivaciones</option>
        <option value="login">Sesiones exitosas</option>
        <option value="login_failed">Intentos fallidos</option>
      </select>

      <select
        className="history-command__filter"
        value={SectionFilter}
        onChange={(e) => OnSectionFilterChange(e.target.value)}
        aria-label="Filtrar por sección"
      >
        <option value="all">Todas las secciones</option>
        <option value="products">Productos</option>
        <option value="categories">Categorías</option>
        <option value="brands">Marcas</option>
        <option value="orders">Pedidos</option>
        <option value="users">Usuarios</option>
        <option value="auth">Autenticación</option>
      </select>
    </div>

    <p className="history-command__count">
      {ResultCount} {ResultCount === 1 ? 'registro' : 'registros'}
      {SearchQuery.trim() || ActionFilter !== 'all' || SectionFilter !== 'all' ? ' · filtrados' : ''}
    </p>
  </section>
);
