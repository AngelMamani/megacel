import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

export const CustomerPrivateRoute = () => {
  const { isAuthenticated, isCliente, isLoading } = useAuth();

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

  if (!isCliente) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
