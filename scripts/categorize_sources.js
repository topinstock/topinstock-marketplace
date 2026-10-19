const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.product.findMany({ select: { id: true, sku: true } });
  const counts = {
    TEOMARKET: 0,
    SPINCOM: 0,
    KITCHENTOOLS: 0,
    VICTRONIC: 0,
    OTHER: 0
  };

  for (const p of all) {
    const s = p.sku || '';
    if (s.startsWith('TIS-TEO-')) counts.TEOMARKET++;
    else if (s.startsWith('SPIN-') || s.startsWith('SPN') || s.startsWith('GWC') || s.startsWith('FI380') || s.startsWith('Back-')) counts.SPINCOM++;
    else if (s.startsWith('KT-') || s.includes('KITCHEN')) counts.KITCHENTOOLS++;
    else if (s.startsWith('TIS-VIC-') || s.startsWith('VIC-')) counts.VICTRONIC++;
    else counts.OTHER++;
  }

  console.log('Source distribution:', counts);

  // Check some samples of OTHER
  const otherSamples = all.filter(p => {
    const s = p.sku || '';
    return !s.startsWith('TIS-TEO-') && !s.startsWith('SPIN-') && !s.startsWith('SPN') && !s.startsWith('GWC') && !s.startsWith('FI380') && !s.startsWith('Back-');
  }).slice(0, 10);
  console.log('Other samples:', otherSamples);
}

main().catch(console.error).finally(() => prisma.$disconnect());
