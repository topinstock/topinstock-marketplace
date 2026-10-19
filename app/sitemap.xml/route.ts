import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEO_CONFIG } from '@/lib/seo';

// ============================================
//   Sitemap Index (/sitemap.xml)
//   - Splits 40,000+ products into lightweight, fast chunks (5,000 URLs / chunk)
//   - Prevents timeouts and memory overflow
//   - Fully compliant with Google & Bing Sitemap 0.9 protocol
// ============================================

export const dynamic = 'force-dynamic';

export const PRODUCTS_PER_SITEMAP = 5000;

export async function GET() {
  const baseUrl = SEO_CONFIG.baseUrl;
  const now = new Date().toISOString();

  try {
    const totalProducts = await prisma.product.count({
      where: { isPublished: true },
    });

    const totalProductSitemaps = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP));

    const sitemapEntries = [
      `  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
      `  <sitemap>
    <loc>${baseUrl}/sitemap-sellers.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
    ];

    for (let i = 1; i <= totalProductSitemaps; i++) {
      sitemapEntries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap-products-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-sellers.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-products-1.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
