/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/:slug/c',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:slug/pd/:code',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/produse',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap-products-:page.xml',
        destination: '/sitemap-products.xml?page=:page',
      },
    ];
  },
};

module.exports = nextConfig;
