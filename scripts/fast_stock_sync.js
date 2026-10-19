const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fastSync() {
  console.log('=== FAST DIRECT SQL STOCK SYNCHRONIZATION ===\n');
  const t0 = Date.now();

  // 1. Create index on sku if not exists
  console.log('1. Creare index pe sku...');
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);`);
  console.log('  ✓ Index creat/verificat.');

  // 2. Load TeoMarket raw
  const teoPath = path.join(__dirname, '..', 'scripts', 'teomarket_all_products_raw.json');
  const rawTeo = JSON.parse(fs.readFileSync(teoPath, 'utf8'));
  console.log(`2. Încărcare TeoMarket: ${rawTeo.length} produse.`);

  // Create temporary table for TeoMarket
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS temp_teo_stocks;`);
  await prisma.$executeRawUnsafe(`
    CREATE TEMP TABLE temp_teo_stocks (
      sku TEXT PRIMARY KEY,
      stock INTEGER NOT NULL,
      is_published INTEGER NOT NULL
    );
  `);

  console.log('3. Inserare în tabel temporar...');
  const BATCH = 400; // SQLite limit on variables is 999
  let teoOOS = 0;
  let teoInStock = 0;

  for (let i = 0; i < rawTeo.length; i += BATCH) {
    const chunk = rawTeo.slice(i, i + BATCH);
    const values = [];
    for (const p of chunk) {
      const sku = `TIS-TEO-${p.id}`;
      const qty = Number(p.stock_quantity) || 0;
      const isPub = qty > 0 ? 1 : 0;
      if (qty > 0) teoInStock++; else teoOOS++;
      values.push(`('${sku}', ${qty}, ${isPub})`);
    }
    await prisma.$executeRawUnsafe(`
      INSERT OR REPLACE INTO temp_teo_stocks (sku, stock, is_published)
      VALUES ${values.join(', ')};
    `);
  }
  console.log(`  ✓ Inserate ${rawTeo.length} produse în temp_teo_stocks (${teoInStock} în stoc, ${teoOOS} epuizate).`);

  // 4. Update products from temp table in one atomic query
  console.log('4. Executare actualizare atomică pentru TeoMarket...');
  const updatedTeo = await prisma.$executeRawUnsafe(`
    UPDATE products
    SET stock = (SELECT stock FROM temp_teo_stocks WHERE temp_teo_stocks.sku = products.sku),
        isPublished = (SELECT is_published FROM temp_teo_stocks WHERE temp_teo_stocks.sku = products.sku)
    WHERE sku IN (SELECT sku FROM temp_teo_stocks);
  `);
  console.log(`  ✓ Actualizate ${updatedTeo} produse TeoMarket în TopinStock!`);

  // 5. KitchenTools
  const ktPath = path.join(__dirname, '..', 'scratch', 'kitchentools_all_products.json');
  if (fs.existsSync(ktPath)) {
    console.log('\n5. Sincronizare KitchenTools...');
    const rawKt = JSON.parse(fs.readFileSync(ktPath, 'utf8'));
    
    // Find out of stock handles/titles
    const oosHandles = [];
    const oosTitles = [];
    for (const item of rawKt) {
      const isAvail = item.available === true || item.variants?.some(v => v.available);
      if (!isAvail) {
        if (item.handle) oosHandles.push(item.handle.toLowerCase().trim());
        if (item.title) oosTitles.push(item.title.toLowerCase().trim().replace(/'/g, "''"));
      }
    }

    console.log(`  KitchenTools fără stoc: ${oosHandles.length}`);

    // Update in DB by slug
    for (let i = 0; i < oosHandles.length; i += 100) {
      const chunk = oosHandles.slice(i, i + 100).map(s => `'${s}'`).join(',');
      await prisma.$executeRawUnsafe(`
        UPDATE products
        SET stock = 0, isPublished = 0
        WHERE lower(slug) IN (${chunk});
      `);
    }

    // Update in DB by title
    for (let i = 0; i < oosTitles.length; i += 50) {
      const chunk = oosTitles.slice(i, i + 50).map(t => `'${t}'`).join(',');
      await prisma.$executeRawUnsafe(`
        UPDATE products
        SET stock = 0, isPublished = 0
        WHERE lower(title) IN (${chunk}) AND stock > 0;
      `);
    }
    console.log('  ✓ KitchenTools sincronizat.');
  }

  // 6. Summary
  const [total, published, oos, activeInStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.product.count({ where: { isPublished: false } }),
    prisma.product.count({ where: { isPublished: true, stock: { gt: 0 } } })
  ]);

  console.log('\n===========================================================');
  console.log('              REZULTAT FINAL SINCRONIZARE STOCURI          ');
  console.log('===========================================================');
  console.log(`✓ Total produse în baza de date: ${total}`);
  console.log(`✓ Produse ACTIVE pe site (În Stoc Real): ${published}`);
  console.log(`✓ Produse cu stock > 0 și isPublished = true: ${activeInStock}`);
  console.log(`✓ Produse DEZACTIVATE (Fără stoc furnizor): ${oos}`);
  console.log(`⏱ Durată totală sincronizare: ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  console.log('===========================================================');

  await prisma.$disconnect();
}

fastSync().catch(err => {
  console.error('Fatal fastSync error:', err);
  prisma.$disconnect();
});
