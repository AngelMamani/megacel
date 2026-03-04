import { type MenuItem } from '../types/index.ts';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Principal',
    path: '/',
  },
  {
    id: 'products',
    label: 'Productos',
    path: '/productos',
  },
  {
    id: 'users',
    label: 'Usuarios',
    path: '/usuarios',
  },
  {
    id: 'categories',
    label: 'Categorías',
    path: '/categorias',
  },
  {
    id: 'brands',
    label: 'Marcas',
    path: '/marcas',
  },
  {
    id: 'orders',
    label: 'Pedidos',
    path: '/pedidos',
  },
  {
    id: 'sales',
    label: 'Ventas',
    path: '/ventas',
  },
  {
    id: 'history',
    label: 'Historial',
    path: '/historial',
  },
  {
    id: 'reports',
    label: 'Reportes',
    path: '/reportes',
  },
  {
    id: 'settings',
    label: 'Configuración',
    path: '/configuracion',
  },
];
