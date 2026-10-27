const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTigai() {
  const tigai = await prisma.product.findMany({
    where: { category: { slug: 'tigai' } },
    select: { id: true, title: true }
  });
  console.log(`Checking ${tigai.length} items in 'tigai':`);
  const nonPan = tigai.filter(p => !/\b(tiga[i|ie]|wok|grill|clatit[e|a])\b/i.test(p.title));
  console.log(`Non-pan in 'tigai': ${nonPan.length}`);
  nonPan.forEach(p => console.log(`[${p.id}] ${p.title}`));
}

checkTigai().finally(() => prisma.$disconnect());

