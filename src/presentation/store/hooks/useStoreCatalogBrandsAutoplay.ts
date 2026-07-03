import { useCallback, useEffect, useRef } from 'react';

const AUTO_SCROLL_PX_PER_FRAME = 0.28;
const RESUME_AFTER_TOUCH_MS = 2200;

export const useStoreCatalogBrandsMobileAutoplay = (
  ViewportRef: React.RefObject<HTMLDivElement | null>,
  Enabled: boolean
) => {
  const IsPausedRef = useRef(false);
  const ResumeTimerRef = useRef<number | null>(null);
  const AnimationFrameRef = useRef<number | null>(null);

  const PauseAutoplay = useCallback(() => {
    IsPausedRef.current = true;
    if (ResumeTimerRef.current !== null) {
      window.clearTimeout(ResumeTimerRef.current);
      ResumeTimerRef.current = null;
    }
  }, []);

  const ScheduleResume = useCallback(() => {
    if (ResumeTimerRef.current !== null) {
      window.clearTimeout(ResumeTimerRef.current);
    }

    ResumeTimerRef.current = window.setTimeout(() => {
      IsPausedRef.current = false;
      ResumeTimerRef.current = null;
    }, RESUME_AFTER_TOUCH_MS);
  }, []);

  useEffect(() => {
    if (!Enabled) return;

    const Viewport = ViewportRef.current;
    if (!Viewport) return;

    const PrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PrefersReducedMotion) return;

    const Tick = () => {
      if (!IsPausedRef.current) {
        const LoopWidth = Viewport.scrollWidth / 2;

        if (LoopWidth > Viewport.clientWidth) {
          Viewport.scrollLeft += AUTO_SCROLL_PX_PER_FRAME;

          if (Viewport.scrollLeft >= LoopWidth) {
            Viewport.scrollLeft -= LoopWidth;
          }
        }
      }

      AnimationFrameRef.current = window.requestAnimationFrame(Tick);
    };

    AnimationFrameRef.current = window.requestAnimationFrame(Tick);

    const OnTouchStart = () => PauseAutoplay();
    const OnTouchEnd = () => ScheduleResume();

    Viewport.addEventListener('touchstart', OnTouchStart, { passive: true });
    Viewport.addEventListener('touchend', OnTouchEnd, { passive: true });
    Viewport.addEventListener('touchcancel', OnTouchEnd, { passive: true });

    return () => {
      if (AnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(AnimationFrameRef.current);
      }
      if (ResumeTimerRef.current !== null) {
        window.clearTimeout(ResumeTimerRef.current);
      }

      Viewport.removeEventListener('touchstart', OnTouchStart);
      Viewport.removeEventListener('touchend', OnTouchEnd);
      Viewport.removeEventListener('touchcancel', OnTouchEnd);
    };
  }, [Enabled, ViewportRef, PauseAutoplay, ScheduleResume]);
};

export const IsStoreCatalogBrandsMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
};
