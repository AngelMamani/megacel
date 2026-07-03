import type { Product } from '../../../../domain/entities/Product.ts';
import type { ProductVariantField } from '../types/ProductPageTypes.ts';

export const VARIANT_NAME_SEPARATOR = ' — ';

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

export const FormatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const GetStockLevel = (stock: number, minStock?: number): 'low' | 'medium' | 'ok' => {
  const min = minStock || 10;
  if (stock <= min) return 'low';
  if (stock <= min * 2) return 'medium';
  return 'ok';
};

export const GetProductBaseName = (name: string): string => {
  const idx = name.lastIndexOf(VARIANT_NAME_SEPARATOR);
  if (idx === -1) return name.trim();
  return name.slice(0, idx).trim();
};

export const GetProductColorLabel = (product: Product): string => {
  const fromSpec = product.specifications?.Color?.trim();
  if (fromSpec) return fromSpec;
  const idx = product.name.lastIndexOf(VARIANT_NAME_SEPARATOR);
  if (idx !== -1) return product.name.slice(idx + VARIANT_NAME_SEPARATOR.length).trim();
  return '';
};

export const GuessColorHex = (colorName: string): string => {
  const normalized = colorName.trim().toLowerCase();
  const preset = ColorPresets.find((p) => p.name.toLowerCase() === normalized);
  if (preset) return preset.hex;
  if (normalized.includes('negro') || normalized.includes('black')) return '#1a1a1a';
  if (normalized.includes('blanco') || normalized.includes('white')) return '#f8fafc';
  if (normalized.includes('azul') || normalized.includes('blue')) return '#2563eb';
  if (normalized.includes('rosa') || normalized.includes('pink')) return '#ec4899';
  if (normalized.includes('verde') || normalized.includes('green')) return '#10b981';
  if (normalized.includes('titanio') || normalized.includes('gris')) return '#9ca3af';
  return '#db2777';
};

export const IsVariantGroupProduct = (product: Product): boolean =>
  product.name.includes(VARIANT_NAME_SEPARATOR) || Boolean(product.specifications?.Color?.trim());

export const FindVariantSiblingProducts = (catalog: Product[], product: Product): Product[] => {
  const baseName = GetProductBaseName(product.name);
  const siblings = catalog.filter(
    (item) =>
      GetProductBaseName(item.name) === baseName &&
      item.categoryId === product.categoryId &&
      item.brandId === product.brandId
  );

  const hasVariantNaming = siblings.some((item) => IsVariantGroupProduct(item));
  if (!hasVariantNaming) return [product];

  return siblings.length > 0 ? siblings : [product];
};

export const ShouldUseVariantEditor = (siblings: Product[]): boolean =>
  siblings.length > 1 || siblings.some((item) => IsVariantGroupProduct(item));

export const MapProductToVariantField = (product: Product): ProductVariantField => ({
  id: `variant-${product.id}`,
  productId: product.id,
  colorName: GetProductColorLabel(product) || GetProductBaseName(product.name),
  colorHex: GuessColorHex(GetProductColorLabel(product)),
  price: product.price,
  costPrice: product.costPrice || 0,
  discount: product.discount || 0,
  stock: product.stock,
  images: (product.images || []).map((url, index) => ({
    id: `img-${product.id}-${index}`,
    file: null,
    preview: url,
    url,
  })),
});
