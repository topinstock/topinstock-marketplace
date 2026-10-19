const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Eliminare Reduceri & Prețuri Tăiate din Baza de Date ---');
  
  const countWithDiscounts = await prisma.product.count({
    where: {
      OR: [
        { originalPrice: { not: null } },
        { discountPercentage: { not: null } },
      ],
    },
  });
  console.log(`Produse cu reduceri / prețuri tăiate identificate: ${countWithDiscounts}`);

  const updateResult = await prisma.product.updateMany({
    data: {
      originalPrice: null,
      discountPercentage: null,
    },
  });

  console.log(`Actualizate: ${updateResult.count} produse. Toate au acum doar prețul raw, fără preț tăiat.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
