const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function inspectTrees() {
  const trees = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'brad', mode: 'insensitive' } },
        { title: { contains: 'brazi', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      sku: true,
      title: true,
      images: true,
      description: true
    }
  });

  console.log(`Found ${trees.length} trees in DB.`);

  let flippyCount = 0;
  const sampleFlippy = [];
  const allImages = [];

  for (const t of trees) {
    let imgs = [];
    try {
      imgs = typeof t.images === 'string' ? JSON.parse(t.images) : t.images;
    } catch {
      imgs = [];
    }

    const hasFlippyInText = (t.title && t.title.toLowerCase().includes('flippy')) ||
                            (t.description && t.description.toLowerCase().includes('flippy')) ||
                            (t.sku && t.sku.toLowerCase().includes('flippy'));

    const hasFlippyInImages = imgs.some(img => img.toLowerCase().includes('flippy'));

    if (hasFlippyInText || hasFlippyInImages) {
      flippyCount++;
      if (sampleFlippy.length < 10) {
        sampleFlippy.push({
          id: t.id,
          sku: t.sku,
          title: t.title,
          hasFlippyInText,
          hasFlippyInImages,
          images: imgs.slice(0, 3)
        });
      }
    }

    if (imgs.length > 0) {
      allImages.push({
        id: t.id,
        sku: t.sku,
        title: t.title,
        firstImage: imgs[0],
        allImagesCount: imgs.length
      });
    }
  }

  console.log(`Trees with 'flippy' mentioned in text or URL: ${flippyCount} out of ${trees.length}`);
  console.log('Sample flippy trees:', JSON.stringify(sampleFlippy, null, 2));

  // Let's also check non-text watermark: inspect where the tree images are hosted
  const hostnames = {};
  for (const item of allImages) {
    try {
      const u = new URL(item.firstImage);
      hostnames[u.hostname] = (hostnames[u.hostname] || 0) + 1;
    } catch {
      hostnames['local_or_relative'] = (hostnames['local_or_relative'] || 0) + 1;
    }
  }
  console.log('Image hostnames for trees:', hostnames);

  // Check some sample images
  console.log('First 5 tree images:', allImages.slice(0, 5).map(x => ({ title: x.title, img: x.firstImage })));
}

inspectTrees()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

