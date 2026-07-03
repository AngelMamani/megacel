import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfrastructure } from '../../../providers/DependencyProvider.tsx';
import type { Product } from '../../../../domain/entities/Product.ts';
import {
  StoreCatalogActiveFilter,
  StoreCatalogProductCard,
} from './StoreCatalogProductCard.tsx';
import {
  STORE_CATALOG_PAGE_SIZE,
  StoreCatalogPagination,
} from './StoreCatalogPagination.tsx';
import { StoreCatalogBrandsCarousel } from '../../components/StoreCatalogBrandsCarousel.tsx';
import { ResolveStoreBrandIdFromParam } from '../../utils/storeBrandLogos.ts';
import './StoreCatalog.css';
import '../../styles/Store.css';

type CatalogSort = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: 'name-asc', label: 'Nombre A → Z' },
  { value: 'name-desc', label: 'Nombre Z → A' },
  { value: 'price-asc', label: 'Precio menor a mayor' },
  { value: 'price-desc', label: 'Precio mayor a menor' },
];

export const StoreCatalog = () => {
  const { repositories } = useInfrastructure();
  const [searchParams] = useSearchParams();
  const marcaParam = searchParams.get('marca') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoria') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<CatalogSort>('name-asc');
  const [isLoading, setIsLoading] = useState(true);

  const resolvedBrandId = useMemo(
    () => (marcaParam ? ResolveStoreBrandIdFromParam(marcaParam, brands) : ''),
    [marcaParam, brands]
  );

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setCategoryId(searchParams.get('categoria') || '');
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryId, marcaParam, sortBy]);

  useEffect(() => {
    const unsubscribe = repositories.category.subscribe((items) => {
      setCategories(
        items
          .filter((item) => item.isActive)
          .map((item) => ({ id: item.id, name: item.name }))
      );
    });
    return () => unsubscribe();
  }, [repositories.category]);

  useEffect(() => {
    const unsubscribe = repositories.brand.subscribe((items) => {
      setBrands(
        items
          .filter((item) => item.isActive)
          .map((item) => ({ id: item.id, name: item.name }))
      );
    });
    return () => unsubscribe();
  }, [repositories.brand]);

  useEffect(() => {
    const unsubscribe = repositories.product.subscribe(
      (items) => {
        setProducts(items.filter((item) => item.status === 'activo'));
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return () => unsubscribe();
  }, [repositories.product]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (categoryId) {
      result = result.filter((product) => product.categoryId === categoryId);
    }

    if (resolvedBrandId) {
      result = result.filter((product) => product.brandId === resolvedBrandId);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.shortDescription?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
      );
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name, 'es');
        case 'price-asc':
          return a.finalPrice - b.finalPrice;
        case 'price-desc':
          return b.finalPrice - a.finalPrice;
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name, 'es');
      }
    });

    return sorted;
  }, [products, search, categoryId, resolvedBrandId, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / STORE_CATALOG_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * STORE_CATALOG_PAGE_SIZE;
    return filteredProducts.slice(start, start + STORE_CATALOG_PAGE_SIZE);
  }, [filteredProducts, safePage]);

  const showPagination = filteredProducts.length > STORE_CATALOG_PAGE_SIZE;
  const rangeStart = filteredProducts.length === 0 ? 0 : (safePage - 1) * STORE_CATALOG_PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * STORE_CATALOG_PAGE_SIZE, filteredProducts.length);

  const ActiveCategoryName = useMemo(
    () => categories.find((item) => item.id === categoryId)?.name,
    [categories, categoryId]
  );

  const ActiveBrandName = useMemo(
    () => brands.find((item) => item.id === resolvedBrandId)?.name,
    [brands, resolvedBrandId]
  );

  const HandlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="store-catalog">
      <div className="store-catalog__backdrop" aria-hidden />
      <div className="store-container store-catalog__shell">
        <header className="store-catalog__hero">
          <div className="store-catalog__hero-copy">
            <h1 className="store-catalog__title">
              {ActiveBrandName || ActiveCategoryName ? (
                ActiveBrandName || ActiveCategoryName
              ) : (
                <>
                  Catálogo <span>completo</span>
                </>
              )}
            </h1>
          </div>

          <div className="store-catalog__toolbar">
            <label className="store-catalog__field">
              <span className="store-catalog__field-label">Buscar</span>
              <input
                type="search"
                className="store-catalog__search"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="store-catalog__field">
              <span className="store-catalog__field-label">Ordenar</span>
              <select
                className="store-catalog__select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as CatalogSort)}
                aria-label="Ordenar productos"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <StoreCatalogBrandsCarousel ActiveBrandId={resolvedBrandId} CategoryId={categoryId} />

        {(ActiveCategoryName || ActiveBrandName) && (
          <div className="store-catalog__filters">
            {ActiveCategoryName && (
              <StoreCatalogActiveFilter
                Label={ActiveCategoryName}
                ClearTo={resolvedBrandId ? `/catalogo?marca=${resolvedBrandId}` : '/catalogo'}
              />
            )}
            {ActiveBrandName && (
              <StoreCatalogActiveFilter
                Label={ActiveBrandName}
                ClearTo={categoryId ? `/catalogo?categoria=${categoryId}` : '/catalogo'}
              />
            )}
          </div>
        )}

        {!isLoading && filteredProducts.length > 0 && (
          <p className="store-catalog__results">
            Mostrando {rangeStart}–{rangeEnd} de {filteredProducts.length} productos
          </p>
        )}

        {isLoading ? (
          <div className="store-catalog__empty">
            <h3>Cargando catálogo...</h3>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="store-catalog__empty">
            <h3>No hay productos disponibles</h3>
            <p>Prueba otro filtro o vuelve más tarde.</p>
          </div>
        ) : (
          <>
            <div className="store-catalog__grid">
              {paginatedProducts.map((product) => (
                <StoreCatalogProductCard key={product.id} Product={product} />
              ))}
            </div>

            {showPagination && (
              <StoreCatalogPagination
                CurrentPage={safePage}
                TotalPages={totalPages}
                OnPageChange={HandlePageChange}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};
