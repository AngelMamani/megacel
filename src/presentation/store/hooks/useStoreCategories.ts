import { useEffect, useState } from 'react';
import { useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { Category } from '../../../domain/entities/Category.ts';

/** Suscripción a categorías activas para la tienda (capa presentation). */
export const useStoreCategories = () => {
  const { repositories } = useInfrastructure();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = repositories.category.subscribe(
      (items) => {
        const active = items
          .filter((item) => item.isActive)
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setCategories(active);
        setIsLoading(false);
      },
      () => {
        setCategories([]);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [repositories.category]);

  return { categories, isLoading };
};
