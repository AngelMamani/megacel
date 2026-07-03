import { useEffect, useState } from 'react';
import logo from '../../assets/logo3.png';
import './AppSplashScreen.css';

interface AppSplashScreenProps {
  OnComplete: () => void;
}

const SPLASH_ENTER_MS = 900;
const SPLASH_EXIT_MS = 650;
const SPLASH_TOTAL_MS = SPLASH_ENTER_MS + SPLASH_EXIT_MS;

export const ShouldShowAppSplash = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem('mega_cel_splash_seen') === '1') return false;

  const path = window.location.pathname;
  if (path === '/login' || path === '/registro' || path.startsWith('/admin')) {
    return false;
  }

  return true;
};

export const AppSplashScreen = ({ OnComplete }: AppSplashScreenProps) => {
  const [Phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    document.body.classList.add('app-splash-open');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enterMs = prefersReducedMotion ? 200 : SPLASH_ENTER_MS;
    const exitMs = prefersReducedMotion ? 150 : SPLASH_EXIT_MS;

    const exitTimer = window.setTimeout(() => setPhase('exit'), enterMs);
    const completeTimer = window.setTimeout(() => {
      sessionStorage.setItem('mega_cel_splash_seen', '1');
      document.body.classList.remove('app-splash-open');
      OnComplete();
    }, enterMs + exitMs);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
      document.body.classList.remove('app-splash-open');
    };
  }, [OnComplete]);

  return (
    <div
      className={`app-splash app-splash--${Phase}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="app-splash__mesh" aria-hidden="true">
        <span className="app-splash__blob app-splash__blob--1" />
        <span className="app-splash__blob app-splash__blob--2" />
        <span className="app-splash__blob app-splash__blob--3" />
      </div>

      <div className="app-splash__content">
        <div className="app-splash__logo-wrap">
          <img src={logo} alt="" className="app-splash__logo" />
        </div>
        <p className="app-splash__tagline">Tecnología que te conecta</p>
      </div>
    </div>
  );
};

export const APP_SPLASH_TOTAL_MS = SPLASH_TOTAL_MS;
