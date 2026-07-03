import type { BrandFormData, CategoryOption } from '../types/BrandPageTypes.ts';
import { IconClose, IconUpload } from './BrandIcons.tsx';

interface BrandFormModalProps {
  Mode: 'create' | 'edit';
  IsOpen: boolean;
  FormData: BrandFormData;
  ActiveCategories: CategoryOption[];
  OnClose: () => void;
  OnSubmit: (e: React.FormEvent) => void;
  OnInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  OnToggleCategory: (categoryId: string, checked: boolean) => void;
  OnImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  OnImageRemove: () => void;
}

export const BrandFormModal = ({
  Mode,
  IsOpen,
  FormData,
  ActiveCategories,
  OnClose,
  OnSubmit,
  OnInputChange,
  OnToggleCategory,
  OnImageUpload,
  OnImageRemove,
}: BrandFormModalProps) => {
  if (!IsOpen) return null;

  const prefix = Mode === 'create' ? '' : 'edit-';
  const title = Mode === 'create' ? 'Nueva Marca' : 'Editar Marca';
  const submitLabel = Mode === 'create' ? 'Crear Marca' : 'Guardar Cambios';

  return (
    <div className="brands-modal-overlay" onClick={OnClose} role="presentation">
      <div
        className="brands-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-form-title"
      >
        <header className="brands-modal__header">
          <div>
            <h2 id="brand-form-title" className="brands-modal__title">
              {title}
            </h2>
            <p className="brands-modal__subtitle">
              {Mode === 'create'
                ? 'La marca aparecerá al instante mientras se sincroniza en segundo plano.'
                : 'Actualiza la información visual y de catálogo de la marca.'}
            </p>
          </div>
          <button type="button" className="brands-modal__close" onClick={OnClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </header>

        <form onSubmit={OnSubmit} className="brands-form">
          <div className="brands-form__grid">
            <div className="brands-form__field brands-form__field--full">
              <label htmlFor={`${prefix}name`} className="brands-form__label">
                Nombre <span className="brands-form__required">*</span>
              </label>
              <input
                type="text"
                id={`${prefix}name`}
                name="name"
                value={FormData.name}
                onChange={OnInputChange}
                className="brands-form__input"
                placeholder="Ej: Samsung, Apple..."
                required
              />
            </div>

            <div className="brands-form__field brands-form__field--full">
              <label htmlFor={`${prefix}description`} className="brands-form__label">
                Descripción <span className="brands-form__required">*</span>
              </label>
              <textarea
                id={`${prefix}description`}
                name="description"
                value={FormData.description}
                onChange={OnInputChange}
                className="brands-form__textarea"
                placeholder="Describe la identidad y enfoque de la marca..."
                rows={3}
                required
              />
            </div>

            <div className="brands-form__field brands-form__field--full">
              <span className="brands-form__label">
                Categorías <span className="brands-form__required">*</span>
              </span>
              <div className="brands-form__categories" role="group" aria-label="Categorías">
                {ActiveCategories.map((category) => {
                  const checked = FormData.categoryIds.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className={`brands-form__category-pill${checked ? ' is-checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => OnToggleCategory(category.id, e.target.checked)}
                      />
                      <span>{category.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="brands-form__field brands-form__field--full">
              <label htmlFor={`${prefix}image`} className="brands-form__label">
                Imagen <span className="brands-form__required">*</span>
              </label>

              {FormData.imagePreview ? (
                <div className="brands-form__preview">
                  <img src={FormData.imagePreview} alt="Vista previa" className="brands-form__preview-img" />
                  <button type="button" className="brands-form__preview-remove" onClick={OnImageRemove}>
                    Quitar imagen
                  </button>
                </div>
              ) : (
                <div className="brands-form__dropzone">
                  <input
                    type="file"
                    id={`${prefix}image`}
                    name="image"
                    accept="image/*"
                    onChange={OnImageUpload}
                    className="brands-form__file-input"
                  />
                  <label htmlFor={`${prefix}image`} className="brands-form__dropzone-label">
                    <IconUpload />
                    <strong>Arrastra o haz clic</strong>
                    <span>PNG, JPG, WEBP · máx. 5MB</span>
                  </label>
                </div>
              )}

              <div className="brands-form__field">
                <label htmlFor={`${prefix}imageFit`} className="brands-form__label">
                  Modo de presentación
                </label>
                <select
                  id={`${prefix}imageFit`}
                  name="imageFit"
                  className="brands-form__select"
                  value={FormData.imageFit}
                  onChange={OnInputChange}
                >
                  <option value="cover">Banner recortado</option>
                  <option value="contain">Logo centrado</option>
                </select>
              </div>
            </div>
          </div>

          <footer className="brands-form__footer">
            <button type="button" className="brands-form__btn brands-form__btn--ghost" onClick={OnClose}>
              Cancelar
            </button>
            <button type="submit" className="brands-form__btn brands-form__btn--primary">
              {submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
