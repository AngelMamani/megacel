import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCustomerAuth } from '../../context/useCustomerAuth.ts';
import logo from '../../../assets/logo3.png';
import './StoreAuth.css';

export const StoreLogin = () => {
  const { login, loginWithGoogle, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const message = sessionStorage.getItem('mega_cel_customer_auth_error');
    if (message) {
      sessionStorage.removeItem('mega_cel_customer_auth_error');
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tienda/cuenta', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      await login(trimmedEmail, trimmedPassword);
      toast.success('Bienvenido a MEGA CEL');
      navigate('/tienda/cuenta', { replace: true });
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
      await loginWithGoogle();
      toast.success('Sesión iniciada con Google');
      navigate('/tienda/cuenta', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo iniciar con Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="store-auth">
      <div className="store-auth__card">
        <div className="store-auth__header">
          <div className="store-auth__logo-wrap">
            <img src={logo} alt="MEGA CEL" className="store-auth__logo" />
          </div>
          <h1>Ingresar a tu cuenta</h1>
          <p>Accede para ver tu perfil y el historial de pedidos.</p>
        </div>

        <form className="store-auth__form" onSubmit={HandleSubmit}>
          <label className="store-auth__field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </label>

          <label className="store-auth__field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </label>

          <button type="submit" className="store-btn store-btn--primary store-auth__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="store-auth__divider">
          <span />
          <p>o</p>
          <span />
        </div>

        <button
          type="button"
          className="store-btn store-btn--outline store-auth__google"
          onClick={HandleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <p className="store-auth__footer">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </div>
    </section>
  );
};
