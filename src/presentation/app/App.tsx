import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from '../components/Layout/Layout.tsx';
import {
  AppSplashScreen,
  ShouldShowAppSplash,
} from '../components/AppSplashScreen/AppSplashScreen.tsx';
import { Dashboard } from '../pages/Dashboard/Dashboard.tsx';
import { Products } from '../pages/Products/Products.tsx';
import { Users } from '../pages/Users/Users.tsx';
import { Categories } from '../pages/Categories/Categories.tsx';
import { Brands } from '../pages/Brands/Brands.tsx';
import { Orders } from '../pages/Orders/Orders.tsx';
import { History } from '../pages/History/History.tsx';
import { Reports } from '../pages/Reports/Reports.tsx';
import { Settings } from '../pages/Settings/Settings.tsx';
import { Login } from '../pages/Login/Login.tsx';
import { DependencyProvider } from '../providers/DependencyProvider.tsx';
import { AuthProvider } from '../context/AuthProvider.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { StoreLayout } from '../store/components/StoreLayout.tsx';
import { CustomerPrivateRoute } from '../store/components/CustomerPrivateRoute.tsx';
import { StoreHome } from '../store/pages/StoreHome/StoreHome.tsx';
import { StoreCatalog } from '../store/pages/StoreCatalog/StoreCatalog.tsx';
import { StoreProductDetail } from '../store/pages/StoreProductDetail/StoreProductDetail.tsx';
import { StoreRegister } from '../store/pages/StoreRegister/StoreRegister.tsx';
import { StoreAccount } from '../store/pages/StoreAccount/StoreAccount.tsx';
import { StoreOrders } from '../store/pages/StoreOrders/StoreOrders.tsx';
import { StoreLegal } from '../store/pages/StoreLegal/StoreLegal.tsx';
import { initializeApp } from '../bootstrap/initializeApp.ts';
import '../styles/App.css';

const AdminPrivateRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="store-page">
        <div className="store-container store-empty" style={{ marginTop: '3rem' }}>
          <h3>Verificando sesión...</h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Layout />;
};

const toasterOptions = {
  duration: 3000,
  style: {
    background: '#ffffff',
    color: '#1e293b',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '1rem',
    fontSize: '0.9375rem',
    fontWeight: '500',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  success: {
    iconTheme: { primary: '#10b981', secondary: '#ffffff' },
    style: { borderLeft: '4px solid #10b981' } as React.CSSProperties,
    className: 'toast-with-progress success',
    duration: 3000,
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
    style: { borderLeft: '4px solid #ef4444' } as React.CSSProperties,
    className: 'toast-with-progress error',
    duration: 4000,
  },
};

function App() {
  const [ShowSplash, setShowSplash] = useState(ShouldShowAppSplash);

  useEffect(() => {
    initializeApp().catch((error) => {
      console.error('Error initializing app:', error);
    });
  }, []);

  return (
    <DependencyProvider>
      <AuthProvider>
        {ShowSplash && <AppSplashScreen OnComplete={() => setShowSplash(false)} />}
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={toasterOptions} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<StoreRegister />} />

            <Route element={<StoreLayout />}>
              <Route index element={<StoreHome />} />
              <Route path="catalogo" element={<StoreCatalog />} />
              <Route path="producto/:productId" element={<StoreProductDetail />} />
              <Route path="legal/:section" element={<StoreLegal />} />
              <Route element={<CustomerPrivateRoute />}>
                <Route path="cuenta" element={<StoreAccount />} />
                <Route path="mis-pedidos" element={<StoreOrders />} />
              </Route>
            </Route>

            <Route path="/admin" element={<AdminPrivateRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<Products />} />
              <Route path="usuarios" element={<Users />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="marcas" element={<Brands />} />
              <Route path="pedidos" element={<Orders />} />
              <Route path="historial" element={<History />} />
              <Route path="reportes" element={<Reports />} />
              <Route path="configuracion" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DependencyProvider>
  );
}

export default App;
