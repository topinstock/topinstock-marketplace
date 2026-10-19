import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ProductCreateForm from '@/components/admin/ProductCreateForm';

export interface DraftProduct {
  title?: string;
  description?: string;
  brand?: string;
  price?: number;
  originalPrice?: number | null;
  stock?: number;
  sku?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  categorySlug?: string;
  material?: string;
  warranty?: string;
  weight?: string;
  features?: string[];
  sourceUrl?: string | null;
}

function parseDraftFromParam(encoded?: string): DraftProduct | null {
  if (!encoded) return null;
  try {
    const json = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}

export default async function NewProductPage(props: {
  searchParams?: Promise<{ draft?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const draft = parseDraftFromParam(searchParams?.draft);
  const session = await getSession();

  let categories: { id: string; name: string; slug: string; parentId: string | null }[] = [];
  let vendors: { id: string; storeName: string }[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (session?.role === 'ADMIN') {
      vendors = await prisma.vendor.findMany({
        select: { id: true, storeName: true },
      });
    }
  } catch (e) {
    console.error('Failed to load categories/vendors:', e);
  }

  let draftCategoryId = '';
  if (draft?.categorySlug && categories.length > 0) {
    const targetSlug = draft.categorySlug.toLowerCase();
    const match = categories.find(
      (c) =>
        c.slug.toLowerCase() === targetSlug ||
        c.slug.toLowerCase().includes(targetSlug) ||
        targetSlug.includes(c.slug.toLowerCase())
    );
    draftCategoryId = match?.id || categories[0]?.id || '';
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-blue-900 transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Panou Vânzător
          </Link>
          <span>/</span>
          <Link href="/admin/importer" className="hover:text-blue-900 transition-colors">
            Chat Importer
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Adăugare Produs</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Adaugă Produs Nou
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Completează și verifică toate detaliile înainte de publicare.
            </p>
          </div>
          {draft && (
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Sparkles size={14} className="text-orange-500" />
              Date pre-completate din AI Importer
            </div>
          )}
        </div>
      </div>

      <ProductCreateForm
        categories={categories}
        vendors={vendors}
        sessionRole={session?.role || 'VENDOR'}
        currentVendorId={session?.vendorId || ''}
        initialData={
          draft
            ? {
                title: draft.title || '',
                description: draft.description || '',
                brand: draft.brand || '',
                price: draft.price ? String(draft.price) : '',
                originalPrice: draft.originalPrice ? String(draft.originalPrice) : '',
                stock: draft.stock ? String(draft.stock) : '',
                sku: draft.sku || '',
                images: draft.images || [],
                sizes: draft.sizes || [],
                colors: draft.colors || [],
                categoryId: draftCategoryId,
                material: draft.material || '',
                warranty: draft.warranty || '',
                weight: draft.weight || '',
                features: draft.features || [],
                sourceUrl: draft.sourceUrl || '',
              }
            : undefined
        }
      />
    </div>
  );
}
