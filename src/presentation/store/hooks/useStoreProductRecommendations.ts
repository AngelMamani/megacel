import { useEffect, useMemo, useState } from 'react';
import type { Brand } from '../../../domain/entities/Brand.ts';
import type { Product } from '../../../domain/entities/Product.ts';
import { PickRelatedProducts } from '../../../domain/services/ProductRecommendationPolicy.ts';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';

export const useStoreProductRecommendations = (currentProduct: Product | null) => {
  const { repositories } = useInfrastructure();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let productsReady = false;
    let brandsReady = false;

    const TryFinish = () => {
      if (productsReady && brandsReady) setIsLoading(false);
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

    const unsubBrands = repositories.brand.subscribe(
      (items) => {
        setBrands(items);
        brandsReady = true;
        TryFinish();
      },
      () => {
        setBrands([]);
        brandsReady = true;
        TryFinish();
      }
    );

    return () => {
      unsubProducts();
      unsubBrands();
    };
  }, [repositories.brand, repositories.product]);

  const recommendations = useMemo(() => {
    if (!currentProduct) return [];
    return PickRelatedProducts(currentProduct, products);
  }, [currentProduct, products]);

  const brandMap = useMemo(
    () => new Map(brands.map((brand) => [brand.id, brand.name])),
    [brands]
  );

  return {
    recommendations,
    brandMap,
    isLoading,
  };
};
