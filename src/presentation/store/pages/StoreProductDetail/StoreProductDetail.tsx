import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../../../../domain/entities/Product.ts';
import { useInfrastructure } from '../../../providers/DependencyProvider.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { StoreIconCart } from '../../components/StoreIcons.tsx';
import { StoreYapePayment } from '../../components/StoreYapePayment.tsx';
import { StoreProductTrustIcons } from '../../components/StoreProductTrustIcons.tsx';
import { StoreProductReviews } from '../../components/StoreProductReviews.tsx';
import { StoreProductRecommendations } from '../../components/StoreProductRecommendations.tsx';
import { FormatStoreCurrency } from '../../utils/storePresentationUtils.ts';
import { NotifyCartAddResult } from '../../utils/storeCartFeedback.tsx';
import './StoreProductDetail.css';
import '../../styles/Store.css';

const BreadcrumbChevron = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
    <path d="m9.693 4.5 7.5 7.5-7.5 7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const GalleryArrow = ({ direction }: { direction: 'prev' | 'next' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden focusable="false">
    {direction === 'prev' ? (
      <path d="m6.797 11.625 8.03-8.03 1.06 1.06-6.97 6.97 6.97 6.97-1.06 1.06z" fill="currentColor" />
    ) : (
      <path d="m9.693 4.5 7.5 7.5-7.5 7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    )}
  </svg>
);

export const StoreProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { repositories } = useInfrastructure();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [brandName, setBrandName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isLensActive, setIsLensActive] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });
  const AutoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MainImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!productId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);

    repositories.product
      .getById(productId)
      .then((item) => {
        if (!isMounted) return;
        if (!item || item.status !== 'activo') {
          setProduct(null);
          setNotFound(true);
          return;
        }
        setProduct(item);
        setActiveImageIndex(0);
        setQuantity(1);
      })
      .catch(() => {
        if (!isMounted) return;
        setProduct(null);
        setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const unsubscribe = repositories.product.subscribe(
      (items) => {
        if (!isMounted) return;
        const item = items.find((entry) => entry.id === productId);
        if (!item || item.status !== 'activo') {
          setProduct(null);
          setNotFound(true);
          return;
        }
        setProduct(item);
        setNotFound(false);
      },
      () => undefined
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [productId, repositories.product]);

  useEffect(() => {
    if (!product) {
      setBrandName('');
      setCategoryName('');
      setCategoryId('');
      return;
    }

    let isMounted = true;

    Promise.all([
      repositories.brand.getById(product.brandId),
      repositories.category.getById(product.categoryId),
    ]).then(([brand, category]) => {
      if (!isMounted) return;
      setBrandName(brand?.name ?? '');
      setCategoryName(category?.name ?? '');
      setCategoryId(category?.id ?? product.categoryId);
    });

    return () => {
      isMounted = false;
    };
  }, [product, repositories.brand, repositories.category]);

  const images = useMemo(() => product?.images?.filter(Boolean) ?? [], [product?.images]);
  const activeImage = images[activeImageIndex] ?? images[0];
  const specificationEntries = useMemo(
    () => Object.entries(product?.specifications ?? {}).filter(([key, value]) => key.trim() && value.trim()),
    [product?.specifications]
  );
  const hasDiscount = (product?.discount || 0) > 0;
  const inStock = (product?.stock ?? 0) > 0;
  const discountPercent = useMemo(() => {
    if (!product || !hasDiscount) return 0;
    if (product.discountPercentage) return Math.round(product.discountPercentage);
    if (product.price <= 0) return 0;
    return Math.round((1 - product.finalPrice / product.price) * 100);
  }, [product, hasDiscount]);

  const stockInfo = useMemo(() => {
    if (!product) {
      return {
        level: 'empty' as const,
        status: 'Agotado',
        urgency: '',
        barWidth: 0,
      };
    }

    const stock = product.stock;
    const scale = Math.max(product.minStock ?? 10, 10, stock);
    const barWidth = stock <= 0 ? 0 : Math.min(100, Math.round((stock / scale) * 100));

    if (stock <= 0) {
      return {
        level: 'empty' as const,
        status: 'Agotado',
        urgency: '',
        barWidth: 0,
      };
    }

    if (stock <= 1) {
      return {
        level: 'very-low' as const,
        status: `${stock} disponible`,
        urgency: '¡Aprovecha! solo queda 1 unidad',
        barWidth: Math.max(barWidth, 8),
      };
    }

    if (stock <= 5) {
      return {
        level: 'low' as const,
        status: `${stock} disponibles`,
        urgency: '¡Aprovecha! solo quedan pocos en stock',
        barWidth,
      };
    }

    return {
      level: 'normal' as const,
      status: `${stock} disponibles`,
      urgency: 'Aprovecha este producto antes de que se acabe',
      barWidth: Math.max(barWidth, 35),
    };
  }, [product]);

  const ShowPrevImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const ShowNextImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  const StopAutoplay = useCallback(() => {
    if (AutoplayTimerRef.current) {
      clearInterval(AutoplayTimerRef.current);
      AutoplayTimerRef.current = null;
    }
  }, []);

  const StartAutoplay = useCallback(() => {
    StopAutoplay();
    if (images.length <= 1 || isGalleryHovered) return;

    AutoplayTimerRef.current = setInterval(() => {
      setActiveImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
    }, 3000);
  }, [StopAutoplay, images.length, isGalleryHovered]);

  const HandleLensMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = MainImageRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setLensPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const HandleMainImageEnter = () => {
    setIsGalleryHovered(true);
    setIsLensActive(true);
  };

  const HandleMainImageLeave = () => {
    setIsLensActive(false);
    setLensPosition({ x: 50, y: 50 });
  };

  useEffect(() => {
    StartAutoplay();
    return StopAutoplay;
  }, [StartAutoplay, StopAutoplay]);

  const HandleQuantityChange = (next: number) => {
    if (!product) return;
    const clamped = Math.max(1, Math.min(product.stock, next));
    setQuantity(clamped);
  };

  const HandleAddToCart = () => {
    if (!product) return;

    const status = addItem(
      {
        id: product.id,
        sku: product.sku,
        name: product.name,
        finalPrice: product.finalPrice,
        stock: product.stock,
        images: product.images,
      },
      quantity
    );

    NotifyCartAddResult(product.name, status);
  };

  if (isLoading) {
    return (
      <main className="store-product-detail">
        <div className="store-container store-product-detail__shell">
          <p className="store-product-detail__loading">Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="store-product-detail">
        <div className="store-container store-product-detail__shell store-product-detail__empty">
          <h1>Producto no encontrado</h1>
          <p>Este producto no está disponible o ya no forma parte del catálogo.</p>
          <Link to="/catalogo" className="store-btn store-btn--primary">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const categoryHref = categoryId ? `/catalogo?categoria=${encodeURIComponent(categoryId)}` : '/catalogo';

  return (
    <main className="store-product-detail" id="main-content">
      <div className="store-container store-product-detail__breadcrumbs-wrap">
        <nav className="store-product-detail__breadcrumbs" aria-label="Migas de pan">
          <ol>
            <li>
              <Link to="/">Inicio</Link>
              <BreadcrumbChevron />
            </li>
            <li>
              <Link to="/catalogo">Catálogo</Link>
              {categoryName && <BreadcrumbChevron />}
            </li>
            {categoryName && (
              <li>
                <Link to={categoryHref}>{categoryName}</Link>
                <BreadcrumbChevron />
              </li>
            )}
            <li>
              <span aria-current="page">{product.name}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="store-container store-product-detail__product">
        <div className="store-product-detail__media" id="product-media">
          <div className="store-product-detail__gallery" role="region" aria-label="Galería del producto">
            <div
              className="store-product-detail__viewer"
              onMouseEnter={() => setIsGalleryHovered(true)}
              onMouseLeave={() => {
                setIsGalleryHovered(false);
                setIsLensActive(false);
                setLensPosition({ x: 50, y: 50 });
              }}
            >
              <div
                ref={MainImageRef}
                className={`store-product-detail__main${isLensActive ? ' is-lens-active' : ''}`}
                onMouseEnter={HandleMainImageEnter}
                onMouseLeave={HandleMainImageLeave}
                onMouseMove={HandleLensMove}
              >
                {activeImage ? (
                  <>
                    <img
                      key={`${product.id}-img-${activeImageIndex}`}
                      src={activeImage}
                      alt={product.name}
                      className="store-product-detail__main-img"
                      style={{ transformOrigin: `${lensPosition.x}% ${lensPosition.y}%` }}
                      draggable={false}
                    />
                    {isLensActive && (
                      <span
                        className="store-product-detail__lens"
                        style={{ left: `${lensPosition.x}%`, top: `${lensPosition.y}%` }}
                        aria-hidden
                      />
                    )}
                  </>
                ) : (
                  <div className="store-product-detail__placeholder">Sin imagen</div>
                )}
                {hasDiscount && (
                  <span className="store-product-detail__sale-badge">
                    {discountPercent > 0 ? `${discountPercent}% de descuento` : 'Oferta'}
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="store-product-detail__nav">
                  <button type="button" className="store-product-detail__nav-btn" onClick={ShowPrevImage} aria-label="Imagen anterior">
                    <GalleryArrow direction="prev" />
                  </button>
                  <button type="button" className="store-product-detail__nav-btn" onClick={ShowNextImage} aria-label="Imagen siguiente">
                    <GalleryArrow direction="next" />
                  </button>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <ul className="store-product-detail__thumbs" aria-label="Miniaturas">
                {images.map((image, index) => (
                  <li key={`${product.id}-thumb-${index}`}>
                    <button
                      type="button"
                      className={`store-product-detail__thumb${index === activeImageIndex ? ' is-active' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                      aria-current={index === activeImageIndex ? 'true' : undefined}
                    >
                      <img src={image} alt="" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="store-product-detail__info">
          <div className="store-product-detail__info-sticky">
            {(brandName || product.sku) && (
              <p className="store-product-detail__vendor">
                {brandName && <span>{brandName}</span>}
                {brandName && product.sku && <span className="store-product-detail__vendor-sep">|</span>}
                {product.sku && (
                  <span>
                    SKU: <span className="store-product-detail__sku">{product.sku}</span>
                  </span>
                )}
              </p>
            )}

            <h1 className="store-product-detail__title">{product.name}</h1>

            <div
              className="store-product-detail__rating"
              role="img"
              aria-label={`5 de 5 estrellas, ${product.soldCount ?? 0} valoraciones`}
            >
              <span className="store-product-detail__stars" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg key={`star-${index}`} viewBox="0 0 24 24" focusable="false">
                    <path d="M12 2l2.9 8.9H24l-7.5 5.5 2.9 8.9L12 19.8l-7.4 4.5 2.9-8.9L0 10.9h9.1L12 2z" />
                  </svg>
                ))}
              </span>
              <span className="store-product-detail__rating-count">({product.soldCount ?? 0})</span>
            </div>

            <div className="store-product-detail__price">
              <strong className="store-product-detail__price-current">
                {FormatStoreCurrency(product.finalPrice)}
              </strong>
              {hasDiscount && (
                <s className="store-product-detail__price-was">{FormatStoreCurrency(product.price)}</s>
              )}
            </div>

            <div
              className={`store-product-detail__inventory is-${stockInfo.level}`}
              aria-label={`Disponibilidad: ${stockInfo.status}`}
            >
              <div className="store-product-detail__inventory-text">
                <span className="store-product-detail__inventory-status">{stockInfo.status}</span>
                {stockInfo.urgency && (
                  <span className="store-product-detail__inventory-urgency">{stockInfo.urgency}</span>
                )}
              </div>
              <div className="store-product-detail__inventory-bar" aria-hidden>
                <span style={{ width: `${stockInfo.barWidth}%` }} />
              </div>
            </div>

            <div className="store-product-detail__purchase">
              <div className="store-product-detail__qty">
                <button
                  type="button"
                  className="store-product-detail__qty-btn"
                  onClick={() => HandleQuantityChange(quantity - 1)}
                  disabled={!inStock || quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <input
                  type="number"
                  className="store-product-detail__qty-input"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(event) => HandleQuantityChange(Number(event.target.value))}
                  disabled={!inStock}
                  aria-label="Cantidad"
                />
                <button
                  type="button"
                  className="store-product-detail__qty-btn"
                  onClick={() => HandleQuantityChange(quantity + 1)}
                  disabled={!inStock || quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="store-product-detail__add"
                disabled={!inStock}
                onClick={HandleAddToCart}
              >
                <StoreIconCart />
                {inStock ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>

            <StoreYapePayment />
          </div>
        </div>
      </div>

      {(specificationEntries.length > 0 || product.description) && (
        <div className="store-container store-product-detail__details">
          {product.description && (
            <details className="store-product-detail__disclosure" open>
              <summary>
                <h2>Descripción</h2>
                <span className="store-product-detail__disclosure-icon" aria-hidden />
              </summary>
              <div
                className="store-product-detail__disclosure-body store-product-detail__description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </details>
          )}

          {specificationEntries.length > 0 && (
            <details className="store-product-detail__disclosure" open={!product.description}>
              <summary>
                <h2>Especificaciones</h2>
                <span className="store-product-detail__disclosure-icon" aria-hidden />
              </summary>
              <ul className="store-product-detail__spec-list">
                {specificationEntries.map(([key, value]) => (
                  <li key={key} className="store-product-detail__spec-item">
                    <span className="store-product-detail__spec-label">{key}</span>
                    <span className="store-product-detail__spec-value">{value}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <StoreProductTrustIcons />
      <StoreProductReviews ProductId={product.id} />
      <StoreProductRecommendations Product={product} />
    </main>
  );
};
