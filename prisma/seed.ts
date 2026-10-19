import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database...');

  // 1. Password Hash for default Admin & Vendor
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);

  // 2. Create or get Admin / Main Vendor User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@topinstock.ro' },
    update: {
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      name: 'TOPinStock',
    },
    create: {
      email: 'admin@topinstock.ro',
      passwordHash: defaultPasswordHash,
      name: 'TOPinStock',
      role: 'ADMIN',
    },
  });

  const mainVendor = await prisma.vendor.upsert({
    where: { userId: adminUser.id },
    update: {
      storeName: 'TOPinStock',
      slug: 'topinstock-oficial',
      description: 'Magazinul oficial de vânzări directe TOPinStock România.',
      isVerified: true,
      rating: 4.95,
      commissionRate: 0.10,
    },
    create: {
      userId: adminUser.id,
      storeName: 'TOPinStock',
      slug: 'topinstock-oficial',
      description: 'Magazinul oficial de vânzări directe TOPinStock România.',
      isVerified: true,
      rating: 4.95,
      commissionRate: 0.10,
    },
  });

  // 3. Create Category Tree
  const categoryWomen = await prisma.category.upsert({
    where: { slug: 'femei' },
    update: { name: 'Femei', order: 1 },
    create: { name: 'Femei', slug: 'femei', order: 1 },
  });

  const dressesCategoryId = (await prisma.category.upsert({
    where: { slug: 'rochii-femei' },
    update: { parentId: categoryWomen.id },
    create: { name: 'Rochii', slug: 'rochii-femei', order: 1, parentId: categoryWomen.id },
  })).id;

  const shoesWomenCategoryId = (await prisma.category.upsert({
    where: { slug: 'pantofi-femei' },
    update: { parentId: categoryWomen.id },
    create: { name: 'Pantofi', slug: 'pantofi-femei', order: 2, parentId: categoryWomen.id },
  })).id;

  const categoryMen = await prisma.category.upsert({
    where: { slug: 'barbati' },
    update: { name: 'Bărbați', order: 2 },
    create: { name: 'Bărbați', slug: 'barbati', order: 2 },
  });

  const shirtsMenCategoryId = (await prisma.category.upsert({
    where: { slug: 'camasi-barbati' },
    update: { parentId: categoryMen.id },
    create: { name: 'Cămăși', slug: 'camasi-barbati', order: 1, parentId: categoryMen.id },
  })).id;

  const pantsMenCategoryId = (await prisma.category.upsert({
    where: { slug: 'pantaloni-barbati' },
    update: { parentId: categoryMen.id },
    create: { name: 'Pantaloni', slug: 'pantaloni-barbati', order: 2, parentId: categoryMen.id },
  })).id;

  const categorySales = await prisma.category.upsert({
    where: { slug: 'reduceri' },
    update: { name: 'Reduceri', order: 3 },
    create: { name: 'Reduceri', slug: 'reduceri', order: 3 },
  });

  // 4. Create Demo Products with JSON strings for SQLite
  const products = [
    {
      title: 'Rochie de Vară Florală cu Volane',
      slug: 'rochie-vara-florala',
      description: 'Rochie ușoară de vară cu imprimeu floral rafinat, croială fluidă și volane delicate. Perfectă pentru zile însorite sau plimbări pe faleză.',
      price: 129.99,
      originalPrice: 199.99,
      discountPercentage: 35,
      stock: 50,
      sku: 'ROCH-VAR-01',
      vendorId: mainVendor.id,
      categoryId: dressesCategoryId,
      images: JSON.stringify(['/images/hero2.jpg']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors: JSON.stringify(['Roșu Coral', 'Albastru Marin']),
      rating: 4.8,
      reviewsCount: 24,
      isPublished: true,
    },
    {
      title: 'Pantofi Stiletto Negri Elegance',
      slug: 'pantofi-stiletto-negri',
      description: 'Pantofi eleganți de seară cu toc stiletto de 9cm, confecționați din piele ecologică moale, cu calapod ergonomic și talpă antialunecare.',
      price: 184.99,
      originalPrice: 249.00,
      discountPercentage: 24,
      stock: 25,
      sku: 'PANT-STIL-02',
      vendorId: mainVendor.id,
      categoryId: shoesWomenCategoryId,
      images: JSON.stringify(['/images/product_sneakers.jpg']),
      sizes: JSON.stringify(['36', '37', '38', '39', '40']),
      colors: JSON.stringify(['Negru Glossy', 'Nude']),
      rating: 4.9,
      reviewsCount: 38,
      isPublished: true,
    },
    {
      title: 'Cămașă Bărbați Casual Oxford Slim Fit',
      slug: 'camasa-barbati-casual',
      description: 'Cămașă bărbătească clasică din bumbac 100% respirabil, croială modernă slim fit, ideală pentru birou, smart casual sau evenimente de weekend.',
      price: 84.99,
      originalPrice: 120.00,
      discountPercentage: 25,
      stock: 100,
      sku: 'CAM-SLIM-03',
      vendorId: mainVendor.id,
      categoryId: shirtsMenCategoryId,
      images: JSON.stringify(['/images/hero1.jpg']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Alb Imaculat', 'Bleumarin', 'Gri Perlat']),
      rating: 4.7,
      reviewsCount: 15,
      isPublished: true,
    },
    {
      title: 'Pantaloni Chino Stretch Bărbați',
      slug: 'pantaloni-chino-barbati',
      description: 'Pantaloni chino extrem de confortabili, confecționați din amestec de bumbac și elastan pentru libertate deplină de mișcare.',
      price: 144.99,
      originalPrice: 185.00,
      discountPercentage: 22,
      stock: 60,
      sku: 'PANT-CHIN-04',
      vendorId: mainVendor.id,
      categoryId: pantsMenCategoryId,
      images: JSON.stringify(['/images/product_laptop.jpg']),
      sizes: JSON.stringify(['30', '32', '34', '36']),
      colors: JSON.stringify(['Bej Nisip', 'Kaki', 'Negru']),
      rating: 4.6,
      reviewsCount: 22,
      isPublished: true,
    },
    {
      title: 'Rochie de Seară Glamour Smarald',
      slug: 'rochie-seara-eleganta',
      description: 'Rochie lungă de gală cu decolteu subtil, crăpătură pe picior și cădere spectaculoasă a materialului. Ideală pentru nunți și gale.',
      price: 449,
      originalPrice: 600.00,
      discountPercentage: 25,
      stock: 12,
      sku: 'ROCH-GLAM-05',
      vendorId: mainVendor.id,
      categoryId: dressesCategoryId,
      images: JSON.stringify(['/images/hero2.jpg']),
      sizes: JSON.stringify(['XS', 'S', 'M']),
      colors: JSON.stringify(['Verde Smarald', 'Bordo Regal']),
      rating: 5.0,
      reviewsCount: 9,
      isPublished: true,
    },
    {
      title: 'Pantofi Sport Running Ultra-Light',
      slug: 'pantofi-sport-alergare',
      description: 'Adidași sport ultra-ușori cu talpă cu amortizare cu aer și material tip plasă pentru ventilare continuă în timpul antrenamentelor.',
      price: 299.99,
      originalPrice: 380.00,
      discountPercentage: 21,
      stock: 45,
      sku: 'RUN-AIR-06',
      vendorId: mainVendor.id,
      categoryId: categorySales.id,
      images: JSON.stringify(['/images/product_sneakers.jpg']),
      sizes: JSON.stringify(['40', '41', '42', '43', '44', '45']),
      colors: JSON.stringify(['Gri/Neon', 'All Black']),
      rating: 4.8,
      reviewsCount: 64,
      isPublished: true,
    },
    {
      title: 'Geacă Biker din Piele Ecologică Urban',
      slug: 'geaca-piele-barbati-biker',
      description: 'Geacă stil biker cu fermoare metalice rezistente, buzunare multiple și finisaj mat premium, rezistent la vânt.',
      price: 389,
      originalPrice: 499.00,
      discountPercentage: 22,
      stock: 30,
      sku: 'BIK-JAK-07',
      vendorId: mainVendor.id,
      categoryId: shirtsMenCategoryId,
      images: JSON.stringify(['/images/hero1.jpg']),
      sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Negru Mat', 'Maro Vintage']),
      rating: 4.9,
      reviewsCount: 42,
      isPublished: true,
    },
    {
      title: 'Sandale cu Toc Pătrat și Barete Fine',
      slug: 'sandale-toc-patrat-barete',
      description: 'Sandale feminine de vară cu toc stabil de 6cm, barete delicate reglabile pe gleznă și branț moale cu spumă de memorie.',
      price: 159,
      originalPrice: 219.00,
      discountPercentage: 27,
      stock: 35,
      sku: 'SAND-FIN-08',
      vendorId: mainVendor.id,
      categoryId: shoesWomenCategoryId,
      images: JSON.stringify(['/images/hero2.jpg']),
      sizes: JSON.stringify(['36', '37', '38', '39', '40']),
      colors: JSON.stringify(['Nude Pudrat', 'Auriu Delicat']),
      rating: 4.7,
      reviewsCount: 19,
      isPublished: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log('Seed SQLite finalizat cu succes! Fără comenzi sau clienți fictivi.');
  console.log('👤 Admin account: admin@topinstock.ro (TOPinStock)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
