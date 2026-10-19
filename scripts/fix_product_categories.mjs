import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getOrCreateCategory(name, slug, parentId = null, description = '') {
  let cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) {
    cat = await prisma.category.create({
      data: {
        name,
        slug,
        parentId,
        description: description || `Produse ${name} disponibile pe TopinStock.`
      }
    });
    console.log(`[Created Category] ${name} (${slug}) [parent: ${parentId}]`);
  }
  return cat;
}

async function batchUpdateCategory(updatesMap) {
  const CHUNK_SIZE = 200;
  for (const [targetCatId, ids] of updatesMap.entries()) {
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE);
      await prisma.product.updateMany({
        where: { id: { in: chunk } },
        data: { categoryId: targetCatId }
      });
    }
  }
}

async function runCategoryFix() {
  console.log('========================================================');
  console.log('   TOPINSTOCK — COMPLETE CATEGORY AUDIT & REORGANIZER   ');
  console.log('========================================================\n');

  // 1. Get or create root categories
  console.log('[1/5] Ensuring all Root and Subcategories exist...');

  // Root: Barbati
  const catBarbati = await getOrCreateCategory('Bărbați', 'barbati', null, 'Modă, încălțăminte și accesorii pentru bărbați.');
  // Subcategories: Barbati
  const catIncaltaminteBarbati = await getOrCreateCategory('Încălțăminte Bărbați', 'incaltaminte-barbati', catBarbati.id);
  const catImbracaminteBarbati = await getOrCreateCategory('Îmbrăcăminte Bărbați', 'imbracaminte-barbati', catBarbati.id);
  const catGeciBarbati = await getOrCreateCategory('Geci & Jachete Bărbați', 'geci-barbati', catBarbati.id);
  const catSportBarbati = await getOrCreateCategory('Articole Sport Bărbați', 'sport-barbati', catBarbati.id);
  const catAccesoriiBarbati = await getOrCreateCategory('Accesorii Bărbați', 'accesorii-barbati', catBarbati.id);
  const catCamasiBarbati = await getOrCreateCategory('Cămăși Bărbați', 'camasi-barbati', catBarbati.id);
  const catPantaloniBarbati = await getOrCreateCategory('Pantaloni Bărbați', 'pantaloni-barbati', catBarbati.id);

  // Root: Femei
  const catFemei = await getOrCreateCategory('Femei', 'femei', null, 'Modă, încălțăminte și accesorii pentru femei.');
  const catIncaltaminteFemei = await getOrCreateCategory('Încălțăminte Femei', 'incaltaminte-femei', catFemei.id);
  const catImbracaminteFemei = await getOrCreateCategory('Îmbrăcăminte Femei', 'imbracaminte-femei', catFemei.id);
  const catRochiiFemei = await getOrCreateCategory('Rochii & Fuste', 'rochii-femei', catFemei.id);
  const catAccesoriiFemei = await getOrCreateCategory('Accesorii Damă', 'accesorii-femei', catFemei.id);

  // Root: GSM si Gadgets
  const catGsm = await getOrCreateCategory('GSM si Gadgets', 'gsm-si-gadgets', null);
  const catFolii = await getOrCreateCategory('Folii Protecție Telefoane', 'folii-protectie-telefoane', catGsm.id);
  const catHuse = await getOrCreateCategory('Huse Telefoane', 'huse-telefoane', catGsm.id);
  const catSuporturiGsm = await getOrCreateCategory('Suporturi Telefoane & Auto', 'suporturi-telefoane', catGsm.id);
  const catCabluriGsm = await getOrCreateCategory('Cabluri de Date & Încărcătoare', 'cabluri-de-date-telefoane', catGsm.id);
  const catCastiGsm = await getOrCreateCategory('Căști Audio & Boxe', 'casti-audio-telefoane', catGsm.id);
  const catAlteGsm = await getOrCreateCategory('Alte Accesorii Telefoane', 'alte-accesorii-telefoane', catGsm.id);

  // Root: Ingrijire Personala si Cosmetice
  const catCosmetice = await getOrCreateCategory('Ingrijire Personala si Cosmetice', 'ingrijire-personala-si-cosmetice', null);
  const catIngrijirePar = await getOrCreateCategory('Ingrijire Păr & Vopsele', 'ingrijire-par-si-accesorii', catCosmetice.id);
  const catMachiaj = await getOrCreateCategory('Machiaj & Accesorii Make-Up', 'accesorii-machiaj-si-trimmere', catCosmetice.id);
  const catIngrijireCorp = await getOrCreateCategory('Îngrijire Ten & Corp', 'ingrijire-ten-si-corp', catCosmetice.id);
  const catParfumuri = await getOrCreateCategory('Parfumuri & Seturi', 'parfumuri-si-seturi', catCosmetice.id);
  const catIgienaDentara = await getOrCreateCategory('Igiena Dentară', 'igiena-dentara', catCosmetice.id);
  const catIngrijireUnghii = await getOrCreateCategory('Ingrijire Unghii & Manichiură', 'ingrijire-unghii', catCosmetice.id);

  // Root: Casa si Bricolaj
  const catCasa = await getOrCreateCategory('Casa si Bricolaj', 'casa-si-bricolaj', null);
  const catScule = await getOrCreateCategory('Scule si Unelte', 'scule-si-unelte', catCasa.id);
  const catIluminat = await getOrCreateCategory('Articole pentru Iluminat', 'articole-pentru-iluminat', catCasa.id);
  const catBaie = await getOrCreateCategory('Articole pentru baie', 'articole-pentru-baie', catCasa.id);
  const catBucatarieArt = await getOrCreateCategory('Articole pentru Bucatarie', 'articole-pentru-bucatarie', catCasa.id);
  const catCuratenie = await getOrCreateCategory('Articole pentru Casa si Curatenie', 'articole-pentru-casa-si-curatenie', catCasa.id);
  const catAuto = await getOrCreateCategory('Articole Auto', 'articole-auto', catCasa.id);
  const catAnimale = await getOrCreateCategory('Articole pentru Animale', 'articole-pentru-animale', catCasa.id);
  const catGradina = await getOrCreateCategory('Articole pentru Gradina si Bricolaj', 'articole-pentru-gradina-si-bricolaj', catCasa.id);

  // Root: Martisoare
  const catMartisoare = await getOrCreateCategory('Martisoare', 'martisoare', null);
  const catSeturiMartisoare = await getOrCreateCategory('Seturi Martisoare', 'seturi-martisoare', catMartisoare.id);

  // Root: Copii
  const catCopii = await getOrCreateCategory('Articole pentru copii', 'articole-pentru-copii', null);
  const catJucariiDiverse = await getOrCreateCategory('Jucarii si Jocuri', 'jucarii-si-jocuri', catCopii.id);

  // Root: Petrecere
  const catPetrecere = await getOrCreateCategory('Articole Petrecere', 'articole-petrecere', null);
  const catServirePetrecere = await getOrCreateCategory('Articole Servire Masa', 'articole-servire-masa', catPetrecere.id);

  console.log('\n[2/5] Cleaning up miscategorized products from "Casa si Bricolaj"...');
  const casaProducts = await prisma.product.findMany({
    where: { categoryId: catCasa.id },
    select: { id: true, title: true }
  });
  console.log(`Found ${casaProducts.length} products sitting directly in Casa si Bricolaj.`);

  let gsmMoved = 0;
  let cosmeticsMoved = 0;
  let autoMoved = 0;
  let lightingMoved = 0;
  let bathroomMoved = 0;
  let kitchenMoved = 0;
  let cleaningMoved = 0;
  let petsMoved = 0;
  let martisoareMoved = 0;
  let toysMoved = 0;
  let toolsMoved = 0;
  let partyMoved = 0;
  const casaUpdates = new Map();
  function queueUpdate(map, catId, id) {
    if (!map.has(catId)) map.set(catId, []);
    map.get(catId).push(id);
  }

  for (const p of casaProducts) {
    const t = p.title.toLowerCase();
    let targetCatId = null;

    // 1. GSM / Phone accessories
    if (t.includes('folie') || (t.includes('sticla securizata') && (t.includes('iphone') || t.includes('samsung') || t.includes('xiaomi') || t.includes('ecran')))) {
      targetCatId = catFolii.id;
      gsmMoved++;
    } else if (t.includes('husa') && (t.includes('iphone') || t.includes('samsung') || t.includes('xiaomi') || t.includes('telefon') || t.includes('silicone') || t.includes('tpu') || t.includes('magsafe') || t.includes('telefon'))) {
      targetCatId = catHuse.id;
      gsmMoved++;
    } else if (t.includes('suport') && (t.includes('telefon') || t.includes('trepied') || t.includes('bord') || t.includes('clema extensibila') || t.includes('grila de ventilatie') || t.includes('ghidon'))) {
      targetCatId = catSuporturiGsm.id;
      gsmMoved++;
    } else if (t.includes('lupa pentru ecran') || t.includes('screen magnifier') || t.includes('ambaj zip') || t.includes('accesorii gsm')) {
      targetCatId = catAlteGsm.id;
      gsmMoved++;
    } else if (t.includes('cablu') && (t.includes('date') || t.includes('type-c') || t.includes('lightning') || t.includes('usb') || t.includes('incarcator'))) {
      targetCatId = catCabluriGsm.id;
      gsmMoved++;
    }
    // 2. Cosmetics & Beauty
    else if (t.includes('vopsea pentru par') || t.includes('vopsea de par') || t.includes('sampon') || t.includes('balsam') || (t.includes('ulei') && t.includes('par'))) {
      targetCatId = catIngrijirePar.id;
      cosmeticsMoved++;
    } else if (t.includes('machiaj') || t.includes('fard') || t.includes('ruj') || t.includes('mascara') || t.includes('bureti') || t.includes('pensul') || t.includes('fond de ten') || t.includes('estompare machiaj')) {
      targetCatId = catMachiaj.id;
      cosmeticsMoved++;
    } else if (t.includes('parfum') || t.includes('apa de toaleta')) {
      targetCatId = catParfumuri.id;
      cosmeticsMoved++;
    } else if (t.includes('crema') || t.includes('lotiune') || (t.includes('ulei') && (t.includes('corp') || t.includes('baby') || t.includes('masline'))) || t.includes('gel de dus') || t.includes('sapun')) {
      targetCatId = catIngrijireCorp.id;
      cosmeticsMoved++;
    } else if (t.includes('unghii') || t.includes('manichiura') || t.includes('oja')) {
      targetCatId = catIngrijireUnghii.id;
      cosmeticsMoved++;
    } else if (t.includes('pasta de dinti') || t.includes('periuta') || t.includes('ata dentara')) {
      targetCatId = catIgienaDentara.id;
      cosmeticsMoved++;
    }
    // 3. Martisoare
    else if (t.includes('martisor') || t.includes('mărțișor') || (t.includes('bratara') && (t.includes('snur rosu') || t.includes('trifoi') || t.includes('cosar')))) {
      targetCatId = catSeturiMartisoare.id;
      martisoareMoved++;
    }
    // 4. Lighting & Lamps
    else if (t.includes('led') || t.includes('lustra') || t.includes('plafoniera') || t.includes('lampa') || t.includes('bec') || t.includes('banda led') || t.includes('proiector') || t.includes('lampi')) {
      targetCatId = catIluminat.id;
      lightingMoved++;
    }
    // 5. Bathroom & Sanitary
    else if (t.includes('baie') || t.includes('dus') || t.includes('coloana dus') || t.includes('baterie lavoar') || t.includes('oglinda led') || t.includes('dispenser sapun') || t.includes('suport prosop') || t.includes('wc') || t.includes('aerator')) {
      targetCatId = catBaie.id;
      bathroomMoved++;
    }
    // 6. Kitchen & Cookware
    else if (t.includes('baterie bucatarie') || t.includes('oala') || t.includes('tigaie') || t.includes('cutit') || t.includes('farfurie') || t.includes('cana') || t.includes('recipient') || t.includes('chiuveta') || t.includes('strecuratoare') || t.includes('tava') || t.includes('tacamu')) {
      targetCatId = catBucatarieArt.id;
      kitchenMoved++;
    }
    // 7. Automotive
    else if (t.includes('auto') || t.includes('stergator') || t.includes('oglinda retrovizoare') || t.includes('odorizant') || t.includes('parasolar')) {
      targetCatId = catAuto.id;
      autoMoved++;
    }
    // 8. Toys & Kids
    else if (t.includes('jucarie') || t.includes('copii') || t.includes('bebe') || t.includes('papusa') || t.includes('lego') || t.includes('puzzle') || t.includes('carucior')) {
      targetCatId = catJucariiDiverse.id;
      toysMoved++;
    }
    // 9. Party & Events
    else if (t.includes('servetele de masa') || t.includes('balon') || t.includes('la multi ani') || t.includes('confetti') || t.includes('banda adeziva')) {
      targetCatId = catServirePetrecere.id;
      partyMoved++;
    }
    // 10. Tools & Hardware
    else if (t.includes('scula') || t.includes('cheie') || t.includes('spaclu') || t.includes('hartie abraziva') || t.includes('calapod') || t.includes('surubelnita') || t.includes('cleste') || t.includes('ciocan') || t.includes('fierastrau') || t.includes('bricolaj')) {
      targetCatId = catScule.id;
      toolsMoved++;
    }
    // 11. Pets
    else if (t.includes('caine') || t.includes('pisica') || t.includes('animale') || t.includes('litiera') || t.includes('zgarda') || t.includes('ham')) {
      targetCatId = catAnimale.id;
      petsMoved++;
    }
    // 12. Home & Cleaning
    else if (t.includes('mop') || t.includes('curatenie') || t.includes('cos gunoi') || t.includes('organizator') || t.includes('cutie') || t.includes('covor') || t.includes('perna') || t.includes('tamaiat') || t.includes('ceas')) {
      targetCatId = catCuratenie.id;
      cleaningMoved++;
    }

    if (targetCatId) {
      queueUpdate(casaUpdates, targetCatId, p.id);
    }
  }

  await batchUpdateCategory(casaUpdates);

  console.log(`Re-classification results from Casa si Bricolaj:`);
  console.log(`  - Moved to GSM & Phone Accessories: ${gsmMoved}`);
  console.log(`  - Moved to Cosmetics & Personal Care: ${cosmeticsMoved}`);
  console.log(`  - Moved to Lighting & Lamps: ${lightingMoved}`);
  console.log(`  - Moved to Bathroom & Sanitary: ${bathroomMoved}`);
  console.log(`  - Moved to Tools & Hardware: ${toolsMoved}`);
  console.log(`  - Moved to Kitchen: ${kitchenMoved}`);
  console.log(`  - Moved to Cleaning & Home: ${cleaningMoved}`);
  console.log(`  - Moved to Mărțișoare: ${martisoareMoved}`);
  console.log(`  - Moved to Auto Accessories: ${autoMoved}`);
  console.log(`  - Moved to Toys & Kids: ${toysMoved}`);
  console.log(`  - Moved to Party & Events: ${partyMoved}`);
  console.log(`  - Moved to Pets: ${petsMoved}`);

  // 3. Populate Barbati Category with products (Memory-lean selection: NO description blob)
  console.log('\n[3/5] Categorizing Men\'s Products into "Bărbați"...');
  const allProds = await prisma.product.findMany({
    select: { id: true, title: true, categoryId: true }
  });

  let barbatiIncaltaminteCount = 0;
  let barbatiImbracaminteCount = 0;
  let barbatiGeciCount = 0;
  let barbatiSportCount = 0;
  let barbatiCamasiCount = 0;
  let barbatiPantaloniCount = 0;
  let barbatiAccesoriiCount = 0;
  const barbatiUpdates = new Map();

  for (const p of allProds) {
    const t = p.title.toLowerCase();
    const isMen = t.includes('bărbați') || t.includes('barbati') || t.includes('bărbat') || t.includes('barbat') ||
                  t.includes('bărbătesc') || t.includes('barbatesc') || t.includes('mens') || t.includes('men\'s') ||
                  (t.includes('joma') && (t.includes('adidasi') || t.includes('pantofi') || t.includes('tricou'))) ||
                  t.includes('boxeri barbati') || t.includes('camasa barbati') || t.includes('pantaloni barbati');

    // Make sure we don't grab women's products
    const isWomen = t.includes('femei') || t.includes('damă') || t.includes('dama') || t.includes('feminin');

    if (isMen && !isWomen) {
      let targetId = catImbracaminteBarbati.id;

      if (t.includes('pantofi') || t.includes('adidasi') || t.includes('sneakers') || t.includes('tenisi') || t.includes('saboti') || t.includes('ghete') || t.includes('bocanci')) {
        targetId = catIncaltaminteBarbati.id;
        barbatiIncaltaminteCount++;
      } else if (t.includes('geaca') || t.includes('geacă') || t.includes('jacheta') || t.includes('jachetă') || t.includes('vesta') || t.includes('vestă') || t.includes('hanorac')) {
        targetId = catGeciBarbati.id;
        barbatiGeciCount++;
      } else if (t.includes('camasa') || t.includes('cămașă')) {
        targetId = catCamasiBarbati.id;
        barbatiCamasiCount++;
      } else if (t.includes('pantaloni') || t.includes('jeans') || t.includes('blugi') || t.includes('trening')) {
        targetId = catPantaloniBarbati.id;
        barbatiPantaloniCount++;
      } else if (t.includes('sport') || t.includes('alergare') || t.includes('fitness') || t.includes('joma')) {
        targetId = catSportBarbati.id;
        barbatiSportCount++;
      } else if (t.includes('sosete') || t.includes('șosete') || t.includes('boxeri') || t.includes('curea') || t.includes('portofel') || t.includes('caciula')) {
        targetId = catAccesoriiBarbati.id;
        barbatiAccesoriiCount++;
      } else {
        barbatiImbracaminteCount++;
      }

      queueUpdate(barbatiUpdates, targetId, p.id);
    }
  }

  await batchUpdateCategory(barbatiUpdates);

  const totalMen = barbatiIncaltaminteCount + barbatiImbracaminteCount + barbatiGeciCount + barbatiSportCount + barbatiCamasiCount + barbatiPantaloniCount + barbatiAccesoriiCount;
  console.log(`Assigned ${totalMen} products to "Bărbați" category hierarchy:`);
  console.log(`  - Încălțăminte Bărbați: ${barbatiIncaltaminteCount}`);
  console.log(`  - Geci & Jachete Bărbați: ${barbatiGeciCount}`);
  console.log(`  - Cămăși Bărbați: ${barbatiCamasiCount}`);
  console.log(`  - Pantaloni Bărbați: ${barbatiPantaloniCount}`);
  console.log(`  - Articole Sport Bărbați: ${barbatiSportCount}`);
  console.log(`  - Accesorii Bărbați: ${barbatiAccesoriiCount}`);
  console.log(`  - Îmbrăcăminte Generală Bărbați: ${barbatiImbracaminteCount}`);

  // 4. Populate Femei Category with products
  console.log('\n[4/5] Categorizing Women\'s Products into "Femei"...');
  let femeiRochiiCount = 0;
  let femeiIncaltaminteCount = 0;
  let femeiImbracaminteCount = 0;
  let femeiAccesoriiCount = 0;
  const femeiUpdates = new Map();

  for (const p of allProds) {
    const t = p.title.toLowerCase();
    const isWomen = (t.includes('femei') || t.includes('damă') || t.includes('dama') || t.includes('feminin') || t.includes('rochie') || t.includes('fustă') || t.includes('fusta') || t.includes('sutien') || t.includes('colanti')) &&
                    !t.includes('barbati') && !t.includes('bărbați');

    if (isWomen) {
      let targetId = catImbracaminteFemei.id;

      if (t.includes('rochie') || t.includes('rochii') || t.includes('fusta') || t.includes('fustă')) {
        targetId = catRochiiFemei.id;
        femeiRochiiCount++;
      } else if (t.includes('pantofi') || t.includes('sandale') || t.includes('balerini') || t.includes('cizme') || t.includes('botine') || t.includes('adidasi') || t.includes('sneakers')) {
        targetId = catIncaltaminteFemei.id;
        femeiIncaltaminteCount++;
      } else if (t.includes('geanta') || t.includes('geantă') || t.includes('poseta') || t.includes('poșetă') || t.includes('esarfa') || t.includes('eșarfă')) {
        targetId = catAccesoriiFemei.id;
        femeiAccesoriiCount++;
      } else {
        femeiImbracaminteCount++;
      }

      queueUpdate(femeiUpdates, targetId, p.id);
    }
  }

  await batchUpdateCategory(femeiUpdates);

  const totalWomen = femeiRochiiCount + femeiIncaltaminteCount + femeiImbracaminteCount + femeiAccesoriiCount;
  console.log(`Assigned ${totalWomen} products to "Femei" category hierarchy:`);
  console.log(`  - Rochii & Fuste: ${femeiRochiiCount}`);
  console.log(`  - Încălțăminte Femei: ${femeiIncaltaminteCount}`);
  console.log(`  - Accesorii Damă: ${femeiAccesoriiCount}`);
  console.log(`  - Îmbrăcăminte Generală Femei: ${femeiImbracaminteCount}`);

  // 5. Final Audit
  console.log('\n[5/5] Final Category Verification:');
  const finalCasaProds = await prisma.product.count({ where: { categoryId: catCasa.id } });
  console.log(`Direct products left in Casa si Bricolaj: ${finalCasaProds}`);

  const gsmCount = await prisma.product.count({
    where: {
      category: {
        OR: [
          { slug: 'gsm-si-gadgets' },
          { parent: { slug: 'gsm-si-gadgets' } }
        ]
      }
    }
  });
  console.log(`Total products in GSM & Gadgets: ${gsmCount}`);

  const barbatiCount = await prisma.product.count({
    where: {
      category: {
        OR: [
          { slug: 'barbati' },
          { parent: { slug: 'barbati' } }
        ]
      }
    }
  });
  console.log(`Total products in Bărbați: ${barbatiCount}`);

  const femeiCount = await prisma.product.count({
    where: {
      category: {
        OR: [
          { slug: 'femei' },
          { parent: { slug: 'femei' } }
        ]
      }
    }
  });
  console.log(`Total products in Femei: ${femeiCount}`);

  await prisma.$disconnect();
}

runCategoryFix().catch(err => {
  console.error('Category fix error:', err);
  process.exit(1);
});
