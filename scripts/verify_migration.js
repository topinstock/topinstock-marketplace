const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const vendors = await prisma.vendor.findMany({
    include: { _count: { select: { products: true, orderItems: true } } }
  });
  console.log('--- VENDORS IN DATABASE ---');
  console.log(vendors);

  const totalProducts = await prisma.product.count();
  console.log('Total products in DB:', totalProducts);

  const topinStockProducts = await prisma.product.count({
    where: { vendor: { storeName: 'TOPinStock' } }
  });
  console.log('Products belonging to TOPinStock:', topinStockProducts);

  const titlesWithFlippy = await prisma.product.count({
    where: { title: { contains: 'flippy' } }
  });
  const titlesWithTeo = await prisma.product.count({
    where: { title: { contains: 'teomarket' } }
  });
  console.log('Titles with flippy:', titlesWithFlippy, '| Titles with teomarket:', titlesWithTeo);

  const attrsWithFlippy = await prisma.product.count({
    where: { attributes: { contains: 'flippy' } }
  });
  const attrsWithTeo = await prisma.product.count({
    where: { attributes: { contains: 'teomarket' } }
  });
  console.log('Attributes with flippy:', attrsWithFlippy, '| Attributes with teomarket:', attrsWithTeo);

  const sampleRucsac = await prisma.product.findFirst({
    where: { title: { contains: 'Rucsac Troler de Calatorie' } },
    select: { title: true, attributes: true, slug: true, vendor: { select: { storeName: true } } }
  });
  console.log('\n--- SAMPLE MIGRATED PRODUCT ---');
  console.log(sampleRucsac);

  // Check image src in descriptions to ensure URLs were not corrupted
  const imgProd = await prisma.product.findFirst({
    where: { description: { contains: 'images-teomarket' } },
    select: { description: true }
  });
  if (imgProd) {
    const match = imgProd.description.match(/src="([^"]+)"/);
    console.log('\n--- SAMPLE IMAGE URL IN DESCRIPTION ---');
    console.log('src URL:', match ? match[1] : 'not found');
  }
}

verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
