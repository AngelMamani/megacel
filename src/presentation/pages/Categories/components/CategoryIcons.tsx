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

export const IconFolder = ({ className, size = 28 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
