const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const braziDir = path.join(process.cwd(), 'public', 'images', 'brazi');
  const files = fs.readdirSync(braziDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  console.log(`Found ${files.length} clean tree images in ${braziDir}`);

  let updatedCount = 0;
  for (const file of files) {
    const sku = path.basename(file, path.extname(file));
    const publicUrl = `/images/brazi/${file}`;

    const product = await prisma.product.findFirst({
      where: { sku }
    });

    if (!product) {
      console.warn(`Product with SKU ${sku} not found in DB!`);
      continue;
    }

    // Clean any Flippy references from title and description if any remain
    let cleanTitle = product.title.replace(/flippy/gi, 'TOPinStock');
    let cleanDescription = product.description.replace(/flippy/gi, 'TOPinStock');

    await prisma.product.update({
      where: { id: product.id },
      data: {
        images: JSON.stringify([publicUrl]),
        title: cleanTitle,
        description: cleanDescription
      }
    });

    console.log(`Updated ${sku}: image set to ${publicUrl}`);
    updatedCount++;
  }

  console.log(`\nSuccessfully updated ${updatedCount} products in DB.`);
}

main()
  .catch(err => {
    console.error('Error applying clean tree images:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

