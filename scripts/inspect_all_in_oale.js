const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectRemainingInOale() {
  const oale = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: { select: { id: true, title: true } } }
  });

  console.log(`Total in Oale: ${oale.products.length}`);
  const items = [];
  for (const p of oale.products) {
    items.push(p.title);
  }
  
  // Categorize what is in oale
  const truePots = [];
  const otherItems = [];

  for (const title of items) {
    const t = title.toLowerCase();
    const isActualPot = /\b(oal[aăe]|cratit[aăe]|tuci|ceaun|kukta)\b/i.test(t) || 
                        t.includes('set de oale') || t.includes('set oale') || 
                        t.includes('oala sub presiune') || t.includes('oală sub presiune');
    if (isActualPot) {
      truePots.push(title);
    } else {
      otherItems.push(title);
    }
  }

  console.log(`\nActual Real Pots/Cratite: ${truePots.length}`);
  truePots.slice(0, 10).forEach(t => console.log(' [POT] ' + t));

  console.log(`\nOther items currently in Oale: ${otherItems.length}`);
  otherItems.forEach(t => console.log(' [OTHER] ' + t));
}

inspectRemainingInOale().finally(() => prisma.$disconnect());

