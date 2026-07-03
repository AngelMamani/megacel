import { useEffect, useState } from 'react';

export const STORE_FOOTER_MOBILE_MQ = '(max-width: 768px)';

/** Detecta vista móvil del pie de página (acordeón). */
export const useStoreFooterMobile = () => {
  const [IsMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(STORE_FOOTER_MOBILE_MQ).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(STORE_FOOTER_MOBILE_MQ);
    const OnChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', OnChange);
    return () => mediaQuery.removeEventListener('change', OnChange);
  }, []);

  return IsMobile;
};
