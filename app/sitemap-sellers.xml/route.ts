import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOManager, SEO_CONFIG } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = SEO_CONFIG.baseUrl;
  const now = new Date().toISOString();

  try {
    let vendors: Array<{ slug: string; updatedAt?: Date | null }> = [];
    try {
      vendors = await prisma.vendor.findMany({
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch {
      vendors = [{ slug: 'topinstock-oficial', updatedAt: new Date() }];
    }

    if (!vendors || vendors.length === 0) {
      vendors = [{ slug: 'topinstock-oficial', updatedAt: new Date() }];
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${vendors
  .map((v) => {
    const relativeUrl = SEOManager.buildSellerUrl(v.slug);
    const loc = `${baseUrl}${relativeUrl}`;
    const lastmod = v.updatedAt ? new Date(v.updatedAt).toISOString() : now;

    return `  <url>
    <loc>${loc.replace(/&/g, '&amp;')}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error('Error generating sellers sitemap:', err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}${SEOManager.buildSellerUrl('topinstock-oficial')}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
}
