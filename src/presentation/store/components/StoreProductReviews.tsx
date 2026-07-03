import { useStoreProductReviews } from '../hooks/useStoreProductReviews.ts';
import { FormatStoreReviewDate } from '../utils/storeReviewPresentationUtils.ts';
import { StoreStarRating } from './StoreStarRating.tsx';
import './StoreProductReviews.css';
import './StoreStarRating.css';

interface StoreProductReviewsProps {
  ProductId?: string;
}

export const StoreProductReviews = ({ ProductId }: StoreProductReviewsProps) => {
  const { reviews, summary, isLoading } = useStoreProductReviews(ProductId);

  if (!ProductId) return null;

  return (
    <section
      id="valoraciones"
      className="store-product-reviews"
      aria-labelledby="store-product-reviews-title"
    >
      <div className="store-container store-product-reviews__shell">
        <header className="store-product-reviews__header">
          <h2 id="store-product-reviews-title" className="store-product-reviews__title">
            <span className="store-product-reviews__title-pill">Valoraciones</span>
          </h2>
          <p className="store-product-reviews__subtitle">Mira lo que dicen nuestros clientes.</p>
        </header>

        {isLoading ? (
          <p className="store-product-reviews__status">Cargando valoraciones...</p>
        ) : (
          <>
            {reviews.length > 0 && (
              <div className="store-product-reviews__summary">
                <div className="store-product-reviews__score">
                  <strong>{summary.average.toFixed(1)}</strong>
                  <StoreStarRating Rating={summary.average} Size="md" />
                  <span>{summary.total} valoraciones</span>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="store-product-reviews__empty">
                Aún no hay valoraciones para este producto.
              </p>
            ) : (
              <ul className="store-product-reviews__grid">
                {reviews.map((review) => (
                  <li key={review.id} className="store-product-reviews__card">
                    <div className="store-product-reviews__media">
                      {review.productImage ? (
                        <img src={review.productImage} alt={review.productName} loading="lazy" />
                      ) : (
                        <span className="store-product-reviews__media-fallback" aria-hidden>
                          Sin imagen
                        </span>
                      )}
                    </div>

                    <div className="store-product-reviews__card-body">
                      <p className="store-product-reviews__name">{review.authorName}</p>
                      <time className="store-product-reviews__date" dateTime={review.publishedAt}>
                        {FormatStoreReviewDate(review.publishedAt)}
                      </time>
                      <StoreStarRating Rating={review.rating} Size="sm" />
                      <p className="store-product-reviews__body">{review.body}</p>
                      {review.images && review.images.length > 0 && (
                        <ul className="store-product-reviews__customer-photos" aria-label="Fotos del cliente">
                          {review.images.map((imageUrl, index) => (
                            <li key={`${review.id}-photo-${index}`}>
                              <img
                                src={imageUrl}
                                alt={`Foto ${index + 1} de ${review.authorName}`}
                                loading="lazy"
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                      {review.isVerified && (
                        <span className="store-product-reviews__verified">Compra verificada</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
};
