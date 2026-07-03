import { useEffect, useMemo, useState } from 'react';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { Product } from '../../../domain/entities/Product.ts';
import type { Order } from '../../../domain/entities/Order.ts';
import { CountsTowardSoldTotal } from '../../../domain/services/ProductSoldCountPolicy.ts';

const NEW_ARRIVALS_LIMIT = 3;
const BESTSELLERS_LIMIT = 5;

const GetProductCreatedTime = (product: Product) => {
  if (!product.createdAt) return 0;
  const time = new Date(product.createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
};

/** Productos activos ordenados por fecha de creación (los más recién agregados). */
const PickNewArrivals = (products: Product[]) => {
  const newest = products
    .filter((product) => GetProductCreatedTime(product) > 0)
    .sort((a, b) => GetProductCreatedTime(b) - GetProductCreatedTime(a));

  if (newest.length > 0) {
    return newest.slice(0, NEW_ARRIVALS_LIMIT);
  }

  return products.slice(0, NEW_ARRIVALS_LIMIT);
};

/** Respaldo histórico por pedidos hasta que soldCount esté completo en Firebase. */
const BuildSoldCountMapFromOrders = (orders: Order[]) => {
  const counts = new Map<string, number>();

  orders
    .filter((order) => CountsTowardSoldTotal(order.status))
    .forEach((order) => {
      order.orderItems?.forEach((item) => {
        if (!item.id) return;
        counts.set(item.id, (counts.get(item.id) || 0) + item.quantity);
      });
    });

  return counts;
};

const GetEffectiveSoldCount = (product: Product, orderCounts: Map<string, number>) =>
  Math.max(product.soldCount ?? 0, orderCounts.get(product.id) ?? 0);

/** Productos con más unidades vendidas (soldCount en Firebase + respaldo por pedidos). */
const PickBestSellers = (products: Product[], orderCounts: Map<string, number>) => {
  const ranked = [...products].sort((a, b) => {
    const soldA = GetEffectiveSoldCount(a, orderCounts);
    const soldB = GetEffectiveSoldCount(b, orderCounts);

    if (soldA !== soldB) return soldB - soldA;

    const discountA = a.discountPercentage || a.discount || 0;
    const discountB = b.discountPercentage || b.discount || 0;
    if (discountA !== discountB) return discountB - discountA;

    return b.finalPrice - a.finalPrice;
  });

  return ranked.slice(0, BESTSELLERS_LIMIT);
};

export const useStoreHomeProducts = () => {
  const { repositories } = useInfrastructure();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let productsReady = false;
    let ordersReady = false;

    const TryFinish = () => {
      if (productsReady && ordersReady) setIsLoading(false);
    };

    const unsubProducts = repositories.product.subscribe(
      (items) => {
        setProducts(items.filter((item) => item.status === 'activo'));
        productsReady = true;
        TryFinish();
      },
      () => {
        setProducts([]);
        productsReady = true;
        TryFinish();
      }
    );

    const unsubOrders = repositories.order.subscribe(
      (items) => {
        setOrders(items);
        ordersReady = true;
        TryFinish();
      },
      () => {
        setOrders([]);
        ordersReady = true;
        TryFinish();
      }
    );

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [repositories.product, repositories.order]);

  const orderSoldCounts = useMemo(() => BuildSoldCountMapFromOrders(orders), [orders]);

  const newArrivals = useMemo(() => PickNewArrivals(products), [products]);
  const bestSellers = useMemo(
    () => PickBestSellers(products, orderSoldCounts),
    [products, orderSoldCounts]
  );

  return { newArrivals, bestSellers, isLoading };
};
