export {
  IconPlus,
  IconSearch,
  IconGrid,
  IconTable,
  IconEdit,
  IconTrash,
  IconClose,
  IconUpload,
} from '../../Brands/components/BrandIcons.tsx';

export const IconPackage = ({ className, size = 28 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3l9 5v8l-9 5-9-5V8l9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
