const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function deleteOutOfStock() {
  console.log('=== ȘTERGERE PRODUSE FĂRĂ STOC DIN BAZA DE DATE ===\n');
  const t0 = Date.now();

  const initialTotal = await prisma.product.count();
  const toDeleteCount = await prisma.product.count({
    where: {
      OR: [
        { stock: { lte: 0 } },
        { isPublished: false }
      ]
    }
  });

  console.log(`Total produse inițial: ${initialTotal}`);
  console.log(`Produse fără stoc / nepublicate identificate pentru ștergere: ${toDeleteCount}`);

  if (toDeleteCount === 0) {
    console.log('Nu există produse fără stoc de șters.');
    await prisma.$disconnect();
    return;
  }

  // Ștergere directă prin SQL atomic
  console.log('\nSe execută ștergerea...');
  const deleted = await prisma.$executeRawUnsafe(`
    DELETE FROM products
    WHERE stock <= 0 OR isPublished = 0;
  `);
  console.log(`✓ Șterse ${deleted} produse din tabelul products.`);

  // Verificare total rămas
  const remainingTotal = await prisma.product.count();
  const remainingInStock = await prisma.product.count({ where: { stock: { gt: 0 } } });
  console.log(`✓ Produse rămase în baza de date: ${remainingTotal} (toate au stock > 0: ${remainingInStock})`);

  // Optimizare și eliberare spațiu disc (VACUUM)
  console.log('\nSe execută VACUUM pentru eliberarea spațiului pe disc și compactarea bazei de date...');
  const dbPath = path.join(__dirname, '..', 'prisma', 'topinstock.db');
  let sizeBefore = 0;
  if (fs.existsSync(dbPath)) {
    sizeBefore = (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2);
  }

  await prisma.$executeRawUnsafe(`VACUUM;`);
  await prisma.$executeRawUnsafe(`PRAGMA optimize;`);

  let sizeAfter = 0;
  if (fs.existsSync(dbPath)) {
    sizeAfter = (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2);
  }

  console.log(`✓ VACUUM finalizat cu succes!`);
  console.log(`  Mărime fișier DB înainte: ${sizeBefore} MB`);
  console.log(`  Mărime fișier DB după:    ${sizeAfter} MB (spațiu eliberat: ${(sizeBefore - sizeAfter).toFixed(2)} MB)`);
  console.log(`⏱ Durată totală operațiune: ${((Date.now() - t0) / 1000).toFixed(2)}s`);
  console.log('\n===========================================================');

  await prisma.$disconnect();
}

deleteOutOfStock().catch(err => {
  console.error('Eroare la ștergerea produselor:', err);
  prisma.$disconnect();
});
