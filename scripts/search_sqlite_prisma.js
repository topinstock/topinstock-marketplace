const { PrismaClient: SqliteClient } = require('../prisma/generated/sqlite-client');
const sqlite = new SqliteClient();

async function main() {
  const count = await sqlite.product.count();
  console.log('Total products in sqlite:', count);

  const joma = await sqlite.product.findMany({
    where: {
      OR: [
        { title: { contains: 'joma' } },
        { description: { contains: 'joma' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      price: true,
      images: true,
      description: true
    }
  });

  console.log(`Found ${joma.length} Joma products in sqlite:`);
  joma.forEach((p, idx) => {
    console.log(`[${idx+1}] ${p.sku} | ${p.title}`);
  });
}

main().catch(console.error).finally(() => sqlite.$disconnect());
