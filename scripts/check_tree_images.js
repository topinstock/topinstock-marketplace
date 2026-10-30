const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const https = require('https');
const prisma = new PrismaClient();

async function checkTreeImages() {
  const trees = await prisma.product.findMany({
    where: {
      OR: [
        { category: { slug: 'brazi-de-craciun' } },
        { category: { slug: 'brazi-craciun' } },
        { title: { contains: 'brad artificial', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      images: true
    }
  });

  console.log(`Checking ${trees.length} trees...`);

  // Let's print all image URLs
  const allTreeImages = [];
  for (const t of trees) {
    let imgs = [];
    try { imgs = JSON.parse(t.images); } catch {}
    for (const img of imgs) {
      allTreeImages.push({
        id: t.id,
        sku: t.sku,
        title: t.title,
        img
      });
    }
  }

  console.log(`Total images across trees: ${allTreeImages.length}`);
  
  // Download 5 sample images to scratch/
  if (!fs.existsSync('scratch/tree_samples')) {
    fs.mkdirSync('scratch/tree_samples', { recursive: true });
  }

  const sampleUrls = allTreeImages.slice(0, 15);
  for (let i = 0; i < sampleUrls.length; i++) {
    const item = sampleUrls[i];
    console.log(`[${i}] ${item.sku}: ${item.title.slice(0, 40)} -> ${item.img}`);
  }
}

checkTreeImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

