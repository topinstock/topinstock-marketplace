import type { Metadata } from 'next';
import type { CatalogProduct } from '@/lib/products';
import {
  CATEGORY_DISPLAY_NAMES_ALL,
  CATEGORY_PARENT_MAP_ALL,
  CATEGORY_SINGULAR_MAP_ALL,
} from '@/lib/seo-categories';

// ============================================
//   SEOManager — Serviciu Centralizat SEO
//   Conformitate fidelă convențiilor eMAG.ro & Trendyol
// ============================================

const resolveBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://topinstock.ro';
};

export const SEO_CONFIG = {
  marketplaceName: process.env.NEXT_PUBLIC_APP_NAME || 'TOPinStock',
  marketplaceLegalName: 'TOPinStock S.R.L.',
  baseUrl: resolveBaseUrl(),
  defaultOgImage: '/images/hero1.jpg',
  locale: 'ro_RO',
  currency: 'RON',
  returnDays: 30,
};

// Mapare denumiri de categorii la singular tehnic (stil catalog eMAG)
const CATEGORY_SINGULAR_MAP: Record<string, string> = {
  ...CATEGORY_SINGULAR_MAP_ALL,
  'telefoane-mobile': 'Telefon mobil',
  'telefoane': 'Telefon mobil',
  'tablete': 'Tabletă',
  'laptopuri': 'Laptop',
  'laptopuri-pc': 'Laptop',
  'audio': 'Căști audio',
  'casti': 'Căști audio',
  'smartwatch': 'Smartwatch',
  'fitness': 'Brățară fitness',
  'incaltaminte': 'Pantofi sport',
  'pantofi': 'Pantofi',
  'pantofi-femei': 'Pantofi damă',
  'rochii': 'Rochie',
  'rochii-femei': 'Rochie damă',
  'camasi': 'Cămașă',
  'camasi-barbati': 'Cămașă bărbați',
  'pantaloni': 'Pantaloni',
  'pantaloni-barbati': 'Pantaloni bărbați',
  'oale': 'Oală de gătit',
  'cratițe': 'Cratiță',
  'oale-si-cratite': 'Oală inox',
  'tigai': 'Tigaie',
  'seturi-vesela': 'Set veselă',
  'vesela': 'Set veselă',
  'electrocasnice': 'Aparat electrocasnic',
  'calorifere-tip-panou': 'Calorifer electric cu ulei',
  'calorifere': 'Calorifer electric',
  'ventilator': 'Ventilator',
  'ventilatoare': 'Ventilator',
  'bucatarie-menaj': 'Articol bucătărie',
  'bucatarie': 'Articol bucătărie',
  'gratar': 'Grătar de grădină',
  'gratare': 'Grătar de grădină',
  'birou': 'Birou',
  'birouri': 'Birou',
  'aspirator-vertical': 'Aspirator vertical',
  'masini-de-tocat-carne': 'Mașină de tocat carne',
  'mixer-si-set-de-mixere': 'Mixer bucătărie',
  'fierbator-de-apa-si-ceainic': 'Fierbător de apă',
  'seturi-de-tacamuri': 'Set tacâmuri',
  'cutit-si-set-de-cutite': 'Set cuțite profesionale',
  'oale-sub-presiune': 'Oală sub presiune',
  'caserole-pentru-mancare': 'Set caserole',
  'termos': 'Termos inox',
  'moda': 'Articol modă',
  'reduceri': 'Ofertă promoțională',
  // ── TOPinStock Categories Singular ───────────────
  'articole-pentru-copii': 'Articol pentru copii',
  'articole-petrecere': 'Articol petrecere',
  'ingrijire-personala-si-cosmetice': 'Produs îngrijire personală',
  'bijuterii-argint': 'Bijuterie argint 925',
  'kendama-si-spinnere': 'Jucărie îndemânare',
  'gsm-si-gadgets': 'Accesoriu GSM & gadget',
  'martisoare': 'Mărțișor tradițional',
  'casa-si-bricolaj': 'Articol casă & bricolaj',
  'craciun': 'Decorațiune Crăciun',
  'solare': 'Sistem iluminat solar',
  'huse-telefoane': 'Husă telefon',
  'folii-protectie-telefoane': 'Folie protecție telefon',
  'baloane-folie': 'Balon folie petrecere',
  'baloane-latex': 'Balon latex petrecere',
  'deodorante-si-antiperspirante': 'Deodorant antiperspirant',
  'bratari': 'Brățară argint',
  'cercei': 'Cercei argint',
  'inele': 'Inel argint',
  'jucarii-si-jocuri': 'Jucărie copii',
  'jucarii-educative': 'Jucărie educativă',
  'lampi-solare': 'Lampă solară LED',
  'brazi-craciun': 'Brad artificial de Crăciun',
  'accesorii-bucatarie': 'Accesoriu bucătărie',
};

// Dicționar de nume de categorii oficiale în română
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  ...CATEGORY_DISPLAY_NAMES_ALL,
  'bucatarie-menaj': 'Bucătărie & Menaj',
  'oale': 'Oale & Cratițe',
  'tigai': 'Tigăi & Grill',
  'seturi-vesela': 'Seturi Veselă Porțelan',
  'seturi-de-tacamuri': 'Tacâmuri Inox',
  'cutit-si-set-de-cutite': 'Cuțite Profesionale',
  'oale-sub-presiune': 'Oale sub Presiune',
  'caserole-pentru-mancare': 'Caserole & Păstrare',
  'termos': 'Termosuri & Ceainice',
  'tocatoare': 'Tocătoare & Ustensile',
  'piese-de-schimb-si-accesorii-pentru-vesele-pentru-gatit': 'Accesorii & Piese Schimb',
  'electrocasnice': 'Electrocasnice',
  'calorifere-tip-panou': 'Calorifere & Panouri Ulei',
  'ventilator': 'Ventilatoare',
  'masini-de-tocat-carne': 'Mașini de Tocat Carne',
  'mixer-si-set-de-mixere': 'Mixere & Blendere',
  'mese-de-calcat-si-accesorii': 'Fiare & Mese de Călcat',
  'fierbator-de-apa-si-ceainic': 'Fierbătoare & Ceainice',
  'aspirator-vertical': 'Aspiratoare Verticale',
  'rasnite-de-cafea-si-condimente': 'Râșnițe Cafea & Condimente',
  'cantar-de-bucatarie': 'Cântare Bucătărie',
  'electronice': 'Electronice',
  'laptopuri': 'Laptopuri & PC',
  'telefoane': 'Telefoane & Tablete',
  'telefoane-mobile': 'Telefoane Mobile',
  'audio': 'Audio & Căști',
  'moda': 'Modă',
  'incaltaminte': 'Încălțăminte Sport',
  'barbati': 'Bărbați',
  'femei': 'Femei',
  'incaltaminte-barbati': 'Încălțăminte Bărbați',
  'imbracaminte-barbati': 'Îmbrăcăminte Bărbați',
  'geci-barbati': 'Geci & Jachete Bărbați',
  'sport-barbati': 'Articole Sport Bărbați',
  'accesorii-barbati': 'Accesorii Bărbați',
  'camasi-barbati': 'Cămăși Bărbați',
  'pantaloni-barbati': 'Pantaloni Bărbați',
  'incaltaminte-femei': 'Încălțăminte Damă',
  'imbracaminte-femei': 'Îmbrăcăminte Damă',
  'rochii-femei': 'Rochii Damă',
  'pantofi-femei': 'Pantofi Damă',
  'accesorii-femei': 'Accesorii Damă',
  'scule-si-unelte': 'Scule & Unelte',
  'suporturi-telefoane': 'Suporturi Telefoane & Auto',
  'smart-gadgets': 'Smart & Gadgets',
  'smartwatch': 'Smartwatch',
  'fitness': 'Brățări Fitness',
  'birou': 'Birou & Mobilier',
  'gratare': 'Grătare & Outdoor',
  'reduceri': 'Oferte Speciale & Reduceri',
  'materiale-electrice-engross': 'Materiale Electrice (En-Gross)',
  'cabluri-conductori-engross': 'Cabluri & Conductori Electrice (En-Gross)',
  'tablouri-sigurante-engross': 'Tablouri & Siguranțe Electrice (En-Gross)',
  'prize-intrerupatoare-engross': 'Prize, Întrerupătoare & Smart Home (En-Gross)',
  'corpuri-iluminat-engross': 'Corpuri & Surse de Iluminat LED (En-Gross)',
  'tuburi-conectica-engross': 'Tuburi, Canale Cablu & Conectică (En-Gross)',
  'instalatii-automatizari-engross': 'Instalații & Automatizări En-Gross',
  'espressoare-cafetiere': 'Espressoare & Cafetiere',
  'airfryer-friteuze': 'Airfryer & Friteuze fără Ulei',
  'mixere-roboti-blendere': 'Mixere, Roboti & Blendere',
  'seturi-oale-si-tigai': 'Seturi de Oale & Tigăi',
  'ustensile-bucatarie-menaj': 'Ustensile Bucătărie & Menaj',
  'tavi-forme-copt': 'Tăvi & Forme de Copt',
  'fierbatoare-cani-electrice': 'Fierbătoare & Cani Electrice',
  'aspiratoare-curatenie': 'Aspiratoare & Curățenie',
  // ── TOPinStock Oficiale Categorii ───────────────
  'articole-pentru-copii': 'Articole pentru Copii & Bebe',
  'articole-petrecere': 'Articole Petrecere & Evenimente',
  'ingrijire-personala-si-cosmetice': 'Îngrijire Personală & Cosmetice',
  'bijuterii-argint': 'Bijuterii Argint 925',
  'kendama-si-spinnere': 'Kendama & Fidget Toys',
  'gsm-si-gadgets': 'GSM, Huse & Gadgets',
  'martisoare': 'Mărțișoare & Cadouri de Sezon',
  'casa-si-bricolaj': 'Casă, Menaj & Bricolaj',
  'craciun': 'Articole & Decorațiuni Crăciun',
  'solare': 'Iluminat Solar & Panouri',
  'huse-telefoane': 'Huse Telefoane',
  'folii-protectie-telefoane': 'Folii Protecție Telefoane',
  'baloane-folie': 'Baloane Folie',
  'baloane-latex': 'Baloane Latex',
  'deodorante-si-antiperspirante': 'Deodorante & Antiperspirante',
  'bratari': 'Brățări Argint',
  'cercei': 'Cercei Argint',
  'inele': 'Inele Argint',
  'jucarii-si-jocuri': 'Jucării & Jocuri',
  'jucarii-educative': 'Jucării Educative',
  'lampi-solare': 'Lămpi Solare LED',
  'brazi-craciun': 'Brazi de Crăciun',
  'accesorii-bucatarie': 'Accesorii Bucătărie',
};

// Mapare ierarhică Subcategorie -> Categorie Părinte (stil eMAG)
export const CATEGORY_PARENT_MAP: Record<string, { name: string; slug: string }> = {
  ...CATEGORY_PARENT_MAP_ALL,
  // ── TOPinStock Ierarhii Subcategorii ──────────────
  'huse-telefoane': { name: 'GSM & Gadgets', slug: 'gsm-si-gadgets' },
  'folii-protectie-telefoane': { name: 'GSM, Huse & Gadgets', slug: 'gsm-si-gadgets' },
  'baloane-folie': { name: 'Articole Petrecere & Evenimente', slug: 'articole-petrecere' },
  'baloane-latex': { name: 'Articole Petrecere & Evenimente', slug: 'articole-petrecere' },
  'deodorante-si-antiperspirante': { name: 'Îngrijire Personală & Cosmetice', slug: 'ingrijire-personala-si-cosmetice' },
  'bratari': { name: 'Bijuterii Argint 925', slug: 'bijuterii-argint' },
  'cercei': { name: 'Bijuterii Argint 925', slug: 'bijuterii-argint' },
  'inele': { name: 'Bijuterii Argint 925', slug: 'bijuterii-argint' },
  'jucarii-si-jocuri': { name: 'Articole pentru Copii & Bebe', slug: 'articole-pentru-copii' },
  'jucarii-educative': { name: 'Articole pentru Copii & Bebe', slug: 'articole-pentru-copii' },
  'lampi-solare': { name: 'Iluminat Solar & Panouri', slug: 'solare' },
  'brazi-craciun': { name: 'Articole & Decorațiuni Crăciun', slug: 'craciun' },
  'accesorii-bucatarie': { name: 'Casă, Menaj & Bricolaj', slug: 'casa-si-bricolaj' },
  // ── Materiale Electrice En-Gross ───────────────
  'cabluri-conductori-engross': { name: 'Materiale Electrice (En-Gross)', slug: 'materiale-electrice-engross' },
  'tablouri-sigurante-engross': { name: 'Materiale Electrice (En-Gross)', slug: 'materiale-electrice-engross' },
  'prize-intrerupatoare-engross': { name: 'Materiale Electrice (En-Gross)', slug: 'materiale-electrice-engross' },
  'corpuri-iluminat-engross': { name: 'Materiale Electrice (En-Gross)', slug: 'materiale-electrice-engross' },
  'tuburi-conectica-engross': { name: 'Materiale Electrice (En-Gross)', slug: 'materiale-electrice-engross' },
  'instalatii-automatizari-engross': { name: 'Materiale Electrice (En-Gross)', slug: 'materiale-electrice-engross' },

  // ── Bucătărie & Menaj (KitchenTools) ───────────
  'seturi-oale-si-tigai': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'ustensile-bucatarie-menaj': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'tavi-forme-copt': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },

  // ── Electrocasnice (KitchenTools) ──────────────
  'espressoare-cafetiere': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'airfryer-friteuze': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'mixere-roboti-blendere': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'fierbatoare-cani-electrice': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'aspiratoare-curatenie': { name: 'Electrocasnice', slug: 'electrocasnice' },

  oale: { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  tigai: { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'seturi-vesela': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'seturi-de-tacamuri': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'cutit-si-set-de-cutite': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'oale-sub-presiune': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'caserole-pentru-mancare': { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  termos: { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  tocatoare: { name: 'Bucătărie & Menaj', slug: 'bucatarie-menaj' },
  'calorifere-tip-panou': { name: 'Electrocasnice', slug: 'electrocasnice' },
  ventilator: { name: 'Electrocasnice', slug: 'electrocasnice' },
  'masini-de-tocat-carne': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'mixer-si-set-de-mixere': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'mese-de-calcat-si-accesorii': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'fierbator-de-apa-si-ceainic': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'aspirator-vertical': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'cantar-de-bucatarie': { name: 'Electrocasnice', slug: 'electrocasnice' },
  'telefoane-mobile': { name: 'Telefoane & Tablete', slug: 'telefoane' },
  tablete: { name: 'Telefoane & Tablete', slug: 'telefoane' },
  laptopuri: { name: 'Electronice', slug: 'electronice' },
  audio: { name: 'Electronice', slug: 'electronice' },
  smartwatch: { name: 'Smart & Gadgets', slug: 'smart-gadgets' },
  fitness: { name: 'Smart & Gadgets', slug: 'smart-gadgets' },
  incaltaminte: { name: 'Modă', slug: 'moda' },
  'rochii-femei': { name: 'Haine Femei', slug: 'femei' },
  'pantofi-femei': { name: 'Haine Femei', slug: 'femei' },
  'camasi-barbati': { name: 'Haine Bărbați', slug: 'barbati' },
  'pantaloni-barbati': { name: 'Haine Bărbați', slug: 'barbati' },
};

export class SEOManager {
  // ── 1. Generatoare de URL-uri oficiale stil eMAG ────────────────

  /**
   * Generează URL-ul oficial de Categorie în stil eMAG.ro: `/{slug-categorie}/c`
   * Exemplu: `/telefoane-mobile/c`
   */
  static buildCategoryUrl(slug: string): string {
    const clean = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    return `/${clean}/c`;
  }

  /**
   * Generează URL-ul oficial de Categorie cu Filtre / Facets în stil eMAG.ro:
   * - Categorie + Brand: `/{slug-categorie}/brand/{slug-brand}/c`
   * - Categorie + Brand + 1 Atribut: `/{slug-categorie}/brand/{slug-brand}/{slug-atribut}/c`
   * - Categorie + 1 Atribut: `/{slug-categorie}/{slug-atribut}/c`
   * - Categorie simplă: `/{slug-categorie}/c`
   */
  static buildFacetedCategoryUrl({
    categorySlug,
    brandSlug,
    attributeSlug,
  }: {
    categorySlug: string;
    brandSlug?: string | null;
    attributeSlug?: string | null;
  }): string {
    const cat = categorySlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const brand = brandSlug ? brandSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '') : null;
    const attr = attributeSlug ? attributeSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '') : null;

    if (brand && attr) {
      return `/${cat}/brand/${brand}/${attr}/c`;
    }
    if (brand) {
      return `/${cat}/brand/${brand}/c`;
    }
    if (attr) {
      return `/${cat}/${attr}/c`;
    }
    return `/${cat}/c`;
  }

  /**
   * Generează URL-ul oficial de Produs (PDP) în stil eMAG.ro: `/{slug-produs}/pd/{cod-unic}/`
   * Exemplu: `/telefon-mobil-apple-iphone-15-128gb-5g-black/pd/D12345/`
   */
  static buildProductUrl(product: { slug: string; id: string; sku?: string | null }): string {
    const cleanSlug = product.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const code = (product.id || product.sku || 'pd').trim();
    return `/${cleanSlug}/pd/${code}/`;
  }

  /**
   * Generează URL-ul oficial de Seller (Vânzător) în stil eMAG.ro: `/seller/{slug-seller}/v`
   * Exemplu: `/seller/urban-fashion/v`
   */
  static buildSellerUrl(vendorSlug: string): string {
    const clean = vendorSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    return `/seller/${clean}/v`;
  }

  /**
   * Transformă o cale relativă într-un URL canonic absolut
   */
  static buildCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SEO_CONFIG.baseUrl}${cleanPath}`;
  }

  // ── 2. Compoziție inteligentă titluri și descrieri stil eMAG ────

  /**
   * Rezolvă categoria la forma singulară pentru compoziția tehnică eMAG
   */
  static getCategorySingular(categoryNameOrSlug?: string): string {
    if (!categoryNameOrSlug) return 'Produs';
    const key = categoryNameOrSlug.toLowerCase().trim();
    if (CATEGORY_SINGULAR_MAP[key]) return CATEGORY_SINGULAR_MAP[key];

    // Căutare parțială
    for (const [k, v] of Object.entries(CATEGORY_SINGULAR_MAP)) {
      if (key.includes(k)) return v;
    }

    // Singularizare automată simplă pentru română
    if (key.endsWith('uri')) return key.slice(0, -3);
    if (key.endsWith('ii')) return key.slice(0, -1);
    if (key.endsWith('e')) return key.slice(0, -1) + 'ă';
    return categoryNameOrSlug;
  }

  /**
   * Numele lizibil oficial al unei categorii
   */
  static getCategoryDisplayName(slugOrName: string): string {
    const key = slugOrName.toLowerCase().trim();
    return CATEGORY_DISPLAY_NAMES[key] || slugOrName;
  }

  /**
   * Extrage brand-ul din atribute, titlu sau vendor
   */
  static extractBrand(product: CatalogProduct): string {
    const attrs = product.attributes;
    if (attrs && typeof attrs === 'object') {
      const explicitBrand = attrs.brand || attrs.Brand || attrs.producator || attrs.Producator;
      if (explicitBrand && typeof explicitBrand === 'string') return explicitBrand.trim();
    }

    // Listă de branduri cunoscute
    const KNOWN_BRANDS = [
      'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Asus', 'Lenovo', 'HP', 'Dell',
      'Sony', 'Philips', 'Bosch', 'Tefal', 'Grünberg', 'Victronic', 'Bohmann', 'TOPinStock', 'Berlinger Haus',
      'Nike', 'Adidas', 'Puma', 'Zara', 'Mango', 'Trendyol', 'Urban Fashion'
    ];

    for (const b of KNOWN_BRANDS) {
      const regex = new RegExp(`\\b${b}\\b`, 'i');
      if (regex.test(product.title)) return b;
    }

    // Recunoaștere automată după cod model producător
    if (/\bVC\d+\b/i.test(product.title)) return 'Victronic';
    if (/\b(IGR|TGR)\d+\b/i.test(product.title)) return 'Grünberg';
    if (/\bBH\s*\d+\b/i.test(product.sku || '')) return 'Bohmann';
    if (/\bBH-\d+\b/i.test(product.title)) return 'Berlinger Haus';

    if (product.vendor?.storeName && !product.vendor.storeName.includes('Oficial')) {
      return product.vendor.storeName.trim();
    }

    return 'TOPinStock';
  }

  /**
   * Extrage specificații tehnice cheie din atribute sau descriere
   */
  static extractKeySpecs(product: CatalogProduct): string[] {
    const specs: string[] = [];
    const attrs = product.attributes;

    if (attrs && typeof attrs === 'object') {
      const preferredKeys = [
        'capacitate', 'putere', 'memorie', 'stocare', 'procesor', 'material',
        'dimensiuni', 'diagonala', 'volum', 'toc'
      ];
      for (const k of preferredKeys) {
        if (attrs[k] && typeof attrs[k] === 'string') {
          specs.push(attrs[k].trim());
        }
      }
    }

    // Extragere tipică regex din titlu dacă specs e gol
    if (specs.length === 0) {
      const powerMatch = product.title.match(/(\d+\s*W\b|\d+\s*kW\b)/i);
      if (powerMatch) specs.push(powerMatch[1].trim());

      const elementsMatch = product.title.match(/(\d+\s*elemente\b|\d+\s*elementi\b)/i);
      if (elementsMatch) specs.push(elementsMatch[1].trim());

      const storageMatch = product.title.match(/(\d+\s*GB\b|\d+\s*TB\b)/i);
      if (storageMatch) specs.push(storageMatch[1].trim());

      const sizeMatch = product.title.match(/(\d+x\d+\s*cm|\d+\s*cm\b)/i);
      if (sizeMatch) specs.push(sizeMatch[1].trim());

      const connectivity = product.title.match(/\b(5G|4G|Wi-Fi|Bluetooth)\b/i);
      if (connectivity) specs.push(connectivity[1].trim());
    }

    // Mărime principală dacă există
    if (product.sizes && product.sizes.length === 1) {
      specs.push(`Mărimea ${product.sizes[0]}`);
    }

    return specs.slice(0, 3);
  }

  /**
   * Compoziție Titlu PDP în stil eMAG.ro:
   * "{Categorie Singular} {Brand} {Nume Model}, {Atribut 1}, {Atribut 2}, {Culoare} - {Nume Marketplace}"
   */
  static composeProductTitle(product: CatalogProduct): string {
    const rawTitle = (product.title || '').trim();
    const brand = this.extractBrand(product);

    // Daca titlul produsului este deja complet si detaliat (>= 20 caractere),
    // nu adaugam prefixe artificiale de categorii la singular (ex. "scule si uneltă")
    let base = rawTitle;
    if (brand && !base.toLowerCase().includes(brand.toLowerCase()) && base.length < 50) {
      base = `${base}, ${brand}`;
    }

    return `${base} - ${SEO_CONFIG.marketplaceName}`;
  }

  /**
   * Compoziție Descriere PDP în stil eMAG.ro:
   * "Cumpara {Titlu Complet Produs} de la {Nume Marketplace}! Ai libertatea sa platesti in rate, beneficiezi de promotiile zilei, deschiderea coletului la livrare, retur gratuit in 30 de zile si Instant Money Back. Vezi {Numar Recenzii} review-uri de la clienti!"
   */
  static composeProductDescription(product: CatalogProduct): string {
    const reviewsCount = product.reviewsCount > 0 ? product.reviewsCount : 18;
    return `Cumpara ${product.title} de la ${SEO_CONFIG.marketplaceName}! Ai libertatea sa platesti in rate, beneficiezi de promotiile zilei, deschiderea coletului la livrare, retur gratuit in 30 de zile si Instant Money Back. Vezi ${reviewsCount} review-uri de la clienti!`;
  }

  /**
   * Compoziție Titlu Pagină de Categorie în stil eMAG.ro:
   * "Cauți {Nume Categorie}? Alege din {Numar Produse} produse - Prețuri de la {Pret Minim} Lei | {Nume Marketplace}"
   */
  static composeCategoryTitle(categoryName: string, productsCount: number, minPrice: number, page?: number): string {
    const formattedPrice = Math.round(minPrice || 1);
    const count = productsCount > 0 ? productsCount : 50;
    const base = `Cauți ${categoryName}? Alege din ${count} produse - Prețuri de la ${formattedPrice} Lei | ${SEO_CONFIG.marketplaceName}`;
    if (page && page > 1) {
      return `${base} (Pagina ${page})`;
    }
    return base;
  }

  /**
   * Compoziție Descriere Pagină de Categorie în stil eMAG.ro:
   * "Ai căutat {Nume Categorie}. La {Nume Marketplace} ai libertatea să alegi din {Numar Produse} oferte de la branduri de top precum {Top 3 Branduri}. Beneficiezi de promoțiile zilei, deschiderea coletului la livrare, livrare rapidă prin curier (DPD, Fan Courier) și retur gratuit în 30 de zile!"
   */
  static composeCategoryDescription(categoryName: string, productsCount: number, topBrands: string[]): string {
    const count = productsCount > 0 ? productsCount : 50;
    const brandsText = (topBrands && topBrands.length > 0)
      ? topBrands.slice(0, 3).join(', ')
      : 'Grünberg, Bohmann, TOPinStock, Berlinger Haus';

    return `Ai căutat ${categoryName}. La ${SEO_CONFIG.marketplaceName} ai libertatea să alegi din ${count} oferte de la branduri de top precum ${brandsText}. Beneficiezi de promoțiile zilei, deschiderea coletului la livrare, livrare rapidă prin curier (DPD, Fan Courier) și retur gratuit în 30 de zile!`;
  }

  /**
   * Compoziție Titlu Pagină de Seller în stil eMAG.ro:
   * "{Nume Seller} - Informații, produse și recenzii ({Rating}/5) | {Nume Marketplace}"
   */
  static composeSellerTitle(sellerName: string, rating: number): string {
    const formattedRating = (rating > 0 ? rating : 4.8).toFixed(1);
    return `${sellerName} - Informații, produse și recenzii (${formattedRating}/5) | ${SEO_CONFIG.marketplaceName}`;
  }

  /**
   * Compoziție Descriere Pagină de Seller în stil eMAG.ro
   */
  static composeSellerDescription(sellerName: string, productsCount: number, rating: number): string {
    const formattedRating = (rating > 0 ? rating : 4.8).toFixed(1);
    const count = productsCount > 0 ? productsCount : 25;
    return `Descoperă oferta ${sellerName} pe ${SEO_CONFIG.marketplaceName}! Ai libertatea să alegi din ${count} oferte verificate cu livrare rapidă prin curier (DPD, Fan Courier), deschiderea coletului la livrare și retur gratuit în 30 de zile. Rating clienți: ${formattedRating}/5!`;
  }

  // ── 2.1. Programmatic Faceted SEO Helper Methods (Stil eMAG / Trendyol) ──

  /**
   * Parsează slug-ul unui brand în nume canonic de afișare
   */
  static parseBrandSlug(brandSlug?: string | null): string {
    if (!brandSlug) return '';
    const clean = brandSlug.trim().toLowerCase();
    const KNOWN_MAP: Record<string, string> = {
      apple: 'Apple',
      samsung: 'Samsung',
      xiaomi: 'Xiaomi',
      huawei: 'Huawei',
      asus: 'Asus',
      lenovo: 'Lenovo',
      hp: 'HP',
      dell: 'Dell',
      sony: 'Sony',
      philips: 'Philips',
      bosch: 'Bosch',
      tefal: 'Tefal',
      grunberg: 'Grünberg',
      victronic: 'Victronic',
      bohmann: 'Bohmann',
      'oliver-voltz': 'Oliver Voltz',
      goldmann: 'GOLDMANN',
      rosberg: 'Rosberg',
      voltz: 'Voltz',
      sapir: 'Sapir',
      zephyr: 'Zephyr',
      rainstahl: 'Rainstahl',
      goldmayer: 'GoldMayer',
      spin: 'SPIN',
      spincom: 'Spincom Exim',
      eltron: 'Eltron',
      asel: 'Asel',
      'barton-steel': 'BartonSteel',
      'berlinger-haus': 'Berlinger Haus',
      desigual: 'Desigual',
      'royalty-line': 'Royalty Line',
      opal: 'Opal',
      nike: 'Nike',
      adidas: 'Adidas',
      puma: 'Puma',
      zara: 'Zara',
      mango: 'Mango',
      trendyol: 'Trendyol',
      topinstock: 'TOPinStock',
      'urban-fashion': 'Urban Fashion',
    };
    if (KNOWN_MAP[clean]) return KNOWN_MAP[clean];
    return clean
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /**
   * Convertește un nume de brand într-un slug SEO eMAG: "Grünberg" -> "grunberg"
   */
  static toBrandSlug(brand: string): string {
    if (!brand) return '';
    return brand
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Convertește o valoare de atribut într-un slug descriptiv eMAG: "256 GB" -> "memorie-interna-256-gb", "42" -> "marimea-42"
   */
  static toAttributeSlug(value: string, key: string = 'marime'): string {
    if (!value) return '';
    const cleanVal = value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (key === 'marime' || key === 'sizes') {
      return `marimea-${cleanVal}`;
    }
    if (key === 'stocare' || key === 'memorie' || key === 'memorie-interna') {
      return `memorie-interna-${cleanVal}`;
    }
    if (key === 'capacitate') {
      return `capacitate-${cleanVal}`;
    }
    if (key === 'culoare') {
      return `culoare-${cleanVal}`;
    }
    return cleanVal;
  }

  /**
   * Parsează slug-ul unui atribut (ex: memorie-interna-256-gb, capacitate-3-l, marimea-42, 256-gb, 8-kg, etc.)
   */
  static parseAttributeSlug(attributeSlug?: string | null): { key: string; value: string; displayName: string } {
    if (!attributeSlug) return { key: '', value: '', displayName: '' };
    const raw = attributeSlug.trim().toLowerCase();

    // 1. memorie-interna-256-gb -> value: 256 GB, displayName: 256 GB
    if (raw.startsWith('memorie-interna-')) {
      const val = raw.replace('memorie-interna-', '').replace(/-/g, ' ').toUpperCase();
      return { key: 'memorie-interna', value: val, displayName: val };
    }
    // 2. capacitate-8-kg or capacitate-3-l
    if (raw.startsWith('capacitate-')) {
      const val = raw.replace('capacitate-', '').replace(/-/g, ' ');
      return { key: 'capacitate', value: val, displayName: val.toUpperCase() };
    }
    // 3. marimea-42 or marime-m
    if (raw.startsWith('marimea-') || raw.startsWith('marime-')) {
      const val = raw.replace(/^marime[a]?-/, '').replace(/-/g, ' ').toUpperCase();
      return { key: 'marime', value: val, displayName: `Mărimea ${val}` };
    }
    // 4. culoare-negru
    if (raw.startsWith('culoare-')) {
      const val = raw.replace('culoare-', '');
      const cap = val.charAt(0).toUpperCase() + val.slice(1);
      return { key: 'culoare', value: cap, displayName: cap };
    }
    // 5. material-inox
    if (raw.startsWith('material-')) {
      const val = raw.replace('material-', '');
      const cap = val.charAt(0).toUpperCase() + val.slice(1);
      return { key: 'material', value: cap, displayName: cap };
    }

    // 6. Direct sizes: xs, s, m, l, xl, xxl, 36..46
    const sizeMatch = raw.match(/^(xs|s|m|l|xl|xxl|3[5-9]|4[0-8])$/i);
    if (sizeMatch) {
      const val = sizeMatch[1].toUpperCase();
      return { key: 'marime', value: val, displayName: `Mărimea ${val}` };
    }

    // 7. Direct spec: 256gb, 256-gb, 8kg, 8-kg, 9-elemente, 2000w, etc.
    const storageMatch = raw.match(/^(\d+)[- ]?(gb|tb)$/i);
    if (storageMatch) {
      const val = `${storageMatch[1]} ${storageMatch[2].toUpperCase()}`;
      return { key: 'stocare', value: val, displayName: val };
    }

    const weightMatch = raw.match(/^(\d+)[- ]?(kg)$/i);
    if (weightMatch) {
      const val = `${weightMatch[1]} kg`;
      return { key: 'capacitate', value: val, displayName: val };
    }

    const powerMatch = raw.match(/^(\d+)[- ]?(w|kw)$/i);
    if (powerMatch) {
      const val = `${powerMatch[1]} ${powerMatch[2].toUpperCase()}`;
      return { key: 'putere', value: val, displayName: val };
    }

    const elementMatch = raw.match(/^(\d+)[- ]?(elemente|elementi)$/i);
    if (elementMatch) {
      const val = `${elementMatch[1]} elemente`;
      return { key: 'elemente', value: val, displayName: val };
    }

    const clean = raw.replace(/-/g, ' ');
    const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
    return { key: 'atribut', value: clean, displayName: cap };
  }

  /**
   * Compoziție <h1> dinamic pe filtre (identic eMAG):
   * "{Nume Categorie} {Brand} {Valoare Atribut}" (ex: "Telefoane mobile Apple, 256 GB")
   */
  static composeFacetedH1({
    categoryName,
    brandName,
    attributeDisplayName,
  }: {
    categoryName: string;
    brandName?: string | null;
    attributeDisplayName?: string | null;
  }): string {
    const brand = brandName ? brandName.trim() : '';
    const attr = attributeDisplayName ? attributeDisplayName.trim() : '';

    if (brand && attr) {
      return `${categoryName} ${brand}, ${attr}`;
    }
    if (brand) {
      return `${categoryName} ${brand}`;
    }
    if (attr) {
      return `${categoryName}, ${attr}`;
    }
    return `Cauți ${categoryName}?`;
  }

  /**
   * Compoziție Meta Title dinamic pe filtre (identic eMAG):
   * "{Nume Categorie} {Brand} {Valoare Atribut} - Alege din {Numar} oferte | {Nume Marketplace}"
   */
  static composeFacetedTitle({
    categoryName,
    brandName,
    attributeDisplayName,
    totalProducts,
    page = 1,
  }: {
    categoryName: string;
    brandName?: string | null;
    attributeDisplayName?: string | null;
    totalProducts: number;
    page?: number;
  }): string {
    const count = totalProducts > 0 ? totalProducts : 10;
    const brand = brandName ? brandName.trim() : '';
    const attr = attributeDisplayName ? attributeDisplayName.trim() : '';

    let base = '';
    if (brand && attr) {
      base = `${categoryName} ${brand}, ${attr} - Alege din ${count} oferte | ${SEO_CONFIG.marketplaceName}`;
    } else if (brand) {
      base = `${categoryName} ${brand} - Alege din ${count} oferte | ${SEO_CONFIG.marketplaceName}`;
    } else if (attr) {
      base = `${categoryName}, ${attr} - Alege din ${count} oferte | ${SEO_CONFIG.marketplaceName}`;
    } else {
      base = `Cauți ${categoryName}? Alege din ${count} oferte | ${SEO_CONFIG.marketplaceName}`;
    }

    if (page && page > 1) {
      return `${base} (Pagina ${page})`;
    }
    return base;
  }

  /**
   * Compoziție Descriere dinamică pe filtre eMAG
   */
  static composeFacetedDescription({
    categoryName,
    brandName,
    attributeDisplayName,
    totalProducts,
  }: {
    categoryName: string;
    brandName?: string | null;
    attributeDisplayName?: string | null;
    totalProducts: number;
  }): string {
    const count = totalProducts > 0 ? totalProducts : 10;
    const brand = brandName ? ` de la ${brandName}` : '';
    const attr = attributeDisplayName ? ` ${attributeDisplayName}` : '';

    return `Ai căutat ${categoryName}${brand}${attr}. La ${SEO_CONFIG.marketplaceName} ai libertatea să alegi din ${count} oferte verificate. Beneficiezi de promoțiile zilei, deschiderea coletului la livrare, livrare rapidă prin curier (DPD, Fan Courier) și retur gratuit în 30 de zile!`;
  }

  /**
   * Reguli de Indexare și Canonical (Protecție Crawl Budget ca la eMAG.ro):
   * - Indexabil (index, follow + self-canonical): Categorie simplă, Categorie + 1 Brand, Categorie + 1 Atribut, Categorie + 1 Brand + 1 Atribut
   * - Neindexabil (noindex, follow): 2+ branduri, 3+ filtre combinate, filtre de preț (?price=), filtre rating, sortare (?sort=), paginare (?page=2+).
   *   În cazurile neindexabile, canonical indică pagina Categorie + Primul Brand (dacă e selectat) sau Categoria principală.
   */
  static evaluateFacetIndexing({
    categorySlug,
    brandSlug,
    attributeSlug,
    brandsList = [],
    attributesList = [],
    minPrice,
    maxPrice,
    sort,
    page = 1,
    inStock,
    onSale,
    search,
  }: {
    categorySlug: string;
    brandSlug?: string | null;
    attributeSlug?: string | null;
    brandsList?: string[];
    attributesList?: string[];
    minPrice?: number | string;
    maxPrice?: number | string;
    sort?: string;
    page?: number;
    inStock?: boolean;
    onSale?: boolean;
    search?: string;
  }): {
    isIndexable: boolean;
    canonicalUrl: string;
    robots: {
      index: boolean;
      follow: boolean;
      googleBot?: {
        index: boolean;
        follow: boolean;
        'max-image-preview': 'large';
        'max-snippet': number;
      };
    };
  } {
    // 1. Multiple brands check (2+ brands)
    const allBrands = new Set<string>();
    if (brandSlug) allBrands.add(brandSlug.toLowerCase());
    brandsList.forEach((b) => b && allBrands.add(b.toLowerCase()));
    const hasMultipleBrands = allBrands.size >= 2;

    // 2. Attributes count
    const allAttributes = new Set<string>();
    if (attributeSlug) allAttributes.add(attributeSlug.toLowerCase());
    attributesList.forEach((a) => a && allAttributes.add(a.toLowerCase()));
    const hasMultipleAttributes = allAttributes.size >= 2;

    // 3. Combined filters count: brand count + attribute count
    const totalFiltersCount = allBrands.size + allAttributes.size;
    const has3PlusFilters = totalFiltersCount >= 3;

    // 4. Query filters check
    const hasPriceFilter = (minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '');
    const hasSortFilter = Boolean(sort && sort !== 'newest');
    const hasSearchFilter = Boolean(search && search.trim() !== '');
    const hasPageFilter = Boolean(page && Number(page) > 1);
    const hasAvailFilter = Boolean(inStock || onSale);

    // 5. Query parameters instead of clean URL path (e.g. /c?brand=apple instead of /brand/apple/c)
    // Only clean URLs should be indexable & self-canonical; query param variants get noindex, follow
    const isFacetedViaQueryParam = (!brandSlug && brandsList.length > 0) || (!attributeSlug && attributesList.length > 0);

    // Is Indexable?
    const isIndexable =
      !isFacetedViaQueryParam &&
      !hasMultipleBrands &&
      !has3PlusFilters &&
      !hasMultipleAttributes &&
      !hasPriceFilter &&
      !hasSortFilter &&
      !hasSearchFilter &&
      !hasPageFilter &&
      !hasAvailFilter;

    // Determine Canonical URL
    let canonicalPath: string;
    if (isIndexable) {
      // Self-canonical
      const singleBrand = brandSlug || Array.from(allBrands)[0] || undefined;
      const singleAttr = attributeSlug || Array.from(allAttributes)[0] || undefined;
      canonicalPath = this.buildFacetedCategoryUrl({
        categorySlug,
        brandSlug: singleBrand,
        attributeSlug: singleAttr,
      });
    } else {
      // Crawl budget protection: Canonical points to Category + Primul Brand (dacă e selectat un singur brand), altfel categorie simplă
      const firstBrand = brandSlug || Array.from(allBrands)[0];
      if (firstBrand && allBrands.size === 1) {
        canonicalPath = this.buildFacetedCategoryUrl({
          categorySlug,
          brandSlug: firstBrand,
        });
      } else {
        canonicalPath = this.buildCategoryUrl(categorySlug);
      }
    }

    const canonicalUrl = this.buildCanonicalUrl(canonicalPath);

    return {
      isIndexable,
      canonicalUrl,
      robots: isIndexable
        ? {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          }
        : {
            index: false,
            follow: true,
          },
    };
  }

  /**
   * Generează obiectul complet Next.js Metadata pentru Pagini de Categorie cu Filtre Faceted
   */
  static getFacetedCategoryMetadata({
    categoryName,
    categorySlug,
    brandSlug,
    attributeSlug,
    brandsList,
    attributesList,
    productsCount,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    inStock,
    onSale,
    search,
  }: {
    categoryName: string;
    categorySlug: string;
    brandSlug?: string | null;
    attributeSlug?: string | null;
    brandsList?: string[];
    attributesList?: string[];
    productsCount: number;
    minPrice?: number | string;
    maxPrice?: number | string;
    sort?: string;
    page?: number;
    inStock?: boolean;
    onSale?: boolean;
    search?: string;
  }): Metadata {
    const brandName = brandSlug ? this.parseBrandSlug(brandSlug) : undefined;
    const parsedAttr = attributeSlug ? this.parseAttributeSlug(attributeSlug) : undefined;
    const attributeDisplayName = parsedAttr?.displayName;

    const title = this.composeFacetedTitle({
      categoryName,
      brandName,
      attributeDisplayName,
      totalProducts: productsCount,
      page,
    });

    const description = this.composeFacetedDescription({
      categoryName,
      brandName,
      attributeDisplayName,
      totalProducts: productsCount,
    });

    const { isIndexable, canonicalUrl, robots } = this.evaluateFacetIndexing({
      categorySlug,
      brandSlug,
      attributeSlug,
      brandsList,
      attributesList,
      minPrice,
      maxPrice,
      sort,
      page,
      inStock,
      onSale,
      search,
    });

    return {
      title: {
        absolute: title,
      },
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: SEO_CONFIG.marketplaceName,
        locale: SEO_CONFIG.locale,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      robots,
    };
  }

  // ── 3. Generatoare de Metadata Next.js App Router ──────────────

  /**
   * Generează obiectul complet Next.js Metadata pentru o Pagină de Categorie
   */
  static getCategoryMetadata({
    categoryName,
    categorySlug,
    productsCount,
    minPrice,
    topBrands = [],
    page = 1,
    image,
  }: {
    categoryName: string;
    categorySlug: string;
    productsCount: number;
    minPrice: number;
    topBrands?: string[];
    page?: number;
    image?: string;
  }): Metadata {
    const title = this.composeCategoryTitle(categoryName, productsCount, minPrice, page);
    const description = this.composeCategoryDescription(categoryName, productsCount, topBrands);
    const canonicalPath = this.buildCategoryUrl(categorySlug);
    const canonicalUrl = this.buildCanonicalUrl(canonicalPath + (page > 1 ? `?page=${page}` : ''));
    const ogImage = image || SEO_CONFIG.defaultOgImage;
    const fullOgImage = ogImage.startsWith('http') ? ogImage : this.buildCanonicalUrl(ogImage);

    return {
      title: {
        absolute: title, // Folosește absolute pentru a preveni dublarea sufixului din layout
      },
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: SEO_CONFIG.marketplaceName,
        locale: SEO_CONFIG.locale,
        type: 'website',
        images: [
          {
            url: fullOgImage,
            width: 1200,
            height: 630,
            alt: categoryName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [fullOgImage],
      },
      robots: {
        index: page <= 5, // indexează primele pagini de paginare
        follow: true,
        googleBot: {
          index: page <= 5,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  /**
   * Generează obiectul complet Next.js Metadata pentru o Pagină de Produs (PDP)
   */
  static getProductMetadata(product: CatalogProduct): Metadata {
    const title = this.composeProductTitle(product);
    const description = this.composeProductDescription(product);
    const canonicalPath = this.buildProductUrl(product);
    const canonicalUrl = this.buildCanonicalUrl(canonicalPath);
    const rawImage = product.images?.[0] || SEO_CONFIG.defaultOgImage;
    const ogImage = rawImage.startsWith('http') ? rawImage : this.buildCanonicalUrl(rawImage);

    return {
      title: {
        absolute: title,
      },
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: SEO_CONFIG.marketplaceName,
        locale: SEO_CONFIG.locale,
        type: 'website',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 1000,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  /**
   * Generează obiectul complet Next.js Metadata pentru o Pagină de Seller
   */
  static getSellerMetadata({
    vendorName,
    vendorSlug,
    rating = 4.8,
    productsCount = 20,
    logo,
    page = 1,
  }: {
    vendorName: string;
    vendorSlug: string;
    rating?: number;
    productsCount?: number;
    logo?: string | null;
    page?: number;
  }): Metadata {
    const title = this.composeSellerTitle(vendorName, rating);
    const description = this.composeSellerDescription(vendorName, productsCount, rating);
    const canonicalPath = this.buildSellerUrl(vendorSlug);
    const canonicalUrl = this.buildCanonicalUrl(canonicalPath + (page > 1 ? `?page=${page}` : ''));
    const rawImage = logo || SEO_CONFIG.defaultOgImage;
    const ogImage = rawImage.startsWith('http') ? rawImage : this.buildCanonicalUrl(rawImage);

    return {
      title: {
        absolute: title,
      },
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: SEO_CONFIG.marketplaceName,
        locale: SEO_CONFIG.locale,
        type: 'website',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: vendorName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  // ── 4. Structured Data (JSON-LD) pentru Boții Google ────────────

  /**
   * JSON-LD BreadcrumbList Schema.org
   */
  static getBreadcrumbsJsonLd(items: { name: string; url: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : this.buildCanonicalUrl(item.url),
      })),
    };
  }

  /**
   * Construiește ierarhia completă de Breadcrumbs în stil eMAG.ro pentru Pagina de Produs (PDP):
   * `Acasă > Categorie Părinte > Subcategorie > Categorie + Brand > Nume Produs`
   */
  static buildProductBreadcrumbs(product: CatalogProduct): { name: string; url: string }[] {
    const items: { name: string; url: string }[] = [
      { name: 'Acasă', url: '/' },
    ];

    const categorySlug = product.category?.slug;
    const categoryName = product.category?.name || (categorySlug ? this.getCategoryDisplayName(categorySlug) : null);
    const brand = this.extractBrand(product);
    const brandSlug = this.toBrandSlug(brand);

    if (categorySlug && categoryName) {
      // 1. Categorie Părinte (e.g. Electrocasnice sau Bucătărie & Menaj)
      const parent = (product.category as any)?.parent || (CATEGORY_PARENT_MAP[categorySlug.toLowerCase()] ?? null);
      if (parent && parent.slug !== categorySlug) {
        items.push({
          name: parent.name,
          url: this.buildCategoryUrl(parent.slug),
        });
      }

      // 2. Subcategorie (e.g. Calorifere tip panou sau Oale & Cratițe)
      items.push({
        name: categoryName,
        url: this.buildCategoryUrl(categorySlug),
      });

      // 3. Subcategorie + Brand (e.g. Calorifere tip panou Victronic sau Oale TOPinStock)
      if (brand && brandSlug) {
        items.push({
          name: `${categoryName} ${brand}`,
          url: this.buildFacetedCategoryUrl({
            categorySlug,
            brandSlug,
          }),
        });
      }
    }

    // 4. Nume Produs
    items.push({
      name: product.title,
      url: this.buildProductUrl(product),
    });

    return items;
  }

  /**
   * JSON-LD Product Schema.org conform eMAG.ro:
   * - name, images (array cu toate imaginile), description, sku, mpn, gtin13 (dacă există), brand
   * - aggregateRating: inclus DOAR dacă produsul are cel puțin 1 review aprobat (reviewsCount > 0)
   * - review: array cu ultimele 3-5 recenzii reale cu autor, dată și notă
   * - offers:
   *   * Single Offer dacă produsul are un singur seller
   *   * AggregateOffer dacă are mai mulți selleri în marketplace (modelul eMAG "Alte X oferte de la Y Lei")
   */
  static getProductJsonLd(
    productOrParams:
      | CatalogProduct
      | {
          product: CatalogProduct;
          additionalOffers?: Array<{
            sellerName: string;
            price: number;
            stock?: number;
            condition?: string;
            url?: string;
          }>;
          reviews?: Array<{
            author: string;
            datePublished?: string;
            rating: number;
            name?: string;
            reviewBody: string;
          }>;
        },
    legacyOffers?: Array<{
      sellerName: string;
      price: number;
      stock?: number;
      condition?: string;
      url?: string;
    }>
  ) {
    let product: CatalogProduct;
    let additionalOffers: Array<{
      sellerName: string;
      price: number;
      stock?: number;
      condition?: string;
      url?: string;
    }> = [];
    let reviewsList: Array<{
      author: string;
      datePublished?: string;
      rating: number;
      name?: string;
      reviewBody: string;
    }> = [];

    if ('title' in productOrParams) {
      product = productOrParams;
      additionalOffers = legacyOffers || product.marketplaceOffers || [];
      reviewsList = (product.reviews as any) || [];
    } else {
      product = productOrParams.product;
      additionalOffers = productOrParams.additionalOffers || product.marketplaceOffers || [];
      reviewsList = productOrParams.reviews || (product.reviews as any) || [];
    }

    const canonicalUrl = this.buildCanonicalUrl(this.buildProductUrl(product));
    const brandName = this.extractBrand(product);
    const primaryVendorName = product.vendor?.storeName || 'TOPinStock';
    const primaryInStock = product.stock > 0;
    const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Array cu toate imaginile produsului convertite la URL-uri absolute
    const rawImages =
      product.images && product.images.length > 0
        ? product.images
        : [SEO_CONFIG.defaultOgImage];
    const images = rawImages.map((img) =>
      img.startsWith('http') ? img : this.buildCanonicalUrl(img)
    );

    // Extragere GTIN13 / EAN din atribute dacă există
    let gtin13: string | undefined = undefined;
    if (product.attributes && typeof product.attributes === 'object') {
      const candidate =
        product.attributes.gtin13 ||
        product.attributes.gtin ||
        product.attributes.ean ||
        product.attributes.barcode;
      if (candidate && typeof candidate === 'string' && /^\d{8,14}$/.test(candidate.trim())) {
        gtin13 = candidate.trim();
      }
    }

    // Logica Marketplace pentru offers: Single Offer vs AggregateOffer
    let offersData: any;
    if (additionalOffers && additionalOffers.length > 0) {
      // Modelul eMAG cu mai mulți selleri ("Alte X oferte de la Y Lei")
      const allOffers = [
        {
          price: product.price,
          inStock: primaryInStock,
          sellerName: primaryVendorName,
          url: canonicalUrl,
        },
        ...additionalOffers.map((o) => ({
          price: o.price,
          inStock: (o.stock ?? 1) > 0,
          sellerName: o.sellerName,
          url: o.url || canonicalUrl,
        })),
      ];

      const prices = allOffers.map((o) => o.price);
      const lowPrice = Math.min(...prices);
      const highPrice = Math.max(...prices);

      offersData = {
        '@type': 'AggregateOffer',
        lowPrice: lowPrice.toFixed(2),
        highPrice: highPrice.toFixed(2),
        priceCurrency: SEO_CONFIG.currency,
        offerCount: allOffers.length,
        offers: allOffers.map((o) => ({
          '@type': 'Offer',
          url: o.url,
          priceCurrency: SEO_CONFIG.currency,
          price: o.price.toFixed(2),
          priceValidUntil,
          itemCondition: 'https://schema.org/NewCondition',
          availability: o.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: o.sellerName,
          },
        })),
      };
    } else {
      // Un singur seller oficial
      offersData = {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: SEO_CONFIG.currency,
        price: product.price.toFixed(2),
        priceValidUntil,
        itemCondition: 'https://schema.org/NewCondition',
        availability: primaryInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: primaryVendorName,
        },
      };
    }

    const schema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: images,
      description: product.description || this.composeProductDescription(product),
      sku: product.sku || product.id,
      mpn: product.id,
      brand: {
        '@type': 'Brand',
        name: brandName,
      },
      offers: offersData,
    };

    if (gtin13) {
      schema.gtin13 = gtin13;
    }

    // Include aggregateRating DOAR dacă produsul are cel puțin 1 review aprobat
    const hasApprovedReviews = Boolean(product.reviewsCount && product.reviewsCount > 0);
    if (hasApprovedReviews) {
      const ratingVal = product.rating > 0 ? product.rating : 4.8;
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: ratingVal.toFixed(1),
        reviewCount: product.reviewsCount,
        bestRating: '5',
        worstRating: '1',
      };

      // Include ultimele 3-5 recenzii reale
      if (reviewsList && reviewsList.length > 0) {
        schema.review = reviewsList.slice(0, 5).map((r) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: r.author,
          },
          datePublished: r.datePublished || new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
          reviewRating: {
            '@type': 'Rating',
            ratingValue: Number(r.rating || 5).toFixed(1),
            bestRating: '5',
            worstRating: '1',
          },
          name: r.name || 'Recenzie cumpărător verificat',
          reviewBody: r.reviewBody,
        }));
      }
    }

    return schema;
  }

  /**
   * JSON-LD WebSite & Organization Schema.org pentru Homepage conform eMAG.ro
   * Include SearchAction legat de ruta de căutare /search?q={search_term_string}
   */
  static getHomepageJsonLd() {
    const baseUrl = SEO_CONFIG.baseUrl;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          url: baseUrl,
          name: 'TOPinStock',
          alternateName: [
            'topinstock',
            'topinstock.ro',
            'Top In Stock',
            'topinstock romania',
            'TOPinStock România',
            'TOPinStock Marketplace',
          ],
          description:
            'TOPinStock este marketplace-ul modern al României, conectând mii de vânzători verificați cu milioane de cumpărători.',
          inLanguage: 'ro-RO',
          publisher: {
            '@id': `${baseUrl}/#organization`,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          '@id': `${baseUrl}/#organization`,
          name: 'TOPinStock',
          alternateName: ['topinstock', 'topinstock.ro', 'Top In Stock', 'TOPinStock România'],
          legalName: 'TOPinStock S.R.L.',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/hero1.jpg`,
            caption: 'TOPinStock Marketplace România',
          },
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: '+40-371-000-000',
              contactType: 'customer service',
              areaServed: 'RO',
              availableLanguage: ['Romanian', 'English'],
            },
          ],
          sameAs: [
            'https://www.facebook.com/topinstock',
            'https://www.instagram.com/topinstock',
          ],
        },
      ],
    };
  }

  /**
   * JSON-LD CollectionPage / ItemList pentru Pagină de Categorie
   */
  static getCategoryJsonLd({
    categoryName,
    categorySlug,
    products,
    totalProducts,
  }: {
    categoryName: string;
    categorySlug: string;
    products: CatalogProduct[];
    totalProducts: number;
  }) {
    const canonicalUrl = this.buildCanonicalUrl(this.buildCategoryUrl(categorySlug));

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: categoryName,
      url: canonicalUrl,
      description: `Catalog complet ${categoryName} cu ${totalProducts} oferte pe ${SEO_CONFIG.marketplaceName}`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: p.title,
          url: this.buildCanonicalUrl(this.buildProductUrl(p)),
          image: p.images?.[0]?.startsWith('http') ? p.images[0] : this.buildCanonicalUrl(p.images?.[0] || ''),
        })),
      },
    };
  }

  /**
   * JSON-LD Store / Organization pentru Pagină de Seller
   */
  static getSellerJsonLd({
    vendorName,
    vendorSlug,
    description,
    rating = 4.8,
  }: {
    vendorName: string;
    vendorSlug: string;
    description?: string | null;
    rating?: number;
  }) {
    const canonicalUrl = this.buildCanonicalUrl(this.buildSellerUrl(vendorSlug));

    return {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: vendorName,
      url: canonicalUrl,
      description: description || `Magazin partener oficial pe ${SEO_CONFIG.marketplaceName}`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (rating > 0 ? rating : 4.8).toFixed(1),
        reviewCount: 25,
      },
    };
  }

  // ── 5. Internal Linking & SEO Text Guides (Stil eMAG / Trendyol) ──

  /**
   * Generează automat lista de linkuri interne ("Căutări populare / Din aceeași categorie")
   * pentru internal linking automat către rutele de Faceted Programmatic SEO.
   */
  static getPopularSearchLinks(categorySlug: string): Array<{ title: string; url: string; badge?: string }> {
    const cleanSlug = categorySlug.trim().toLowerCase();
    const categoryName = this.getCategoryDisplayName(cleanSlug);
    const links: Array<{ title: string; url: string; badge?: string }> = [];

    // 1. Branduri relevante pe baza categoriei
    const CATEGORY_BRAND_MAP: Record<string, string[]> = {
      'espressoare-cafetiere': ['oliver-voltz', 'rosberg', 'voltz', 'zephyr'],
      'airfryer-friteuze': ['oliver-voltz', 'rosberg', 'goldmann', 'voltz'],
      'mixere-roboti-blendere': ['oliver-voltz', 'rosberg', 'sapir', 'zephyr'],
      'fierbatoare-cani-electrice': ['oliver-voltz', 'rosberg', 'sapir'],
      'prajitor-de-paine': ['oliver-voltz', 'rosberg', 'sapir'],
      'seturi-oale-si-tigai': ['bohmann', 'topinstock', 'grunberg', 'zephyr', 'sapir', 'rainstahl'],
      oale: ['bohmann', 'topinstock', 'grunberg', 'zephyr', 'sapir'],
      tigai: ['zephyr', 'bohmann', 'topinstock', 'grunberg', 'sapir'],
      'ustensile-bucatarie-menaj': ['bohmann', 'topinstock', 'zephyr', 'sapir', 'grunberg'],
      'aspiratoare-curatenie': ['oliver-voltz', 'rosberg'],
      'calorifere-tip-panou': ['victronic'],
      'materiale-electrice-engross': ['spin', 'spincom'],
      'cabluri-conductori-engross': ['spin'],
      'tablouri-sigurante-engross': ['spin'],
      'prize-intrerupatoare-engross': ['spin'],
      'corpuri-iluminat-engross': ['spin'],
      'tuburi-conectica-engross': ['spin'],
      'instalatii-automatizari-engross': ['spin'],
      'telefoane-mobile': ['apple', 'samsung', 'xiaomi', 'huawei'],
      telefoane: ['apple', 'samsung', 'xiaomi'],
      incaltaminte: ['nike', 'adidas', 'puma'],
      'pantofi-femei': ['zara', 'mango', 'desigual'],
      'rochii-femei': ['zara', 'mango', 'trendyol'],
      'smart-gadgets': ['apple', 'samsung'],
      smartwatch: ['apple', 'samsung'],
    };

    const targetBrands = CATEGORY_BRAND_MAP[cleanSlug] || ['bohmann', 'topinstock', 'oliver-voltz', 'grunberg', 'spin'];
    for (const bSlug of targetBrands) {
      const bName = this.parseBrandSlug(bSlug);
      links.push({
        title: `${categoryName} ${bName}`,
        url: this.buildFacetedCategoryUrl({
          categorySlug: cleanSlug,
          brandSlug: bSlug,
        }),
        badge: 'Brand',
      });
    }

    // 2. Atribute & Specificații relevante pentru categorie
    const CATEGORY_ATTR_MAP: Record<string, Array<{ slug: string; name: string }>> = {
      'espressoare-cafetiere': [
        { slug: 'presiune-19-bari', name: '19 bari' },
        { slug: 'sistem-capsule', name: 'Capsule 5 în 1' },
        { slug: 'rezervor-1-5-l', name: '1.5 Litri' },
      ],
      'airfryer-friteuze': [
        { slug: 'capacitate-mare', name: 'Fără Ulei' },
        { slug: 'ecran-digital', name: 'Panou Digital Touch' },
      ],
      'mixere-roboti-blendere': [
        { slug: 'functie-turbo', name: 'Funcție Turbo' },
        { slug: 'putere-500w', name: '500W' },
      ],
      'seturi-oale-si-tigai': [
        { slug: 'material-inox-18-10', name: 'Inox 18/10' },
        { slug: 'acoperire-granit', name: 'Acoperire Granit' },
        { slug: 'compatibil-inductie', name: 'Inducție' },
      ],
      oale: [
        { slug: 'material-inox-18-10', name: 'Inox Alimentar' },
        { slug: 'compatibil-inductie', name: 'Inducție' },
      ],
      'materiale-electrice-engross': [
        { slug: 'smart-wifi', name: 'Smart Wi-Fi' },
        { slug: 'sticla-securizata', name: 'Sticlă Securizată' },
        { slug: 'engross-palet', name: 'Comandă Paletizată' },
      ],
      'cabluri-conductori-engross': [
        { slug: 'conductor-cupru-fy', name: 'Conductor FY / MYF' },
        { slug: 'cablu-bransament', name: 'Branșament Aerian' },
      ],
      'prize-intrerupatoare-engross': [
        { slug: 'intrerupator-touch-wifi', name: 'Touch Wi-Fi' },
        { slug: 'telecomanda-rf', name: 'Telecomandă RF' },
      ],
      'telefoane-mobile': [
        { slug: 'memorie-interna-256-gb', name: '256 GB' },
        { slug: 'memorie-interna-128-gb', name: '128 GB' },
        { slug: 'memorie-interna-512-gb', name: '512 GB' },
      ],
    };

    const targetAttrs = CATEGORY_ATTR_MAP[cleanSlug] || [
      { slug: 'calitate-premium', name: 'Gama Premium' },
      { slug: 'livrare-rapida', name: 'Livrare 24h' },
    ];

    for (const attr of targetAttrs) {
      links.push({
        title: `${categoryName} ${attr.name}`,
        url: this.buildFacetedCategoryUrl({
          categorySlug: cleanSlug,
          attributeSlug: attr.slug,
        }),
        badge: 'Specificație',
      });
    }

    // 3. Subcategorii înrudite (Siblings din aceeași categorie părinte)
    const parentInfo = CATEGORY_PARENT_MAP[cleanSlug];
    if (parentInfo) {
      const parentSlug = parentInfo.slug;
      const siblings = Object.entries(CATEGORY_PARENT_MAP)
        .filter(([subSlug, p]) => p.slug === parentSlug && subSlug !== cleanSlug)
        .slice(0, 5);

      for (const [sibSlug] of siblings) {
        links.push({
          title: this.getCategoryDisplayName(sibSlug),
          url: this.buildCategoryUrl(sibSlug),
          badge: 'Categorie',
        });
      }
    }

    return links;
  }

  /**
   * Generează Ghidul SEO Text complet pentru subsolul categoriei (stil eMAG / Trendyol)
   */
  static generateCategorySeoGuide(
    categorySlug: string,
    customName?: string,
    options: { minPrice?: number; maxPrice?: number; total?: number; brands?: string[] } = {}
  ) {
    const cleanSlug = categorySlug.trim().toLowerCase();
    const categoryName = customName || this.getCategoryDisplayName(cleanSlug);
    const parentInfo = CATEGORY_PARENT_MAP[cleanSlug];
    const parentName = parentInfo ? parentInfo.name : 'Catalog General';

    const minPriceFormatted = options.minPrice ? Math.round(options.minPrice) : 29;
    const maxPriceFormatted = options.maxPrice ? Math.round(options.maxPrice) : 899;
    const count = options.total && options.total > 0 ? options.total : 45;

    const brandList = (options.brands && options.brands.length > 0)
      ? options.brands.slice(0, 5).join(', ')
      : 'Oliver Voltz, Bohmann, TOPinStock, Grünberg, SPIN, Rosberg, Zephyr';

    const isEngross = cleanSlug.includes('engross');

    return {
      h2: `Ghid de cumpărături: Cum alegi cel mai bun produs din categoria ${categoryName}?`,
      intro: isEngross
        ? `Gama de ${categoryName} distribuită prin ${SEO_CONFIG.marketplaceName} este destinată exclusiv firmelor de construcții, instalatorilor autorizați, revânzătorilor și electricienilor profesioniști. Toate produsele respectă cele mai exigente standarde europene de siguranță, fiind disponibile direct din stoc pentru comenzi paletizate sau ambalate la bax.`
        : `Atunci când cauți ${categoryName} de calitate superioară pe ${SEO_CONFIG.marketplaceName}, ai la dispoziție o selecție diversificată de peste ${count} de oferte verificate. Fie că îți dorești un model accesibil pentru utilizare zilnică sau echipamente profesionale de lungă durată, este esențial să ții cont de câteva criterii fundamentale înainte de a plasa comanda.`,
      sections: [
        {
          h3: `1. Calitatea materialelor și standardele de fabricație`,
          body: isEngross
            ? `Pentru instalații electrice durabile, conductorii din cupru electrolitic pur, izolațiile ignifuge cu întârziere la propagarea flăcării (PVC/XLPE) și carcasele din policarbonat cu protecție UV sau sticlă securizată oferă rezistență mecanică optimă și siguranță totală împotriva scurtcircuitelor.`
            : `Fie că vorbim despre inox alimentar 18/10, acoperiri ceramice sau marmorate antiaderente fără PFOA, sau carcase robuste din aluminiu turnat, alegerea unor materiale sigure îți garantează performanță impecabilă, curățare facilă și rezistență îndelungată în timp.`,
        },
        {
          h3: `2. Eficiență, compatibilitate și funcționalități avansate`,
          body: isEngross
            ? `Echipamentele smart Wi-Fi și RF permit integrarea directă cu smartphone-ul fără a necesita hub-uri suplimentare, oferind control de la distanță, temporizator și monitorizare a consumului pentru un confort maxim.`
            : `Aparatele electrocasnice moderne oferă motoare puternice cu consum redus de energie, setări multiple de viteză, funcții de siguranță precum oprirea automată la supraîncălzire și accesorii multifuncționale adaptate stilului tău de viață.`,
        },
        {
          h3: `3. Branduri recunoscute și producători certificați pe ${SEO_CONFIG.marketplaceName}`,
          body: `În catalogul nostru vei găsi producători apreciați pentru fiabilitate și inovație, printre care: ${brandList}. Fiecare produs beneficiază de specificații tehnice complete și recenzii reale lăsate de cumpărători verificați.`,
        },
        {
          h3: `4. Prețuri competitive, garanție de la furnizor și livrare rapidă`,
          body: isEngross
            ? `Beneficiezi de prețuri en-gros direct de importator, factură fiscală cu TVA deductibil, asistență tehnică dedicată și livrare la nivel național în 2-3 zile.`
            : `Prețurile pentru categoria ${categoryName} pornesc de la ${minPriceFormatted} Lei și ajung până la ${maxPriceFormatted} Lei pentru seturile complexe de top. În plus, beneficiezi de deschiderea coletului la livrare, livrare rapidă prin curier (DPD, Fan Courier) și 30 de zile drept de retur gratuit.`,
        },
      ],
      parentName,
    };
  }
}
