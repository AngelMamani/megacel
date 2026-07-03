import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  if (window.location.hash) {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

export const StoreScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    ScrollToTop();
  }, [pathname, search, hash]);

  useLayoutEffect(() => {
    const HandlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        ScrollToTop();
      }
    };

    window.addEventListener('pageshow', HandlePageShow);
    return () => window.removeEventListener('pageshow', HandlePageShow);
  }, []);

  return null;
};
