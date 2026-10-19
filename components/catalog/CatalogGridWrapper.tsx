'use client';

import React from 'react';
import { useCatalogLoading } from './CatalogLoadingContext';
import ProductGridSkeleton from './ProductGridSkeleton';

interface CatalogGridWrapperProps {
  children: React.ReactNode;
  count?: number;
}

export default function CatalogGridWrapper({ children, count = 8 }: CatalogGridWrapperProps) {
  const { isPending, gridRef } = useCatalogLoading();

  return (
    <div ref={gridRef} id="catalog-grid-top" className="scroll-mt-24">
      {isPending ? (
        <ProductGridSkeleton count={count} />
      ) : (
        children
      )}
    </div>
  );
}
