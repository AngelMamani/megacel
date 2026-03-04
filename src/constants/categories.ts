import celImage from '../assets/categoria-cel.png';
import audifonosImage from '../assets/categoria-audifonos.png';

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  products: unknown[];
  image: string;
  color: string;
  gradient: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  createdAt: string;
  editedAt?: string;
  isActive: boolean;
}

export const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Smartphones',
    description: 'Teléfonos inteligentes de última generación con tecnología avanzada',
    productCount: 3,
    products: [],
    image: celImage,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: 'up',
    trendValue: 12,
    createdAt: new Date('2024-01-01T10:30:00').toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Tablets',
    description: 'Tabletas y dispositivos portátiles para productividad y entretenimiento',
    productCount: 3,
    products: [],
    image: celImage,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: 'stable',
    trendValue: 0,
    createdAt: new Date('2024-01-05T14:20:00').toISOString(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Accesorios',
    description: 'Accesorios y complementos para tus dispositivos',
    productCount: 3,
    products: [],
    image: audifonosImage,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: 'up',
    trendValue: 8,
    createdAt: new Date('2024-01-10T09:15:00').toISOString(),
    isActive: true,
  },
  {
    id: '4',
    name: 'Auriculares',
    description: 'Auriculares inalámbricos y con cable de alta calidad',
    productCount: 3,
    products: [],
    image: audifonosImage,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    trend: 'up',
    trendValue: 20,
    createdAt: new Date('2024-01-12T16:45:00').toISOString(),
    isActive: true,
  },
  {
    id: '5',
    name: 'Smartwatch',
    description: 'Relojes inteligentes con funciones avanzadas',
    productCount: 3,
    products: [],
    image: celImage,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    trend: 'down',
    trendValue: -5,
    createdAt: new Date('2024-01-15T11:30:00').toISOString(),
    isActive: true,
  },
  {
    id: '6',
    name: 'Cámaras',
    description: 'Cámaras digitales y accesorios para fotografía profesional',
    productCount: 3,
    products: [],
    image: celImage,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    trend: 'stable',
    trendValue: 0,
    createdAt: new Date('2024-01-18T13:00:00').toISOString(),
    isActive: true,
  },
];

