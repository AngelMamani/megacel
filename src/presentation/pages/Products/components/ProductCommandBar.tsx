import type { RefObject } from 'react';
import type { BrandOption, CategoryOption, ProductSortKey, ProductViewMode } from '../types/ProductPageTypes.ts';
import { IconClose, IconGrid, IconSearch, IconTable } from './ProductIcons.tsx';

interface ProductCommandBarProps {
  SearchQuery: string;
  OnSearchChange: (value: string) => void;
  OnClearSearch: () => void;
  IsSearching: boolean;
  CategoryFilter: string;
  BrandFilter: string;
  OnCategoryFilterChange: (value: string) => void;
  OnBrandFilterChange: (value: string) => void;
  ActiveCategories: CategoryOption[];
  ActiveBrands: BrandOption[];
  ViewMode: ProductViewMode;
  OnViewModeChange: (mode: ProductViewMode) => void;
  SortBy: ProductSortKey;
  OnSortChange: (sort: ProductSortKey) => void;
  ResultCount: number;
  SearchInputRef?: RefObject<HTMLInputElement | null>;
}

const SortOptions: { key: ProductSortKey; label: string }[] = [
  { key: 'recent', label: 'Recientes' },
  { key: 'name', label: 'A-Z' },
  { key: 'price', label: 'Precio' },
  { key: 'stock', label: 'Stock' },
];

export const ProductCommandBar = ({
  SearchQuery,
  OnSearchChange,
  OnClearSearch,
  IsSearching,
  CategoryFilter,
  BrandFilter,
  OnCategoryFilterChange,
  OnBrandFilterChange,
  ActiveCategories,
  ActiveBrands,
  ViewMode,
  OnViewModeChange,
  SortBy,
  OnSortChange,
  ResultCount,
  SearchInputRef,
}: ProductCommandBarProps) => (
  <section className="products-command" aria-label="Controles de productos">
    <div className="products-command__search">
      <IconSearch className="products-command__search-icon" />
      <input
        ref={SearchInputRef}
        type="search"
        className="products-command__search-input"
        placeholder="Buscar productos... (Ctrl+K)"
        value={SearchQuery}
        onChange={(e) => OnSearchChange(e.target.value)}
        aria-label="Buscar productos"
      />
      {SearchQuery && (
        <button type="button" className="products-command__search-clear" onClick={OnClearSearch} aria-label="Limpiar búsqueda">
          <IconClose size={14} />
        </button>
      )}
      {IsSearching && <span className="products-command__search-pulse" aria-hidden="true" />}
    </div>

    <div className="products-command__actions">
      <select
        className="products-command__filter"
        value={CategoryFilter}
        onChange={(e) => OnCategoryFilterChange(e.target.value)}
        aria-label="Filtrar por categoría"
      >
        <option value="all">Todas las categorías</option>
        {ActiveCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        className="products-command__filter"
        value={BrandFilter}
        onChange={(e) => OnBrandFilterChange(e.target.value)}
        aria-label="Filtrar por marca"
      >
        <option value="all">Todas las marcas</option>
        {ActiveBrands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      <div className="products-command__sort-pills" role="group" aria-label="Ordenar productos">
        {SortOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`products-command__sort-pill${SortBy === option.key ? ' is-active' : ''}`}
            onClick={() => OnSortChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="products-command__view" role="group" aria-label="Modo de vista">
        <button
          type="button"
          className={`products-command__view-btn${ViewMode === 'grid' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('grid')}
          title="Vista cuadrícula"
        >
          <IconGrid />
        </button>
        <button
          type="button"
          className={`products-command__view-btn${ViewMode === 'table' ? ' is-active' : ''}`}
          onClick={() => OnViewModeChange('table')}
          title="Vista tabla"
        >
          <IconTable />
        </button>
      </div>
    </div>

    <p className="products-command__count">
      {ResultCount} {ResultCount === 1 ? 'producto activo' : 'productos activos'}
      {SearchQuery.trim() || CategoryFilter !== 'all' || BrandFilter !== 'all' ? ' · filtrados' : ''}
    </p>
  </section>
);
