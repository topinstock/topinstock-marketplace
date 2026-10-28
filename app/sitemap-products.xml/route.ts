import { NextRequest, NextResponse } from 'next/server';
import { SEOManager, SEO_CONFIG } from '@/lib/seo';
import sitemapProducts from '@/lib/data/all_products_sitemap.json';

// ============================================
//   Paginated Products Sitemap (/sitemap-products.xml)
//   - Supports ?page=1..6 or /sitemap-products-1..6.xml rewrite
//   - Fixed page size: 5,000 URLs (prevents timeouts & memory exhaustion)
//   - Covers all 28,074 products
// ============================================

export const revalidate = 86400; // Cache on Edge CDN for 24 hours

export const PRODUCTS_PER_SITEMAP = 5000;

export async function GET(request: NextRequest) {
  const baseUrl = SEO_CONFIG.baseUrl;
  const searchParams = request.nextUrl.searchParams;
  const rawPage = searchParams.get('page');

  try {
    const totalProducts = (sitemapProducts as any[]).length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP));

    // If no page is specified and we have multiple pages, return sub-sitemapindex
    if (!rawPage && totalPages > 1) {
      const now = new Date().toISOString();
      const sitemapEntries = Array.from(
        { length: totalPages },
        (_, i) => `  <sitemap>
    <loc>${baseUrl}/sitemap-products-${i + 1}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
      ).join('\n');

      const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

      return new NextResponse(indexXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        },
      });
    }

    const currentPage = Math.min(
      totalPages,
      Math.max(1, parseInt(rawPage || '1', 10) || 1)
    );
    const skip = (currentPage - 1) * PRODUCTS_PER_SITEMAP;

    // Fast static lookup: sitemapProducts contains all 28,074 active products in memory
    // Instant ~10ms generation with 0 database roundtrips & 0 timeout risk
    const slice = (sitemapProducts as any[]).slice(skip, skip + PRODUCTS_PER_SITEMAP);
    const products = slice.map((p) => ({
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      updatedAt: p.u || '2026-10-28',
    }));

    const nowIso = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .map((p) => {
    const relativeUrl = SEOManager.buildProductUrl({
      slug: p.slug,
      sku: p.sku,
      id: p.id,
    });
    const loc = `${baseUrl}${relativeUrl}`.replace(/&/g, '&amp;');
    const lastmod = p.updatedAt ? (p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt)) : nowIso;

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating products sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
