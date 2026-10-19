'use client';

import React, { createContext, useContext, useTransition, useRef, useCallback } from 'react';

interface CatalogLoadingContextType {
  isPending: boolean;
  startCatalogTransition: (callback: () => void) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
  scrollToGridTop: () => void;
}

const CatalogLoadingContext = createContext<CatalogLoadingContextType>({
  isPending: false,
  startCatalogTransition: (cb) => cb(),
  gridRef: { current: null },
  scrollToGridTop: () => {},
});

export function CatalogLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const scrollToGridTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      // If user has scrolled down past the top of the grid (with 120px offset for headers)
      if (rect.top < 100) {
        gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const startCatalogTransition = useCallback(
    (callback: () => void) => {
      scrollToGridTop();
      startTransition(() => {
        callback();
      });
    },
    [scrollToGridTop]
  );

  return (
    <CatalogLoadingContext.Provider
      value={{
        isPending,
        startCatalogTransition,
        gridRef,
        scrollToGridTop,
      }}
    >
      {children}
    </CatalogLoadingContext.Provider>
  );
}

export function useCatalogLoading() {
  return useContext(CatalogLoadingContext);
}
