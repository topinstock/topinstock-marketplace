const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const j = await prisma.$queryRawUnsafe('PRAGMA journal_mode;');
  const s = await prisma.$queryRawUnsafe('PRAGMA synchronous;');
  const c = await prisma.$queryRawUnsafe('PRAGMA cache_size;');
  console.log({ journal_mode: j, synchronous: s, cache_size: c });
  await prisma.$disconnect();
}

main();
