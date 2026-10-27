import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOManager, SEO_CONFIG } from '@/lib/seo';
import productsFallback from '@/lib/data/products_catalog_fallback.json';

// ============================================
//   Paginated Products Sitemap (/sitemap-products.xml)
//   - Supports ?page=1, ?page=2 or /sitemap-products-1.xml rewrite
//   - Fixed page size: 5,000 URLs (prevents timeouts & memory exhaustion)
//   - Indexed primary key scan for instant (<100ms) generation
// ============================================

export const dynamic = 'force-dynamic';

export const PRODUCTS_PER_SITEMAP = 5000;

export async function GET(request: NextRequest) {
  const baseUrl = SEO_CONFIG.baseUrl;
  const searchParams = request.nextUrl.searchParams;
  const rawPage = searchParams.get('page');

  try {
    let totalProducts = 0;
    try {
      totalProducts = await prisma.product.count({
        where: { isPublished: true },
      });
    } catch {
      totalProducts = (productsFallback as any[]).length;
    }

    if (!totalProducts) {
      totalProducts = (productsFallback as any[]).length;
    }

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
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    const currentPage = Math.min(
      totalPages,
      Math.max(1, parseInt(rawPage || '1', 10) || 1)
    );
    const skip = (currentPage - 1) * PRODUCTS_PER_SITEMAP;

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          slug: true,
          sku: true,
          updatedAt: true,
        },
        orderBy: { id: 'asc' },
        skip,
        take: PRODUCTS_PER_SITEMAP,
      });
    } catch {
      products = (productsFallback as any[]).slice(skip, skip + PRODUCTS_PER_SITEMAP).map((p) => ({
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        updatedAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      }));
    }

    if (!products || products.length === 0) {
      products = (productsFallback as any[]).slice(skip, skip + PRODUCTS_PER_SITEMAP).map((p) => ({
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        updatedAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      }));
    }

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
    const lastmod = p.updatedAt ? (p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date(p.updatedAt).toISOString()) : new Date().toISOString();

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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('Error generating paginated products sitemap:', err);
    const fallbackUrls = (productsFallback as any[]).slice(0, 100).map((p) => {
      const loc = `${baseUrl}${SEOManager.buildProductUrl(p)}`.replace(/&/g, '&amp;');
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('\n');

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackUrls}
</urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
}
