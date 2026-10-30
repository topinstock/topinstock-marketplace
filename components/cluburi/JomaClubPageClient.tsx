'use client';

import { useState } from 'react';
import JomaClubHero from './JomaClubHero';
import JomaCustomizationGuide from './JomaCustomizationGuide';
import JomaCatalogGrid from './JomaCatalogGrid';
import JomaQuoteForm from './JomaQuoteForm';

export default function JomaClubPageClient() {
  const [selectedModel, setSelectedModel] = useState<string>('Trening Joma Academy IV');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const handleSelectModel = (modelName: string, colorName?: string) => {
    setSelectedModel(modelName);
    if (colorName) setSelectedColor(colorName);

    // Smooth scroll down to the quote form
    const el = document.getElementById('cere-oferta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Showcase with High-Impact Banner */}
      <JomaClubHero />

      {/* 2. Customization Guide: How Ordering for Clubs Works */}
      <JomaCustomizationGuide />

      {/* 3. Catalog Grid with all official Joma models */}
      <JomaCatalogGrid onSelectModel={handleSelectModel} />

      {/* 4. Dedicated Club Quotation Form */}
      <JomaQuoteForm initialModel={selectedModel} initialColor={selectedColor} />
    </div>
  );
}
