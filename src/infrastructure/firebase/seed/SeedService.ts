import { COLLECTIONS } from '../config/Collections.ts';
import { isCollectionEmpty, setDocById } from '../helpers/FirestoreHelpers.ts';
import { initialBrands } from '../seed/constants/brands.ts';
import { initialCategories } from '../seed/constants/categories.ts';
import celImage from '../../../presentation/assets/categoria-cel.png';

type SeedProduct = {
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  costPrice?: number;
  discount?: number;
  discountPercentage?: number;
  finalPrice: number;
  stock: number;
  minStock?: number;
  status: 'activo' | 'inactivo';
  images?: string[];
  description?: string;
  shortDescription?: string;
  specifications?: Record<string, string>;
  notes?: string;
  createdAt?: string;
  editedAt?: string;
};

type SeedOrder = {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  items: number;
  orderItems?: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

const nowIso = () => new Date().toISOString();

export async function seedFirestoreIfEmpty() {
  if (!import.meta.env.DEV) return;

  const shouldSeed =
    (await isCollectionEmpty(COLLECTIONS.categories)) &&
    (await isCollectionEmpty(COLLECTIONS.brands)) &&
    (await isCollectionEmpty(COLLECTIONS.products)) &&
    (await isCollectionEmpty(COLLECTIONS.orders));

  if (!shouldSeed) return;

  const createdAt = nowIso();
  const categories = initialCategories.map((c) => ({
    id: c.id,
    data: {
      ...c,
      products: [],
      createdAt: c.createdAt || createdAt,
    },
  }));

  const brands = initialBrands.map((b) => ({
    id: b.id,
    data: {
      ...b,
      categoryIds: [b.categoryId],
      categoryId: undefined,
      products: [],
      createdAt: b.createdAt || createdAt,
    },
  }));

  const products: Array<{ id: string; data: SeedProduct }> = [
    {
      id: '1',
      data: {
        sku: 'IPH15PM256-001',
        name: 'iPhone 15 Pro Max 256GB',
        categoryId: '1',
        brandId: '1',
        price: 1499,
        costPrice: 1200,
        finalPrice: 1499,
        stock: 12,
        minStock: 5,
        status: 'activo',
        images: [celImage],
        description: 'Smartphone premium.',
        shortDescription: 'iPhone 15 Pro Max',
        specifications: { Modelo: 'iPhone 15 Pro Max', Capacidad: '256GB' },
        createdAt,
      },
    },
    {
      id: '2',
      data: {
        sku: 'SGS24U512-001',
        name: 'Samsung Galaxy S24 Ultra 512GB',
        categoryId: '1',
        brandId: '2',
        price: 1299,
        costPrice: 1050,
        discount: 100,
        discountPercentage: 7.7,
        finalPrice: 1199,
        stock: 8,
        minStock: 5,
        status: 'activo',
        images: [celImage],
        description: 'Smartphone con cámara avanzada.',
        shortDescription: 'Galaxy S24 Ultra',
        specifications: { Modelo: 'Galaxy S24 Ultra', Capacidad: '512GB' },
        createdAt,
      },
    },
  ];

  const orders: Array<{ id: string; data: SeedOrder }> = [
    {
      id: 'ORD-001',
      data: {
        customerName: 'Juan Pérez',
        customerEmail: 'juan.perez@example.com',
        customerPhone: '+51 987 654 321',
        total: 1250,
        status: 'completed',
        date: createdAt.split('T')[0],
        items: 2,
        orderItems: [
          { id: '1', productName: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 1499, subtotal: 1499 },
          { id: '2', productName: 'Auriculares', quantity: 1, price: 49, subtotal: 49 },
        ],
        createdAt,
      },
    },
  ];

  await Promise.all([
    ...categories.map((c) => setDocById(COLLECTIONS.categories, c.id, c.data)),
    ...brands.map((b) => setDocById(COLLECTIONS.brands, b.id, b.data)),
    ...products.map((p) => setDocById(COLLECTIONS.products, p.id, p.data)),
    ...orders.map((o) => setDocById(COLLECTIONS.orders, o.id, o.data)),
  ]);
}
