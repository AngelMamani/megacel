import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { DismissStoreCartToasts } from '../utils/storeCartFeedback.tsx';
import { useStoreCategories } from '../hooks/useStoreCategories.ts';
import { useStoreHeaderViewport } from '../hooks/useStoreHeaderViewport.ts';
import logo from '../../assets/logo3.png';
import {
  StoreIconCart,
  StoreIconClose,
  StoreIconLogout,
  StoreIconMenu,
  StoreIconPackage,
  StoreIconUser,
} from './StoreIcons.tsx';
import { StoreHeaderSearch } from './StoreHeaderSearch.tsx';
import './StoreHeader.css';

export const StoreHeader = () => {
  const { user, isAuthenticated, isCliente, logout } = useAuth();
  const { categories: Categories, isLoading: IsCategoriesLoading } = useStoreCategories();
  const IsCompactLayout = useStoreHeaderViewport();
  const { itemCount, justAdded, toggleCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ActiveCategoryId = searchParams.get('categoria') || '';

  const [IsMenuOpen, setIsMenuOpen] = useState(false);
  const [IsUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [SearchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!IsCompactLayout) {
      setIsMenuOpen(false);
    }
  }, [IsCompactLayout]);

  useEffect(() => {
    document.body.style.overflow = IsMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [IsMenuOpen]);

  useEffect(() => {
    const HandleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', HandleClickOutside);
    return () => document.removeEventListener('mousedown', HandleClickOutside);
  }, []);

  const HandleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  const HandleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = SearchQuery.trim();
    navigate(query ? `/catalogo?q=${encodeURIComponent(query)}` : '/catalogo');
  };

  const HandleCategoryClick = (categoryId: string) => {
    setIsMenuOpen(false);
    navigate(`/catalogo?categoria=${encodeURIComponent(categoryId)}`);
  };

  return (
    <header className={`store-header ${IsMenuOpen ? 'is-menu-open' : ''}`}>
      <div className="store-header__bar">
        <div className="store-container store-header__shell">
          <div className="store-header__row store-header__row--main">
            <div className="store-header__start">
              <button
                type="button"
                className={`store-header__icon-btn store-header__menu-btn ${IsMenuOpen ? 'is-active' : ''}`}
                aria-label={IsMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={IsMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {IsMenuOpen ? <StoreIconClose /> : <StoreIconMenu />}
              </button>

              <NavLink to="/" className="store-header__brand" onClick={() => setIsMenuOpen(false)}>
                <img src={logo} alt="MEGA CEL" className="store-header__logo" />
              </NavLink>
            </div>

            {!IsCompactLayout && (
              <StoreHeaderSearch
                className="store-header__search--desktop"
                value={SearchQuery}
                onChange={setSearchQuery}
                onSubmit={HandleSearchSubmit}
              />
            )}

            <div className="store-header__tools">
              {isAuthenticated && isCliente ? (
                <div className="store-header__user" ref={userMenuRef}>
                  <button
                    type="button"
                    className={`store-header__icon-btn store-header__user-btn ${IsUserMenuOpen ? 'is-active' : ''}`}
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-expanded={IsUserMenuOpen}
                    aria-label="Mi cuenta"
                  >
                    <span className="store-header__avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                  </button>

                  {IsUserMenuOpen && (
                    <div className="store-header__user-menu">
                      <div className="store-header__user-menu-head">
                        <p>{user?.name}</p>
                        <span>{user?.email}</span>
                      </div>
                      <NavLink to="/cuenta" className="store-header__user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                        <StoreIconUser />
                        Mi cuenta
                      </NavLink>
                      <NavLink to="/mis-pedidos" className="store-header__user-menu-item" onClick={() => setIsUserMenuOpen(false)}>
                        <StoreIconPackage />
                        Mis pedidos
                      </NavLink>
                      <button type="button" className="store-header__user-menu-item is-danger" onClick={HandleLogout}>
                        <StoreIconLogout />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="store-header__icon-btn store-header__login-btn"
                  aria-label="Ingresar"
                >
                  <StoreIconUser />
                </NavLink>
              )}

              <button
                type="button"
                className={`store-header__icon-btn store-header__cart-btn ${justAdded ? 'is-pulse' : ''}`}
                aria-label={`Carrito de compras, ${itemCount} productos`}
                onClick={() => {
                  DismissStoreCartToasts();
                  toggleCart();
                }}
              >
                <StoreIconCart />
                {itemCount > 0 && (
                  <span className="store-header__cart-badge" key={itemCount}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {IsCompactLayout && (
            <div className="store-header__row store-header__row--search-mobile">
              <StoreHeaderSearch
                className="store-header__search--mobile"
                value={SearchQuery}
                onChange={setSearchQuery}
                onSubmit={HandleSearchSubmit}
              />
            </div>
          )}

          {!IsCompactLayout && Categories.length > 0 && (
            <nav className="store-header__row store-header__row--cats" aria-label="Categorías">
              <div className="store-header__cats">
                {Categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`store-header__cat ${ActiveCategoryId === category.id ? 'is-active' : ''}`}
                    onClick={() => HandleCategoryClick(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>

      <div className={`store-header__drawer ${IsMenuOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className="store-header__drawer-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setIsMenuOpen(false)}
        />
        <aside className="store-header__drawer-panel">
          <div className="store-header__drawer-head">
            <h2>Categorías</h2>
            <button
              type="button"
              className="store-header__icon-btn store-header__drawer-close"
              aria-label="Cerrar menú"
              onClick={() => setIsMenuOpen(false)}
            >
              <StoreIconClose />
            </button>
          </div>

          {Categories.length === 0 ? (
            <p className="store-header__drawer-empty">
              {IsCategoriesLoading ? 'Cargando categorías...' : 'No hay categorías disponibles'}
            </p>
          ) : (
            <nav className="store-header__drawer-cats" aria-label="Categorías">
              {Categories.map((category) => (
                <button
                  key={`drawer-cat-${category.id}`}
                  type="button"
                  className={`store-header__drawer-cat ${ActiveCategoryId === category.id ? 'is-active' : ''}`}
                  onClick={() => HandleCategoryClick(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          )}
        </aside>
      </div>
    </header>
  );
};
