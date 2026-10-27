import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEO_CONFIG } from '@/lib/seo';
import sitemapProducts from '@/lib/data/all_products_sitemap.json';

// ============================================
//   Sitemap Index (/sitemap.xml)
//   - Covers all 28,074 products across 6 lightweight sitemaps (5,000 URLs / chunk)
//   - Includes categories sitemap and sellers sitemap
//   - Fully compliant with Google & Bing Sitemap 0.9 protocol
// ============================================

export const dynamic = 'force-dynamic';

export const PRODUCTS_PER_SITEMAP = 5000;

export async function GET() {
  const baseUrl = SEO_CONFIG.baseUrl;
  const now = new Date().toISOString();

  try {
    let totalProducts = 0;
    try {
      totalProducts = await prisma.product.count({
        where: { isPublished: true },
      });
    } catch {
      totalProducts = (sitemapProducts as any[]).length;
    }

    if (!totalProducts) {
      totalProducts = (sitemapProducts as any[]).length;
    }

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
    const totalProductSitemaps = Math.max(1, Math.ceil((sitemapProducts as any[]).length / PRODUCTS_PER_SITEMAP));
    const entries = [
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
      entries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap-products-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
    }

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;

    return new NextResponse(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
