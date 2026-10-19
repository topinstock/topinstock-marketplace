import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink, ShieldCheck, Store, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { safeJsonParse } from '@/lib/utils';
import ProductEditForm from '@/components/admin/ProductEditForm';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session || (session.role !== 'ADMIN' && session.role !== 'VENDOR')) {
    redirect('/admin/login');
  }

  const rawProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      vendor: { select: { id: true, storeName: true, slug: true } },
    },
  });

  if (!rawProduct) {
    notFound();
  }

  // Authorization check for vendors
  if (session.role === 'VENDOR' && rawProduct.vendorId !== session.vendorId) {
    redirect('/admin');
  }

  // Fetch categories and vendors
  let categories: { id: string; name: string; slug: string; parentId: string | null }[] = [];
  let vendors: { id: string; storeName: string }[] = [];

  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (session.role === 'ADMIN') {
      vendors = await prisma.vendor.findMany({
        orderBy: { storeName: 'asc' },
        select: { id: true, storeName: true },
      });
    }
  } catch (err) {
    console.error('Error fetching categories/vendors for edit page:', err);
  }

  const images = safeJsonParse<string[]>(rawProduct.images, ['/images/product_laptop.jpg']);
  const sizes = safeJsonParse<string[]>(rawProduct.sizes, []);
  const colors = safeJsonParse<string[]>(rawProduct.colors, []);
  const attributes = safeJsonParse<any>(rawProduct.attributes, {});

  const formattedProduct = {
    id: rawProduct.id,
    title: rawProduct.title,
    slug: rawProduct.slug,
    description: rawProduct.description,
    price: Number(rawProduct.price),
    originalPrice: rawProduct.originalPrice ? Number(rawProduct.originalPrice) : null,
    stock: rawProduct.stock,
    sku: rawProduct.sku,
    images: images.length > 0 ? images : ['/images/product_laptop.jpg'],
    sizes,
    colors,
    attributes,
    isPublished: rawProduct.isPublished,
    categoryId: rawProduct.categoryId,
    vendorId: rawProduct.vendorId,
    category: rawProduct.category,
    vendor: rawProduct.vendor,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link
            href="/admin"
            className="hover:text-blue-900 transition-colors flex items-center gap-1 font-semibold"
          >
            <ArrowLeft size={13} /> Panou Produse
          </Link>
          <span>/</span>
          <span className="text-gray-400">Editare Produs</span>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{rawProduct.title}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Editare Produs
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Modifică prețul, galeria de poze, stocul și detaliile produsului direct în catalogul TOPinStock.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/produse/${rawProduct.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors border border-blue-200/60"
            >
              <ExternalLink size={14} />
              <span>Previzualizează pe site</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <ProductEditForm
        product={formattedProduct}
        categories={categories}
        vendors={vendors}
        sessionRole={session.role}
      />
    </div>
  );
}
