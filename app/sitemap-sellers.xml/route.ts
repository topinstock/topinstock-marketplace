import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOManager, SEO_CONFIG } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = SEO_CONFIG.baseUrl;

  try {
    const vendors = await prisma.vendor.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${vendors
  .map((v) => {
    const relativeUrl = SEOManager.buildSellerUrl(v.slug);
    const loc = `${baseUrl}${relativeUrl}`;
    const lastmod = v.updatedAt ? v.updatedAt.toISOString() : new Date().toISOString();

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
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: { 'Content-Type': 'application/xml' } }
    );
  }
}
