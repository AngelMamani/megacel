export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Principal', path: '/admin' },
  { id: 'products', label: 'Productos', path: '/admin/productos' },
  { id: 'users', label: 'Usuarios', path: '/admin/usuarios' },
  { id: 'categories', label: 'Categorías', path: '/admin/categorias' },
  { id: 'brands', label: 'Marcas', path: '/admin/marcas' },
  { id: 'orders', label: 'Pedidos', path: '/admin/pedidos' },
  { id: 'history', label: 'Historial', path: '/admin/historial' },
  { id: 'reports', label: 'Reportes', path: '/admin/reportes' },
  { id: 'settings', label: 'Configuración', path: '/admin/configuracion' },
];
