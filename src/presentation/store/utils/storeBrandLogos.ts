import appleLogo from '../../assets/logos/apple.png';
import bossneyLogo from '../../assets/logos/bossney.png';
import ewttoLogo from '../../assets/logos/ewtto.png';
import honorLogo from '../../assets/logos/honor.png';
import reddLogo from '../../assets/logos/redd.png';
import romaxLogo from '../../assets/logos/romax.png';
import samsungLogo from '../../assets/logos/samsung.png';
import xiaomiLogo from '../../assets/logos/xiaomi.png';

export interface StoreBrandLogoItem {
  key: string;
  name: string;
  logo: string;
  aliases?: string[];
}

export const StoreBrandLogoItems: StoreBrandLogoItem[] = [
  { key: 'apple', name: 'Apple', logo: appleLogo },
  { key: 'samsung', name: 'Samsung', logo: samsungLogo },
  { key: 'xiaomi', name: 'Xiaomi', logo: xiaomiLogo, aliases: ['mi', 'redmi'] },
  { key: 'honor', name: 'Honor', logo: honorLogo },
  { key: 'romax', name: 'Romax', logo: romaxLogo },
  { key: 'redd', name: 'Redd', logo: reddLogo },
  { key: 'bossney', name: 'Bossney', logo: bossneyLogo },
  { key: 'ewtto', name: 'Ewtto', logo: ewttoLogo },
];

const NormalizeBrandValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');

const BuildBrandSlugId = (key: string) => `marca-${key}`;

const StripBrandIdPrefix = (brandId: string) => brandId.replace(/^marca-/, '');

export const ResolveStoreBrandCatalogId = (
  item: Pick<StoreBrandLogoItem, 'name' | 'key' | 'aliases'>,
  brands: Array<{ id: string; name: string }>
) => {
  const tokens = [item.key, item.name, ...(item.aliases ?? [])]
    .map(NormalizeBrandValue)
    .filter(Boolean);

  for (const token of tokens) {
    const exactName = brands.find((brand) => NormalizeBrandValue(brand.name) === token);
    if (exactName) return exactName.id;

    const byId = brands.find((brand) => {
      const normalizedId = NormalizeBrandValue(StripBrandIdPrefix(brand.id));
      return normalizedId === token || brand.id === BuildBrandSlugId(token);
    });
    if (byId) return byId.id;

    const byPartialName = brands.find((brand) => {
      const normalizedBrandName = NormalizeBrandValue(brand.name);
      return (
        normalizedBrandName === token ||
        normalizedBrandName.startsWith(token) ||
        token.startsWith(normalizedBrandName)
      );
    });
    if (byPartialName) return byPartialName.id;
  }

  const fallbackId = BuildBrandSlugId(item.key);
  if (brands.some((brand) => brand.id === fallbackId)) return fallbackId;

  return fallbackId;
};

export const ResolveStoreBrandIdFromParam = (
  marcaParam: string,
  brands: Array<{ id: string; name: string }>
) => {
  const trimmed = marcaParam.trim();
  if (!trimmed) return '';

  const byId = brands.find((brand) => brand.id === trimmed);
  if (byId) return byId.id;

  const normalizedParam = NormalizeBrandValue(StripBrandIdPrefix(trimmed));
  const byName = brands.find((brand) => {
    const normalizedName = NormalizeBrandValue(brand.name);
    const normalizedId = NormalizeBrandValue(StripBrandIdPrefix(brand.id));
    return normalizedName === normalizedParam || normalizedId === normalizedParam;
  });
  if (byName) return byName.id;

  return trimmed;
};
