import type { CSSProperties, MouseEvent } from 'react';
import type { BrandView } from '../types/BrandPageTypes.ts';
import { FormatDate, GetTrendColor, GetTrendIcon } from '../utils/brandPresentationUtils.ts';
import { IconEdit, IconTag, IconTrash } from './BrandIcons.tsx';

interface BrandTableViewProps {
  Brands: BrandView[];
  PendingBrandIds: Set<string>;
  SelectedBrandId: string | null;
  GetCategoryLabels: (ids: string[]) => string;
  OnSelect: (brand: BrandView) => void;
  OnEdit: (brand: BrandView) => void;
  OnDelete: (brand: BrandView) => void;
  HasSearch: boolean;
}

export const BrandTableView = ({
  Brands,
  PendingBrandIds,
  SelectedBrandId,
  GetCategoryLabels,
  OnSelect,
  OnEdit,
  OnDelete,
  HasSearch,
}: BrandTableViewProps) => {
  const HandleRowClick = (brand: BrandView) => {
    if (PendingBrandIds.has(brand.id)) return;
    OnSelect(brand);
    OnEdit(brand);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="brands-table-shell">
      <table className="brands-table">
        <thead>
          <tr>
            <th>Marca</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Productos</th>
            <th>Tendencia</th>
            <th>Fecha</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {Brands.length > 0 ? (
            Brands.map((brand, index) => (
              <tr
                key={brand.id}
                className={[
                  PendingBrandIds.has(brand.id) ? 'brands-table__row--pending' : '',
                  SelectedBrandId === brand.id ? 'brands-table__row--selected' : '',
                  'brands-table__row--interactive',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--row-delay': `${Math.min(index * 40, 320)}ms` } as CSSProperties}
                onClick={() => HandleRowClick(brand)}
                tabIndex={PendingBrandIds.has(brand.id) ? -1 : 0}
                onKeyDown={(e) => {
                  if (PendingBrandIds.has(brand.id)) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    HandleRowClick(brand);
                  }
                }}
                role="button"
                aria-label={`Editar marca ${brand.name}`}
              >
                <td>
                  <div className="brands-table__brand">
                    <div className="brands-table__thumb">
                      <img
                        src={brand.image}
                        alt=""
                        className={
                          brand.imageFit === 'contain'
                            ? 'brands-table__thumb-img brands-table__thumb-img--contain'
                            : 'brands-table__thumb-img'
                        }
                      />
                    </div>
                    <div>
                      <strong>{brand.name}</strong>
                      {PendingBrandIds.has(brand.id) && (
                        <span className="brands-table__pending">Guardando...</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <p className="brands-table__description">{brand.description}</p>
                </td>
                <td>
                  <span className="brands-table__category">{GetCategoryLabels(brand.categoryIds)}</span>
                </td>
                <td>
                  <span className="brands-table__count">{brand.productCount}</span>
                </td>
                <td>
                  <span className="brands-table__trend" style={{ color: GetTrendColor(brand.trend) }}>
                    {GetTrendIcon(brand.trend)} {brand.trendValue > 0 ? '+' : ''}
                    {brand.trendValue}%
                  </span>
                </td>
                <td>
                  <time className="brands-table__date">
                    {brand.editedAt ? FormatDate(brand.editedAt) : FormatDate(brand.createdAt)}
                  </time>
                </td>
                <td>
                  <div className="brands-table__actions" onClick={StopActions}>
                    <button type="button" className="brands-table__action" onClick={() => OnEdit(brand)} title="Editar">
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="brands-table__action brands-table__action--danger"
                      onClick={() => OnDelete(brand)}
                      title={brand.productCount > 0 ? 'Desactivar' : 'Eliminar'}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                <div className="brands-empty">
                  <IconTag size={36} />
                  <h3>Sin resultados</h3>
                  <p>
                    {HasSearch
                      ? 'No hay marcas activas que coincidan con tu búsqueda.'
                      : 'Aún no hay marcas activas. Crea la primera desde el botón superior.'}
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
