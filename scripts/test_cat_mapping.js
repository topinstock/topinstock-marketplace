const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function testCategoryMapping() {
  const allCategories = await prisma.category.findMany({
    include: { parent: true }
  });

  const catBySlug = new Map();
  const catByName = new Map();
  allCategories.forEach(c => {
    catBySlug.set(c.slug.toLowerCase(), c);
    catByName.set(c.name.toLowerCase().trim(), c);
  });

  console.log('Categories indexed:', catBySlug.size);
  await prisma.$disconnect();
}

testCategoryMapping().catch(console.error);
