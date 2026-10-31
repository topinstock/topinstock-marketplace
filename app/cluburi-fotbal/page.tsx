import type { Metadata } from 'next';
import JomaClubPageClient from '@/components/cluburi/JomaClubPageClient';

export const metadata: Metadata = {
  title: 'Distribuitor Oficial Joma | Echipamente & Treninguri pentru Echipe | Minim 10 Comenzi | TOPinStock',
  description:
    'Distribuitor oficial Joma în România. Echipamente complete și treninguri oficiale Joma pentru cluburi de fotbal și academii sportive. Preț la cerere pentru echipe, minim 10 comenzi, personalizare la cerere cu stemă, numere și sponsori.',
  keywords: [
    'distribuitor oficial joma',
    'treninguri joma cluburi',
    'echipamente joma echipe',
    'pret la cerere echipe joma',
    'joma minim 10 comenzi',
    'personalizare echipamente fotbal',
    'joma academy iv',
    'joma championship vii',
    'topinstock joma',
  ],
  alternates: {
    canonical: 'https://topinstock.ro/cluburi-fotbal',
  },
  openGraph: {
    title: 'Distribuitor Oficial Joma — Echipamente & Treninguri Echipe',
    description: 'Preț la cerere pentru echipe • Minim 10 comenzi • Personalizare la cerere cu stemă și numere.',
    url: 'https://topinstock.ro/cluburi-fotbal',
    siteName: 'TOPinStock',
    images: [
      {
        url: 'https://topinstock.ro/images/banners/banner-joma-cluburi.jpg',
        width: 1920,
        height: 594,
        alt: 'Distribuitor Oficial Joma - Echipamente & Treninguri Echipe',
      },
    ],
    locale: 'ro_RO',
    type: 'website',
  },
};

export default function CluburiFotbalPage() {
  return <JomaClubPageClient />;
}

