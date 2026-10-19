import type { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo';

// ============================================
//   robots.txt — Technical SEO & Crawl Budget Protection
//   - Disallow internal search (/search, ?q=, ?search=)
//   - Disallow infinite faceted filter permutations (*?*sort=, *?*minPrice=, etc.)
//   - Disallow admin, checkout, cart, customer account, and API routes
//   - Point directly to the root sitemap index (/sitemap.xml)
// ============================================

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.baseUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',
          '/_next/image/',
          '/images/',
          '/*.css$',
          '/*.js$',
          '/*.webp$',
          '/*.jpg$',
          '/*.jpeg$',
          '/*.png$',
          '/*.svg$',
        ],
        disallow: [
          // Admin & Vendor Portals
          '/admin',
          '/admin/',
          '/admin/*',
          '/vanzator/login',
          '/vanzator/apply',
          '/vanzator/admin/',
          '/vanzator/admin/*',

          // API Routes
          '/api/',
          '/api/*',

          // Cart & Checkout Transaction Flows
          '/cos',
          '/cos/',
          '/checkout',
          '/checkout/',
          '/checkout/*',
          '/comanda-plasata/',
          '/comanda-plasata/*',

          // User Account & Wishlist
          '/cont',
          '/cont/',
          '/cont/*',
          '/favorite',
          '/favorite/',

          // Internal Search Results (eMAG standard)
          '/search',
          '/search/',
          '/search/*',

          // Faceted Navigation & Query Filter Permutations (Crawl Budget Defense)
          // Wildcard /*?* catches parameters whether they appear first (?param=) or subsequent (&param=)
          '/*?*sort=',
          '/*?*minPrice=',
          '/*?*maxPrice=',
          '/*?*price=',
          '/*?*sizes=',
          '/*?*inStock=',
          '/*?*onSale=',
          '/*?*page=',
          '/*?*search=',
          '/*?*q=',
          '/*?*filter=',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
