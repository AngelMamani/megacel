import type { ChangeEvent, CSSProperties } from 'react';
import type { ProductVariantField, ProductVariantFieldKey } from '../types/ProductPageTypes.ts';

const ColorPresets = [
  { name: 'Negro', hex: '#1a1a1a' },
  { name: 'Blanco', hex: '#f8fafc' },
  { name: 'Titanio', hex: '#9ca3af' },
  { name: 'Azul', hex: '#2563eb' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Dorado', hex: '#d4a017' },
  { name: 'Grafito', hex: '#374151' },
  { name: 'Morado', hex: '#7c3aed' },
  { name: 'Rojo', hex: '#dc2626' },
];

interface ProductVariantsSectionProps {
  Variants: ProductVariantField[];
  VariantUrlInputs: Record<string, string>;
  OnVariantUrlInputChange: (variantId: string, value: string) => void;
  OnAddVariant: () => void;
  OnRemoveVariant: (variantId: string) => void;
  OnVariantFieldChange: (
    variantId: string,
    field: ProductVariantFieldKey,
    value: string | number
  ) => void;
  OnApplyColorPreset: (variantId: string, name: string, hex: string) => void;
  OnVariantImageUpload: (variantId: string, e: ChangeEvent<HTMLInputElement>) => void;
  OnVariantAddImageUrl: (variantId: string) => void;
  OnVariantImageUrlPaste: (variantId: string, e: React.ClipboardEvent<HTMLInputElement>) => void;
  OnVariantImageRemove: (variantId: string, imageId: string) => void;
  MaxImagesPerVariant: number;
  FormatCurrency: (amount: number) => string;
  CalculateDiscountPercentage: (price: number, discount: number) => number;
  CalculateFinalPrice: (price: number, discount: number) => number;
}

export const ProductVariantsSection = ({
  Variants,
  VariantUrlInputs,
  OnVariantUrlInputChange,
  OnAddVariant,
  OnRemoveVariant,
  OnVariantFieldChange,
  OnApplyColorPreset,
  OnVariantImageUpload,
  OnVariantAddImageUrl,
  OnVariantImageUrlPaste,
  OnVariantImageRemove,
  MaxImagesPerVariant,
  FormatCurrency,
  CalculateDiscountPercentage,
  CalculateFinalPrice,
}: ProductVariantsSectionProps) => (
  <div className="form-section product-variants-section">
    <div className="product-variants-section__header">
      <div>
        <h3 className="form-section-title">Variantes por color</h3>
        <p className="form-hint form-hint--block">
          Cada color puede tener su propio precio, costo, descuento, stock e imágenes. Se guardan como
          productos separados en el catálogo.
        </p>
      </div>
      <button type="button" className="product-variants-section__add-btn" onClick={OnAddVariant}>
        + Agregar color
      </button>
    </div>

    {Variants.length === 0 ? (
      <div className="product-variants-section__empty">
        <span className="product-variants-section__empty-icon" aria-hidden="true">
          🎨
        </span>
        <p>
          Sin variantes = <strong>1 producto</strong>. Pulsa &quot;Agregar color&quot; para crear varios
          (ej: Negro, Blanco, Azul) con fotos distintas en una sola operación.
        </p>
      </div>
    ) : (
      <div className="product-variants-grid">
        {Variants.map((variant, index) => {
          const urlInput = VariantUrlInputs[variant.id] || '';
          const canAddMoreImages = variant.images.length < MaxImagesPerVariant;

          return (
            <article
              key={variant.id}
              className="product-variant-card"
              style={{ '--variant-color': variant.colorHex } as CSSProperties}
            >
              <header className="product-variant-card__header">
                <span className="product-variant-card__index">
                  Color {index + 1}
                  {variant.productId && (
                    <span className="product-variant-card__saved" title="Variante existente en catálogo">
                      · Guardado
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="product-variant-card__remove"
                  onClick={() => OnRemoveVariant(variant.id)}
                  title="Quitar variante"
                >
                  ×
                </button>
              </header>

              <div className="product-variant-card__swatch-row">
                <span
                  className="product-variant-card__swatch"
                  style={{ background: variant.colorHex }}
                  aria-hidden="true"
                />
                <div className="product-variant-card__fields">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre del color (ej: Titanio Natural)"
                    value={variant.colorName}
                    onChange={(e) => OnVariantFieldChange(variant.id, 'colorName', e.target.value)}
                  />
                  <div className="product-variant-card__color-tools">
                    <input
                      type="color"
                      className="product-variant-card__picker"
                      value={variant.colorHex}
                      onChange={(e) => OnVariantFieldChange(variant.id, 'colorHex', e.target.value)}
                      title="Elegir color"
                    />
                    <input
                      type="text"
                      className="form-input product-variant-card__hex"
                      value={variant.colorHex}
                      onChange={(e) => OnVariantFieldChange(variant.id, 'colorHex', e.target.value)}
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              <div className="product-variant-card__presets">
                {ColorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className={`product-variant-card__preset${variant.colorHex === preset.hex ? ' is-active' : ''}`}
                    style={{ '--preset-color': preset.hex } as CSSProperties}
                    onClick={() => OnApplyColorPreset(variant.id, preset.name, preset.hex)}
                    title={preset.name}
                  >
                    <span className="product-variant-card__preset-dot" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>

              <div className="product-variant-card__pricing">
                <div className="product-variant-card__pricing-field">
                  <label className="form-label">Precio venta (PEN)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={0}
                    step="0.01"
                    value={variant.price || ''}
                    onChange={(e) =>
                      OnVariantFieldChange(variant.id, 'price', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="product-variant-card__pricing-field">
                  <label className="form-label">Costo (PEN)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={0}
                    step="0.01"
                    value={variant.costPrice || ''}
                    onChange={(e) =>
                      OnVariantFieldChange(variant.id, 'costPrice', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="product-variant-card__pricing-field">
                  <label className="form-label">Descuento (PEN)</label>
                  <input
                    type="number"
                    className="form-input"
                    min={0}
                    step="0.01"
                    max={variant.price || undefined}
                    value={variant.discount || ''}
                    onChange={(e) =>
                      OnVariantFieldChange(variant.id, 'discount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {variant.price > 0 && (
                <p className="product-variant-card__final-price">
                  Precio final:{' '}
                  <strong>
                    {FormatCurrency(CalculateFinalPrice(variant.price, variant.discount || 0))}
                  </strong>
                  {variant.discount > 0 && (
                    <span className="product-variant-card__discount-badge">
                      -
                      {CalculateDiscountPercentage(variant.price, variant.discount).toFixed(0)}%
                    </span>
                  )}
                </p>
              )}

              <div className="product-variant-card__stock">
                <label className="form-label">Stock de este color</label>
                <input
                  type="number"
                  className="form-input"
                  min={0}
                  value={variant.stock || ''}
                  onChange={(e) =>
                    OnVariantFieldChange(variant.id, 'stock', parseInt(e.target.value, 10) || 0)
                  }
                  placeholder="0"
                />
              </div>

              <div className="product-variant-card__images">
                <label className="form-label">
                  Imágenes de este color ({variant.images.length}/{MaxImagesPerVariant})
                </label>

                {variant.images.length > 0 && (
                  <div className="product-variant-card__preview-grid">
                    {variant.images.map((img) => (
                      <div key={img.id} className="product-variant-card__preview-item">
                        <img src={img.preview || img.url || ''} alt="" />
                        <button
                          type="button"
                          onClick={() => OnVariantImageRemove(variant.id, img.id)}
                          title="Eliminar"
                        >
                          ×
                        </button>
                        {img.file && <span className="product-variant-card__pending">⏳</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="product-variant-card__upload-row">
                  <label className="product-variant-card__upload-btn">
                    📷 Subir
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={!canAddMoreImages}
                      onChange={(e) => OnVariantImageUpload(variant.id, e)}
                    />
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="URL de imagen"
                    value={urlInput}
                    disabled={!canAddMoreImages}
                    onChange={(e) => OnVariantUrlInputChange(variant.id, e.target.value)}
                    onPaste={(e) => OnVariantImageUrlPaste(variant.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        OnVariantAddImageUrl(variant.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-add-image-url"
                    disabled={!urlInput.trim() || !canAddMoreImages}
                    onClick={() => OnVariantAddImageUrl(variant.id)}
                  >
                    URL
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </div>
);
