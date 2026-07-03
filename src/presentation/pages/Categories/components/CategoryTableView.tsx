import type { CSSProperties, MouseEvent } from 'react';
import type { CategoryView } from '../types/CategoryPageTypes.ts';
import { FormatDate, GetTrendColor, GetTrendIcon } from '../utils/categoryPresentationUtils.ts';
import { IconEdit, IconFolder, IconTrash } from './CategoryIcons.tsx';

interface CategoryTableViewProps {
  Categories: CategoryView[];
  PendingCategoryIds: Set<string>;
  SelectedCategoryId: string | null;
  OnSelect: (category: CategoryView) => void;
  OnEdit: (category: CategoryView) => void;
  OnDelete: (category: CategoryView) => void;
  HasSearch: boolean;
}

export const CategoryTableView = ({
  Categories,
  PendingCategoryIds,
  SelectedCategoryId,
  OnSelect,
  OnEdit,
  OnDelete,
  HasSearch,
}: CategoryTableViewProps) => {
  const HandleRowClick = (category: CategoryView) => {
    if (PendingCategoryIds.has(category.id)) return;
    OnSelect(category);
    OnEdit(category);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="categories-table-shell">
      <table className="categories-table">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Productos</th>
            <th>Tendencia</th>
            <th>Fecha</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {Categories.length > 0 ? (
            Categories.map((category, index) => (
              <tr
                key={category.id}
                className={[
                  PendingCategoryIds.has(category.id) ? 'categories-table__row--pending' : '',
                  SelectedCategoryId === category.id ? 'categories-table__row--selected' : '',
                  'categories-table__row--interactive',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--row-delay': `${Math.min(index * 40, 320)}ms` } as CSSProperties}
                onClick={() => HandleRowClick(category)}
                tabIndex={PendingCategoryIds.has(category.id) ? -1 : 0}
                onKeyDown={(e) => {
                  if (PendingCategoryIds.has(category.id)) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    HandleRowClick(category);
                  }
                }}
                role="button"
                aria-label={`Editar categoría ${category.name}`}
              >
                <td>
                  <div className="categories-table__brand">
                    <div className="categories-table__thumb">
                      <img src={category.image} alt="" className="categories-table__thumb-img" />
                    </div>
                    <div>
                      <strong>{category.name}</strong>
                      {PendingCategoryIds.has(category.id) && (
                        <span className="categories-table__pending">Sincronizando...</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <p className="categories-table__description">{category.description}</p>
                </td>
                <td>
                  <span className="categories-table__count">{category.productCount}</span>
                </td>
                <td>
                  <span className="categories-table__trend" style={{ color: GetTrendColor(category.trend) }}>
                    {GetTrendIcon(category.trend)} {category.trendValue > 0 ? '+' : ''}
                    {category.trendValue}%
                  </span>
                </td>
                <td>
                  <time className="categories-table__date">
                    {category.editedAt ? FormatDate(category.editedAt) : FormatDate(category.createdAt)}
                  </time>
                </td>
                <td>
                  <div className="categories-table__actions" onClick={StopActions}>
                    <button
                      type="button"
                      className="categories-table__action"
                      onClick={() => OnEdit(category)}
                      title="Editar"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="categories-table__action categories-table__action--danger"
                      onClick={() => OnDelete(category)}
                      title={category.productCount > 0 ? 'Desactivar' : 'Eliminar'}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <div className="categories-empty">
                  <IconFolder size={36} />
                  <h3>Sin resultados</h3>
                  <p>
                    {HasSearch
                      ? 'No hay categorías activas que coincidan con tu búsqueda.'
                      : 'Aún no hay categorías activas. Crea la primera desde el botón superior.'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
