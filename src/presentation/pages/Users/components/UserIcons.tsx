export {
  IconSearch,
  IconGrid,
  IconTable,
  IconEdit,
  IconTrash,
  IconClose,
  IconPlus,
} from '../../Brands/components/BrandIcons.tsx';

export const IconUsers = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
    <path d="M5 19c1.2-3 4.4-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconShield = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 4 7v6c0 4.2 3.4 6.8 8 8 4.6-1.2 8-3.8 8-8V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="m9.5 12 1.8 1.8L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
