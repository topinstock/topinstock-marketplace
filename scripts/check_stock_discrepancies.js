const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkStockSync() {
  console.log('=== VERIFICARE DISCREPANȚE STOC SURSE IMPORT VS DATABASE ===\n');

  // 1. TeoMarket
  const teoPath = path.join(__dirname, '..', 'scripts', 'teomarket_all_products_raw.json');
  let teoOOSIds = [];
  let teoInStockCount = 0;

  if (fs.existsSync(teoPath)) {
    const rawTeo = JSON.parse(fs.readFileSync(teoPath, 'utf8'));
    console.log(`[TeoMarket] Total produse în fișier sursă: ${rawTeo.length}`);
    const teoMap = new Map();
    for (const p of rawTeo) {
      teoMap.set(`TIS-TEO-${p.id}`, p.stock_quantity ?? 0);
    }

    const teoDbProducts = await prisma.product.findMany({
      where: { sku: { startsWith: 'TIS-TEO-' } },
      select: { id: true, sku: true, stock: true }
    });
    console.log(`[TeoMarket] Total produse TIS-TEO în baza de date: ${teoDbProducts.length}`);

    for (const p of teoDbProducts) {
      const srcStock = teoMap.get(p.sku);
      if (srcStock !== undefined) {
        if (srcStock === 0) {
          teoOOSIds.push(p.id);
        } else {
          teoInStockCount++;
        }
      }
    }
    console.log(`  -> În stoc pe TeoMarket: ${teoInStockCount}`);
    console.log(`  -> FĂRĂ stoc pe TeoMarket (dar active cu stoc fals în DB): ${teoOOSIds.length}`);
  }

  // 2. KitchenTools
  const ktPath = path.join(__dirname, '..', 'scratch', 'kitchentools_all_products.json');
  let ktOOSIds = [];
  let ktInStockCount = 0;

  if (fs.existsSync(ktPath)) {
    const rawKt = JSON.parse(fs.readFileSync(ktPath, 'utf8'));
    console.log(`\n[KitchenTools] Total produse în fișier sursă: ${rawKt.length}`);
    const ktMap = new Map();
    for (const p of rawKt) {
      const isAvail = p.available === true || p.variants?.some(v => v.available);
      if (p.handle) ktMap.set(p.handle.toLowerCase().trim(), isAvail);
      if (p.title) ktMap.set(p.title.toLowerCase().trim(), isAvail);
    }

    const nonTeo = await prisma.product.findMany({
      where: {
        NOT: { sku: { startsWith: 'TIS-TEO-' } }
      },
      select: { id: true, slug: true, title: true, stock: true, sku: true }
    });

    for (const p of nonTeo) {
      const match = ktMap.get(p.slug.toLowerCase().trim()) ?? ktMap.get(p.title.toLowerCase().trim());
      if (match !== undefined) {
        if (match === false) {
          ktOOSIds.push(p.id);
        } else {
          ktInStockCount++;
        }
      }
    }
    console.log(`  -> În stoc pe KitchenTools: ${ktInStockCount}`);
    console.log(`  -> FĂRĂ stoc pe KitchenTools (dar cu stoc 50 în DB): ${ktOOSIds.length}`);
  }

  const totalOOS = teoOOSIds.length + ktOOSIds.length;
  console.log(`\n========================================`);
  console.log(`TOTAL PRODUSE FĂRĂ STOC LA FURNIZORI: ${totalOOS}`);
  console.log(`  TeoMarket: ${teoOOSIds.length}`);
  console.log(`  KitchenTools: ${ktOOSIds.length}`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

checkStockSync().catch(console.error);
