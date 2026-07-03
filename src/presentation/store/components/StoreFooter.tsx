import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo3.png';
import { useStoreFooterMobile } from '../hooks/useStoreFooterMobile.ts';
import { StoreFooterPanel } from './StoreFooterPanel.tsx';
import './StoreFooter.css';

const INFO_LINKS = [
  { label: 'Nosotros', to: { pathname: '/', hash: '#footer-nosotros' } },
  { label: 'Contactos', to: { pathname: '/', hash: '#footer-contacto' } },
  { label: 'Nuestra tienda', to: '/catalogo' },
] as const;

const LEGAL_LINKS = [
  { label: 'Términos y condiciones', to: '/legal/terminos' },
  { label: 'Política de privacidad', to: '/legal/privacidad' },
  { label: 'Política de envíos', to: '/legal/envios' },
] as const;

const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d486.7384803220785!2d-69.19542143271144!3d-12.58832510942593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2spe!4v1782845341269!5m2!1ses!2spe';

export const StoreFooter = () => {
  const IsMobile = useStoreFooterMobile();
  const [OpenPanelId, setOpenPanelId] = useState<string | null>(null);

  const HandleToggle = (id: string) => {
    setOpenPanelId((current) => (current === id ? null : id));
  };

  const IsOpen = (id: string) => !IsMobile || OpenPanelId === id;

  return (
    <footer className="store-footer">
      <div className="store-footer__accent" aria-hidden />
      <div className="store-container store-footer__shell">
        <div className={`store-footer__grid${IsMobile ? ' store-footer__grid--accordion' : ''}`}>
          <StoreFooterPanel
            Id="footer-nosotros"
            Title="MEGA CEL"
            IsMobile={IsMobile}
            IsOpen={IsOpen('footer-nosotros')}
            OnToggle={HandleToggle}
            ClassName="store-footer__panel--brand"
          >
            <Link to="/" className="store-footer__logo-link" aria-label="MEGA CEL — Inicio">
              <img src={logo} alt="MEGA CEL" className="store-footer__logo" />
            </Link>
            <p className="store-footer__about">
              MEGA CEL se destaca como una tienda en linea en la venta y distribución de tecnología móvil y
              accesorios en Puerto Maldonado. Entre nuestro catálogo encontrarás celulares, smartphones,
              tablets, audífonos, cargadores, cases, smartwatches y mucho más de las mejores marcas. Nuestra
              dedicación a la excelencia y la satisfacción del cliente nos distingue en la región. ¡Estamos
              aquí para cubrir tus necesidades tecnológicas!
            </p>
          </StoreFooterPanel>

          <StoreFooterPanel
            Id="footer-contacto"
            Title="Información"
            IsMobile={IsMobile}
            IsOpen={IsOpen('footer-contacto')}
            OnToggle={HandleToggle}
          >
            <ul className="store-footer__links">
              {INFO_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="store-footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StoreFooterPanel>

          <StoreFooterPanel
            Id="footer-legales"
            Title="Legales"
            IsMobile={IsMobile}
            IsOpen={IsOpen('footer-legales')}
            OnToggle={HandleToggle}
          >
            <ul className="store-footer__links">
              {LEGAL_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="store-footer__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StoreFooterPanel>

          <StoreFooterPanel
            Id="footer-ubicacion"
            Title="Ubicación"
            IsMobile={IsMobile}
            IsOpen={IsOpen('footer-ubicacion')}
            OnToggle={HandleToggle}
            ClassName="store-footer__panel--map"
          >
            <div className="store-footer__map-frame">
              <iframe
                src={MAP_EMBED_URL}
                title="Ubicación de MEGA CEL en Puerto Maldonado"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </StoreFooterPanel>
        </div>

        <div className="store-footer__bottom">
          <p>© {new Date().getFullYear()} MEGA CEL — Tecnología y accesorios móviles · Puerto Maldonado</p>
        </div>
      </div>
    </footer>
  );
};
