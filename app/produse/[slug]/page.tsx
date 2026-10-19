import { notFound, permanentRedirect } from 'next/navigation';
import { getProductByCodeOrSlug } from '@/lib/products';
import { SEOManager } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface LegacyProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ── Redirecționare Permanentă 308/301 către URL-ul canonic eMAG PDP ──
// /produse/[slug] -> /[slug]/pd/[code]/
export default async function LegacyProductDetailPage({ params }: LegacyProductDetailPageProps) {
  const resolvedParams = await params;
  const product = await getProductByCodeOrSlug(resolvedParams.slug);

  if (!product || !product.isPublished) {
    notFound();
  }

  // Redirecționare 308 (permanentă) conform standardelor eMAG & Googlebot
  permanentRedirect(SEOManager.buildProductUrl(product));
}
