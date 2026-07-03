export {
  IconSearch,
  IconGrid,
  IconTable,
  IconEdit,
  IconTrash,
  IconClose,
} from '../../Brands/components/BrandIcons.tsx';

export const IconOrders = ({ className, size = 28 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconEye = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
