const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('===========================================================');
  console.log('         VERIFICARE SEO PRODUSE TEOMARKET PE TOPINSTOCK     ');
  console.log('===========================================================');

  // 1. Pick 5 sample products from TeoMarket
  const samples = await prisma.product.findMany({
    where: { vendor: { slug: 'teomarket' } },
    take: 5,
    include: {
      category: true,
      vendor: true
    }
  });

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const images = JSON.parse(p.images || '[]');
    const attributes = JSON.parse(p.attributes || '{}');

    console.log(`\n[Produs ${i + 1}] ID: ${p.id}`);
    console.log(`  Titlu: ${p.title}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  SKU: ${p.sku}`);
    console.log(`  Preț: ${p.price} LEI (Original: ${p.originalPrice} LEI, Reducere: -${p.discountPercentage}%)`);
    console.log(`  Stoc: ${p.stock} buc`);
    console.log(`  Rating: ${p.rating} / 5 (${p.reviewsCount} recenzii)`);
    console.log(`  Categorie: ${p.category?.name} (slug: /${p.category?.slug}/c)`);
    console.log(`  Vânzător: ${p.vendor?.storeName} (URL: /seller/${p.vendor?.slug}/v)`);
    console.log(`  URL Canonic eMAG style: /${p.slug}/pd/${p.id}/`);
    console.log(`  Imagini: ${images.length} foto (prima: ${images[0]})`);
    console.log(`  Atribute:`, attributes);
    console.log(`  Descriere (preview):`, p.description.substring(0, 180).replace(/\n/g, ' ') + '...');
  }

  // 2. Category count check
  const totalCategories = await prisma.category.count();
  console.log(`\n✓ Total categorii în baza de date: ${totalCategories}`);

  // 3. Vendor count check
  const vendors = await prisma.vendor.findMany({
    select: { storeName: true, slug: true, _count: { select: { products: true } } }
  });
  console.log('✓ Vânzători activi:', vendors);

  // 4. Products total
  const totalProducts = await prisma.product.count();
  console.log(`✓ Total produse în baza de date TopinStock: ${totalProducts}`);

  console.log('\n===========================================================');
  console.log('                 AUDIT SEO FINALIZAT CU SUCCES!            ');
  console.log('===========================================================');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
