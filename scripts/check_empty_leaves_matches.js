const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmpty() {
  const emptyLeaves = [
    { name: 'Bijuterii copii', slug: 'bijuterii-copii', kw: ['bijuterii copii', 'cercei copii', 'bratara copii'] },
    { name: 'Bratari', slug: 'bratari', kw: ['bratara', 'bratari'] },
    { name: 'Carucioare Copii', slug: 'carucioare-copii', kw: ['carucior', 'carucioare'] },
    { name: 'Decoratiune Muzicala Craciun', slug: 'decoratiune-muzicala-craciun', kw: ['muzicala craciun', 'decoratiune muzicala'] },
    { name: 'Gratare si Accesorii BBQ', slug: 'gratare-si-accesorii-bbq', kw: ['gratar', 'bbq', 'barbeque'] },
    { name: 'Husa cu Suport', slug: 'husa-cu-suport', kw: ['husa cu suport'] },
    { name: 'Huse Iqos', slug: 'huse-iqos', kw: ['iqos'] },
    { name: 'Magnetic 360', slug: 'magnetic-360', kw: ['magnetic 360'] },
    { name: 'Masti pentru ten si gomaje', slug: 'masti-pentru-ten-si-gomaje', kw: ['masca ten', 'masti ten', 'gomaj'] },
    { name: 'Maternitate', slug: 'maternitate', kw: ['maternitate', 'gravide'] },
    { name: 'Motomo', slug: 'motomo', kw: ['motomo'] },
    { name: 'Power bank telefoane', slug: 'power-bank-telefoane', kw: ['power bank', 'baterie externa'] },
    { name: 'Selfie Stick-uri', slug: 'selfie-stick-uri', kw: ['selfie stick', 'selfie'] },
    { name: 'Trambuline', slug: 'trambuline', kw: ['trambulina', 'trambuline'] },
  ];

  for (const item of emptyLeaves) {
    const matchingProducts = await prisma.product.findMany({
      where: {
        OR: item.kw.map(k => ({ title: { contains: k, mode: 'insensitive' } }))
      },
      select: { id: true, title: true },
      take: 5
    });
    console.log(`[${item.name}] matches in remaining products: ${matchingProducts.length}`, matchingProducts.map(p => p.title));
  }

  await prisma.$disconnect();
}

checkEmpty();

