import { permanentRedirect } from 'next/navigation';
import { SEOManager } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface LegacyVendorPageProps {
  params: Promise<{ slug: string }>;
}

// ── Redirecționare Permanentă 308/301 către URL-ul canonic eMAG Seller ──
// /vanzator/[slug] -> /seller/[slug]/v
export default async function LegacyVendorPage({ params }: LegacyVendorPageProps) {
  const resolvedParams = await params;
  permanentRedirect(SEOManager.buildSellerUrl(resolvedParams.slug));
}
