import type { CategoryFormData } from '../types/CategoryPageTypes.ts';
import { IconClose, IconUpload } from './CategoryIcons.tsx';

interface CategoryFormModalProps {
  Mode: 'create' | 'edit';
  IsOpen: boolean;
  FormData: CategoryFormData;
  OnClose: () => void;
  OnSubmit: (e: React.FormEvent) => void;
  OnInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  OnImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  OnImageRemove: () => void;
}

export const CategoryFormModal = ({
  Mode,
  IsOpen,
  FormData,
  OnClose,
  OnSubmit,
  OnInputChange,
  OnImageUpload,
  OnImageRemove,
}: CategoryFormModalProps) => {
  if (!IsOpen) return null;

  const prefix = Mode === 'create' ? '' : 'edit-';
  const title = Mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría';
  const submitLabel = Mode === 'create' ? 'Crear Categoría' : 'Guardar Cambios';

  return (
    <div className="categories-modal-overlay" onClick={OnClose} role="presentation">
      <div
        className="categories-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
      >
        <header className="categories-modal__header">
          <div>
            <h2 id="category-form-title" className="categories-modal__title">
              {title}
            </h2>
            <p className="categories-modal__subtitle">
              {Mode === 'create'
                ? 'La categoría aparecerá al instante mientras se sincroniza en segundo plano.'
                : 'Los cambios se reflejan de inmediato en la lista mientras se guardan en segundo plano.'}
            </p>
          </div>
          <button type="button" className="categories-modal__close" onClick={OnClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>

        <form onSubmit={OnSubmit} className="categories-form">
          <div className="categories-form__grid">
            <div className="categories-form__field categories-form__field--full">
              <label htmlFor={`${prefix}name`} className="categories-form__label">
                Nombre <span className="categories-form__required">*</span>
              </label>
              <input
                type="text"
                id={`${prefix}name`}
                name="name"
                value={FormData.name}
                onChange={OnInputChange}
                className="categories-form__input"
                placeholder="Ej: Smartphones, Accesorios..."
                required
              />
            </div>

            <div className="categories-form__field categories-form__field--full">
              <label htmlFor={`${prefix}description`} className="categories-form__label">
                Descripción <span className="categories-form__required">*</span>
              </label>
              <textarea
                id={`${prefix}description`}
                name="description"
                value={FormData.description}
                onChange={OnInputChange}
                className="categories-form__textarea"
                placeholder="Describe el tipo de productos de esta categoría..."
                rows={3}
                required
              />
            </div>

            <div className="categories-form__field categories-form__field--full">
              <label htmlFor={`${prefix}image`} className="categories-form__label">
                Imagen <span className="categories-form__required">*</span>
              </label>

              {FormData.imagePreview ? (
                <div className="categories-form__preview">
                  <img src={FormData.imagePreview} alt="Vista previa" className="categories-form__preview-img" />
                  <button type="button" className="categories-form__preview-remove" onClick={OnImageRemove}>
                    Quitar imagen
                  </button>
                </div>
              ) : (
                <div className="categories-form__dropzone">
                  <input
                    type="file"
                    id={`${prefix}image`}
                    name="image"
                    accept="image/*"
                    onChange={OnImageUpload}
                    className="categories-form__file-input"
                  />
                  <label htmlFor={`${prefix}image`} className="categories-form__dropzone-label">
                    <IconUpload />
                    <strong>Arrastra o haz clic</strong>
                    <span>PNG, JPG, WEBP · máx. 5MB</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <footer className="categories-form__footer">
            <button type="button" className="categories-form__btn categories-form__btn--ghost" onClick={OnClose}>
              Cancelar
            </button>
            <button type="submit" className="categories-form__btn categories-form__btn--primary">
              {submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
