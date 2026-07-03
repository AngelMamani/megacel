import type { CSSProperties, MouseEvent } from 'react';
import type { BrandView } from '../types/BrandPageTypes.ts';
import { FormatDate, GetTrendColor, GetTrendIcon } from '../utils/brandPresentationUtils.ts';
import { IconEdit, IconTrash } from './BrandIcons.tsx';

interface BrandCardProps {
  Brand: BrandView;
  Index: number;
  IsPending: boolean;
  IsSelected: boolean;
  SharePercentage: number;
  CategoryLabel: string;
  OnSelect: (brand: BrandView) => void;
  OnEdit: (brand: BrandView) => void;
  OnDelete: (brand: BrandView) => void;
}

export const BrandCard = ({
  Brand,
  Index,
  IsPending,
  IsSelected,
  SharePercentage,
  CategoryLabel,
  OnSelect,
  OnEdit,
  OnDelete,
}: BrandCardProps) => {
  const HandleBodyClick = () => {
    if (IsPending) return;
    OnSelect(Brand);
    OnEdit(Brand);
  };

  const StopActions = (e: MouseEvent) => e.stopPropagation();

  return (
    <article
      className={`brand-card${IsPending ? ' brand-card--pending' : ''}${IsSelected ? ' brand-card--selected' : ''}`}
      style={
        {
          '--brand-color': Brand.color,
          '--brand-gradient': Brand.gradient,
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
      aria-label={`Editar marca ${Brand.name}`}
    >
      <div className="brand-card__media">
        <img
          src={Brand.image}
          alt={Brand.name}
          className={
            Brand.imageFit === 'contain'
              ? 'brand-card__image brand-card__image--contain'
              : 'brand-card__image'
          }
          loading="lazy"
        />
        <div className="brand-card__media-overlay" aria-hidden="true" />
        <div className="brand-card__edit-hint" aria-hidden="true">
          <IconEdit size={18} />
          <span>Clic para editar</span>
        </div>

        <div className="brand-card__chips">
          {IsPending && (
            <span className="brand-card__chip brand-card__chip--pending">
              <span className="brand-card__spinner" aria-hidden="true" />
              Guardando
            </span>
          )}
          <span
            className={`brand-card__chip brand-card__chip--trend brand-card__chip--trend-${Brand.trend}`}
            style={{ '--trend-color': GetTrendColor(Brand.trend) } as CSSProperties}
          >
            {GetTrendIcon(Brand.trend)} {Brand.trendValue > 0 ? '+' : ''}
            {Brand.trendValue}%
          </span>
        </div>
      </div>

      <div className="brand-card__body">
        <header className="brand-card__header">
          <h3 className="brand-card__name">{Brand.name}</h3>
          <span className="brand-card__date">
            {Brand.editedAt ? `Editado · ${FormatDate(Brand.editedAt)}` : FormatDate(Brand.createdAt)}
          </span>
        </header>

        <p className="brand-card__description">{Brand.description}</p>

        {Brand.categoryIds.length > 0 && (
          <div className="brand-card__category">
            <span className="brand-card__category-dot" aria-hidden="true" />
            {CategoryLabel}
          </div>
        )}

        <div className="brand-card__metrics">
          <div className="brand-card__metric">
            <strong>{Brand.productCount}</strong>
            <span>productos</span>
          </div>
          <div className="brand-card__progress">
            <div className="brand-card__progress-track">
              <div
                className="brand-card__progress-fill"
                style={{ width: `${SharePercentage}%`, background: Brand.gradient }}
              />
            </div>
            <span>{Math.round(SharePercentage)}% del total</span>
          </div>
        </div>
      </div>

      <footer className="brand-card__actions" onClick={StopActions}>
        <button type="button" className="brand-card__action" onClick={() => OnEdit(Brand)}>
          <IconEdit />
          <span>Editar</span>
        </button>
        <button
          type="button"
          className="brand-card__action brand-card__action--danger"
          onClick={() => OnDelete(Brand)}
        >
          <IconTrash />
          <span>{Brand.productCount > 0 ? 'Desactivar' : 'Eliminar'}</span>
        </button>
      </footer>
    </article>
  );
};
