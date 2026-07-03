interface ProductKpiStripProps {
  TotalProducts: number;
  TotalStock: number;
  TotalValue: string;
  LowStockCount: number;
}

export const ProductKpiStrip = ({
  TotalProducts,
  TotalStock,
  TotalValue,
  LowStockCount,
}: ProductKpiStripProps) => (
  <section className="products-kpi" aria-label="Métricas de productos">
    <article className="products-kpi__card products-kpi__card--primary">
      <span className="products-kpi__label">Productos activos</span>
      <strong className="products-kpi__value">{TotalProducts}</strong>
      <span className="products-kpi__meta">En catálogo visible</span>
    </article>

    <article className="products-kpi__card products-kpi__card--accent">
      <span className="products-kpi__label">Stock total</span>
      <strong className="products-kpi__value">{TotalStock.toLocaleString('es-PE')}</strong>
      <span className="products-kpi__meta">Unidades disponibles</span>
    </article>

    <article className="products-kpi__card products-kpi__card--neutral">
      <span className="products-kpi__label">Valor inventario</span>
      <strong className="products-kpi__value products-kpi__value--compact">{TotalValue}</strong>
      <span className="products-kpi__meta">Precio final × stock</span>
    </article>

    <article className="products-kpi__card products-kpi__card--warn">
      <span className="products-kpi__label">Stock bajo</span>
      <strong className="products-kpi__value">{LowStockCount}</strong>
      <span className="products-kpi__meta">Requieren atención</span>
    </article>
  </section>
);
