import celImage from '../assets/categoria-cel.png';
import audifonosImage from '../assets/categoria-audifonos.png';

export interface Brand {
  id: string;
  name: string;
  description: string;
  categoryId: string;
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

export const initialBrands: Brand[] = [
  {
    id: '1',
    name: 'Apple',
    description: 'Tecnología innovadora y diseño premium',
    categoryId: '1',
    productCount: 3,
    products: [],
    image: celImage,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: 'up',
    trendValue: 18,
    createdAt: new Date('2024-01-01T10:30:00').toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Samsung',
    description: 'Innovación y calidad en dispositivos móviles',
    categoryId: '1',
    productCount: 3,
    products: [],
    image: celImage,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: 'up',
    trendValue: 15,
    createdAt: new Date('2024-01-05T14:20:00').toISOString(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Sony',
    description: 'Audio y tecnología de alta calidad',
    categoryId: '4',
    productCount: 3,
    products: [],
    image: audifonosImage,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: 'stable',
    trendValue: 0,
    createdAt: new Date('2024-01-10T09:15:00').toISOString(),
    isActive: true,
  },
];

