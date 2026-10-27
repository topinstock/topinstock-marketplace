const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTaxonomyAudit() {
  console.log('--- STARTING TAXONOMY AUDIT ---');

  // 1. Fetch all categories
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  });
  const catBySlug = new Map(categories.map(c => [c.slug, c]));

  // Ensure target categories exist
  async function getOrCreateCategory(name, slug, parentSlug = null) {
    let cat = catBySlug.get(slug);
    if (!cat) {
      let parentId = null;
      if (parentSlug && catBySlug.has(parentSlug)) {
        parentId = catBySlug.get(parentSlug).id;
      }
      cat = await prisma.category.create({
        data: { name, slug, parentId }
      });
      catBySlug.set(slug, cat);
      console.log(`[Created Category] ${name} (${slug})`);
    }
    return cat;
  }

  const catOale = await getOrCreateCategory('Oale', 'oale');
  const catTigai = await getOrCreateCategory('Tigăi', 'tigai');
  const catSeturiOale = await getOrCreateCategory('Seturi de Oale & Tigăi', 'seturi-oale-si-tigai');
  const catUstensile = await getOrCreateCategory('Ustensile pentru Bucătărie', 'ustensile-pentru-bucatarie');
  const catServire = await getOrCreateCategory('Articole Servire Masa', 'articole-servire-masa');
  const catElectro = await getOrCreateCategory('Electrocasnice', 'electrocasnice');
  const catTutun = await getOrCreateCategory('Articole si Accesorii Tutun', 'articole-si-accesorii-tutun');
  const catBirou = await getOrCreateCategory('Accesorii Birou si Consumabile', 'accesorii-birou-si-consumabile');
  const catIngrijire = await getOrCreateCategory('Îngrijire personală', 'ingrijire-personala');

  // Fetch all products
  const products = await prisma.product.findMany({
    select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true, slug: true } } }
  });

  console.log(`Total products in database: ${products.length}`);

  let movedCount = 0;
  const moves = [];

  for (const p of products) {
    const titleLower = p.title.toLowerCase();
    const currentSlug = p.category?.slug || '';

    // Regex checks with word boundaries to avoid 'scoala' or 'koala'
    const isPencilSharpener = titleLower.includes('ascutitoare') || titleLower.includes('creioane') || titleLower.includes('creion');
    const isAshtray = titleLower.includes('scrumiera') || titleLower.includes('scrumieră');
    const isCutlery = titleLower.includes('linguri') || titleLower.includes('furculit') || titleLower.includes('furculiț') || titleLower.includes('lingurite') || titleLower.includes('lingurițe') || titleLower.includes('tacamuri') || titleLower.includes('tacâmuri') || titleLower.includes('polonic') || titleLower.includes('spumiera') || titleLower.includes('suport tacamuri');
    const isDishware = (titleLower.includes('farfurie') || titleLower.includes('farfurii') || titleLower.includes('bol din inox') || titleLower.includes('platou')) && !titleLower.includes('oala') && !titleLower.includes('cratita');
    const isWetWipes = titleLower.includes('servetele umede') || titleLower.includes('șervețele umede');

    const isTruePot = /\b(oal[aăe]|cratit[aăe]|cratiti|tuci|ceaun|ceaune|kukta)\b/i.test(titleLower) && 
                      !/\b(sc[oO][aA]l[aăe]|k[oO][aA]l[aA])\b/i.test(titleLower) &&
                      !titleLower.includes('capac ') && !titleLower.includes('maner ') && !titleLower.includes('mâner ') && !titleLower.includes('suport ');

    const isTruePan = /\b(tigaie|tig[aăi]i|wok)\b/i.test(titleLower) && !titleLower.includes('capac ');
    const isPotSet = titleLower.includes('set oale') || titleLower.includes('set de oale') || titleLower.includes('set cratite') || titleLower.includes('set tigai');

    // RULE 1: If it's a pencil sharpener or pencils, move to office supplies
    if (isPencilSharpener && currentSlug !== 'accesorii-birou-si-consumabile') {
      moves.push({ id: p.id, title: p.title, from: currentSlug, to: catBirou.slug, toId: catBirou.id, reason: 'Pencil sharpener / school supplies' });
      continue;
    }

    // RULE 2: If it's an ashtray, move to tobacco/smoking or home
    if (isAshtray && (currentSlug === 'oale' || currentSlug === 'seturi-oale-si-tigai')) {
      moves.push({ id: p.id, title: p.title, from: currentSlug, to: catTutun.slug, toId: catTutun.id, reason: 'Ashtray was in Oale' });
      continue;
    }

    // RULE 3: If it's cutlery (linguri, furculite), move to kitchen utensils
    if (isCutlery && (currentSlug === 'oale' || currentSlug === 'seturi-oale-si-tigai')) {
      moves.push({ id: p.id, title: p.title, from: currentSlug, to: catUstensile.slug, toId: catUstensile.id, reason: 'Cutlery was in Oale' });
      continue;
    }

    // RULE 4: If it's plates/dishes/bowls, move to tableware/servire
    if (isDishware && (currentSlug === 'oale' || currentSlug === 'seturi-oale-si-tigai')) {
      moves.push({ id: p.id, title: p.title, from: currentSlug, to: catServire.slug, toId: catServire.id, reason: 'Plates/Bowls were in Oale' });
      continue;
    }

    // RULE 5: If it's wet wipes in toys, move to personal care
    if (isWetWipes && currentSlug === 'jucarii-si-jocuri') {
      moves.push({ id: p.id, title: p.title, from: currentSlug, to: catIngrijire.slug, toId: catIngrijire.id, reason: 'Wet wipes in Toys' });
      continue;
    }

    // RULE 6: If it is a TRUE POT (Oală / Cratiță) but NOT in 'oale' or 'seturi-oale-si-tigai'
    if (isTruePot && currentSlug !== 'oale' && currentSlug !== 'seturi-oale-si-tigai' && currentSlug !== 'oale-sub-presiune') {
      // Don't move toys that contain "koala" or "scoala"
      if (!titleLower.includes('koala') && !titleLower.includes('scoala') && !titleLower.includes('jucarie') && !titleLower.includes('martisor')) {
        moves.push({ id: p.id, title: p.title, from: currentSlug, to: catOale.slug, toId: catOale.id, reason: 'True pot found outside oale' });
        continue;
      }
    }

    // RULE 7: If it is a TRUE PAN (Tigaie / Wok) but NOT in 'tigai' or 'seturi-oale-si-tigai'
    if (isTruePan && currentSlug !== 'tigai' && currentSlug !== 'seturi-oale-si-tigai') {
      if (!titleLower.includes('jucarie') && !titleLower.includes('martisor')) {
        moves.push({ id: p.id, title: p.title, from: currentSlug, to: catTigai.slug, toId: catTigai.id, reason: 'True pan found outside tigai' });
        continue;
      }
    }
  }

  console.log(`\nIdentified ${moves.length} products to re-classify for taxonomic purity.`);
  console.log('Sample 30 planned moves:');
  moves.slice(0, 30).forEach(m => {
    console.log(`[MOVE] "${m.title.slice(0, 45)}..." from "${m.from}" -> "${m.to}" (${m.reason})`);
  });

  // Apply updates in a transaction
  console.log('\nApplying updates to database...');
  for (const m of moves) {
    await prisma.product.update({
      where: { id: m.id },
      data: { categoryId: m.toId }
    });
    movedCount++;
  }

  console.log(`\nSUCCESS: ${movedCount} products successfully remapped to their correct categories!`);

  // Verify Oale category after cleanup
  const oaleFinal = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: { select: { id: true, title: true } } }
  });
  console.log(`\nCategory 'oale' now has: ${oaleFinal ? oaleFinal.products.length : 0} products.`);
  console.log('First 10 products now in Oale:');
  oaleFinal.products.slice(0, 10).forEach(p => console.log(' -> ' + p.title));
}

runTaxonomyAudit().finally(() => prisma.$disconnect());

