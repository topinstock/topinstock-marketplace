const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bench() {
  console.log('Testing speed of 100 updates...');
  const sample = await prisma.product.findMany({
    take: 100,
    select: { id: true, title: true }
  });
  
  const start = Date.now();
  await prisma.$transaction(
    sample.map(p => prisma.product.update({
      where: { id: p.id },
      data: { title: p.title }
    }))
  );
  const elapsed = Date.now() - start;
  console.log(`100 updates in transaction took ${elapsed}ms (${(elapsed / 100).toFixed(2)}ms per item)`);
  console.log(`Estimated time for 24,000 items: ${((elapsed / 100) * 24000 / 1000).toFixed(1)} seconds`);
}

bench().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
