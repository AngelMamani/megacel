export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  maxStock: number;
}

export interface CartAddProductInput {
  id: string;
  sku: string;
  name: string;
  finalPrice: number;
  stock: number;
  images?: string[];
}

export type CartAddStatus = 'added' | 'no-stock' | 'max-reached';
