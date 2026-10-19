const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const vicPath = path.join(__dirname, '..', 'scripts', 'victronic_complete_scraped.json');
  let rawVic = [];
  if (fs.existsSync(vicPath)) {
    rawVic = JSON.parse(fs.readFileSync(vicPath, 'utf8'));
    console.log(`Victronic raw items: ${rawVic.length}`);
  }

  // Let's see some sample rawVic items
  if (rawVic.length > 0) {
    console.log('Sample rawVic:', JSON.stringify(rawVic[0], null, 2));
  }

  const tisProducts = await prisma.product.findMany({
    where: {
      sku: {
        startsWith: 'TIS-'
      },
      NOT: {
        sku: {
          startsWith: 'TIS-TEO'
        }
      }
    },
    select: {
      id: true,
      sku: true,
      title: true,
      slug: true,
      stock: true
    }
  });

  console.log(`Total TIS- (non TEO) products in DB: ${tisProducts.length}`);

  // Let's check matching with rawVic
  const vicByTitle = new Map();
  for (const v of rawVic) {
    if (v.title) vicByTitle.set(v.title.toLowerCase().trim(), v);
  }

  let vicMatch = 0;
  for (const p of tisProducts) {
    if (vicByTitle.has(p.title.toLowerCase().trim())) {
      vicMatch++;
    }
  }

  console.log(`Matched to rawVic by title: ${vicMatch} out of ${tisProducts.length}`);

  // Also check Spincom items (SPIN- or electrical)
  const spinPath = path.join(__dirname, '..', 'scratch', 'spincom_products.json');
  if (fs.existsSync(spinPath)) {
    const rawSpin = JSON.parse(fs.readFileSync(spinPath, 'utf8'));
    console.log(`Spincom raw items: ${rawSpin.length}`);
    if (rawSpin.length > 0) {
      console.log('Sample rawSpin:', JSON.stringify(rawSpin[0], null, 2));
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
