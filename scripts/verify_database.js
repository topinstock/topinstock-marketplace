const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('=== VERIFICARE BAZĂ DE DATE TOPINSTOCK ===');
  
  const totalProducts = await prisma.product.count();
  console.log(`Total produse în baza de date: ${totalProducts}`);

  const byVendor = await prisma.product.groupBy({
    by: ['vendorId'],
    _count: { id: true }
  });

  for (const v of byVendor) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: v.vendorId },
      include: { user: { select: { email: true, role: true } } }
    });
    console.log(`- Vendor "${vendor.storeName}" (${vendor.slug}, User: ${vendor.user.email}, Role: ${vendor.user.role}): ${v._count.id} produse`);
  }

  // Sample newly uploaded products
  const sampleNew = await prisma.product.findMany({
    where: {
      sku: { startsWith: 'TIS-VIC-' }
    },
    take: 10,
    include: {
      category: { select: { name: true, slug: true } }
    }
  });

  console.log('\n=== EȘANTION PRODUSE NOI VICTRONIC (10 buc) ===');
  sampleNew.forEach(p => {
    const images = JSON.parse(p.images);
    console.log(`- [${p.category.name}] ${p.title}`);
    console.log(`  Preț: ${p.price} LEI (Vechi: ${p.originalPrice} LEI, Reducere: ${p.discountPercentage}%)`);
    console.log(`  SKU: ${p.sku} | Slug: ${p.slug} | Stoc: ${p.stock}`);
    console.log(`  Imagine: ${images[0]}`);
  });

  // Verify no duplicate slugs
  const allSlugs = await prisma.product.findMany({ select: { slug: true } });
  const uniqueSlugs = new Set(allSlugs.map(s => s.slug));
  console.log(`\nVerificare unicitate slugs: ${allSlugs.length} totale vs ${uniqueSlugs.size} unice (Egal: ${allSlugs.length === uniqueSlugs.size})`);

  await prisma.$disconnect();
}

verify().catch(console.error);
