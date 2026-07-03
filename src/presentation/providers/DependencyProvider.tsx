import { createContext, useContext, type ReactNode } from 'react';
import { getInfrastructure, type Infrastructure } from '../../infrastructure/index.ts';

const DependencyContext = createContext<Infrastructure | null>(null);

export function DependencyProvider({ children }: { children: ReactNode }) {
  const infrastructure = getInfrastructure();

  return (
    <DependencyContext.Provider value={infrastructure}>{children}</DependencyContext.Provider>
  );
}

export function useInfrastructure(): Infrastructure {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useInfrastructure debe usarse dentro de DependencyProvider');
  }
  return context;
}

export function useApplication() {
  return useInfrastructure().application;
}
