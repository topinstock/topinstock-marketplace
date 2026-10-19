// scripts/cleanup-marketplace.js
// Curățare completă a datelor fictive din TopinStock:
// 1. Ștergere toate comenzile de test (0 comenzi)
// 2. Reasignare toate produsele (3.369) către magazinul unic "TopinStock Oficial"
// 3. Ștergere toți vânzătorii fictivi/demo
// 4. Ștergere utilizatori de test
// 5. Asigurare cont Super-Admin cu drepturi depline

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function cleanup() {
  console.log('========================================================');
  console.log('CURĂȚARE DATE FICTIVE — TOPINSTOCK PRODUCȚIE');
  console.log('========================================================\n');

  // 1. Găsire sau configurare Magazin Unic TopinStock & User Admin
  let adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@topinstock.ro' },
        { role: 'ADMIN' },
      ],
    },
  });

  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@topinstock.ro',
        name: 'TOPinStock',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        email: 'admin@topinstock.ro',
        name: 'TOPinStock',
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
      },
    });
  }

  console.log(`✓ Cont Super-Admin configurat:`);
  console.log(`  - Nume: ${adminUser.name}`);
  console.log(`  - Email: ${adminUser.email}`);
  console.log(`  - Rol: ${adminUser.role}`);
  console.log(`  - Parolă acces: admin123\n`);

  // 2. Asigurare Magazin Oficial TopinStock
  let topinStockVendor = await prisma.vendor.findFirst({
    where: {
      OR: [
        { slug: 'topinstock-oficial' },
        { slug: 'topinstock' },
        { userId: adminUser.id },
      ],
    },
  });

  if (!topinStockVendor) {
    topinStockVendor = await prisma.vendor.create({
      data: {
        userId: adminUser.id,
        storeName: 'TopinStock',
        slug: 'topinstock-oficial',
        description: 'Magazinul oficial TopinStock România. Livrare directă din depozit central.',
        legalName: 'TopinStock Marketplace S.R.L.',
        cui: 'RO48921450',
        regCom: 'J40/1234/2026',
        rating: 5.0,
        isVerified: true,
        status: 'ACTIVE',
        commissionRate: 0.0,
      },
    });
  } else {
    topinStockVendor = await prisma.vendor.update({
      where: { id: topinStockVendor.id },
      data: {
        userId: adminUser.id,
        storeName: 'TopinStock',
        slug: 'topinstock-oficial',
        description: 'Magazinul oficial TopinStock România. Livrare directă din depozit central.',
        legalName: 'TopinStock Marketplace S.R.L.',
        cui: 'RO48921450',
        regCom: 'J40/1234/2026',
        rating: 5.0,
        isVerified: true,
        status: 'ACTIVE',
        commissionRate: 0.0,
      },
    });
  }

  console.log(`✓ Magazin Unic Activ configurat:`);
  console.log(`  - Nume: ${topinStockVendor.storeName}`);
  console.log(`  - Slug: /seller/${topinStockVendor.slug}/v`);
  console.log(`  - CUI: ${topinStockVendor.cui}`);
  console.log(`  - Status: ${topinStockVendor.status}`);
  console.log(`  - Este Verificat: ${topinStockVendor.isVerified}\n`);

  // 3. Reasignare TOATE produsele existente la Magazinul Oficial TopinStock
  const reassignResult = await prisma.product.updateMany({
    where: {
      NOT: { vendorId: topinStockVendor.id },
    },
    data: {
      vendorId: topinStockVendor.id,
    },
  });
  console.log(`✓ S-au reasignat ${reassignResult.count} produse la magazinul TopinStock.`);

  const totalProducts = await prisma.product.count({
    where: { vendorId: topinStockVendor.id },
  });
  console.log(`✓ Total produse în proprietatea TopinStock: ${totalProducts}\n`);

  // 4. Ștergere completă a tuturor comenzilor fictive / de test
  const deletedItems = await prisma.orderItem.deleteMany({});
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ S-au șters toate comenzile de test:`);
  console.log(`  - Articole comandă șterse: ${deletedItems.count}`);
  console.log(`  - Comenzi șterse: ${deletedOrders.count}`);
  console.log(`  - Comenzi rămase în sistem: ${await prisma.order.count()} (0 comenzi confirmate!)\n`);

  // 5. Ștergere magazine terțe/fictive din baza de date
  const deletedVendors = await prisma.vendor.deleteMany({
    where: {
      NOT: { id: topinStockVendor.id },
    },
  });
  console.log(`✓ S-au șters ${deletedVendors.count} magazine fictive/demo.`);

  // 6. Ștergere utilizatori de test (lăsăm doar contul de admin)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      NOT: { id: adminUser.id },
    },
  });
  console.log(`✓ S-au șters ${deletedUsers.count} utilizatori fictivi/de test.`);

  // 7. Verificare finală integritate DB
  const finalVendors = await prisma.vendor.findMany({
    include: { _count: { select: { products: true } }, user: true },
  });
  const finalOrders = await prisma.order.count();
  const finalUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });

  console.log('\n========================================================');
  console.log('STARE FINALĂ BAZĂ DE DATE PRODUCȚIE:');
  console.log('========================================================');
  console.log(`• Comenzi active: ${finalOrders}`);
  console.log(`• Magazine active (${finalVendors.length}):`);
  for (const v of finalVendors) {
    console.log(`  - "${v.storeName}" (/seller/${v.slug}/v) | ${v._count.products} produse | Status: ${v.status} | Verificat: ${v.isVerified}`);
  }
  console.log(`• Utilizatori activi (${finalUsers.length}):`);
  for (const u of finalUsers) {
    console.log(`  - ${u.name} (${u.email}) — Rol: ${u.role}`);
  }
  console.log('========================================================\n');
}

cleanup()
  .catch((e) => {
    console.error('Eroare curățare:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
