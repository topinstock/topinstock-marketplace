const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function deepCleanTaxonomy() {
  console.log('=== DEEP TAXONOMY CLEANING STARTED ===');

  // Load all categories
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.slug, c]));

  async function ensureCat(name, slug, parentSlug = null) {
    if (catMap.has(slug)) return catMap.get(slug);
    const parentId = parentSlug && catMap.has(parentSlug) ? catMap.get(parentSlug).id : null;
    const created = await prisma.category.create({
      data: { name, slug, parentId }
    });
    catMap.set(slug, created);
    console.log(`[Created Category] ${name} (${slug})`);
    return created;
  }

  // Core Categories Needed
  const catOale = await ensureCat('Oale & Cratițe', 'oale');
  const catTigai = await ensureCat('Tigăi & Wok-uri', 'tigai');
  const catSeturiOale = await ensureCat('Seturi de Oale & Tigăi', 'seturi-oale-si-tigai');
  const catTaviCopt = await ensureCat('Tăvi și Forme de Copt', 'tavi-si-forme-copt');
  const catIbriceCafea = await ensureCat('Ibrice & Preparare Cafea', 'ibrice-cafea');
  const catTermosuri = await ensureCat('Termosuri & Bidoane', 'termosuri-si-bidoane');
  const catPahareCani = await ensureCat('Pahare, Căni & Frapiere', 'pahare-si-cani');
  const catUstensile = await ensureCat('Ustensile pentru Bucătărie', 'ustensile-pentru-bucatarie');
  const catServire = await ensureCat('Articole Servire Masa', 'articole-servire-masa');
  const catDepozitareBucatarie = await ensureCat('Organizatoare si Depozitare Bucatarie', 'organizatoare-si-depozitare-bucatarie');
  const catAccesoriiBucatarie = await ensureCat('Accesorii Bucătărie', 'accesorii-bucatarie');
  
  // Electrocasnice
  const catElectro = await ensureCat('Electrocasnice', 'electrocasnice');
  const catMixere = await ensureCat('Mixere, Roboti & Blendere', 'mixere-roboti-blendere', 'electrocasnice');
  const catEspressoare = await ensureCat('Espressoare & Cafetiere', 'espressoare-cafetiere', 'electrocasnice');
  const catFiareCalcat = await ensureCat('Fiare și Stații de Călcat', 'fiare-de-calcat', 'electrocasnice');
  const catIncalzire = await ensureCat('Calorifere & Încălzire', 'calorifere-tip-panou', 'electrocasnice');
  const catAspiratoare = await ensureCat('Aspiratoare & Curățare', 'aspiratoare', 'electrocasnice');
  const catPrajitoare = await ensureCat('Prăjitoare Pâine & Sandviș', 'prajitoare-paine-sandwich', 'electrocasnice');

  // Other non-kitchen
  const catTutun = await ensureCat('Articole si Accesorii Tutun', 'articole-si-accesorii-tutun');
  const catBirou = await ensureCat('Accesorii Birou si Consumabile', 'accesorii-birou-si-consumabile');
  const catIngrijire = await ensureCat('Îngrijire personală', 'ingrijire-personala');

  // Fetch all products
  const products = await prisma.product.findMany({
    select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true, slug: true } } }
  });

  console.log(`Auditing all ${products.length} products...`);

  const updates = [];

  for (const p of products) {
    const t = p.title.toLowerCase();
    const curSlug = p.category?.slug || '';
    let targetCat = null;
    let reason = '';

    // ── 1. TOBACCO / ASHTRAY ──
    if (t.includes('scrumiera') || t.includes('scrumieră')) {
      if (curSlug !== catTutun.slug) {
        targetCat = catTutun;
        reason = 'Ashtray';
      }
    }
    // ── 2. SCHOOL / OFFICE SUPPLIES ──
    else if (t.includes('ascutitoare') || t.includes('creioane') || (t.includes('creion') && !t.includes('machiaj')) || t.includes('radiera') || t.includes('dispenser de banda') || t.includes('banda adeziva')) {
      if (curSlug !== catBirou.slug) {
        targetCat = catBirou;
        reason = 'Office / school supplies';
      }
    }
    // ── 3. HOME APPLIANCES (ELECTROCASNICE) ──
    else if (t.includes('fier de calcat') || t.includes('stație de călcat') || t.includes('statie de calcat')) {
      if (curSlug !== catFiareCalcat.slug) {
        targetCat = catFiareCalcat;
        reason = 'Iron appliance';
      }
    }
    else if (t.includes('prajitor pentru paine') || t.includes('prăjitor de pâine') || t.includes('prajitor paine') || t.includes('sandwich maker') || t.includes('aparat de facut sandwich') || t.includes('waffle maker')) {
      if (curSlug !== catPrajitoare.slug) {
        targetCat = catPrajitoare;
        reason = 'Toaster / Sandwich maker';
      }
    }
    else if (t.includes('espressor') || t.includes('cafetiera') || t.includes('cafetieră') || t.includes('rasnita cafea') || t.includes('râșniță cafea')) {
      if (curSlug !== catEspressoare.slug) {
        targetCat = catEspressoare;
        reason = 'Coffee machine';
      }
    }
    else if (t.includes('calorifer') || t.includes('aeroterma') || t.includes('aerotermă') || t.includes('convector') || t.includes('panou radiant') || t.includes('incalzitor')) {
      if (curSlug !== catIncalzire.slug) {
        targetCat = catIncalzire;
        reason = 'Heater / heating appliance';
      }
    }
    else if (t.includes('aspirator') && !t.includes('aspirator nazal')) {
      if (curSlug !== catAspiratoare.slug) {
        targetCat = catAspiratoare;
        reason = 'Vacuum cleaner';
      }
    }
    // ── 4. BAKEWARE (TĂVI & FORME DE COPT) ──
    else if (t.includes('forma de copt') || t.includes('forme de copt') || t.includes('tava cuptor') || t.includes('tavă cuptor') || t.includes('tava pentru cuptor') || t.includes('tavă pentru cuptor') || t.includes('tava din inox, pentru cuptor')) {
      if (curSlug !== catTaviCopt.slug) {
        targetCat = catTaviCopt;
        reason = 'Bakeware pan/mold';
      }
    }
    // ── 5. IBRICE ──
    else if (t.includes('ibric')) {
      if (curSlug !== catIbriceCafea.slug) {
        targetCat = catIbriceCafea;
        reason = 'Ibric';
      }
    }
    // ── 6. TERMOSURI & BIDON INOX ──
    else if (t.includes('termos') || t.includes('bidon din inox') || t.includes('bidon lapte') || t.includes('recipient termic')) {
      if (curSlug !== catTermosuri.slug) {
        targetCat = catTermosuri;
        reason = 'Thermos / can';
      }
    }
    // ── 7. PAHARE, CĂNI & FRAPIERE ──
    else if (t.includes('frapiera') || t.includes('cana din inox') || t.includes('pahar din inox') || t.includes('shaker')) {
      if (curSlug !== catPahareCani.slug) {
        targetCat = catPahareCani;
        reason = 'Cups/Glasses/Ice bucket';
      }
    }
    // ── 8. CASEROLE & ORGANIZATOARE ──
    else if (t.includes('caserola termos') || t.includes('recipiente organizare') || t.includes('recipiente depozitare') || t.includes('cutie pentru pranz')) {
      if (curSlug !== catDepozitareBucatarie.slug) {
        targetCat = catDepozitareBucatarie;
        reason = 'Food storage container';
      }
    }
    // ── 9. ACCESORII SILICON / MANERE / CLESTE PENTRU OALE ──
    else if (t.includes('manere de protectie') || t.includes('mâner silicon') || t.includes('maner silicon') || t.includes('manusa din silicon') || t.includes('cleste pentru boluri') || t.includes('clema pentru boluri') || t.includes('suport capac anti-varsare') || t.includes('suport capac anti-varsare')) {
      if (curSlug !== catAccesoriiBucatarie.slug) {
        targetCat = catAccesoriiBucatarie;
        reason = 'Kitchen accessory / silicone handle';
      }
    }
    // ── 10. USTENSILE DE GĂTIT & SERVIRE ──
    else if ((t.includes('ustensila') || t.includes('ustensile') || t.includes('strecuratoare') || t.includes('strecurătoare') || t.includes('sita din inox') || t.includes('feliator') || t.includes('razatoare') || t.includes('răzătoare') || t.includes('cutite pentru peste') || t.includes('cutit') || t.includes('cuțit') || t.includes('polonic') || t.includes('spumiera') || t.includes('lingura') || t.includes('furculita')) && !t.includes('oala') && !t.includes('cratita') && !t.includes('tigaie')) {
      if (curSlug === 'oale' || curSlug === 'seturi-oale-si-tigai') {
        targetCat = catUstensile;
        reason = 'Utensil was in Oale';
      }
    }
    // ── 11. STRICT OALE & CRATIȚE (THE CORE REQUEST: „dacă categoria e oale să fie doar oale”) ──
    else if (
      (
        /\b(oal[aăe]|cratit[aăe]|ceaun|tuci|kukta)\b/i.test(t) ||
        t.includes('oala sub presiune') || t.includes('oală sub presiune') ||
        t.includes('cazan din oțel') || t.includes('cazan din otel') ||
        t.includes('vas pentru gătit') || t.includes('vas pentru gatit') ||
        t.includes('oala profesionala') || t.includes('oală profesională')
      ) &&
      !/\b(sc[oO][aA]l[aăe]|k[oO][aA]l[aA])\b/i.test(t) &&
      !t.includes('capac ') && !t.includes('maner ') && !t.includes('jucarie') && !t.includes('martisor') && !t.includes('tigaie') && !t.includes('wok')
    ) {
      if (curSlug !== catOale.slug && curSlug !== catSeturiOale.slug) {
        targetCat = catOale;
        reason = 'Strict Pot / Cratita found outside Oale';
      }
    }
    // ── 12. STRICT TIGĂI & WOK-URI ──
    else if (
      (/\b(tigaie|tig[aăi]i|wok)\b/i.test(t)) &&
      !t.includes('set de oale') && !t.includes('capac ') && !t.includes('jucarie') && !t.includes('martisor')
    ) {
      if (curSlug !== catTigai.slug && curSlug !== catSeturiOale.slug) {
        targetCat = catTigai;
        reason = 'Strict Pan / Wok found outside Tigai';
      }
    }
    // ── 13. SETURI OALE & TIGĂI ──
    else if (t.includes('set de oale') || t.includes('set oale') || t.includes('set de tigăi') || t.includes('set de tigai') || t.includes('set de vase de gătit') || t.includes('set de vase de gatit') || t.includes('set vase de gătit')) {
      if (curSlug !== catSeturiOale.slug && curSlug !== catOale.slug) {
        targetCat = catSeturiOale;
        reason = 'Set of pots / pans';
      }
    }

    if (targetCat && targetCat.slug !== curSlug) {
      updates.push({
        id: p.id,
        title: p.title,
        from: curSlug,
        to: targetCat.slug,
        toId: targetCat.id,
        reason
      });
    }
  }

  console.log(`\nIdentified ${updates.length} products to re-categorize strictly.`);
  console.log('\nSample 35 re-categorizations:');
  updates.slice(0, 35).forEach(u => {
    console.log(`[RE-MAP] "${u.title.slice(0, 48)}..." from [${u.from}] -> [${u.to}] (${u.reason})`);
  });

  // Apply in batch
  console.log('\nExecuting database updates...');
  for (const u of updates) {
    await prisma.product.update({
      where: { id: u.id },
      data: { categoryId: u.toId }
    });
  }
  console.log(`Updated ${updates.length} products in SQLite database!`);

  // Verify Oale category
  const oaleFinal = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: { select: { id: true, title: true } } }
  });
  console.log(`\n=== VERIFICATION: Category 'oale' now has: ${oaleFinal.products.length} products ===`);
  console.log('Sample 20 products in Oale:');
  oaleFinal.products.slice(0, 20).forEach(p => console.log(' [OALA PURA] ' + p.title));

  // Verify Tigai category
  const tigaiFinal = await prisma.category.findUnique({
    where: { slug: 'tigai' },
    include: { products: { select: { id: true, title: true } } }
  });
  console.log(`\n=== VERIFICATION: Category 'tigai' now has: ${tigaiFinal.products.length} products ===`);
  console.log('Sample 10 products in Tigai:');
  tigaiFinal.products.slice(0, 10).forEach(p => console.log(' [TIGAIE PURA] ' + p.title));

  // Check for any remaining non-pots in Oale
  const remainingAnomalies = oaleFinal.products.filter(p => {
    const t = p.title.toLowerCase();
    const isP = /\b(oal[aăe]|cratit[aăe]|ceaun|tuci|kukta)\b/i.test(t) ||
                t.includes('set de oale') || t.includes('set oale') ||
                t.includes('cazan') || t.includes('presiune') || t.includes('vas pentru');
    return !isP;
  });
  console.log(`\nRemaining anomalies in Oale: ${remainingAnomalies.length}`);
  remainingAnomalies.forEach(a => console.log(' ! STILL IN OALE?: ' + a.title));

  // Export updated data to fallback JSON files so Vercel is 100% synchronized!
  console.log('\n--- SYNCHRONIZING FALLBACK JSON FOR VERCEL ---');
  
  // 1. Export all products for fallback
  const allUpdatedProducts = await prisma.product.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      vendorId: true,
      categoryId: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      originalPrice: true,
      discountPercentage: true,
      stock: true,
      sku: true,
      images: true,
      sizes: true,
      colors: true,
      attributes: true,
      rating: true,
      reviewsCount: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } }
    }
  });

  const formattedForFallback = allUpdatedProducts.map(p => {
    let imagesArr = [];
    try { imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; } catch(e) { imagesArr = [p.images]; }
    let sizesArr = [];
    try { sizesArr = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes; } catch(e) {}
    let colorsArr = [];
    try { colorsArr = typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors; } catch(e) {}
    let attributesParsed = null;
    try { attributesParsed = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes; } catch(e) {}

    return {
      ...p,
      images: imagesArr,
      sizes: sizesArr,
      colors: colorsArr,
      attributes: attributesParsed
    };
  });

  const productsJsonPath = path.join(__dirname, '..', 'lib', 'data', 'products_catalog_fallback.json');
  fs.writeFileSync(productsJsonPath, JSON.stringify(formattedForFallback, null, 2), 'utf-8');
  console.log(`[SAVED] ${formattedForFallback.length} products to ${productsJsonPath}`);

  // 2. Export all categories for fallback
  const allUpdatedCategories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      _count: { select: { products: true } }
    }
  });

  const categoriesJsonPath = path.join(__dirname, '..', 'lib', 'data', 'categories_catalog_fallback.json');
  fs.writeFileSync(categoriesJsonPath, JSON.stringify(allUpdatedCategories, null, 2), 'utf-8');
  console.log(`[SAVED] ${allUpdatedCategories.length} categories to ${categoriesJsonPath}`);

  console.log('\n=== ALL CATEGORIES AUDITED, CLEANED AND SYNCHRONIZED! ===');
}

deepCleanTaxonomy().finally(() => prisma.$disconnect());

