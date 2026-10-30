import type { Metadata } from 'next';
import JomaClubPageClient from '@/components/cluburi/JomaClubPageClient';

export const metadata: Metadata = {
  title: 'Echipamente & Treninguri Joma pentru Cluburi de Fotbal | Comandă Minim 8 Bucăți | TOPinStock',
  description:
    'Echipamente complete și treninguri oficiale Joma pentru cluburi și academii de fotbal. Comandă pe proiect de minimum 8 bucăți per model, preț la cerere, personalizare cu stemă și numere inclusă.',
  keywords: [
    'treninguri joma cluburi',
    'echipamente joma fotbal',
    'trening joma comanda echipe',
    'joma academy iv fotbal',
    'joma championship vii',
    'treninguri fotbal personalizate',
    'echipamente sportive cluburi romania',
    'topinstock joma cluburi',
  ],
  alternates: {
    canonical: 'https://topinstock.ro/cluburi-fotbal',
  },
  openGraph: {
    title: 'Treninguri Oficiale Joma pentru Cluburi de Fotbal — TOPinStock',
    description: 'Comandă minim 8 bucăți per model. Personalizare stemă club & numere. Preț direct de producător la cerere.',
    url: 'https://topinstock.ro/cluburi-fotbal',
    siteName: 'TOPinStock',
    images: [
      {
        url: 'https://topinstock.ro/images/banners/banner-joma-cluburi.jpg',
        width: 1280,
        height: 540,
        alt: 'Treninguri Joma pentru Cluburi de Fotbal',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
};

export default function CluburiFotbalPage() {
  return <JomaClubPageClient />;
}

