const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

function stripDiacritics(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeTitle(text) {
  return stripDiacritics(text)
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractModelCodes(text) {
  if (!text) return [];
  const regex = /\b([a-z]{1,4}[- ]?[0-9]{2,5}[a-z0-9]*)\b/gi;
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const code = m[1].replace(/[- ]/g, '').toUpperCase();
    if (code.length >= 3 && /[0-9]/.test(code) && /[A-Z]/.test(code)) {
      matches.push(code);
    }
  }
  return [...new Set(matches)];
}

async function exportExisting() {
  const existingProducts = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      sku: true,
      price: true,
      images: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } }
    }
  });

  console.log('Total products currently in DB:', existingProducts.length);
  
  const mapped = existingProducts.map(p => {
    return {
      id: p.id,
      title: p.title,
      normTitle: normalizeTitle(p.title),
      slug: p.slug,
      sku: p.sku,
      modelCodes: extractModelCodes(p.title),
      category: p.category.name,
      catSlug: p.category.slug
    };
  });

  fs.writeFileSync('scripts/existing_db_products.json', JSON.stringify(mapped, null, 2));
  console.log('Saved scripts/existing_db_products.json');

  const withCodes = mapped.filter(p => p.modelCodes.length > 0);
  console.log(`Products with detected model codes: ${withCodes.length} / ${mapped.length}`);
  console.log('Sample model codes:', withCodes.slice(0, 15).map(p => ({ title: p.title.slice(0, 50), codes: p.modelCodes })));

  await prisma.$disconnect();
}

exportExisting().catch(console.error);
