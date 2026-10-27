const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oale = await prisma.product.findMany({
    where: { category: { slug: 'oale' } },
    select: { id: true, title: true }
  });

  const potRegex = /\b(oal[aăe]|cratit[aăe]|ceaun|tuci|kukta)\b/i;
  const nonPotCore = [];

  for (const p of oale) {
    if (!potRegex.test(p.title)) {
      nonPotCore.push(p);
    }
  }

  console.log(`Out of ${oale.length} items in 'oale', non-pot-core items: ${nonPotCore.length}`);
  nonPotCore.forEach(p => console.log(`[${p.id}] ${p.title}`));
}

main().finally(() => prisma.$disconnect());

