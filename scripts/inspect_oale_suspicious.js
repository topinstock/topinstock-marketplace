const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectOaleComplete() {
  const oaleCat = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: true }
  });

  console.log(`Checking ${oaleCat.products.length} products in 'oale':`);
  const suspicious = [];
  for (const p of oaleCat.products) {
    const t = p.title.toLowerCase();
    if (
      t.includes('sita') ||
      t.includes('capac') ||
      t.includes('maner') ||
      t.includes('suport') ||
      t.includes('nu este inclus') ||
      t.includes('lingura') ||
      t.includes('furculita') ||
      t.includes('cutit') ||
      t.includes('paleta') ||
      t.includes('tocator') ||
      t.includes('cana') ||
      t.includes('pahar') ||
      t.includes('termos') ||
      t.includes('ceainic') ||
      t.includes('ibric')
    ) {
      suspicious.push({ id: p.id, title: p.title });
    }
  }

  console.log(`Found ${suspicious.length} suspicious non-pot products in 'oale':`);
  suspicious.forEach(s => console.log(`[${s.id}] ${s.title}`));
}

inspectOaleComplete().finally(() => prisma.$disconnect());

