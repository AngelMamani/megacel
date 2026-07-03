import { IconFolder, IconPlus } from './CategoryIcons.tsx';

interface CategoryPageHeaderProps {
  OnOpenCreate: () => void;
}

export const CategoryPageHeader = ({ OnOpenCreate }: CategoryPageHeaderProps) => (
  <header className="categories-hero">
    <div className="categories-hero__mesh" aria-hidden="true">
      <span className="categories-hero__blob categories-hero__blob--1" />
      <span className="categories-hero__blob categories-hero__blob--2" />
      <span className="categories-hero__blob categories-hero__blob--3" />
    </div>

    <div className="categories-hero__content">
      <div className="categories-hero__badge">
        <IconFolder size={16} />
        <span>Catálogo · Categorías</span>
      </div>
      <h1 className="categories-hero__title">Centro de Categorías</h1>
      <p className="categories-hero__subtitle">
        Organiza el inventario de MEGA CEL por familias de productos con control visual en tiempo real.
      </p>
    </div>

    <button type="button" className="categories-hero__cta" onClick={OnOpenCreate}>
      <IconPlus size={18} />
      <span>Nueva Categoría</span>
      <span className="categories-hero__cta-glow" aria-hidden="true" />
    </button>
  </header>
);
