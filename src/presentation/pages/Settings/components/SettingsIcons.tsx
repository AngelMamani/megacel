export const IconSettings = ({ className, size = 28 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const IconUser = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconSliders = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="14" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="11" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);
