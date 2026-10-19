const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkpointAndVacuum() {
  const dbPath = path.join(__dirname, '..', 'prisma', 'topinstock.db');
  console.log('File size before:', (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2), 'MB');
  
  await prisma.$queryRawUnsafe(`PRAGMA wal_checkpoint(TRUNCATE);`);
  await prisma.$executeRawUnsafe(`VACUUM;`);
  await prisma.$queryRawUnsafe(`PRAGMA wal_checkpoint(TRUNCATE);`);
  
  console.log('File size after vacuum:', (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2), 'MB');

  const count = await prisma.product.count();
  const oos = await prisma.product.count({ where: { stock: { lte: 0 } } });
  console.log({ totalProductsInDb: count, outOfStockInDb: oos });

  await prisma.$disconnect();
}

checkpointAndVacuum().catch(console.error);
