const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runStockSync() {
  console.log('=== PORNIRE SINCRONIZARE STOCURI CU SITE-URILE FURNIZOARE ===\n');

  const startTime = Date.now();

  // 1. TEO MARKET
  const teoPath = path.join(__dirname, '..', 'scripts', 'teomarket_all_products_raw.json');
  if (!fs.existsSync(teoPath)) {
    throw new Error('Fișierul TeoMarket nu există!');
  }
  const rawTeo = JSON.parse(fs.readFileSync(teoPath, 'utf8'));
  console.log(`[TeoMarket] S-au încărcat ${rawTeo.length} produse din fișierul sursă.`);

  // Construim map-ul de SKU -> { stock, isPublished }
  const teoOosSkus = [];
  const teoInStockItems = [];

  for (const p of rawTeo) {
    const sku = `TIS-TEO-${p.id}`;
    const qty = Number(p.stock_quantity) || 0;
    if (qty > 0) {
      teoInStockItems.push({ sku, stock: qty });
    } else {
      teoOosSkus.push(sku);
    }
  }

  console.log(`[TeoMarket] Fără stoc pe site-ul sursă: ${teoOosSkus.length}`);
  console.log(`[TeoMarket] În stoc pe site-ul sursă: ${teoInStockItems.length}`);

  // Pasul 1A: Dezactivare masivă a celor fără stoc din TeoMarket (în loturi de 500)
  console.log('\n[TeoMarket] Se dezactivează produsele fără stoc (isPublished: false, stock: 0)...');
  const BATCH_SIZE = 500;
  let teoOosUpdated = 0;

  for (let i = 0; i < teoOosSkus.length; i += BATCH_SIZE) {
    const chunk = teoOosSkus.slice(i, i + BATCH_SIZE);
    const res = await prisma.product.updateMany({
      where: {
        sku: { in: chunk }
      },
      data: {
        isPublished: false,
        stock: 0
      }
    });
    teoOosUpdated += res.count;
    if (teoOosUpdated % 2500 === 0 || i + BATCH_SIZE >= teoOosSkus.length) {
      console.log(`  Progres dezactivare TeoMarket: ${teoOosUpdated} / ${teoOosSkus.length}`);
    }
  }

  // Pasul 1B: Actualizare stoc real pentru produsele în stoc din TeoMarket
  console.log('\n[TeoMarket] Se actualizează stocurile reale pentru produsele în stoc...');
  // Pentru performanță maximă în SQLite, grupăm produsele după cantitatea de stoc dacă sunt similare sau actualizăm rapid
  // Să vedem distribuția de stock_quantity
  const qtyGroups = new Map();
  for (const item of teoInStockItems) {
    if (!qtyGroups.has(item.stock)) {
      qtyGroups.set(item.stock, []);
    }
    qtyGroups.get(item.stock).push(item.sku);
  }

  console.log(`[TeoMarket] Număr grupuri de cantități unice: ${qtyGroups.size}`);
  let teoInStockUpdated = 0;

  for (const [qty, skus] of qtyGroups.entries()) {
    for (let i = 0; i < skus.length; i += BATCH_SIZE) {
      const chunk = skus.slice(i, i + BATCH_SIZE);
      const res = await prisma.product.updateMany({
        where: {
          sku: { in: chunk }
        },
        data: {
          stock: qty,
          isPublished: true
        }
      });
      teoInStockUpdated += res.count;
    }
  }
  console.log(`  ✓ Actualizate produse în stoc TeoMarket: ${teoInStockUpdated}`);


  // 2. KITCHENTOOLS
  const ktPath = path.join(__dirname, '..', 'scratch', 'kitchentools_all_products.json');
  if (fs.existsSync(ktPath)) {
    const rawKt = JSON.parse(fs.readFileSync(ktPath, 'utf8'));
    console.log(`\n[KitchenTools] S-au încărcat ${rawKt.length} produse.`);

    const ktOosHandles = [];
    const ktOosTitles = [];
    const ktInStockHandles = [];

    for (const item of rawKt) {
      const isAvail = item.available === true || item.variants?.some(v => v.available);
      if (!isAvail) {
        if (item.handle) ktOosHandles.push(item.handle.toLowerCase().trim());
        if (item.title) ktOosTitles.push(item.title.toLowerCase().trim());
      } else {
        if (item.handle) ktInStockHandles.push(item.handle.toLowerCase().trim());
      }
    }

    console.log(`[KitchenTools] Fără stoc pe site-ul sursă: ${ktOosHandles.length}`);
    console.log(`[KitchenTools] În stoc pe site-ul sursă: ${ktInStockHandles.length}`);

    // Găsim produsele din DB care corespund celor fără stoc
    const ktDbProducts = await prisma.product.findMany({
      where: {
        NOT: { sku: { startsWith: 'TIS-TEO-' } }
      },
      select: { id: true, slug: true, title: true }
    });

    const oosDbIds = [];
    const inStockDbIds = [];
    const oosHandleSet = new Set(ktOosHandles);
    const oosTitleSet = new Set(ktOosTitles);
    const inStockHandleSet = new Set(ktInStockHandles);

    for (const p of ktDbProducts) {
      const slugLower = p.slug.toLowerCase().trim();
      const titleLower = p.title.toLowerCase().trim();

      if (oosHandleSet.has(slugLower) || oosTitleSet.has(titleLower)) {
        oosDbIds.push(p.id);
      } else if (inStockHandleSet.has(slugLower)) {
        inStockDbIds.push(p.id);
      }
    }

    console.log(`[KitchenTools] Produse DB găsite fără stoc: ${oosDbIds.length}`);
    console.log(`[KitchenTools] Produse DB găsite în stoc: ${inStockDbIds.length}`);

    // Actualizăm cele fără stoc
    if (oosDbIds.length > 0) {
      for (let i = 0; i < oosDbIds.length; i += BATCH_SIZE) {
        const chunk = oosDbIds.slice(i, i + BATCH_SIZE);
        await prisma.product.updateMany({
          where: { id: { in: chunk } },
          data: {
            isPublished: false,
            stock: 0
          }
        });
      }
    }

    // Ne asigurăm că cele în stoc sunt isPublished: true
    if (inStockDbIds.length > 0) {
      for (let i = 0; i < inStockDbIds.length; i += BATCH_SIZE) {
        const chunk = inStockDbIds.slice(i, i + BATCH_SIZE);
        await prisma.product.updateMany({
          where: { id: { in: chunk } },
          data: {
            isPublished: true
          }
        });
      }
    }
    console.log(`  ✓ Actualizate produse KitchenTools cu succes.`);
  }

  // REZUMAT FINAL
  const totalDb = await prisma.product.count();
  const publishedDb = await prisma.product.count({ where: { isPublished: true } });
  const unpublishedDb = await prisma.product.count({ where: { isPublished: false } });
  const zeroStockDb = await prisma.product.count({ where: { stock: 0 } });
  const activeWithStockDb = await prisma.product.count({ where: { isPublished: true, stock: { gt: 0 } } });

  console.log('\n===========================================================');
  console.log('              SINCRONIZARE STOCURI FINALIZATĂ              ');
  console.log('===========================================================');
  console.log(`✓ Total produse în baza de date: ${totalDb}`);
  console.log(`✓ Produse ACTIVE pe site (În Stoc Real): ${publishedDb} (${activeWithStockDb} cu stock > 0)`);
  console.log(`✓ Produse DEZACTIVATE (Fără stoc la furnizor): ${unpublishedDb}`);
  console.log(`✓ Produse cu stoc = 0: ${zeroStockDb}`);
  console.log(`⏱ Timp total de execuție: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log('===========================================================');

  await prisma.$disconnect();
}

runStockSync().catch(err => {
  console.error('Eroare sincronizare stoc:', err);
  prisma.$disconnect();
});
