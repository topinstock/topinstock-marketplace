import { Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import type { CatalogProduct } from '@/lib/products';

interface RelatedProductsProps {
  products: CatalogProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Produse similare recomandate
            </h2>
            <p className="text-xs text-gray-500">
              Alte articole populare din aceeași categorie care ți-ar putea plăcea
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {products.map((product, idx) => (
          <ProductCard key={product.id} product={product} index={idx} />
        ))}
      </div>
    </div>
  );
}
