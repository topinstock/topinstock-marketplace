const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Inițializare setări firmă Marketplace & KYC vânzători...');

  // 1. Marketplace Settings (Datele Firmei Operatoare)
  await prisma.marketplaceSettings.upsert({
    where: { id: 'default' },
    update: {
      companyName: 'S.C. TopinStock Marketplace S.R.L.',
      cui: 'RO48921450',
      regCom: 'J40/14280/2024',
      legalAddress: 'București, Sector 1, Calea Floreasca nr. 169, Etaj 4',
      capitalSocial: '50.000 LEI',
      iban: 'RO49BTRLRONCRT0123456701',
      bankName: 'Banca Transilvania',
      contactEmail: 'contact@topinstock.ro',
      supportPhone: '0720 123 456',
      defaultCommission: 0.12,
      payoutTermsDays: 14,
      returnPolicyDays: 14,
      orderMinimumAmount: 0,
      platformNotice: 'Comisioanele sunt calculate la fiecare livrare finalizată cu succes. Deconturile se fac bilunar direct în contul IBAN specificat.',
    },
    create: {
      id: 'default',
      companyName: 'S.C. TopinStock Marketplace S.R.L.',
      cui: 'RO48921450',
      regCom: 'J40/14280/2024',
      legalAddress: 'București, Sector 1, Calea Floreasca nr. 169, Etaj 4',
      capitalSocial: '50.000 LEI',
      iban: 'RO49BTRLRONCRT0123456701',
      bankName: 'Banca Transilvania',
      contactEmail: 'contact@topinstock.ro',
      supportPhone: '0720 123 456',
      defaultCommission: 0.12,
      payoutTermsDays: 14,
      returnPolicyDays: 14,
      orderMinimumAmount: 0,
      platformNotice: 'Comisioanele sunt calculate la fiecare livrare finalizată cu succes. Deconturile se fac bilunar direct în contul IBAN specificat.',
    },
  });

  // 2. Update existing vendors with realistic Romanian KYC & fiscal data
  const mainVendor = await prisma.vendor.findFirst({
    where: { slug: 'topinstock-oficial' },
  });

  if (mainVendor) {
    await prisma.vendor.update({
      where: { id: mainVendor.id },
      data: {
        legalName: 'S.C. TopinStock Marketplace S.R.L.',
        cui: 'RO48921450',
        regCom: 'J40/14280/2024',
        iban: 'RO49BTRLRONCRT0123456701',
        bank: 'Banca Transilvania',
        legalAddress: 'București, Sector 1, Calea Floreasca nr. 169',
        contactPerson: 'Adrian TopinStock',
        phone: '0720 123 456',
        status: 'ACTIVE',
        isVerified: true,
        commissionRate: 0.05,
      },
    });
  }

  const partnerVendor = await prisma.vendor.findFirst({
    where: { slug: 'urban-fashion' },
  });

  if (partnerVendor) {
    await prisma.vendor.update({
      where: { id: partnerVendor.id },
      data: {
        legalName: 'S.C. Urban Trend Concept S.R.L.',
        cui: 'RO39482103',
        regCom: 'J40/3421/2022',
        iban: 'RO12INGB0000999901234567',
        bank: 'ING Bank România',
        legalAddress: 'Cluj-Napoca, Str. Memorandumului nr. 18, Jud. Cluj',
        contactPerson: 'Mihai Urban',
        phone: '0740 987 654',
        status: 'ACTIVE',
        isVerified: true,
        commissionRate: 0.12,
      },
    });
  }

  // 3. Add a Pending Vendor for testing Admin Verification / Onboarding flow
  const pendingUser = await prisma.user.upsert({
    where: { email: 'office@electrosmart.ro' },
    update: {},
    create: {
      email: 'office@electrosmart.ro',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'Dan Popescu (ElectroSmart)',
      role: 'VENDOR',
    },
  });

  await prisma.vendor.upsert({
    where: { userId: pendingUser.id },
    update: {
      legalName: 'S.C. ElectroSmart Retail S.R.L.',
      cui: 'RO41203948',
      regCom: 'J12/842/2023',
      iban: 'RO88RZBR0000060012345678',
      bank: 'Raiffeisen Bank',
      legalAddress: 'Brașov, B-dul Eroilor nr. 5',
      contactPerson: 'Dan Popescu',
      phone: '0733 445 566',
      status: 'PENDING',
      isVerified: false,
      commissionRate: 0.15,
    },
    create: {
      userId: pendingUser.id,
      storeName: 'ElectroSmart Depot',
      slug: 'electrosmart-depot',
      description: 'Electrocasnice mici, accesorii tech și gadgeturi inteligente.',
      legalName: 'S.C. ElectroSmart Retail S.R.L.',
      cui: 'RO41203948',
      regCom: 'J12/842/2023',
      iban: 'RO88RZBR0000060012345678',
      bank: 'Raiffeisen Bank',
      legalAddress: 'Brașov, B-dul Eroilor nr. 5',
      contactPerson: 'Dan Popescu',
      phone: '0733 445 566',
      status: 'PENDING',
      isVerified: false,
      commissionRate: 0.15,
      rating: 0,
    },
  });

  console.log('✅ Setări firmă și vânzători inițializați cu succes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
