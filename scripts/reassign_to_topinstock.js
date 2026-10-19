const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reassignToTopinStock() {
  console.log('===========================================================');
  console.log('   REASIGNARE PRODUSE PE VENDORUL TOPINSTOCK (ADMIN)       ');
  console.log('===========================================================');

  // 1. Get TopinStock Admin Vendor
  const topinStockVendor = await prisma.vendor.findFirst({
    where: { slug: 'topinstock-oficial' }
  });

  if (!topinStockVendor) {
    throw new Error('Nu s-a găsit vendorul "topinstock-oficial"!');
  }

  console.log(`✓ Vendor Țintă: ${topinStockVendor.storeName} (ID: ${topinStockVendor.id})`);

  // 2. Count current products per vendor
  const beforeCount = await prisma.product.count({
    where: { vendorId: topinStockVendor.id }
  });
  console.log(`✓ Produse curente pe TopinStock: ${beforeCount}`);

  // 3. Update all products in DB to belong to TopinStock vendor
  const updateResult = await prisma.product.updateMany({
    data: {
      vendorId: topinStockVendor.id
    }
  });

  console.log(`✓ Total produse actualizate pe TopinStock: ${updateResult.count}`);

  // 4. Verify counts
  const afterCount = await prisma.product.count({
    where: { vendorId: topinStockVendor.id }
  });
  const totalCount = await prisma.product.count();

  console.log('\n===========================================================');
  console.log('                  REZULTAT REASIGNARE                      ');
  console.log('===========================================================');
  console.log(`✓ Produse asociate contului Admin TopinStock: ${afterCount}`);
  console.log(`✓ Total produse în Marketplace: ${totalCount}`);
  console.log('✓ Adminul are acces direct complet la toate produsele!');
  console.log('===========================================================');
}

reassignToTopinStock()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
