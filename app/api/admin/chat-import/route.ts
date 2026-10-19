import { NextResponse } from 'next/server';

// ============================================
//   POST /api/admin/chat-import
//   Direct Listing Product Importer
//   - Extracts ONLY exact photos from the provided listing URL
//   - Zero generic search engine image fallbacks
//   - Cloudflare-bypass pipeline using Google proxy for direct HTML extraction
//   - Accurate JSON-LD schema parsing (exact title, price, brand, description, photos)
//   - Returns DRAFT data for vendor review and editing
// ============================================

export const maxDuration = 30;

interface ChatImportPayload {
  message: string;
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

// ── Bot Challenge & Anti-Scraping Detector ──
function isBotChallengeOrInvalid(html: string): boolean {
  if (!html || html.length < 300) return true;
  // If the page contains a valid Schema.org Product, it is definitively a valid product listing!
  if (html.includes('"@type":"Product"') || html.includes('"@type": "Product"')) {
    return false;
  }
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = (titleMatch ? titleMatch[1] : '').toLowerCase();
  const trapPhrases = [
    'online alışveriş sitesi',
    'gizlilik tercihi',
    'just a moment',
    'attention required',
    'access denied',
    'robot check',
    'robot or human',
    'verify you are human',
    'select country',
    'challenge',
  ];
  return trapPhrases.some((phrase) => title.includes(phrase));
}

// ── Build Google Proxy URL for Cloudflare-Protected Sites ──
function buildTranslateProxyUrl(originalUrl: string): string {
  try {
    const u = new URL(originalUrl);
    const hostWithHyphens = u.hostname.replace(/\./g, '-');
    const proxyHost = `${hostWithHyphens}.translate.goog`;
    const searchParams = new URLSearchParams(u.search);
    searchParams.set('_x_tr_sl', 'auto');
    searchParams.set('_x_tr_tl', 'ro');
    searchParams.set('_x_tr_hl', 'ro');
    return `https://${proxyHost}${u.pathname}?${searchParams.toString()}`;
  } catch {
    return originalUrl;
  }
}

// ── Romanian Dictionary for Slug Normalization ──
const RO_DICTIONARY: Record<string, string> = {
  leagan: 'Leagăn',
  copii: 'copii',
  bebelusi: 'bebeluși',
  bebelus: 'bebeluș',
  bebe: 'bebe',
  pentru: 'pentru',
  interior: 'interior',
  exterior: 'exterior',
  roz: 'Roz',
  negru: 'Negru',
  alb: 'Alb',
  albastru: 'Albastru',
  rosu: 'Roșu',
  verde: 'Verde',
  galben: 'Galben',
  gri: 'Gri',
  bej: 'Bej',
  maro: 'Maro',
  mov: 'Mov',
  turcoaz: 'Turcoaz',
  auriu: 'Auriu',
  argintiu: 'Argintiu',
  barbati: 'bărbați',
  barbat: 'bărbat',
  femei: 'femei',
  fete: 'fete',
  baieti: 'băieți',
  camasa: 'Cămașă',
  rochie: 'Rochie',
  fusta: 'Fustă',
  tricou: 'Tricou',
  pantaloni: 'Pantaloni',
  geaca: 'Geacă',
  pantofi: 'Pantofi',
  adidasi: 'Adidași',
  ghete: 'Ghete',
  sandale: 'Sandale',
  scaun: 'Scaun',
  masa: 'Masă',
  pat: 'Pat',
  dulap: 'Dulap',
  casti: 'Căști',
  ceas: 'Ceas',
  telefon: 'Telefon',
  balansoar: 'Balansoar',
  carucior: 'Cărucior',
  premergator: 'Premergător',
  patut: 'Pătuț',
  jucarie: 'Jucărie',
  jucarii: 'Jucării',
  farfurii: 'Farfurii',
  farfurie: 'Farfurie',
  boluri: 'Boluri',
  bol: 'Bol',
  set: 'Set',
  tort: 'tort',
  desert: 'desert',
  portelan: 'porțelan',
  ceramica: 'ceramică',
};

function formatSlugWord(w: string, isFirst: boolean): string {
  const clean = w.toLowerCase().trim();
  if (RO_DICTIONARY[clean]) {
    const val = RO_DICTIONARY[clean];
    return isFirst ? val.charAt(0).toUpperCase() + val.slice(1) : val;
  }
  if (isFirst) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
}

// ── Extract ONLY Exact Listing Photos from HTML ──
function extractExactListingImages(html: string): string[] {
  const images: string[] = [];

  // 1. JSON-LD Product Schema (Guaranteed exact product photos, no recommendations)
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  for (const s of jsonLdMatches) {
    const clean = s.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '').trim();
    try {
      const obj = JSON.parse(clean);
      const prod = obj['@type'] === 'Product' ? obj : (Array.isArray(obj['@graph']) ? obj['@graph'].find((i: any) => i['@type'] === 'Product') : null);
      if (prod && prod.image) {
        if (Array.isArray(prod.image)) {
          prod.image.forEach((img: any) => {
            const u = typeof img === 'string' ? img : (img.contentUrl || img.url);
            if (typeof u === 'string' && u.startsWith('http')) images.push(u);
          });
        } else if (typeof prod.image === 'object' && prod.image.contentUrl) {
          const list = Array.isArray(prod.image.contentUrl) ? prod.image.contentUrl : [prod.image.contentUrl];
          list.forEach((u: any) => {
            if (typeof u === 'string' && u.startsWith('http')) images.push(u);
          });
        } else if (typeof prod.image === 'string' && prod.image.startsWith('http')) {
          images.push(prod.image);
        }
      }
    } catch {}
  }

  // 2. OpenGraph meta tag image (Official listing thumbnail)
  if (images.length === 0) {
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
      images.push(ogMatch[1]);
    }
  }

  // 3. Twitter Card image
  if (images.length === 0) {
    const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    if (twMatch && twMatch[1] && twMatch[1].startsWith('http')) {
      images.push(twMatch[1]);
    }
  }

  // Deduplicate and filter out logos / icons
  const cleanList = Array.from(new Set(images)).filter((u) => {
    if (!u.startsWith('http')) return false;
    const lower = u.toLowerCase();
    if (lower.includes('apple-icon') || lower.includes('favicon') || lower.includes('logo') || lower.includes('banner')) return false;
    return true;
  });

  return cleanList;
}

// ── Accurate Price Parsing (Excludes dimensions like '115 cm') ──
function parsePrice(text: string): { price: number; originalPrice?: number } {
  // Explicit currency expressions: e.g. "184,50 lei", "184.5 lei", "184 lei", "184 RON"
  const regex = /(\d+[\.,]?\d*)\s*(?:lei|ron|€|\$|eur)\b/gi;
  const numbers: number[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[1].replace(',', '.');
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0 && val < 50000) {
      numbers.push(val);
    }
  }

  if (numbers.length >= 2) {
    const sorted = [...numbers].sort((a, b) => b - a);
    return { originalPrice: sorted[0], price: sorted[1] };
  }

  if (numbers.length === 1) {
    return { price: numbers[0] };
  }

  return { price: 0 };
}

// ── Extract JSON-LD Product Object ──
function extractJsonLdProduct(html: string): any | null {
  try {
    const scripts = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    for (const s of scripts) {
      const clean = s.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '').trim();
      try {
        const obj = JSON.parse(clean);
        if (obj['@type'] === 'Product') return obj;
        if (Array.isArray(obj['@graph'])) {
          const prod = obj['@graph'].find((i: any) => i['@type'] === 'Product');
          if (prod) return prod;
        }
      } catch {}
    }
  } catch {}
  return null;
}

// ── Category Resolution ──
function resolveCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('leagan') || t.includes('balansoar')) return 'leagane-pentru-copii';
  if (t.includes('farfuri') || t.includes('boluri') || t.includes('vesela') || t.includes('cani') || t.includes('oale')) return 'seturi-vesela';
  if (t.includes('copii') || t.includes('bebe') || t.includes('jucari')) return 'copii-jucarii';
  if (t.includes('telefon') || t.includes('laptop') || t.includes('casti') || t.includes('smartwatch')) return 'electrocasnice';
  if (t.includes('camasa') || t.includes('barbat')) return 'camasi-barbati';
  if (t.includes('rochie') || t.includes('femei')) return 'rochii-femei';
  if (t.includes('pantof') || t.includes('adidasi') || t.includes('ghete')) return 'moda-incaltaminte';
  if (t.includes('bucatarie') || t.includes('menaj')) return 'bucatarie-menaj';
  return 'casa-decoratiuni';
}

// ── Multi-Stage HTML Fetcher with Google Proxy Fallback ──
async function fetchListingHtml(targetUrl: string): Promise<string> {
  // 1. Try Direct Fetch
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      if (!isBotChallengeOrInvalid(html)) {
        return html;
      }
    }
  } catch {}

  // 2. Try Google Translate Transparent Proxy (Bypasses Cloudflare & Bot Fight Mode)
  try {
    const proxyUrl = buildTranslateProxyUrl(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      if (!isBotChallengeOrInvalid(html)) {
        return html;
      }
    }
  } catch {}

  return '';
}

// ── Parse Trendyol URL as Structural Fallback ──
function parseTrendyolSlugFallback(urlStr: string) {
  try {
    const u = new URL(urlStr);
    const segments = u.pathname.split('/').filter(Boolean);
    const brandSegment = segments[1] || '';
    const productSegment = segments[2] || '';

    const brand = brandSegment
      ? brandSegment
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : '';

    const pMatch = productSegment.match(/-p-(\d+)/);
    const productId = pMatch ? pMatch[1] : '';

    let rawSlug = productSegment.replace(/-p-\d+.*$/, '');
    const brandWords = brandSegment.toLowerCase().split('-');
    const words = rawSlug.split('-').filter((w) => w && !brandWords.includes(w.toLowerCase()));

    const formattedWords = words.map((w, idx) => formatSlugWord(w, idx === 0));
    const titleCore = formattedWords.join(' ');
    const title = brand ? `${brand} - ${titleCore}` : titleCore;

    return {
      title,
      brand,
      sku: productId ? `TY-${productId}` : `TY-${Date.now().toString().slice(-6)}`,
      categorySlug: resolveCategory(title),
    };
  } catch {
    return null;
  }
}

// ── Main Chat Import POST Handler ──
export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const message = (body.message || body.prompt || '')?.trim();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesajul este gol. Introdu un link sau o descriere a produsului.' },
        { status: 400 }
      );
    }

    const urls = extractUrls(message);
    const targetUrl = urls[0] || '';

    let detectedTitle = '';
    let detectedDesc = '';
    let detectedBrand = '';
    let detectedCategory = 'casa-decoratiuni';
    let detectedFeatures: string[] = [];
    let detectedColors: string[] = [];
    let detectedSizes: string[] = [];
    let detectedSku = `SKU-${Date.now().toString().slice(-6)}`;
    let detectedMaterial = '';
    let detectedWarranty = '24 luni';
    let detectedImages: string[] = [];
    let price = 0;
    let originalPrice: number | null = null;

    // 1. Check if user typed an explicit price in their chat message (e.g. "link 184.5 lei")
    const priceFromPrompt = parsePrice(message);
    if (priceFromPrompt.price > 0) {
      price = priceFromPrompt.price;
      originalPrice = priceFromPrompt.originalPrice || null;
    }

    // 2. Fetch live HTML of the listing (Direct or via Google Proxy)
    let html = '';
    if (targetUrl) {
      html = await fetchListingHtml(targetUrl);
    }

    // 3. Extract EXACT data from JSON-LD Schema (Highest priority & accuracy)
    const jsonLd = html ? extractJsonLdProduct(html) : null;
    if (jsonLd) {
      if (jsonLd.name) {
        detectedTitle = jsonLd.name.trim();
      }
      if (jsonLd.brand?.name || jsonLd.manufacturer) {
        detectedBrand = (jsonLd.brand?.name || jsonLd.manufacturer).trim();
      }
      if (jsonLd.description && !isBotChallengeOrInvalid(jsonLd.description)) {
        detectedDesc = jsonLd.description.trim();
      }
      if (jsonLd.offers?.price && price === 0) {
        const p = parseFloat(jsonLd.offers.price);
        if (!isNaN(p) && p > 0) {
          price = p;
        }
      }
      if (jsonLd.sku) {
        detectedSku = String(jsonLd.sku);
      }
      if (jsonLd.color) {
        detectedColors = [String(jsonLd.color)];
      }

      // Extract additional properties / specifications
      if (Array.isArray(jsonLd.additionalProperty)) {
        jsonLd.additionalProperty.forEach((prop: any) => {
          if (prop?.name && prop?.unitText) {
            detectedFeatures.push(`${prop.name}: ${prop.unitText}`);
            if (prop.name.toLowerCase().includes('culoare') && !detectedColors.length) {
              detectedColors.push(prop.unitText);
            }
            if (prop.name.toLowerCase().includes('material')) {
              detectedMaterial = prop.unitText;
            }
          }
        });
      }

      // EXACT LISTING PHOTOS ONLY
      const listingImgs = extractExactListingImages(html);
      if (listingImgs.length > 0) {
        detectedImages = listingImgs;
      }
    } else if (html) {
      // Non-JSON-LD listing extraction
      const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitle && ogTitle[1] && !isBotChallengeOrInvalid(ogTitle[1])) {
        detectedTitle = ogTitle[1].replace(/[|\-].*$/, '').trim();
      }

      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      if (ogDesc && ogDesc[1] && !isBotChallengeOrInvalid(ogDesc[1])) {
        detectedDesc = ogDesc[1].trim();
      }

      if (price === 0) {
        const parsed = parsePrice(html);
        if (parsed.price > 0) {
          price = parsed.price;
          originalPrice = parsed.originalPrice || null;
        }
      }

      const listingImgs = extractExactListingImages(html);
      if (listingImgs.length > 0) {
        detectedImages = listingImgs;
      }
    }

    // 4. Structural Fallback if HTML couldn't be loaded (e.g. offline)
    if (!detectedTitle && targetUrl) {
      if (targetUrl.includes('trendyol.com')) {
        const fallback = parseTrendyolSlugFallback(targetUrl);
        if (fallback) {
          detectedTitle = fallback.title;
          detectedBrand = fallback.brand;
          detectedSku = fallback.sku;
          detectedCategory = fallback.categorySlug;
        }
      }
    }

    // 5. Raw Text Message Paste Fallback
    if (!detectedTitle) {
      const lines = message.split('\n').map((l: string) => l.trim()).filter(Boolean);
      detectedTitle = lines[0]?.slice(0, 100) || 'Produs Nou Importat';
      detectedDesc = lines.slice(1).join('\n\n') || detectedTitle;
    }

    // 6. Resolve Category
    detectedCategory = resolveCategory(detectedTitle + ' ' + (detectedDesc || ''));

    // 7. Ensure Clean Description & Features
    if (!detectedDesc) {
      detectedDesc = `Produs original ${detectedBrand ? detectedBrand + ' ' : ''}: ${detectedTitle}.\n\nCalitate garantată, conform specificațiilor originale ale producătorului.`;
    }
    if (detectedFeatures.length === 0) {
      if (detectedBrand) detectedFeatures.push(`Brand oficial: ${detectedBrand}`);
      detectedFeatures.push('Produs original și verificat');
      detectedFeatures.push('Garanție inclusă 24 luni');
    }

    // 8. Build Draft Product
    // Note: detectedImages contains ONLY the photos of that specific listing!
    // No random search engine images are ever added.
    const draftProduct = {
      title: detectedTitle,
      description: detectedDesc,
      brand: detectedBrand,
      price,
      originalPrice,
      stock: 10,
      sku: detectedSku,
      images: detectedImages, // ONLY exact listing photos
      sizes: detectedSizes,
      colors: detectedColors,
      categorySlug: detectedCategory,
      material: detectedMaterial,
      warranty: detectedWarranty,
      weight: '',
      features: detectedFeatures,
      sourceUrl: targetUrl || null,
      extractedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      draft: draftProduct,
      sourceUrl: targetUrl || null,
      aiUsed: !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY),
    });
  } catch (error: any) {
    console.error('Chat import error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Eroare la procesarea produsului.' },
      { status: 500 }
    );
  }
}
