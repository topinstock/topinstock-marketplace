import { prisma } from '@/lib/prisma';
import { CATALOG_CARD_SELECT, formatDbProduct, CatalogProduct } from '@/lib/products';

export interface SeasonalSectionConfig {
  id: string;
  badgeText: string;
  badgeTheme: 'festive' | 'kitchen' | 'toys' | 'comfort';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  highlight1: string;
  products: CatalogProduct[];
}

// In-memory cache for ultra-fast, 0ms load times on homepage
let cachedSeasonalSections: SeasonalSectionConfig[] | null = null;
let lastSeasonalFetch = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getSeasonalSections(): Promise<SeasonalSectionConfig[]> {
  if (cachedSeasonalSections && Date.now() - lastSeasonalFetch < CACHE_TTL_MS) {
    return cachedSeasonalSections;
  }

  const selectedIds = new Set<string>();

  const baseWhere = {
    isPublished: true,
    stock: { gt: 0 },
    price: { gt: 0 },
    NOT: {
      OR: [
        { category: { slug: { contains: 'engross' } } },
        { title: { contains: 'pistol cu apa' } },
        { title: { contains: 'pistoale cu apa' } },
        { title: { contains: 'piscina' } },
        { title: { contains: 'piscine' } },
        { title: { contains: 'plaja' } },
        { title: { contains: 'plajă' } },
        { title: { contains: 'ventilator' } },
        { title: { contains: 'ventilatoare' } },
        { title: { contains: 'gratar de gradina' } },
        { title: { contains: 'grătar de vară' } },
        { title: { contains: 'mobilier terasa' } },
        { title: { contains: 'mobilier terasă' } },
        { title: { contains: 'slefuitor' } },
        { title: { contains: 'aspirator nazal' } },
        { title: { contains: 'Happy Birthday' } },
        { title: { contains: 'martisor' } },
        { title: { contains: 'creion' } },
        { title: { contains: 'creioane' } },
      ],
    },
  };

  function pickUnique(candidates: any[], count = 8): CatalogProduct[] {
    const picked: CatalogProduct[] = [];
    for (const raw of candidates) {
      if (picked.length >= count) break;
      if (!selectedIds.has(raw.id)) {
        selectedIds.add(raw.id);
        picked.push(formatDbProduct(raw));
      }
    }
    return picked;
  }

  try {
    // ==========================================
    // SECTION 1: Magia Sărbătorilor: Instalații & Decoruri de Crăciun
    // ==========================================
    const sec1Candidates = await prisma.product.findMany({
      where: {
        ...baseWhere,
        OR: [
          {
            category: {
              slug: {
                in: [
                  'brazi-de-craciun',
                  'decoratiuni-de-craciun',
                  'turturi-franjuri',
                  'instalatii-si-figurine-craciun',
                  'instalatii-de-craciun',
                  'instalatii-cu-baterii',
                  'instalatii-220v',
                  'beteala-craciun',
                  'proiectoare-craciun',
                ],
              },
            },
          },
          { title: { contains: 'Brad de Crăciun' } },
          { title: { contains: 'Brad artificial' } },
          { title: { contains: 'brad artificial' } },
          { title: { contains: 'Instalație' } },
          { title: { contains: 'Instalatie' } },
          { title: { contains: 'instalatie' } },
          { title: { contains: 'turturi' } },
          { title: { contains: 'perdea lumini' } },
          { title: { contains: 'ghirlandă' } },
          { title: { contains: 'ghirlanda' } },
          { title: { contains: 'furtun luminos' } },
          { title: { contains: 'banda led' } },
          { title: { contains: 'proiector craciun' } },
        ],
        NOT: {
          OR: [
            { title: { contains: 'Set de vase' } },
            { title: { contains: 'Mixer' } },
            { title: { contains: 'oale' } },
            { title: { contains: 'Slefuitor' } },
            { category: { slug: { in: ['oale', 'mixer-si-set-de-mixere', 'tigai'] } } },
          ],
        },
      },
      orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }, { rating: 'desc' }],
      take: 30,
      select: CATALOG_CARD_SELECT,
    });
    const sec1Products = pickUnique(sec1Candidates, 8);

    // ==========================================
    // SECTION 2: Pregătiri de Sărbători: Bucătărie, Cârnați & Cozonaci
    // ==========================================
    const sec2Candidates = await prisma.product.findMany({
      where: {
        ...baseWhere,
        id: { notIn: Array.from(selectedIds) },
        OR: [
          {
            category: {
              slug: {
                in: [
                  'masini-de-umplut-carnati',
                  'masini-de-tocat-carne',
                  'oale',
                  'oale-sub-presiune',
                  'cratite',
                  'tavi-si-forme-copt',
                  'mixer-si-set-de-mixere',
                  'robot-de-bucatarie',
                ],
              },
            },
          },
          { title: { contains: 'cârnați' } },
          { title: { contains: 'carnati' } },
          { title: { contains: 'mașină de tocat' } },
          { title: { contains: 'masina de tocat' } },
          { title: { contains: 'tocat carne' } },
          { title: { contains: 'robot de bucătărie' } },
          { title: { contains: 'mixer cu bol' } },
          { title: { contains: 'mixer' } },
          { title: { contains: 'frământat' } },
          { title: { contains: 'tavă copt' } },
          { title: { contains: 'tava copt' } },
          { title: { contains: 'cozonac' } },
          { title: { contains: 'set oale' } },
          { title: { contains: 'Set oale' } },
          { title: { contains: 'oală sub presiune' } },
          { title: { contains: 'oala sub presiune' } },
          { title: { contains: 'cratita' } },
          { title: { contains: 'ceaun' } },
          { title: { contains: 'kukta' } },
        ],
        NOT: {
          OR: [
            { title: { contains: 'creion' } },
            { title: { contains: 'fidget' } },
            { title: { contains: 'jucarie' } },
            { category: { slug: { in: ['needoh-si-dumpling', 'jucarii', 'accesorii-birou-si-consumabile'] } } },
          ],
        },
      },
      orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }, { rating: 'desc' }],
      take: 40,
      select: CATALOG_CARD_SELECT,
    });

    // Balanced distribution: prioritize appliances/grinders/mixers first, then cookware
    const sec2Specialized = sec2Candidates.filter((p: any) => {
      const t = p.title.toLowerCase();
      const c = p.category?.slug || '';
      return (
        t.includes('tocat') ||
        t.includes('carnat') ||
        t.includes('cârnaț') ||
        t.includes('mixer') ||
        t.includes('robot') ||
        t.includes('framant') ||
        c.includes('carnati') ||
        c.includes('tocat') ||
        c.includes('mixer')
      );
    });
    const sec2Cookware = sec2Candidates.filter((p: any) => !sec2Specialized.includes(p));

    const sec2Combined = [
      ...sec2Specialized.slice(0, 4),
      ...sec2Cookware.slice(0, 4),
      ...sec2Candidates,
    ];
    const sec2Products = pickUnique(sec2Combined, 8);

    // ==========================================
    // SECTION 3: Fabrica de Cadouri: Jucării pentru Moș Nicolae & Crăciun
    // ==========================================
    const sec3Candidates = await prisma.product.findMany({
      where: {
        ...baseWhere,
        id: { notIn: Array.from(selectedIds) },
        OR: [
          {
            category: {
              slug: {
                in: [
                  'jucarii-si-jocuri',
                  'jucarii',
                  'jucarie-din-lemn',
                  'jucarie-cu-telecomanda',
                  'masinute-de-jucarie',
                  'trotinete-pentru-copii',
                  'jocuri-de-societate-si-familie',
                ],
              },
            },
          },
          { title: { contains: 'jucărie' } },
          { title: { contains: 'jucarie' } },
          { title: { contains: 'mașinuță' } },
          { title: { contains: 'masinuta' } },
          { title: { contains: 'păpușă' } },
          { title: { contains: 'papusa' } },
          { title: { contains: 'set constructie' } },
          { title: { contains: 'constructie' } },
          { title: { contains: 'cuburi' } },
          { title: { contains: 'interactiv' } },
          { title: { contains: 'pluș' } },
          { title: { contains: 'plus' } },
          { title: { contains: 'joc' } },
          { title: { contains: 'trotinetă' } },
          { title: { contains: 'trotineta' } },
          { title: { contains: 'robotel' } },
        ],
        NOT: {
          OR: [
            {
              category: {
                slug: {
                  in: [
                    'jucarii-de-plaja',
                    'biciclete-pentru-copii',
                    'birou',
                    'mobilier-copii',
                    'accesorii-biciclete',
                  ],
                },
              },
            },
            { title: { contains: 'apa' } },
            { title: { contains: 'apă' } },
            { title: { contains: 'plaja' } },
            { title: { contains: 'plajă' } },
            { title: { contains: 'nisip' } },
            { title: { contains: 'piscina' } },
            { title: { contains: 'piscină' } },
            { title: { contains: 'saltea gonflabila' } },
            { title: { contains: 'colac' } },
            { title: { contains: 'furtun' } },
            { title: { contains: 'plita' } },
            { title: { contains: 'birou' } },
            { title: { contains: 'scaun' } },
            { title: { contains: 'bicicleta' } },
            { title: { contains: 'bicicletă' } },
          ],
        },
      },
      orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }, { rating: 'desc' }],
      take: 40,
      select: CATALOG_CARD_SELECT,
    });
    const sec3Products = pickUnique(sec3Candidates, 8);

    // ==========================================
    // SECTION 4: Electrocasnice & Confort de Iarnă
    // ==========================================
    const sec4Candidates = await prisma.product.findMany({
      where: {
        ...baseWhere,
        id: { notIn: Array.from(selectedIds) },
        OR: [
          {
            category: {
              slug: {
                in: [
                  'calorifere-tip-panou',
                  'electrocasnice',
                  'aspirator-vertical',
                  'aspiratoare',
                  'fierbator-de-apa-si-ceainic',
                  'prajitor-de-paine',
                  'rasnite-de-cafea-si-condimente',
                  'aparate-de-cafea-cu-filtru',
                  'radiatoare-si-seminee-electrice',
                ],
              },
            },
          },
          { title: { contains: 'aerotermă' } },
          { title: { contains: 'aeroterma' } },
          { title: { contains: 'calorifer' } },
          { title: { contains: 'încălzitor' } },
          { title: { contains: 'incalzitor' } },
          { title: { contains: 'radiator' } },
          { title: { contains: 'espressor' } },
          { title: { contains: 'cafetieră' } },
          { title: { contains: 'cafetiera' } },
          { title: { contains: 'fierbător' } },
          { title: { contains: 'fierbator' } },
          { title: { contains: 'prăjitor' } },
          { title: { contains: 'prajitor' } },
          { title: { contains: 'airfryer' } },
          { title: { contains: 'friteuză' } },
          { title: { contains: 'friteuza' } },
          { title: { contains: 'aspirator' } },
        ],
        NOT: {
          OR: [
            { title: { contains: 'nazal' } },
            { title: { contains: 'auto' } },
            { title: { contains: 'masina' } },
            { title: { contains: 'ventilator' } },
          ],
        },
      },
      orderBy: [{ reviewsCount: 'desc' }, { stock: 'desc' }, { rating: 'desc' }],
      take: 30,
      select: CATALOG_CARD_SELECT,
    });
    const sec4Products = pickUnique(sec4Candidates, 8);

    const sections: SeasonalSectionConfig[] = [
      {
        id: 'craciun-decoruri',
        badgeText: 'Magia Sărbătorilor • Ediție de Iarnă',
        badgeTheme: 'festive',
        title: 'Magia Sărbătorilor: Instalații & Decoruri de Crăciun',
        subtitle:
          'Transformă-ți casa pentru sărbători cu luminițe, brazi și decorațiuni de iarnă.',
        ctaText: 'Vezi toate decorațiunile',
        ctaHref: '/turturi-franjuri/c',
        highlight1: 'Instalații LED de exterior & Brazi artificiali bogați',
        products: sec1Products,
      },
      {
        id: 'bucatarie-sarbatori',
        badgeText: 'Masa Tradițională de Sărbători',
        badgeTheme: 'kitchen',
        title: 'Pregătiri de Sărbători: Bucătărie, Cârnați & Cozonaci',
        subtitle:
          'Tot ce ai nevoie pentru masa tradițională: mașini de tocat, aparate de cârnați, roboți de frământat și oale încăpătoare.',
        ctaText: 'Vezi ustensilele de bucătărie',
        ctaHref: '/oale/c',
        highlight1: 'Inox alimentar rezistent & Mașini puternice de tocat',
        products: sec2Products,
      },
      {
        id: 'fabrica-cadouri',
        badgeText: 'Fabrica de Cadouri • Moș Nicolae & Crăciun',
        badgeTheme: 'toys',
        title: 'Fabrica de Cadouri: Jucării pentru Moș Nicolae & Crăciun',
        subtitle: 'Cele mai dorite jucării și jocuri interactive pentru cei mici.',
        ctaText: 'Vezi toate cadourile',
        ctaHref: '/jucarii-si-jocuri/c',
        highlight1: 'Jocuri educative, vehicule & cadouri gata de pus sub brad',
        products: sec3Products,
      },
      {
        id: 'confort-iarna',
        badgeText: 'Confort Termic & Răsfăț în Casă',
        badgeTheme: 'comfort',
        title: 'Electrocasnice & Confort de Iarnă',
        subtitle:
          'Căldură și răsfăț în zilele reci: încălzire, cafea caldă și aparate utile în casă.',
        ctaText: 'Vezi electrocasnicele de iarnă',
        ctaHref: '/calorifere-tip-panou/c',
        highlight1: 'Consum energetic optimizat & Încălzire rapidă',
        products: sec4Products,
      },
    ];

    cachedSeasonalSections = sections;
    lastSeasonalFetch = Date.now();
    return sections;
  } catch (err) {
    console.error('Error fetching seasonal sections:', err);
    return cachedSeasonalSections || [];
  }
}
