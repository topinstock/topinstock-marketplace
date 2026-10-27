// ============================================
//   Category-Specific Filter Configuration (eMAG Style)
//   Attributes, Colors, and Brands tailored per category
// ============================================

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface AttributeFilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}

export interface ColorFilterOption {
  name: string;
  value: string;
  hex: string;
  border?: boolean;
  isGradient?: boolean;
}

export interface CategoryFilterConfig {
  categorySlug: string;
  categoryName: string;
  attributes: AttributeFilterGroup[];
  colors: ColorFilterOption[];
  topBrands: { name: string; count?: number }[];
}

// ── Standard Universal Colors Palette ──
export const STANDARD_COLORS: ColorFilterOption[] = [
  { name: 'Negru', value: 'negru', hex: '#1e293b' },
  { name: 'Argintiu / Inox', value: 'inox', hex: '#cbd5e1' },
  { name: 'Alb', value: 'alb', hex: '#ffffff', border: true },
  { name: 'Roșu', value: 'rosu', hex: '#ef4444' },
  { name: 'Albastru', value: 'albastru', hex: '#3b82f6' },
  { name: 'Gri', value: 'gri', hex: '#64748b' },
  { name: 'Auriu / Cupru', value: 'auriu', hex: '#f59e0b' },
  { name: 'Verde', value: 'verde', hex: '#10b981' },
  { name: 'Roz', value: 'roz', hex: '#ec4899' },
  { name: 'Multicolor', value: 'multicolor', hex: '#8b5cf6', isGradient: true },
  { name: 'Transparent', value: 'transparent', hex: '#e2e8f0', border: true },
];

// ── Category Profiles ──
const CATEGORY_PROFILES: Record<string, {
  name: string;
  attributes: AttributeFilterGroup[];
  brands: string[];
  colors?: ColorFilterOption[];
}> = {
  // 1. Bucătărie & Menaj, Oale, Tigăi
  'bucatarie-menaj': {
    name: 'Bucătărie & Menaj',
    brands: ['TOPinStock', 'Grunberg', 'Victronic', 'Royalty Line', 'Berlinger Haus', 'Cheffinger', 'Tefal', 'Schmitter', 'Qlux', 'Blueberg', 'Sapir', 'Voltz'],
    attributes: [
      {
        id: 'tip-produs',
        title: 'Tip Produs',
        options: [
          { label: 'Tigaie', value: 'tigaie' },
          { label: 'Oală / Cratiță', value: 'oala' },
          { label: 'Set Oale & Tigăi', value: 'set oale' },
          { label: 'Ibric', value: 'ibric' },
          { label: 'Cuțite & Foarfece', value: 'cutit' },
          { label: 'Tavă & Formă copt', value: 'tava' },
          { label: 'Ustensile bucătărie', value: 'ustensile' },
          { label: 'Cărucior cumpărături', value: 'carucior' },
          { label: 'Geantă frigorifică', value: 'frigorifica' },
        ],
      },
      {
        id: 'material',
        title: 'Material',
        options: [
          { label: 'Inox (Oțel inoxidabil)', value: 'inox' },
          { label: 'Aluminiu teflonat / granitat', value: 'aluminiu' },
          { label: 'Fontă', value: 'fonta' },
          { label: 'Ceramică', value: 'ceramica' },
          { label: 'Sticlă termorezistentă', value: 'sticla' },
          { label: 'Fibre de bambus / Lemn', value: 'bambus' },
          { label: 'Silicon alimentar', value: 'silicon' },
        ],
      },
      {
        id: 'sursa-caldura',
        title: 'Sursă de căldură / Plită',
        options: [
          { label: 'Inducție', value: 'inductie' },
          { label: 'Gaz', value: 'gaz' },
          { label: 'Vitroceramic', value: 'vitroceramic' },
          { label: 'Electric', value: 'electric' },
          { label: 'Compatibil Cuptor', value: 'cuptor' },
        ],
      },
      {
        id: 'capacitate',
        title: 'Capacitate / Volum',
        options: [
          { label: 'Sub 1 Litru', value: '550 ml' },
          { label: '1L – 3L', value: '2 l' },
          { label: '3L – 6L', value: '4 l' },
          { label: 'Peste 6 Litri', value: '8 l' },
        ],
      },
    ],
  },

  // 2. Electrocasnice
  'electrocasnice': {
    name: 'Electrocasnice',
    brands: ['Victronic', 'Grunberg', 'Rosberg', 'Voltz', 'Heinner', 'Philips', 'Bosch', 'DeLonghi', 'Sapir', 'Zephyr'],
    attributes: [
      {
        id: 'tip-aparat',
        title: 'Tip Electrocasnic',
        options: [
          { label: 'Aspirator vertical / clasic', value: 'aspirator' },
          { label: 'Espressor & Cafetieră', value: 'espressor' },
          { label: 'Friteuză cu aer cald', value: 'friteuza' },
          { label: 'Mixer & Robot bucătărie', value: 'mixer' },
          { label: 'Fier / Stație de călcat', value: 'fier de calcat' },
          { label: 'Blender & Tocător', value: 'blender' },
          { label: 'Cuptor cu microunde', value: 'microunde' },
          { label: 'Sandwich Maker & Grătar', value: 'sandwich' },
        ],
      },
      {
        id: 'putere',
        title: 'Putere (W)',
        options: [
          { label: 'Sub 500 W', value: '400w' },
          { label: '500 W – 1000 W', value: '800w' },
          { label: '1000 W – 1500 W', value: '1200w' },
          { label: 'Peste 1500 W', value: '1800w' },
        ],
      },
      {
        id: 'alimentare',
        title: 'Tip Alimentare',
        options: [
          { label: 'La rețea (220V - 240V)', value: '220v' },
          { label: 'Cu acumulator Li-Ion', value: 'acumulator' },
        ],
      },
    ],
  },

  // 3. Articole pentru Iluminat & Instalații Crăciun
  'articole-pentru-iluminat': {
    name: 'Articole pentru Iluminat',
    brands: ['TOPinStock', 'Luminex', 'Holiday Deco', 'SmartLight'],
    attributes: [
      {
        id: 'tip-iluminat',
        title: 'Tip Instalație / Corp',
        options: [
          { label: 'Turturi & Franjuri LED', value: 'turturi' },
          { label: 'Șir / Liniar LED', value: 'sir' },
          { label: 'Plasă luminoasă', value: 'plasa' },
          { label: 'Perdea de lumini', value: 'perdea' },
          { label: 'Furtun luminos', value: 'furtun' },
          { label: 'Proiector laser / LED', value: 'proiector' },
          { label: 'Figurină luminoasă', value: 'figurina' },
        ],
      },
      {
        id: 'culoare-lumina',
        title: 'Culoare Lumină',
        options: [
          { label: 'Alb cald (3000K)', value: 'cald' },
          { label: 'Alb rece (6500K)', value: 'rece' },
          { label: 'Multicolor (RGB)', value: 'multicolor' },
          { label: 'Albastru', value: 'albastru' },
        ],
      },
      {
        id: 'utilizare',
        title: 'Utilizare',
        options: [
          { label: 'Exterior (IP44 / IP65)', value: 'exterior' },
          { label: 'Interior', value: 'interior' },
          { label: 'Interconectabilă (extensibilă)', value: 'interconectabil' },
        ],
      },
      {
        id: 'lungime',
        title: 'Lungime / Dimensiune',
        options: [
          { label: 'Sub 10 metri', value: '5m' },
          { label: '10m – 20m', value: '15m' },
          { label: '20m – 50m', value: '30m' },
          { label: 'Peste 50m', value: '100m' },
        ],
      },
    ],
  },

  // 4. Telefoane & Huse
  'telefoane-tablete': {
    name: 'Telefoane & Huse',
    brands: ['TOPinStock', 'TechNova', 'Apple', 'Samsung', 'Xiaomi', 'Spigen', 'Nillkin'],
    attributes: [
      {
        id: 'brand-compatibil',
        title: 'Brand Compatibil',
        options: [
          { label: 'Apple iPhone', value: 'iphone' },
          { label: 'Samsung Galaxy', value: 'samsung' },
          { label: 'Xiaomi / Redmi', value: 'xiaomi' },
          { label: 'Huawei', value: 'huawei' },
        ],
      },
      {
        id: 'tip-husa',
        title: 'Tip Husă / Protecție',
        options: [
          { label: 'Liquid Silicone (Soft-Touch)', value: 'liquid silicone' },
          { label: 'TPU Matte', value: 'matte' },
          { label: 'Antisoc / Heavy Duty', value: 'antisoc' },
          { label: 'Husă tip Carte / Portofel', value: 'carte' },
          { label: 'Folie sticlă securizată', value: 'folie' },
        ],
      },
      {
        id: 'material-husa',
        title: 'Material',
        options: [
          { label: 'Silicon lichid', value: 'silicon' },
          { label: 'TPU flexibil', value: 'tpu' },
          { label: 'Piele ecologică', value: 'piele' },
          { label: 'Policarbonat dur', value: 'policarbonat' },
        ],
      },
    ],
  },

  // 5. Materiale Electrice & Cabluri
  'materiale-electrice': {
    name: 'Materiale Electrice',
    brands: ['TOPinStock Industrial', 'Prysmian', 'Schneider Electric', 'Legrand', 'Gewiss', 'Noark'],
    attributes: [
      {
        id: 'tip-articol',
        title: 'Tip Articol',
        options: [
          { label: 'Cablu MYYM flexibil', value: 'myym' },
          { label: 'Cablu CYY-F rigid', value: 'cyy' },
          { label: 'Conductor FY / H07V-U', value: 'fy' },
          { label: 'Siguranță automată', value: 'siguranta' },
          { label: 'Tablou electric', value: 'tablou' },
          { label: 'Prize & Întrerupătoare', value: 'priza' },
          { label: 'Tub protecție / Copex', value: 'tub' },
        ],
      },
      {
        id: 'sectiune',
        title: 'Secțiune Conductor',
        options: [
          { label: '1.5 mmp (Iluminat)', value: '1.5' },
          { label: '2.5 mmp (Prize)', value: '2.5' },
          { label: '4.0 mmp (Putere)', value: '4' },
          { label: '6.0 mmp (Branșament)', value: '6' },
          { label: '10.0 mmp (General)', value: '10' },
        ],
      },
      {
        id: 'fire',
        title: 'Număr Conductoare',
        options: [
          { label: '2 fire (2x)', value: '2x' },
          { label: '3 fire cu împământare (3x)', value: '3x' },
          { label: '4 fire (4x)', value: '4x' },
          { label: '5 fire trifazat (5x)', value: '5x' },
        ],
      },
    ],
  },

  // 6. Frumusețe & Îngrijire Personală
  'frumusete-ingrijire': {
    name: 'Frumusețe & Îngrijire Personală',
    brands: ['Victronic', 'Nivea', 'Dove', 'Garnier', 'L\'Oreal', 'Philips', 'Braun', 'Remington', 'Sapir'],
    attributes: [
      {
        id: 'tip-produs',
        title: 'Tip Produs',
        options: [
          { label: 'Îngrijire Păr & Coafură', value: 'par' },
          { label: 'Deodorant & Antiperspirant', value: 'deodorant' },
          { label: 'Parfumuri & Seturi cadou', value: 'parfum' },
          { label: 'Gel de duș & Spumant', value: 'gel de dus' },
          { label: 'Cremă & Loțiune corp', value: 'crema' },
          { label: 'Igienă dentară', value: 'dentara' },
          { label: 'Aparat de tuns / bărbierit', value: 'tuns' },
        ],
      },
      {
        id: 'pentru',
        title: 'Pentru',
        options: [
          { label: 'Femei', value: 'femei' },
          { label: 'Bărbați', value: 'barbati' },
          { label: 'Unisex', value: 'unisex' },
          { label: 'Copii', value: 'copii' },
        ],
      },
    ],
  },

  // 7. Casă, Curățenie & Decorațiuni
  'articole-pentru-casa-si-curatenie': {
    name: 'Casă & Curățenie',
    brands: ['TOPinStock', 'Grunberg', 'Tuffex', 'Qlux', 'Victronic', 'CleanPro'],
    attributes: [
      {
        id: 'tip-produs',
        title: 'Tip Produs',
        options: [
          { label: 'Cutii & Organizare depozitare', value: 'cutii' },
          { label: 'Mopuri & Curățenie', value: 'mop' },
          { label: 'Accesorii baie', value: 'baie' },
          { label: 'Uscătoare & Mese călcat', value: 'uscator' },
          { label: 'Decorațiuni & Textile', value: 'decoratiuni' },
        ],
      },
      {
        id: 'material',
        title: 'Material',
        options: [
          { label: 'Plastic durabil', value: 'plastic' },
          { label: 'Inox / Metal', value: 'inox' },
          { label: 'Bambus natural', value: 'bambus' },
          { label: 'Textil / Microfibră', value: 'microfibra' },
        ],
      },
    ],
  },

  // 8. Jucării & Copii
  'jucarii-copii-bebe': {
    name: 'Jucării, Copii & Bebe',
    brands: ['TOPinStock', 'Disney Frozen', 'LEGO', 'Fisher-Price', 'Chicco', 'KinderKraft', 'Jolly Kids'],
    attributes: [
      {
        id: 'varsta',
        title: 'Vârstă Recomandată',
        options: [
          { label: '0 – 12 luni (Bebeluși)', value: 'bebe' },
          { label: '1 – 3 ani (Preadolescenți)', value: '1-3' },
          { label: '3 – 5 ani (Preșcolari)', value: '3-5' },
          { label: '5 – 8 ani', value: '5-8' },
          { label: 'Peste 8 ani', value: '8 ani' },
        ],
      },
      {
        id: 'tip-jucarie',
        title: 'Tip Jucărie',
        options: [
          { label: 'Jucării Interactive & Sonore', value: 'interactiv' },
          { label: 'Puzzle & Jocuri educative', value: 'puzzle' },
          { label: 'Vehicule & Mașinuțe', value: 'masina' },
          { label: 'Păpuși & Figurine', value: 'papusa' },
          { label: 'Jocuri de construcție', value: 'constructie' },
          { label: 'Jucării exterior & plajă', value: 'exterior' },
        ],
      },
      {
        id: 'pentru',
        title: 'Pentru',
        options: [
          { label: 'Fete', value: 'fete' },
          { label: 'Băieți', value: 'baieti' },
          { label: 'Unisex', value: 'unisex' },
        ],
      },
    ],
  },

  // 9. Scule, Bricolaj & Grădină
  'scule-feronerie-bricolaj': {
    name: 'Scule & Bricolaj',
    brands: ['TOPinStock', 'Total', 'Raider', 'Makita', 'Bosch', 'Almaz', 'Victronic', 'Grunberg'],
    attributes: [
      {
        id: 'tip-scula',
        title: 'Tip Unealtă',
        options: [
          { label: 'Bormașină / Autofiletantă', value: 'autofiletanta' },
          { label: 'Polizor unghiular (Flex)', value: 'polizor' },
          { label: 'Motocoasă / Trimmer', value: 'motocoasa' },
          { label: 'Drujbă / Motoferăstrău', value: 'drujba' },
          { label: 'Pompă de apă / Hidrofor', value: 'pompa' },
          { label: 'Trusă scule & Chei', value: 'trusa' },
        ],
      },
      {
        id: 'alimentare',
        title: 'Alimentare',
        options: [
          { label: 'Cu acumulator Li-Ion', value: 'acumulator' },
          { label: 'La rețea 230V', value: '230v' },
          { label: 'Pe benzină (2T / 4T)', value: 'benzina' },
          { label: 'Manual', value: 'manual' },
        ],
      },
    ],
  },

  // 10. Articole Auto
  'articole-auto': {
    name: 'Articole Auto',
    brands: ['Grunberg', 'Victronic', 'TOPinStock', 'TechNova', 'AutoPro'],
    attributes: [
      {
        id: 'tip-auto',
        title: 'Tip Produs Auto',
        options: [
          { label: 'Organizator portbagaj / scaun', value: 'organizator' },
          { label: 'Compresor & Pompă roți', value: 'compresor' },
          { label: 'Suport telefon & Încărcător auto', value: 'suport' },
          { label: 'Huse scaune & Protecție', value: 'husa' },
          { label: 'Aspirator auto portabil', value: 'aspirator auto' },
          { label: 'Cabluri pornire & Siguranțe', value: 'cabluri' },
        ],
      },
    ],
  },
};

// Aliase pentru subcategorii ca să preia automat profilul părintelui
const CATEGORY_ALIASES: Record<string, string> = {
  // Bucatarie
  'oale': 'bucatarie-menaj',
  'tigai': 'bucatarie-menaj',
  'seturi-oale-si-tigai': 'bucatarie-menaj',
  'seturi-vesela': 'bucatarie-menaj',
  'ustensile-pentru-bucatarie': 'bucatarie-menaj',
  'ustensile-bucatarie-menaj': 'bucatarie-menaj',
  'cutite-si-accesorii': 'bucatarie-menaj',
  'tocatoare': 'bucatarie-menaj',
  'tavi-si-forme-de-copt': 'bucatarie-menaj',
  'lazi-frigorifice-frigidere-si-congelatoare-portabile': 'bucatarie-menaj',
  'organizatoare-si-depozitare-bucatarie': 'bucatarie-menaj',

  // Electrocasnice
  'aspiratoare-curatenie': 'electrocasnice',
  'aspirator-vertical': 'electrocasnice',
  'espressoare-cafetiere': 'electrocasnice',
  'espressor': 'electrocasnice',
  'mixere-roboti-bucatarie': 'electrocasnice',
  'mixer-si-set-de-mixere': 'electrocasnice',
  'blendere-si-tocatoare': 'electrocasnice',
  'friteuze-aer-cald': 'electrocasnice',
  'fiare-statii-calcat': 'electrocasnice',

  // Iluminat
  'turturi-franjuri': 'articole-pentru-iluminat',
  'liniar-sir': 'articole-pentru-iluminat',
  'plasa': 'articole-pentru-iluminat',
  'perdea': 'articole-pentru-iluminat',
  'instalatii-craciun': 'articole-pentru-iluminat',
  'becuri-led': 'articole-pentru-iluminat',
  'proiectoare-led': 'articole-pentru-iluminat',

  // Telefoane
  'huse-telefoane': 'telefoane-tablete',
  'liquid-silicone': 'telefoane-tablete',
  'tpu-matte': 'telefoane-tablete',
  'tpu-antisoc': 'telefoane-tablete',
  'accesorii-telefoane': 'telefoane-tablete',
  'folii-protectie': 'telefoane-tablete',

  // Materiale Electrice
  'cabluri-conductori-engross': 'materiale-electrice',
  'aparataj-prize-intrerupatoare': 'materiale-electrice',
  'tablouri-sigurante': 'materiale-electrice',

  // Frumusete
  'ingrijire-par-si-accesorii': 'frumusete-ingrijire',
  'deodorante-si-antiperspirante': 'frumusete-ingrijire',
  'parfumuri-si-seturi': 'frumusete-ingrijire',
  'geluri-de-dus': 'frumusete-ingrijire',
  'lotiuni-si-creme-de-corp': 'frumusete-ingrijire',
  'ingrijire-ten-si-corp': 'frumusete-ingrijire',
  'igiena-dentara': 'frumusete-ingrijire',

  // Casa & Curatenie
  'casa-si-decoratiuni': 'articole-pentru-casa-si-curatenie',
  'cutii-depozitare': 'articole-pentru-casa-si-curatenie',
  'organizatoare': 'articole-pentru-casa-si-curatenie',
  'articole-pentru-baie': 'articole-pentru-casa-si-curatenie',
  'lenjerii-pat-textile': 'articole-pentru-casa-si-curatenie',

  // Jucarii
  'jucarii-si-jocuri': 'jucarii-copii-bebe',
  'jucarii-interactive': 'jucarii-copii-bebe',

  // Scule
  'articole-pentru-gradina-si-bricolaj': 'scule-feronerie-bricolaj',
  'scule-electrice': 'scule-feronerie-bricolaj',
};

/**
 * Returns tailored filter configuration for any given category slug.
 * If no category slug is given, returns the general catalog filter setup.
 */
export function getCategoryFilterConfig(categorySlug?: string | null): CategoryFilterConfig {
  const cleanSlug = categorySlug ? categorySlug.toLowerCase().trim() : '';

  // 1. Direct match or alias
  const targetKey = CATEGORY_ALIASES[cleanSlug] || cleanSlug;
  const profile = CATEGORY_PROFILES[targetKey];

  if (profile) {
    return {
      categorySlug: cleanSlug || targetKey,
      categoryName: profile.name,
      attributes: profile.attributes,
      colors: profile.colors || STANDARD_COLORS,
      topBrands: profile.brands.map((b) => ({ name: b })),
    };
  }

  // 2. Fuzzy match by partial word
  for (const [key, prof] of Object.entries(CATEGORY_PROFILES)) {
    if (cleanSlug.includes(key) || key.includes(cleanSlug)) {
      return {
        categorySlug: cleanSlug,
        categoryName: prof.name,
        attributes: prof.attributes,
        colors: prof.colors || STANDARD_COLORS,
        topBrands: prof.brands.map((b) => ({ name: b })),
      };
    }
  }

  // 3. Fallback / General Catalog Config
  return {
    categorySlug: cleanSlug,
    categoryName: 'Toate Categoriile',
    attributes: [
      {
        id: 'material',
        title: 'Material',
        options: [
          { label: 'Inox / Oțel', value: 'inox' },
          { label: 'Aluminiu', value: 'aluminiu' },
          { label: 'Plastic / Silicon', value: 'plastic' },
          { label: 'Sticlă / Ceramică', value: 'sticla' },
          { label: 'Bambus / Lemn', value: 'bambus' },
        ],
      },
    ],
    colors: STANDARD_COLORS,
    topBrands: [
      { name: 'TOPinStock' },
      { name: 'Grunberg' },
      { name: 'Victronic' },
      { name: 'Rosberg' },
      { name: 'Voltz' },
      { name: 'Royalty Line' },
      { name: 'Disney Frozen' },
      { name: 'Apple' },
      { name: 'Samsung' },
    ],
  };
}
