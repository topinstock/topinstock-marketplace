const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  const products = await prisma.product.findMany({ take: 15 });
  console.log('Verificare primele 15 imagini de produse:');
  for (const p of products) {
    const img = p.images?.[0];
    if (img) {
      try {
        const url = img.startsWith('http') ? img : 'http://localhost:3000' + img;
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`[${res.status}] ${url.slice(0, 70)}... (${p.title.slice(0, 30)}...)`);
      } catch (e) {
        console.log(`[ERR] ${img}`);
      }
    } else {
      console.log(`[LIPSEȘTE IMAGINE] pentru ${p.title}`);
    }
  }
  await prisma.$disconnect();
}

checkImages();
