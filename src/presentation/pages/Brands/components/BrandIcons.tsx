interface IconProps {
  className?: string;
  size?: number;
}

export const IconPlus = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconSearch = ({ className, size = 18 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconGrid = ({ className, size = 18 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconTable = ({ className, size = 18 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconEye = ({ className, size = 16 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconEdit = ({ className, size = 16 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTrash = ({ className, size = 16 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconRefresh = ({ className, size = 16 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 12a8 8 0 0113.5-5.7M20 12a8 8 0 01-13.5 5.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 6h2.5V3.5M6.5 18H4v2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTag = ({ className, size = 28 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 12l-8 8-8-8V4h8l8 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

export const IconClose = ({ className, size = 22 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconUpload = ({ className, size = 32 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 16V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
