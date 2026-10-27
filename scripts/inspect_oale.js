const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectCookware() {
  const oaleCategory = await prisma.category.findUnique({
    where: { slug: 'oale' },
    include: { products: { select: { id: true, title: true, sku: true } } },
  });

  console.log(`=== Category 'oale' total products: ${oaleCategory ? oaleCategory.products.length : 0} ===`);
  
  if (oaleCategory) {
    console.log('\nSample 15 products currently in "oale":');
    oaleCategory.products.slice(0, 15).forEach(p => console.log(` [${p.id}] ${p.title}`));

    // Check for suspicious non-cookware in oale
    const nonCookwareInOale = oaleCategory.products.filter(p => {
      const t = p.title.toLowerCase();
      const isCookware = t.includes('oal') || t.includes('cratit') || t.includes('tigai') || 
                         t.includes('tigaie') || t.includes('ceaun') || t.includes('tuci') || 
                         t.includes('vas') || t.includes('inox') || t.includes('gatit') || 
                         t.includes('copt') || t.includes('tava') || t.includes('tavă') || 
                         t.includes('wok') || t.includes('ibric') || t.includes('set') ||
                         t.includes('capac') || t.includes('grunberg') || t.includes('bohmann') ||
                         t.includes('berlinger') || t.includes('royalty') || t.includes('tefal') ||
                         t.includes('kukta') || t.includes('presiune');
      return !isCookware;
    });

    console.log(`\nPotential suspicious non-cookware in "oale": ${nonCookwareInOale.length}`);
    nonCookwareInOale.slice(0, 15).forEach(p => console.log(` ! NON-OALE?: ${p.title}`));
  }

  // Check cookware outside oale
  const cookwareWords = ['oală', 'oala', 'cratiță', 'cratita', 'tigaie', 'tigăi', 'tigai', 'ceaun', 'tuci', 'kukta', 'cratite'];
  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true, categoryId: true, category: { select: { name: true, slug: true } } }
  });

  const cookwareOutsideOale = allProducts.filter(p => {
    if (p.category && (p.category.slug === 'oale' || p.category.slug === 'seturi-oale-si-tigai' || p.category.slug === 'tigai')) {
      return false;
    }
    const t = p.title.toLowerCase();
    return cookwareWords.some(w => t.includes(w));
  });

  console.log(`\n=== Cookware products found OUTSIDE "oale" or "tigai": ${cookwareOutsideOale.length} ===`);
  cookwareOutsideOale.slice(0, 20).forEach(p => {
    console.log(` -> Found: "${p.title}" in category "${p.category?.name} (${p.category?.slug})"`);
  });
}

inspectCookware().finally(() => prisma.$disconnect());

