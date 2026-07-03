import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthProvider.tsx';

export const AdminAuthShell = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);
