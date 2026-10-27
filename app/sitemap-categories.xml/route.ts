import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEOManager, SEO_CONFIG } from '@/lib/seo';
import categoriesFallback from '@/lib/data/categories_catalog_fallback.json';
import productsFallback from '@/lib/data/products_catalog_fallback.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = SEO_CONFIG.baseUrl;
  const now = new Date().toISOString();

  try {
    // 1. Fetch all categories (Prisma with instant fallback)
    let categories: Array<{ slug: string }> = [];
    try {
      categories = await prisma.category.findMany({
        select: { slug: true },
      });
    } catch {
      categories = (categoriesFallback as any[]).map((c) => ({ slug: c.slug }));
    }

    if (!categories || categories.length === 0) {
      categories = (categoriesFallback as any[]).map((c) => ({ slug: c.slug }));
    }

    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

    // Main Category URLs
    for (const cat of categories) {
      urls.push({
        loc: `${baseUrl}${SEOManager.buildCategoryUrl(cat.slug)}`,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.9',
      });
    }

    // 2. Fetch popular brands per category for faceted indexable URLs
    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: { isPublished: true },
        select: {
          categoryId: true,
          category: { select: { slug: true } },
          attributes: true,
          title: true,
        },
        take: 2000,
      });
    } catch {
      products = (productsFallback as any[]).map((p) => ({
        categoryId: p.categoryId,
        category: { slug: p.category?.slug },
        attributes: p.attributes,
        title: p.title,
      }));
    }

    if (!products || products.length === 0) {
      products = (productsFallback as any[]).map((p) => ({
        categoryId: p.categoryId,
        category: { slug: p.category?.slug },
        attributes: p.attributes,
        title: p.title,
      }));
    }

    const categoryBrandSet = new Set<string>();

    for (const p of products) {
      const catSlug = p.category?.slug;
      if (!catSlug) continue;

      const brand = SEOManager.extractBrand(p as any);
      const brandSlug = SEOManager.toBrandSlug(brand);

      if (brand && brandSlug && brandSlug !== 'topinstock') {
        const key = `${catSlug}:::${brandSlug}`;
        if (!categoryBrandSet.has(key)) {
          categoryBrandSet.add(key);
          urls.push({
            loc: `${baseUrl}${SEOManager.buildFacetedCategoryUrl({ categorySlug: catSlug, brandSlug })}`,
            lastmod: now,
            changefreq: 'weekly',
            priority: '0.8',
          });
        }
      }
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc.replace(/&/g, '&amp;')}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('Error generating categories sitemap:', err);
    // Even in catastrophic error, return a valid 200 with fallback categories
    const fallbackUrls = (categoriesFallback as any[]).slice(0, 100).map((c) => `  <url>
    <loc>${baseUrl}${SEOManager.buildCategoryUrl(c.slug)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackUrls}
</urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
}
