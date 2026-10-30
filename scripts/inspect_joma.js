const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function checkJoma() {
  const jomaProducts = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'joma', mode: 'insensitive' } },
        { description: { contains: 'joma', mode: 'insensitive' } },
        { attributes: { contains: 'joma', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      price: true,
      images: true,
      category: { select: { name: true, slug: true } },
      attributes: true
    }
  });

  console.log('Total Joma in DB:', jomaProducts.length);

  const byType = {};
  jomaProducts.forEach(p => {
    const t = p.title.toLowerCase();
    let type = 'altele';
    if (t.includes('trening') || t.includes('tracksuit')) type = 'trening';
    else if (t.includes('tricou') || t.includes('t-shirt') || t.includes('shirt')) type = 'tricou';
    else if (t.includes('pantalon') || t.includes('pants')) type = 'pantalon';
    else if (t.includes('bluza') || t.includes('sweatshirt') || t.includes('hanorac') || t.includes('jacket')) type = 'bluza_jacheta';
    else if (t.includes('geanta') || t.includes('rucsac') || t.includes('bag')) type = 'genti';
    else if (t.includes('jambiere') || t.includes('sosete')) type = 'sosete_jambiere';
    else if (t.includes('ghete') || t.includes('pantofi') || t.includes('incaltaminte')) type = 'incaltaminte';
    
    byType[type] = (byType[type] || 0) + 1;
  });

  console.log('Joma products by type:', byType);

  const tracksuits = jomaProducts.filter(p => {
    const t = p.title.toLowerCase();
    return t.includes('trening') || t.includes('tracksuit');
  });

  console.log(`\nFound ${tracksuits.length} exact 'trening' items.`);
  tracksuits.forEach((p, idx) => {
    let imgs = [];
    try { imgs = JSON.parse(p.images); } catch(e) {}
    console.log(`[${idx + 1}] ${p.sku} | ${p.title}`);
    console.log(`    Category: ${p.category?.name} (${p.category?.slug})`);
    console.log(`    First Image: ${imgs[0]}`);
  });

  fs.writeFileSync('scratch/joma_tracksuits.json', JSON.stringify(tracksuits, null, 2));
  fs.writeFileSync('scratch/all_joma.json', JSON.stringify(jomaProducts, null, 2));
}

checkJoma()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
