const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function secondPassPurification() {
  const oale = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: true }
  });

  const catTigai = await prisma.category.findUnique({ where: { slug: 'tigai' } });
  const catSeturi = await prisma.category.findUnique({ where: { slug: 'seturi-oale-si-tigai' } });
  const catTavi = await prisma.category.findUnique({ where: { slug: 'tavi-si-forme-copt' } });
  const catServire = await prisma.category.findUnique({ where: { slug: 'articole-servire-masa' } });
  const catPahare = await prisma.category.findUnique({ where: { slug: 'pahare-si-cani' } });
  const catUstensile = await prisma.category.findUnique({ where: { slug: 'ustensile-pentru-bucatarie' } });
  const catDepozitare = await prisma.category.findUnique({ where: { slug: 'organizatoare-si-depozitare-bucatarie' } });

  console.log(`Second pass: auditing ${oale.products.length} products in Oale...`);

  let moved = 0;
  for (const p of oale.products) {
    const t = p.title.toLowerCase();
    let target = null;

    if (t.includes('tigaie') || t.includes('wok')) {
      target = catTigai;
    } else if (t.includes('tava') || t.includes('tavă')) {
      target = catTavi;
    } else if (t.includes('boluri') || t.includes('bol ') || t.includes('sosiera') || t.includes('platou') || t.includes('servire inghetata')) {
      target = catServire;
    } else if (t.includes('cana') || t.includes('halba') || t.includes('pahar')) {
      target = catPahare;
    } else if (t.includes('cleste') || t.includes('gratar ') || t.includes('tocator')) {
      target = catUstensile;
    } else if (t.includes('caserole')) {
      target = catDepozitare;
    } else if (t.includes('set de vase de gătit') || t.includes('set de vase de gatit') || t.includes('set de 3 vase pentru prăjit') || t.includes('set 6 piese: 3 vase') || t.includes('set de 4 vase') || t.includes('set de vase din') || t.includes('set 4 piese')) {
      target = catSeturi;
    }

    if (target) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: target.id }
      });
      moved++;
      console.log(`[PASS 2 MOVED] "${p.title}" -> ${target.slug}`);
    }
  }

  console.log(`Pass 2 finished: moved ${moved} products out of Oale.`);

  // Verify Oale now
  const finalOale = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: { select: { id: true, title: true } } }
  });

  console.log(`\n=== OALE NOW HAS ${finalOale.products.length} PRODUCTS ===`);
  console.log('ALL PRODUCTS IN OALE:');
  finalOale.products.forEach((p, i) => console.log(` ${i+1}. ${p.title}`));

  // Resync fallback json
  const allUpdatedProducts = await prisma.product.findMany({
    where: { isPublished: true },
    select: {
      id: true, vendorId: true, categoryId: true, title: true, slug: true, description: true,
      price: true, originalPrice: true, discountPercentage: true, stock: true, sku: true,
      images: true, sizes: true, colors: true, attributes: true, rating: true, reviewsCount: true,
      isPublished: true, createdAt: true, updatedAt: true,
      vendor: { select: { id: true, storeName: true, slug: true, isVerified: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } }
    }
  });

  const formatted = allUpdatedProducts.map(p => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
    attributes: typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes
  }));

  const productsJsonPath = path.join(__dirname, '..', 'lib', 'data', 'products_catalog_fallback.json');
  fs.writeFileSync(productsJsonPath, JSON.stringify(formatted, null, 2), 'utf-8');
  console.log(`Updated fallback JSON!`);
}

secondPassPurification().finally(() => prisma.$disconnect());

