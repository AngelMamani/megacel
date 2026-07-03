interface StoreCatalogPaginationProps {
  CurrentPage: number;
  TotalPages: number;
  OnPageChange: (page: number) => void;
}

const BuildPageNumbers = (current: number, total: number) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const result: Array<number | 'ellipsis'> = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  });

  return result;
};

export const StoreCatalogPagination = ({
  CurrentPage,
  TotalPages,
  OnPageChange,
}: StoreCatalogPaginationProps) => {
  if (TotalPages <= 1) return null;

  const pages = BuildPageNumbers(CurrentPage, TotalPages);

  return (
    <nav className="store-catalog__pagination" aria-label="Paginación del catálogo">
      <button
        type="button"
        className="store-catalog__page-btn store-catalog__page-btn--arrow"
        disabled={CurrentPage <= 1}
        onClick={() => OnPageChange(CurrentPage - 1)}
        aria-label="Página anterior"
      >
        ‹
      </button>

      <ul className="store-catalog__page-list">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} className="store-catalog__page-ellipsis" aria-hidden>
              …
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                className={`store-catalog__page-btn${page === CurrentPage ? ' is-active' : ''}`}
                onClick={() => OnPageChange(page)}
                aria-label={`Página ${page}`}
                aria-current={page === CurrentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        className="store-catalog__page-btn store-catalog__page-btn--arrow"
        disabled={CurrentPage >= TotalPages}
        onClick={() => OnPageChange(CurrentPage + 1)}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </nav>
  );
};

export const STORE_CATALOG_PAGE_SIZE = 12;
