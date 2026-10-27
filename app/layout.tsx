import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// ============================================
//   Font Setup
// ============================================

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

// ============================================
//   Viewport Configuration (Prevents Mobile Zoom-Out & Overflow)
// ============================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#008fa8',
};

// ============================================
//   Root Metadata
// ============================================

export const metadata: Metadata = {
  metadataBase: new URL('https://topinstock.ro'),
  alternates: {
    canonical: 'https://topinstock.ro',
  },
  title: {
    default: 'TOPinStock — Marketplace România',
    template: '%s | TOPinStock',
  },
  description:
    'TOPinStock (topinstock.ro) este marketplace-ul de încredere al României, conectând mii de vânzători verificați cu milioane de cumpărători. Produse originale din stoc, prețuri competitive, livrare rapidă.',
  keywords: [
    'topinstock',
    'topinstock.ro',
    'top in stock',
    'topinstock romania',
    'marketplace romania',
    'cumpărături online',
    'magazin online romania',
  ],
  authors: [{ name: 'TOPinStock' }],
  creator: 'TOPinStock S.R.L.',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://topinstock.ro',
    siteName: 'TOPinStock',
    title: 'TOPinStock — Marketplace România',
    description:
      'Cumpără online din mii de produse originale la prețuri competitive cu livrare rapidă.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import ClientCartDrawer from '@/components/cart/ClientCartDrawer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { SEOManager } from '@/lib/seo';

// ============================================
//   Root Layout
// ============================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteOrgJsonLd = SEOManager.getHomepageJsonLd();

  return (
    <html lang="ro" className={`${inter.variable} overflow-x-hidden max-w-full`} data-scroll-behavior="smooth">
      <head>
        {/* ── Schema.org WebSite & Organization JSON-LD in <head> for Googlebot & Sitelinks Searchbox (eMAG standard) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteOrgJsonLd) }}
        />
      </head>
      <body className={`${inter.className} pb-16 md:pb-0 overflow-x-hidden max-w-full relative`}>
        {/* Global announcement bar */}
        <TopBar />
        {/* Sticky header + category mega menu */}
        <Header />
        {/* Slide-over Cart Drawer (Client dynamic import, deferred) */}
        <ClientCartDrawer />
        {/* Page content */}
        {children}
        {/* Sticky Mobile Bottom Navigation Bar (Hidden on desktop) */}
        <MobileBottomNav />
        {/* Site footer */}
        <Footer />
      </body>
    </html>
  );
}

