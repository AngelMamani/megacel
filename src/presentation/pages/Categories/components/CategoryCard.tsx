import type { CSSProperties, MouseEvent } from 'react';
import type { CategoryView } from '../types/CategoryPageTypes.ts';
import { FormatDate, GetTrendColor, GetTrendIcon } from '../utils/categoryPresentationUtils.ts';
import { IconEdit, IconTrash } from './CategoryIcons.tsx';

interface CategoryCardProps {
  Category: CategoryView;
  Index: number;
  IsPending: boolean;
  IsSelected: boolean;
  SharePercentage: number;
  OnSelect: (category: CategoryView) => void;
  OnEdit: (category: CategoryView) => void;
  OnDelete: (category: CategoryView) => void;
}

export const CategoryCard = ({
  Category,
  Index,
  IsPending,
  IsSelected,
  SharePercentage,
  OnSelect,
  OnEdit,
  OnDelete,
}: CategoryCardProps) => {
  const HandleBodyClick = () => {
    if (IsPending) return;
    OnSelect(Category);
    OnEdit(Category);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <article
      className={`category-card${IsPending ? ' category-card--pending' : ''}${IsSelected ? ' category-card--selected' : ''}`}
      style={
        {
          '--category-color': Category.color,
          '--category-gradient': Category.gradient,
          '--card-delay': `${Math.min(Index * 60, 480)}ms`,
        } as CSSProperties
      }
      onClick={HandleBodyClick}
      role="button"
      tabIndex={IsPending ? -1 : 0}
      onKeyDown={(e) => {
        if (IsPending) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          HandleBodyClick();
        }
      }}
      aria-label={`Editar categoría ${Category.name}`}
    >
      <div className="category-card__media">
        <img src={Category.image} alt={Category.name} className="category-card__image" loading="lazy" />
        <div className="category-card__media-overlay" aria-hidden="true" />
        <div className="category-card__edit-hint" aria-hidden="true">
          <IconEdit size={18} />
          <span>Clic para editar</span>
        </div>

        <div className="category-card__chips">
          {IsPending && (
            <span className="category-card__chip category-card__chip--pending">
              <span className="category-card__spinner" aria-hidden="true" />
              Sincronizando
            </span>
          )}
          <span className="category-card__chip category-card__chip--products">
            {Category.productCount} {Category.productCount === 1 ? 'producto' : 'productos'}
          </span>
          <span
            className={`category-card__chip category-card__chip--trend category-card__chip--trend-${Category.trend}`}
            style={{ '--trend-color': GetTrendColor(Category.trend) } as CSSProperties}
          >
            {GetTrendIcon(Category.trend)} {Category.trendValue > 0 ? '+' : ''}
            {Category.trendValue}%
          </span>
        </div>
      </div>

      <div className="category-card__body">
        <header className="category-card__header">
          <h3 className="category-card__name">{Category.name}</h3>
          <span className="category-card__date">
            {Category.editedAt
              ? `Editado · ${FormatDate(Category.editedAt)}`
              : FormatDate(Category.createdAt)}
          </span>
        </header>

        <p className="category-card__description">{Category.description}</p>

        <div className="category-card__metrics">
          <div className="category-card__metric">
            <strong>{Category.productCount}</strong>
            <span>productos</span>
          </div>
          <div className="category-card__progress">
            <div className="category-card__progress-track">
              <div
                className="category-card__progress-fill"
                style={{ width: `${SharePercentage}%`, background: Category.gradient }}
              />
            </div>
            <span>{Math.round(SharePercentage)}% del total</span>
          </div>
        </div>
      </div>

      <footer className="category-card__actions" onClick={StopActions}>
        <button type="button" className="category-card__action" onClick={() => OnEdit(Category)}>
          <IconEdit />
          <span>Editar</span>
        </button>
        <button
          type="button"
          className="category-card__action category-card__action--danger"
          onClick={() => OnDelete(Category)}
        >
          <IconTrash />
          <span>{Category.productCount > 0 ? 'Desactivar' : 'Eliminar'}</span>
        </button>
      </footer>
    </article>
  );
};
