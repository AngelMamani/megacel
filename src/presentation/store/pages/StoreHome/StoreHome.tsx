import { Link } from 'react-router-dom';
import { StoreBrandsCarousel } from '../../components/StoreBrandsCarousel.tsx';
import { StoreHomeShowcase } from '../../components/StoreHomeShowcase.tsx';
import slider2 from '../../../assets/slider2.png';
import './StoreHome.css';

export const StoreHome = () => {
  return (
    <section className="store-home">
      <Link to="/catalogo" className="store-home__slider" aria-label="Ver catálogo — Sonido premium para tu día a día">
        <img
          src={slider2}
          alt="Sonido premium para tu día a día — audífonos, parlantes y accesorios MEGA CEL"
          className="store-home__slider-img"
          fetchPriority="high"
        />
      </Link>

      <StoreBrandsCarousel />

      <StoreHomeShowcase />
    </section>
  );
};
