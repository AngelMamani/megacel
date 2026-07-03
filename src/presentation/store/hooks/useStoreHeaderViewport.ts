import { useEffect, useState } from 'react';

export const STORE_HEADER_COMPACT_MQ = '(max-width: 1100px)';

/** Detecta layout compacto (móvil/tablet) del encabezado tienda. */
export const useStoreHeaderViewport = () => {
  const [IsCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(STORE_HEADER_COMPACT_MQ).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(STORE_HEADER_COMPACT_MQ);
    const OnChange = (event: MediaQueryListEvent) => setIsCompact(event.matches);

    setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener('change', OnChange);
    return () => mediaQuery.removeEventListener('change', OnChange);
  }, []);

  return IsCompact;
};
