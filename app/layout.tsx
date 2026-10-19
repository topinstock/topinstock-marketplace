import type { Metadata } from 'next';
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
//   Root Metadata
// ============================================

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://topinstock.ro'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'TOPinStock — Marketplace România',
    template: '%s | TOPinStock',
  },
  description:
    'TOPinStock este marketplace-ul de încredere al României, conectând mii de vânzători verificați cu milioane de cumpărători. Produse de calitate, prețuri competitive, livrare rapidă.',
  keywords: [
    'marketplace',
    'cumpărături online',
    'România',
    'electronice',
    'modă',
    'TOPinStock',
  ],
  authors: [{ name: 'TOPinStock' }],
  creator: 'TOPinStock S.R.L.',
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TOPinStock',
    title: 'TOPinStock — Marketplace România',
    description:
      'Produse de la mii de vânzători verificați, la prețuri excelente.',
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
    <html lang="ro" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        {/* ── Schema.org WebSite & Organization JSON-LD in <head> for Googlebot & Sitelinks Searchbox (eMAG standard) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteOrgJsonLd) }}
        />
      </head>
      <body className={`${inter.className} pb-16 md:pb-0`}>
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

