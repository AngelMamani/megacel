import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Products } from './pages/Products/Products';
import { Users } from './pages/Users/Users';
import { Categories } from './pages/Categories/Categories';
import { Brands } from './pages/Brands/Brands';
import { Orders } from './pages/Orders/Orders';
import { History } from './pages/History/History';
import { Reports } from './pages/Reports/Reports';
import { Settings } from './pages/Settings/Settings';
import { Sales } from './pages/Sales/Sales';
import { Login } from './pages/Login/Login';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { seedFirestoreIfEmpty } from './firebase/seed';
import { initializePrimaryAdmin } from './firebase/adminHelpers';
import './App.css';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

function App() {
  useEffect(() => {
    initializePrimaryAdmin().catch((error) => {
      console.error('Error initializing primary admin:', error);
    });

    seedFirestoreIfEmpty().catch((error) => {
      console.error('Error seeding Firestore:', error);
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              padding: '1rem',
              fontSize: '0.9375rem',
              fontWeight: '500',
              position: 'relative',
              overflow: 'hidden',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
              style: {
                borderLeft: '4px solid #10b981',
                '--toast-duration': '3000ms',
              } as React.CSSProperties,
              className: 'toast-with-progress success',
              duration: 3000,
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                borderLeft: '4px solid #ef4444',
                '--toast-duration': '4000ms',
              } as React.CSSProperties,
              className: 'toast-with-progress error',
              duration: 4000,
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<Products />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="marcas" element={<Brands />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="historial" element={<History />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="configuracion" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;