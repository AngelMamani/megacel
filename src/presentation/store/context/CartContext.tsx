import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CartAddProductInput, CartAddStatus, CartItem } from '../types/CartTypes.ts';

const CART_STORAGE_KEY = 'mega_cel_cart';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  justAdded: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: CartAddProductInput, quantity?: number) => CartAddStatus;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const ResolveStock = (stock: number | string | null | undefined) => {
  const value = Number(stock);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
};

const SanitizeCartItem = (item: CartItem): CartItem | null => {
  if (!item?.productId) return null;

  const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
  if (quantity <= 0) return null;

  return {
    productId: item.productId,
    sku: item.sku ?? '',
    name: item.name ?? 'Producto',
    price: Number(item.price) || 0,
    image: item.image,
    quantity,
    maxStock: ResolveStock(item.maxStock),
  };
};

const LoadStoredCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => SanitizeCartItem(item))
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
};

const MapProductToCartItem = (product: CartAddProductInput, quantity: number): CartItem => ({
  productId: product.id,
  sku: product.sku,
  name: product.name,
  price: product.finalPrice,
  image: product.images?.[0],
  quantity,
  maxStock: ResolveStock(product.stock),
});

const BuildNextCartItems = (
  prev: CartItem[],
  product: CartAddProductInput,
  safeQty: number,
  stock: number
): CartItem[] | null => {
  const existing = prev.find((item) => item.productId === product.id);
  const currentQty = existing?.quantity ?? 0;
  const nextQty = Math.min(currentQty + safeQty, stock);

  if (nextQty <= currentQty) return null;

  if (existing) {
    return prev.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: nextQty, maxStock: stock, price: product.finalPrice }
        : item
    );
  }

  return [...prev, MapProductToCartItem(product, Math.min(safeQty, stock))];
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => LoadStoredCart());
  const [isOpen, setIsOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const ItemsRef = useRef(items);

  useEffect(() => {
    ItemsRef.current = items;
  }, [items]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1200);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((product: CartAddProductInput, quantity = 1): CartAddStatus => {
    const stock = ResolveStock(product.stock);
    if (stock <= 0) return 'no-stock';

    const safeQty = Math.max(1, Math.floor(quantity));
    const prev = ItemsRef.current;
    const existing = prev.find((item) => item.productId === product.id);
    const currentQty = existing?.quantity ?? 0;
    const nextQty = Math.min(currentQty + safeQty, stock);

    if (nextQty <= currentQty) {
      return currentQty > 0 ? 'max-reached' : 'no-stock';
    }

    const nextItems = BuildNextCartItems(prev, product, safeQty, stock);
    if (!nextItems) {
      return currentQty > 0 ? 'max-reached' : 'no-stock';
    }

    ItemsRef.current = nextItems;
    setItems(nextItems);
    setJustAdded(true);
    return 'added';
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.productId !== productId);
      ItemsRef.current = next;
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = Math.max(1, Math.min(Math.floor(quantity), item.maxStock));
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0);

      ItemsRef.current = next;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    ItemsRef.current = [];
    setItems([]);
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isOpen,
      justAdded,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isOpen,
      justAdded,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
