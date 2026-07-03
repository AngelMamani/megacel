import { IconPackage, IconPlus } from './ProductIcons.tsx';

interface ProductPageHeaderProps {
  OnOpenCreate: () => void;
}

export const ProductPageHeader = ({ OnOpenCreate }: ProductPageHeaderProps) => (
  <header className="products-hero">
    <div className="products-hero__mesh" aria-hidden="true">
      <span className="products-hero__blob products-hero__blob--1" />
      <span className="products-hero__blob products-hero__blob--2" />
      <span className="products-hero__blob products-hero__blob--3" />
    </div>

    <div className="products-hero__content">
      <div className="products-hero__badge">
        <IconPackage size={16} />
        <span>Inventario · Productos</span>
      </div>
      <h1 className="products-hero__title">Centro de Productos</h1>
      <p className="products-hero__subtitle">
        Administra precios, stock e imágenes del catálogo MEGA CEL con actualización instantánea.
      </p>
    </div>

    <button type="button" className="products-hero__cta" onClick={OnOpenCreate}>
      <IconPlus size={18} />
      <span>Nuevo Producto</span>
      <span className="products-hero__cta-glow" aria-hidden="true" />
    </button>
  </header>
);
