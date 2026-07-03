import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Login.css';
import { useAuth } from '../../context/AuthContext.tsx';
import { GetHomePathForRole } from '../../utils/authPresentationUtils.ts';
import logo from '../../assets/logo3.png';

const GoogleIcon = () => (
  <svg className="login-button-google__icon" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const Login = () => {
  const { login, loginWithGoogle, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('login-page-open');
    document.body.classList.add('login-page-open');
    return () => {
      document.documentElement.classList.remove('login-page-open');
      document.body.classList.remove('login-page-open');
    };
  }, []);

  useEffect(() => {
    const message = sessionStorage.getItem('mega_cel_auth_error');
    if (message) {
      sessionStorage.removeItem('mega_cel_auth_error');
      toast.error(message);
    }
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(GetHomePathForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGoogleLoading) return;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Ingresa tu correo y contraseña');
      return;
    }

    setIsSubmitting(true);
    try {
      const authUser = await login(trimmedEmail, trimmedPassword);
      toast.success(
        authUser.role === 'admin'
          ? 'Bienvenido al panel administrativo'
          : 'Bienvenido a MEGA CEL'
      );
      navigate(GetHomePathForRole(authUser.role), { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const HandleGoogleLogin = async () => {
    if (isSubmitting || isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const authUser = await loginWithGoogle();
      toast.success(
        authUser.role === 'admin'
          ? 'Bienvenido al panel administrativo'
          : 'Bienvenido a MEGA CEL'
      );
      navigate(GetHomePathForRole(authUser.role), { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (isLoading && !isAuthenticated && !isGoogleLoading && !isSubmitting) {
    return (
      <div className="login-page">
        <div className="login-page__backdrop" aria-hidden />
        <div className="login-page__shell">
          <div className="login-card login-card--loading">
            <div className="login-card__loader" aria-hidden />
            <p className="login-card__loading-text">Verificando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden />
      <div className="login-page__shell">
        <div className="login-card">
          <div className="login-card__brand">
            <Link to="/" className="login-card__logo-link" aria-label="MEGA CEL — Inicio">
              <img src={logo} alt="MEGA CEL" className="login-card__logo" />
            </Link>
          </div>

          <div className="login-card__intro">
            <h1>Ingresar a tu cuenta</h1>
          </div>

          <form className="login-form" onSubmit={HandleSubmit}>
            <div className="login-form__group">
              <label htmlFor="email" className="login-form__label">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className="login-form__input"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__group">
              <label htmlFor="password" className="login-form__label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="login-form__input"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="login-form__submit"
              disabled={isSubmitting || isGoogleLoading}
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="login-divider" aria-hidden>
            <span />
            <p>o continúa con</p>
            <span />
          </div>

          <button
            type="button"
            className="login-button-google"
            onClick={HandleGoogleLogin}
            disabled={isSubmitting || isGoogleLoading}
          >
            <GoogleIcon />
            {isGoogleLoading ? 'Conectando...' : 'Google'}
          </button>

          <footer className="login-card__footer">
            <p>
              ¿Nuevo en MEGA CEL? <Link to="/registro">Crear cuenta</Link>
            </p>
            <Link to="/" className="login-card__back">
              ← Volver a la tienda
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
};
