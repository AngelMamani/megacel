import { Outlet } from 'react-router-dom';
import { CustomerAuthProvider } from '../context/CustomerAuthProvider.tsx';

export const CustomerAuthShell = () => (
  <CustomerAuthProvider>
    <Outlet />
  </CustomerAuthProvider>
);
