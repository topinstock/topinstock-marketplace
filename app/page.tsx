import type { Metadata } from 'next';
import { SEOManager } from '@/lib/seo';
import HeroSection from '@/components/home/HeroSection';
import AdvantagesStrip from '@/components/home/AdvantagesStrip';
import CategoryPills from '@/components/home/CategoryPills';
import { getSeasonalSections } from '@/lib/seasonal';
import SeasonalSection from '@/components/home/SeasonalSection';
import TopBrandsSection from '@/components/home/TopBrandsSection';
import VendorBanner from '@/components/home/VendorBanner';

export const metadata: Metadata = {
  title: 'TOPinStock — Marketplace România | Cumpărături Online Rapide',
  description:
    'TOPinStock (topinstock.ro) este marketplace-ul modern al României. Comandă online decorațiuni de Crăciun, oale și ustensile de bucătărie, cadouri pentru copii și electrocasnice cu livrare rapidă din stoc.',
  keywords: [
    'topinstock',
    'topinstock.ro',
    'top in stock',
    'topinstock romania',
    'marketplace romania',
    'cumparaturi online romania',
  ],
  alternates: {
    canonical: 'https://topinstock.ro',
  },
};

export default async function HomePage() {
  const seasonalSections = await getSeasonalSections();

  return (
    <main className="min-h-screen bg-slate-50/70 pb-12">
      {/* 1. Hero Carousel + Campaign side-banners */}
      <HeroSection />

      {/* 2. Trust signals & Advantages strip */}
      <AdvantagesStrip />

      {/* 3. Category navigation showcase */}
      <CategoryPills />

      {/* 4. Section 1: Magia Sărbătorilor: Instalații & Decoruri de Crăciun */}
      {seasonalSections[0] && <SeasonalSection section={seasonalSections[0]} />}

      {/* 5. Section 2: Pregătiri de Sărbători: Bucătărie, Cârnați & Cozonaci */}
      {seasonalSections[1] && <SeasonalSection section={seasonalSections[1]} />}

      {/* 6. Section 3: Fabrica de Cadouri: Jucării pentru Moș Nicolae & Crăciun */}
      {seasonalSections[2] && <SeasonalSection section={seasonalSections[2]} />}

      {/* 7. Section 4: Electrocasnice & Confort de Iarnă */}
      {seasonalSections[3] && <SeasonalSection section={seasonalSections[3]} />}

      {/* 8. Top Official Brands showcase */}
      <TopBrandsSection />

      {/* 9. Vendor registration call-to-action banner */}
      <VendorBanner />
    </main>
  );
}
