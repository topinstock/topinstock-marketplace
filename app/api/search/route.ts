import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache recent autocomplete queries for 60 seconds
const searchCache = new Map<string, { timestamp: number; results: any[] }>();
const SEARCH_CACHE_TTL = 60 * 1000;

// GET /api/search?q=query&limit=5
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '6', 10), 12);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = `${q.toLowerCase()}:${limit}`;
  const now = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.timestamp < SEARCH_CACHE_TTL) {
    return NextResponse.json({ results: cached.results, query: q, cached: true });
  }

  try {
    const words = q.split(/\s+/).filter(Boolean);
    const searchWhere: any = {
      isPublished: true,
    };

    if (words.length === 1) {
      searchWhere.OR = [
        { title: { contains: words[0] } },
        { sku: { contains: words[0] } },
      ];
    } else if (words.length > 1) {
      searchWhere.AND = words.map((w) => ({
        OR: [
          { title: { contains: w } },
          { sku: { contains: w } },
        ],
      }));
    }

    const products = await prisma.product.findMany({
      where: searchWhere,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        originalPrice: true,
        images: true,
        stock: true,
        rating: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const results = products.map((p) => {
      let images: string[] = [];
      try {
        images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images ?? [];
      } catch {
        images = [];
      }

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        image: images[0] ?? '/images/product_laptop.jpg',
        category: p.category?.name ?? null,
        categorySlug: p.category?.slug ?? null,
        stock: p.stock,
        rating: Number(p.rating),
      };
    });

    searchCache.set(cacheKey, { timestamp: now, results });
    return NextResponse.json({ results, query: q });
  } catch (err) {
    console.error('[search] DB error:', err);
    return NextResponse.json({ results: [], error: 'Eroare la căutare' }, { status: 500 });
  }
}
