import { useEffect, useState } from 'react';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { Brand } from '../../../domain/entities/Brand.ts';

/** Suscripción a marcas activas para la tienda (capa presentation). */
export const useStoreBrands = () => {
  const { repositories } = useInfrastructure();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = repositories.brand.subscribe(
      (items) => {
        const active = items
          .filter((item) => item.isActive)
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setBrands(active);
        setIsLoading(false);
      },
      () => {
        setBrands([]);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [repositories.brand]);

  return { brands, isLoading };
};
