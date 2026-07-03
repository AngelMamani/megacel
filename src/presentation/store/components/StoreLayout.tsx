import { Outlet } from 'react-router-dom';
import { CartProvider } from '../context/CartContext.tsx';
import { StoreHeader } from './StoreHeader.tsx';
import { StoreCartDrawer } from './StoreCartDrawer.tsx';
import { StoreFooter } from './StoreFooter.tsx';
import { StoreServiceHighlights } from './StoreServiceHighlights.tsx';
import { StoreScrollToTop } from './StoreScrollToTop.tsx';
import './StoreLayout.css';
import '../styles/Store.css';

export const StoreLayout = () => (
  <CartProvider>
    <StoreScrollToTop />
    <div className="store-page">
      <StoreHeader />
      <StoreCartDrawer />

      <main className="store-main">
        <Outlet />
      </main>

      <div className="store-footer-group">
        <StoreServiceHighlights />
        <StoreFooter />
      </div>
    </div>
  </CartProvider>
);
