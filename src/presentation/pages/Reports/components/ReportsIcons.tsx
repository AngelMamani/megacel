export const IconReports = ({ className, size = 28 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 19V5M4 19h16M8 17V11M12 17V7M16 17v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconExport = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3v12M8 11l4 4 4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChart = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="12" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="10" y="8" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="17" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
  </svg>
);
