import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApplication } from '../../providers/DependencyProvider.tsx';
import { uploadProductReviewImage } from '../../../infrastructure/index.ts';
import {
  MAX_REVIEW_BODY_LENGTH,
  MAX_REVIEW_IMAGE_SIZE_BYTES,
  MAX_REVIEW_IMAGES,
  MIN_REVIEW_BODY_LENGTH,
  REVIEW_IMAGE_ACCEPT,
} from '../../../domain/services/ProductReviewPolicy.ts';
import { StoreStarRatingInput } from './StoreStarRatingInput.tsx';
import './StoreProductReviewModal.css';

interface PendingReviewImage {
  Id: string;
  File: File;
  PreviewUrl: string;
}

export interface StoreProductReviewTarget {
  ProductId: string;
  ProductName: string;
  OrderId: string;
}

interface StoreProductReviewModalProps {
  Target: StoreProductReviewTarget | null;
  HasExistingReview: boolean;
  OnClose: () => void;
  OnSubmitted: (productId: string) => void;
}

const BuildPendingImage = (file: File): PendingReviewImage => ({
  Id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  File: file,
  PreviewUrl: URL.createObjectURL(file),
});

export const StoreProductReviewModal = ({
  Target,
  HasExistingReview,
  OnClose,
  OnSubmitted,
}: StoreProductReviewModalProps) => {
  const { user } = useAuth();
  const application = useApplication();
  const FileInputRef = useRef<HTMLInputElement>(null);
  const DialogRef = useRef<HTMLDivElement>(null);
  const [Rating, setRating] = useState(0);
  const [Body, setBody] = useState('');
  const [PendingImages, setPendingImages] = useState<PendingReviewImage[]>([]);
  const [IsSubmitting, setIsSubmitting] = useState(false);

  const IsOpen = Boolean(Target);

  useEffect(() => {
    if (!IsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') OnClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    DialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [IsOpen, OnClose]);

  useEffect(() => {
    if (!IsOpen) {
      setRating(0);
      setBody('');
      setPendingImages((current) => {
        current.forEach((image) => URL.revokeObjectURL(image.PreviewUrl));
        return [];
      });
      setIsSubmitting(false);
    }
  }, [IsOpen]);

  useEffect(
    () => () => {
      PendingImages.forEach((image) => URL.revokeObjectURL(image.PreviewUrl));
    },
    [PendingImages]
  );

  const HandleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) OnClose();
  };

  const HandleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) return;

    const remainingSlots = MAX_REVIEW_IMAGES - PendingImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Solo puedes subir hasta ${MAX_REVIEW_IMAGES} imágenes`);
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    const nextImages: PendingReviewImage[] = [];

    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        continue;
      }

      if (file.size > MAX_REVIEW_IMAGE_SIZE_BYTES) {
        toast.error('Cada imagen debe pesar menos de 5 MB');
        continue;
      }

      nextImages.push(BuildPendingImage(file));
    }

    if (nextImages.length > 0) {
      setPendingImages((current) => [...current, ...nextImages]);
    }
  };

  const HandleRemoveImage = (imageId: string) => {
    setPendingImages((current) => {
      const target = current.find((image) => image.Id === imageId);
      if (target) URL.revokeObjectURL(target.PreviewUrl);
      return current.filter((image) => image.Id !== imageId);
    });
  };

  const HandleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!Target || !user?.platformUserId) return;

    if (HasExistingReview) {
      toast.error('Ya publicaste una valoración para este producto');
      return;
    }

    if (Rating < 1) {
      toast.error('Selecciona una calificación de 1 a 5 estrellas');
      return;
    }

    if (Body.trim().length < MIN_REVIEW_BODY_LENGTH) {
      toast.error(`El comentario debe tener al menos ${MIN_REVIEW_BODY_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImages = await Promise.all(
        PendingImages.map((image) =>
          uploadProductReviewImage({
            productId: Target.ProductId,
            platformUserId: user.platformUserId!,
            file: image.File,
          })
        )
      );

      await application.customer.createProductReview.execute({
        productId: Target.ProductId,
        platformUserId: user.platformUserId,
        authorName: user.name,
        orderId: Target.OrderId,
        rating: Rating,
        body: Body.trim(),
        images: uploadedImages,
      });

      toast.success('¡Gracias! Tu valoración fue publicada.');
      OnSubmitted(Target.ProductId);
      OnClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo publicar la valoración');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!IsOpen || !Target) return null;

  return (
    <div className="store-review-modal" onClick={HandleBackdropClick} role="presentation">
      <div
        ref={DialogRef}
        className="store-review-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-review-modal-title"
        tabIndex={-1}
      >
        <header className="store-review-modal__header">
          <div>
            <p className="store-review-modal__eyebrow">Valorar producto</p>
            <h2 id="store-review-modal-title">{Target.ProductName}</h2>
          </div>
          <button
            type="button"
            className="store-review-modal__close"
            onClick={OnClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        {HasExistingReview ? (
          <div className="store-review-modal__done">
            <p>Ya publicaste tu valoración para este producto.</p>
            <button type="button" className="store-btn store-btn--primary" onClick={OnClose}>
              Entendido
            </button>
          </div>
        ) : (
          <form className="store-review-modal__form" onSubmit={HandleSubmit}>
            <p className="store-review-modal__hint">
              Tu compra verificada aparecerá junto a tu comentario.
            </p>

            <StoreStarRatingInput Value={Rating} OnChange={setRating} />

            <label className="store-review-modal__field">
              <span>Tu comentario</span>
              <textarea
                value={Body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Cuéntanos qué te pareció el producto, la calidad, el empaque, etc."
                rows={4}
                maxLength={MAX_REVIEW_BODY_LENGTH}
                required
              />
              <small>
                Mínimo {MIN_REVIEW_BODY_LENGTH} caracteres · {Body.trim().length}/{MAX_REVIEW_BODY_LENGTH}
              </small>
            </label>

            <div className="store-review-modal__images">
              <div className="store-review-modal__images-head">
                <span>Fotos del producto (opcional)</span>
                <small>Hasta {MAX_REVIEW_IMAGES} imágenes · máx. 5 MB c/u</small>
              </div>

              {PendingImages.length > 0 && (
                <ul className="store-review-modal__preview-list">
                  {PendingImages.map((image) => (
                    <li key={image.Id}>
                      <img src={image.PreviewUrl} alt="Vista previa de tu foto" />
                      <button
                        type="button"
                        className="store-review-modal__remove-image"
                        onClick={() => HandleRemoveImage(image.Id)}
                        aria-label="Quitar imagen"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {PendingImages.length < MAX_REVIEW_IMAGES && (
                <>
                  <input
                    ref={FileInputRef}
                    type="file"
                    accept={REVIEW_IMAGE_ACCEPT}
                    multiple
                    className="store-review-modal__file-input"
                    onChange={HandleSelectImages}
                  />
                  <button
                    type="button"
                    className="store-review-modal__add-images"
                    onClick={() => FileInputRef.current?.click()}
                    disabled={IsSubmitting}
                  >
                    + Agregar fotos
                  </button>
                </>
              )}
            </div>

            <div className="store-review-modal__actions">
              <button type="button" className="store-btn store-btn--ghost" onClick={OnClose}>
                Cancelar
              </button>
              <button type="submit" className="store-btn store-btn--primary" disabled={IsSubmitting}>
                {IsSubmitting ? 'Publicando...' : 'Publicar valoración'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
