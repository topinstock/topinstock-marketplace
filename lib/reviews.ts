// ============================================
//   TopinStock — Deterministic Review Generator
//   Generates realistic, category-tailored Romanian
//   customer reviews matching exact reviewsCount
// ============================================

export interface ReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  likes: number;
}

export interface ReviewProductInput {
  id: string;
  title: string;
  category?: { slug?: string; name?: string } | null;
  vendor?: { storeName?: string } | null;
  rating?: number | null;
  reviewsCount?: number | null;
}

// ── Pool of authentic Romanian Names ───────────────────────────────────────────
const FIRST_NAMES = [
  'Andrei', 'Elena', 'Alexandru', 'Maria', 'Radu', 'Ioana', 'Cristian', 'Andreea',
  'Mihai', 'Gabriel', 'Simona', 'Florin', 'Diana', 'Vlad', 'Raluca', 'Bogdan',
  'Carmen', 'Ionuț', 'Laura', 'Marius', 'Oana', 'Dan', 'Cristina', 'Claudiu',
  'Roxana', 'Adrian', 'Mihaela', 'Paul', 'Ana-Maria', 'George', 'Alina', 'Sorin',
  'Valentina', 'Cosmin', 'Daniela', 'Victor', 'Nicoleta', 'Răzvan', 'Georgiana',
  'Lucian', 'Anca', 'Emil', 'Monica', 'Costin', 'Irina', 'Ștefan', 'Lavinia',
  'Tudor', 'Loredana', 'Cătălin', 'Patricia', 'Robert', 'Denisa', 'Liviu', 'Silvia',
  'Vasile', 'Bianca', 'Dorin', 'Camelia', 'Octavian', 'Simona', 'Mircea'
];

const LAST_NAMES = [
  'Popescu', 'Ionescu', 'Radu', 'Dumitrescu', 'Stan', 'Vasile', 'Tudor', 'Dobre',
  'Marinescu', 'Constantinescu', 'Nistor', 'Stoica', 'Gheorghe', 'Ilie', 'Moldovan',
  'Enache', 'Oprea', 'Diaconu', 'Barbu', 'Munteanu', 'Florea', 'Voinea', 'Cristea',
  'Preda', 'Popa', 'Stanciu', 'Neagu', 'Petrescu', 'Drăgan', 'Mocanu', 'Badea',
  'Cojocaru', 'Lupu', 'Toma', 'Sandu', 'Șerban', 'Grigore', 'Iacob', 'Mihai', 'Avram',
  'Vasilescu', 'Dinu', 'Roman', 'Chiriac', 'Mihăilescu', 'Moraru', 'Gheorghiu'
];

// ── Realistic Dates Ordered from Recent to Past ──────────────────────────────
const ORDERED_DATE_POOL = [
  'Acum 1 zi',
  'Acum 2 zile',
  'Acum 3 zile',
  'Acum 4 zile',
  'Acum 5 zile',
  'Acum 6 zile',
  'Acum 1 săptămână',
  'Acum 9 zile',
  'Acum 10 zile',
  'Acum 12 zile',
  'Acum 2 săptămâni',
  'Acum 16 zile',
  'Acum 3 săptămâni',
  'Acum 24 zile',
  'Acum 1 lună',
  'Acum 5 săptămâni',
  'Acum 6 săptămâni',
  'Acum 2 luni',
  'Acum 2 luni și jumătate',
  'Acum 3 luni',
  'Acum 3 luni și jumătate',
  'Acum 4 luni',
  'Acum 5 luni',
  'Acum 6 luni',
];

// ── Category-Specific Review Templates ────────────────────────────────────────
interface ReviewTemplate {
  title: string;
  comment: string;
  ratingMin?: number;
}

const KITCHEN_REVIEWS: ReviewTemplate[] = [
  {
    title: 'Calitate excelentă a inoxului, recomand!',
    comment: 'Comanda a ajuns a doua zi prin curier. Ambalajul a fost intact, iar calitatea materialului este exact așa cum e descrisă. Baza este groasă și nu lipește deloc pe inducție.',
  },
  {
    title: 'Finisaje impecabile și distribuție uniformă a căldurii',
    comment: 'Materialul este solid, greu, se vede imediat că e un produs original. Mânerele nu se încălzesc excesiv, iar mâncarea iese delicioasă. Se spală foarte ușor.',
  },
  {
    title: 'Raport calitate/preț imbatabil în bucătărie',
    comment: 'Am înlocuit vechile vase cu acest model și diferența se simte din prima zi. Se curăță fără efort și arată foarte elegant pe aragaz.',
  },
  {
    title: 'Exact ce căutam pentru gătit zilnic',
    comment: 'Folosesc produsul de două săptămâni aproape zilnic. Suprafața rezistă perfect, mâncarea nu se arde, iar capacul etanșează foarte bine aburul.',
  },
  {
    title: 'Super mulțumită de achiziție!',
    comment: 'Aspect modern, finisaj lucios frumos și materiale durabile. A venit ambalat cu mare grijă în folie de protecție.',
  },
  {
    title: 'Oale solide cu fund triplu stratificat',
    comment: 'Păstrează căldura mult timp după ce opresc focul. Merită fiecare leu, felicitări vânzătorului pentru livrarea rapidă!',
  },
  {
    title: 'Foarte bune pentru plită cu inducție',
    comment: 'Recunoaște vasul instantaneu pe plită, apa fierbe mult mai repede decât în alte vase. Recomand cu încredere.',
  },
  {
    title: 'Produs conform specificațiilor',
    comment: 'Totul conform descrierii de pe site. Inoxul este alimentar de calitate bună, mânerele bine nituite și finisajele curate.',
  },
  {
    title: 'Calitate premium la preț corect',
    comment: 'Am gătit ciorbe, tocănițe și sosuri. Nimic nu s-a lipit de fund. Se curăță ușor cu detergent normal de vase.',
  },
  {
    title: 'O surpriză foarte plăcută',
    comment: 'La început eram sceptică la prețul acesta, dar când am deschis coletul am rămas impresionată. Arată de nota 10.',
  },
  {
    title: 'Cadou apreciat de soție',
    comment: 'L-am luat cadou pentru soție și este extrem de încântată. Gătește cu drag în ele în fiecare weekend.',
  },
  {
    title: 'Curățare rapidă și rezistență în timp',
    comment: 'După mai multe spălări la mașina de spălat vase luciul s-a păstrat impecabil. Fără pete sau deformări.',
  },
];

const APPLIANCE_REVIEWS: ReviewTemplate[] = [
  {
    title: 'Foarte puternic și silențios',
    comment: 'Funcționează ireproșabil, motorul are o putere excelentă și este surprinzător de silențios. Își face treaba rapid și fără efort.',
  },
  {
    title: 'Peste așteptări, produs de încredere!',
    comment: 'Construcție robustă, butoane receptive și materiale de calitate. Livrarea TOPinStock a fost impecabilă, în mai puțin de 48 de ore.',
  },
  {
    title: 'Ușor de utilizat și foarte eficient',
    comment: 'Manualul de instrucțiuni este clar în limba română, l-am pus în funcțiune în 5 minute. Consumul de energie este redus, foarte mulțumit.',
  },
  {
    title: 'Un aparat indispensabil în casă',
    comment: 'Economisește foarte mult timp zilnic. Funcționează perfect conform specificațiilor descrise pe site.',
  },
  {
    title: 'Design compact și finisaje moderne',
    comment: 'Ocupă puțin spațiu pe blat, arată estetic și funcționează fără nicio eroare. Recomand cu drag!',
  },
  {
    title: 'Încălzire rapidă și randament mare',
    comment: 'Atinge temperatura setată în câteva secunde. Cablul de alimentare este suficient de lung și calitativ.',
  },
  {
    title: 'Raport preț/performanță imbatabil',
    comment: 'Brand bun, am mai cumpărat produse de la ei și nu au dezamăgit niciodată. Vânzător serios.',
  },
  {
    title: 'Solid și stabil în timpul utilizării',
    comment: 'Baza are piciorușe anti-alunecare foarte eficiente. Nu vibrează și nu se încălzește carcasa.',
  },
];

const BIKE_REVIEWS: ReviewTemplate[] = [
  {
    title: 'Bicicletă excelentă, copilul este în culmea fericirii!',
    comment: 'A venit parțial asamblată, a durat doar 15 minute să montez pedalele și ghidonul. Cadrul este solid, frânele țin perfect, iar culoarea este superbă.',
  },
  {
    title: 'Sigură, robustă și bine finisată',
    comment: 'Materiale rezistente, roțile rulează foarte ușor. Recomand pentru raportul calitate/preț foarte avantajos.',
  },
  {
    title: 'Cadoul perfect, livrare super rapidă',
    comment: 'Comandată marți, miercuri după-amiază era deja la ușă. Cutia a fost intactă, toate piesele și accesoriile la locul lor.',
  },
  {
    title: 'Frâne eficiente și șa confortabilă',
    comment: 'Se reglează foarte ușor pe înălțime. Copilul merge zilnic cu ea prin parc fără nicio problemă.',
  },
  {
    title: 'Calitate bună la piese și suduri',
    comment: 'Cadrul de oțel inspiră încredere, protecția la lanț este solidă. O alegere sigură pentru cel mic.',
  },
];

const TOYS_REVIEWS: ReviewTemplate[] = [
  {
    title: 'Foarte calitativ și sigur pentru cei mici',
    comment: 'Plasticul este durabil, fără miros și fără margini ascuțite. Copilul se joacă ore întregi fără să se plictisească.',
  },
  {
    title: 'Recomand cu drag părinților!',
    comment: 'Culori vii, stimulează creativitatea și este foarte rezistent la căzături. O achiziție excelentă!',
  },
  {
    title: 'Ambalaj atractiv și piese rezistente',
    comment: 'A sosit la timp pentru ziua de naștere a băiețelului. Bucurie maximă la deschiderea pachetului!',
  },
  {
    title: 'Jucărie educativă și bine gândită',
    comment: 'Finisajele sunt sigure, nu se desprind piese mici. Merită toți banii.',
  },
];

const CHRISTMAS_LIGHTS_REVIEWS: ReviewTemplate[] = [
  {
    title: 'Creează o atmosferă magică de Crăciun!',
    comment: 'Lumina este caldă și plăcută, cablul este flexibil și rezistent. Arată senzațional pe fațada casei, consum mic de energie.',
  },
  {
    title: 'Calitate superioară, LED-uri luminoase',
    comment: 'Toate LED-urile funcționează perfect, modurile de iluminare sunt ușor de schimbat. Foarte mulțumit de achiziție!',
  },
  {
    title: 'Rezistentă la ploaie și ger',
    comment: 'Am montat instalația pe streașina casei și a rezistat impecabil la vânt și temperaturi negative. Efect vizual de poveste.',
  },
  {
    title: 'Frumos și ușor de întins',
    comment: 'Nu se încurcă firul, are conector rezistent și lungime generoasă. Felicitări magazinului!',
  },
];

const GENERAL_REVIEWS: ReviewTemplate[] = [
  {
    title: 'Produs excelent, raport calitate/preț imbatabil!',
    comment: 'Comanda a ajuns a doua zi prin curier. Ambalajul a fost intact, iar calitatea este exact așa cum e descrisă. Recomand cu încredere acest vânzător!',
  },
  {
    title: 'Foarte mulțumit de achiziție',
    comment: 'Finisajele sunt de calitate superioară, se observă că e un produs original. Îl folosesc zilnic și nu am avut nicio problemă. Merită toți banii!',
  },
  {
    title: 'Bun, conform specificațiilor',
    comment: 'Produsul corespunde exact cu pozele și descrierea. Livrarea a durat 48 de ore, curierul foarte amabil. Îi acord 5 stele cu felicitări!',
  },
  {
    title: 'Recomand, serios și prompt',
    comment: 'Totul a decurs fără cusur: comandă simplă pe site, confirmare rapidă și livrare la termen. Produsul este conform așteptărilor.',
  },
  {
    title: 'O surpriză plăcută',
    comment: 'La început am fost puțin reticent, dar produsul s-a dovedit a fi chiar mai bun decât mă așteptam. Construcție trainică și finisaje plăcute.',
  },
  {
    title: 'Achiziție inspirată',
    comment: 'Își îndeplinește funcția cu brio. Recomand TOPinStock pentru promptitudine și prețurile corecte practicate.',
  },
  {
    title: 'Calitate fără compromis',
    comment: 'Se vede atenția la detalii încă de când desfaci ambalajul. Nimic de reproșat, funcționează conform tuturor specificațiilor.',
  },
  {
    title: 'Peste așteptări la acest preț',
    comment: 'Materiale calitative, montaj intuitiv și rezistență mare. Am mai recomandat produsul și prietenilor.',
  },
  {
    title: 'Livrare ultra-rapidă și ambalaj protejat',
    comment: 'Cutia a fost învelită în folie cu bule protectoare. Produsul fără nicio urmă de zgârietură. Nota 10!',
  },
  {
    title: 'Comandă fără bătăi de cap',
    comment: 'Site-ul se mișcă foarte repede, plata a fost securizată și produsul a sosit la timp. Voi mai comanda cu siguranță.',
  },
  {
    title: 'Un produs util și bine realizat',
    comment: 'Face exact ceea ce promite. Materiale durabile și aspect plăcut. Îl recomand tuturor.',
  },
  {
    title: 'Solid și fiabil în timp',
    comment: 'După o lună de utilizare continuă se comportă impecabil. Merită investit în produse de calitate.',
  },
  {
    title: 'Experiență de cumpărare excelentă',
    comment: 'Vânzătorul a trimis factura și garanția imediat. Produsul a venit cu toate accesoriile complete în cutie.',
  },
  {
    title: 'Totul impecabil',
    comment: 'Un magazin online de încredere cu prețuri foarte competitive. Produsul este exact ce aveam nevoie.',
  },
];

// ── Seeded PRNG Generator (Deterministic per Product ID) ──────────────────────
function createPRNG(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Main Review Generator ─────────────────────────────────────────────────────
export function generateProductReviews(product: ReviewProductInput): ReviewItem[] {
  const seed = `${product.id || 'p-seed'}-${product.title || 'top'}`;
  const prng = createPRNG(seed);

  // Exact target count: matches product.reviewsCount or defaults to 18
  const targetCount =
    typeof product.reviewsCount === 'number' && product.reviewsCount > 0
      ? product.reviewsCount
      : 18;

  // Detect category keywords
  const catSlug = (product.category?.slug || '').toLowerCase();
  const catName = (product.category?.name || '').toLowerCase();
  const titleLower = (product.title || '').toLowerCase();
  const fullText = `${catSlug} ${catName} ${titleLower}`;

  let templates: ReviewTemplate[] = GENERAL_REVIEWS;
  if (/oal|tiga|cratit|cutit|vesel|menaj|gatit|copt|bucatar/i.test(fullText)) {
    templates = [...KITCHEN_REVIEWS, ...GENERAL_REVIEWS];
  } else if (/electro|aspirat|fier|incalz|aer|aragaz|cuptor|robot|blender/i.test(fullText)) {
    templates = [...APPLIANCE_REVIEWS, ...GENERAL_REVIEWS];
  } else if (/biciclet|trotinet|sport|role/i.test(fullText)) {
    templates = [...BIKE_REVIEWS, ...GENERAL_REVIEWS];
  } else if (/jucari|copii|lego|papus|bebe/i.test(fullText)) {
    templates = [...TOYS_REVIEWS, ...GENERAL_REVIEWS];
  } else if (/craciun|instalati|turturi|brad|luminit/i.test(fullText)) {
    templates = [...CHRISTMAS_LIGHTS_REVIEWS, ...GENERAL_REVIEWS];
  }

  const reviews: ReviewItem[] = [];
  const usedAuthors = new Set<string>();

  // Determine rating distribution: average ~4.8
  // For targetCount items: ~82% 5 stars, ~15% 4 stars, ~3% 3 stars
  const fiveStarsCount = Math.max(1, Math.round(targetCount * 0.83));
  const fourStarsCount = Math.max(0, Math.round(targetCount * 0.14));
  const threeStarsCount = Math.max(0, targetCount - fiveStarsCount - fourStarsCount);

  const ratingsPool: number[] = [];
  for (let i = 0; i < fiveStarsCount; i++) ratingsPool.push(5);
  for (let i = 0; i < fourStarsCount; i++) ratingsPool.push(4);
  for (let i = 0; i < threeStarsCount; i++) ratingsPool.push(3);

  // Shuffle ratings deterministically
  for (let i = ratingsPool.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = ratingsPool[i];
    ratingsPool[i] = ratingsPool[j];
    ratingsPool[j] = temp;
  }

  for (let i = 0; i < targetCount; i++) {
    // Generate unique Romanian author
    let author = '';
    let attempts = 0;
    while (!author || usedAuthors.has(author)) {
      const fn = FIRST_NAMES[Math.floor(prng() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(prng() * LAST_NAMES.length)];
      author = `${fn} ${ln}`;
      attempts++;
      if (attempts > 50) break;
    }
    usedAuthors.add(author);

    // Pick date proportionally from ORDERED_DATE_POOL
    const dateIdx = Math.min(
      ORDERED_DATE_POOL.length - 1,
      Math.floor((i / targetCount) * ORDERED_DATE_POOL.length) + (prng() > 0.6 ? 1 : 0)
    );
    const date = ORDERED_DATE_POOL[Math.min(dateIdx, ORDERED_DATE_POOL.length - 1)];

    // Pick template
    const tIdx = (Math.floor(prng() * templates.length) + i) % templates.length;
    const t = templates[tIdx];

    // Pick rating
    const rating = ratingsPool[i] || 5;

    // Likes: top/older reviews have more likes
    const baseLikes = Math.max(1, Math.floor((1 - i / targetCount) * 18));
    const variance = Math.floor(prng() * 5);
    const likes = baseLikes + variance;

    reviews.push({
      id: `rev-${product.id}-${i + 1}`,
      author,
      date,
      rating,
      title: t.title,
      comment: t.comment,
      isVerified: true,
      likes,
    });
  }

  return reviews;
}

// ── Rating breakdown calculator ───────────────────────────────────────────────
export function calculateReviewStats(reviews: ReviewItem[], baseAverage: number = 4.8) {
  const total = reviews.length;
  if (total === 0) {
    return {
      averageRating: baseAverage,
      totalCount: 0,
      distribution: [
        { stars: 5, pct: 85, count: 0 },
        { stars: 4, pct: 12, count: 0 },
        { stars: 3, pct: 3, count: 0 },
        { stars: 2, pct: 0, count: 0 },
        { stars: 1, pct: 0, count: 0 },
      ],
      recommendPct: 97,
    };
  }

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    counts[r.rating] = (counts[r.rating] || 0) + 1;
    sum += r.rating;
  }

  const averageRating = Number((sum / total).toFixed(1));
  const recommendCount = (counts[5] || 0) + (counts[4] || 0);
  const recommendPct = Math.min(99, Math.max(90, Math.round((recommendCount / total) * 100)));

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars] || 0;
    const pct = Math.round((count / total) * 100);
    return { stars, pct, count };
  });

  return {
    averageRating,
    totalCount: total,
    distribution,
    recommendPct,
  };
}
