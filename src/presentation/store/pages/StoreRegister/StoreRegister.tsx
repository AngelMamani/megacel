import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.tsx';
import logo from '../../../assets/logo3.png';
import '../../../pages/Login/Login.css';

export const StoreRegister = () => {
  const { register, isAuthenticated, isCliente, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-page-open');
    return () => {
      document.body.classList.remove('login-page-open');
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && isCliente && user) {
      navigate('/cuenta', { replace: true });
    }
  }, [isAuthenticated, isCliente, navigate, user]);

  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      toast.error('Completa nombre, correo y contraseña');
      return;
    }

    if (trimmedPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(trimmedName, trimmedEmail, trimmedPassword);
      toast.success('Cuenta creada correctamente');
      navigate('/cuenta', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden />
      <div className="login-page__shell login-page__shell--register">
        <div className="login-card">
          <div className="login-card__brand">
            <Link to="/" className="login-card__logo-link" aria-label="MEGA CEL — Inicio">
              <img src={logo} alt="MEGA CEL" className="login-card__logo" />
            </Link>
          </div>

          <div className="login-card__intro">
            <h1>Crear cuenta</h1>
          </div>

          <form className="login-form login-form--register" onSubmit={HandleSubmit}>
            <div className="login-form__group">
              <label htmlFor="register-name" className="login-form__label">
                Nombre completo
              </label>
              <input
                id="register-name"
                type="text"
                className="login-form__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__group">
              <label htmlFor="register-email" className="login-form__label">
                Correo electrónico
              </label>
              <input
                id="register-email"
                type="email"
                className="login-form__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            <div className="login-form__group">
              <label htmlFor="register-password" className="login-form__label">
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                className="login-form__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="login-form__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <footer className="login-card__footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/login">Ingresar</Link>
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
