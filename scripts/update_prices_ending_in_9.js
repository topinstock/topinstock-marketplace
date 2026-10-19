const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

function roundPriceEndingIn9(rawPrice) {
  if (rawPrice == null || isNaN(rawPrice)) return rawPrice;
  const num = Number(rawPrice);
  if (num <= 5) return num;

  const intVal = Math.floor(num);
  const units = intVal % 10;
  const tens = Math.floor(intVal / 10);

  if (units >= 5) {
    // 45 -> 49, 245 -> 249, 5 -> 9
    return tens * 10 + 9;
  } else {
    // 44 -> 39, 40 -> 39, 14 -> 9
    const prevTens = Math.max(0, tens - 1);
    return prevTens * 10 + 9;
  }
}

async function run() {
  console.log('=== Step 1: Updating lib/data/products_catalog_fallback.json ===');
  const catalogPath = path.join(__dirname, '..', 'lib', 'data', 'products_catalog_fallback.json');
  if (fs.existsSync(catalogPath)) {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    let catalogUpdated = 0;
    for (const p of catalog) {
      const oldPrice = p.price;
      const newPrice = roundPriceEndingIn9(oldPrice);
      if (oldPrice !== newPrice) {
        p.price = newPrice;
        catalogUpdated++;
      }
      if (p.originalPrice != null && p.originalPrice > 5) {
        const roundedOrig = roundPriceEndingIn9(p.originalPrice);
        p.originalPrice = roundedOrig > p.price ? roundedOrig : null;
      }
    }
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`Updated ${catalogUpdated} prices in products_catalog_fallback.json`);
  }

  console.log('=== Step 2: Updating lib/data/seasonal_fallback.json ===');
  const seasonalPath = path.join(__dirname, '..', 'lib', 'data', 'seasonal_fallback.json');
  if (fs.existsSync(seasonalPath)) {
    const seasonal = JSON.parse(fs.readFileSync(seasonalPath, 'utf8'));
    let seasonalUpdated = 0;
    for (const key of Object.keys(seasonal)) {
      if (Array.isArray(seasonal[key])) {
        for (const item of seasonal[key]) {
          const oldPrice = item.price;
          const newPrice = roundPriceEndingIn9(oldPrice);
          if (oldPrice !== newPrice) {
            item.price = newPrice;
            seasonalUpdated++;
          }
          if (item.originalPrice != null && item.originalPrice > 5) {
            const roundedOrig = roundPriceEndingIn9(item.originalPrice);
            item.originalPrice = roundedOrig > item.price ? roundedOrig : null;
          }
        }
      }
    }
    fs.writeFileSync(seasonalPath, JSON.stringify(seasonal, null, 2), 'utf8');
    console.log(`Updated ${seasonalUpdated} items in seasonal_fallback.json`);
  }

  console.log('=== Step 3: Updating lib/data/products.ts ===');
  const productsTsPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
  if (fs.existsSync(productsTsPath)) {
    let content = fs.readFileSync(productsTsPath, 'utf8');
    // Replace "price": <number>
    content = content.replace(/"price":\s*([0-9.]+)/g, (match, p1) => {
      const rounded = roundPriceEndingIn9(parseFloat(p1));
      return `"price": ${rounded}`;
    });
    // Replace "originalPrice": <number>
    content = content.replace(/"originalPrice":\s*([0-9.]+)/g, (match, p1) => {
      const rounded = roundPriceEndingIn9(parseFloat(p1));
      return `"originalPrice": ${rounded}`;
    });
    fs.writeFileSync(productsTsPath, content, 'utf8');
    console.log('Updated prices in products.ts');
  }

  console.log('=== Step 4: Updating Prisma Database topinstock.db ===');
  try {
    const prisma = new PrismaClient();
    const allProducts = await prisma.product.findMany({
      where: { price: { gt: 5 } },
      select: { id: true, price: true, originalPrice: true }
    });
    console.log(`Found ${allProducts.length} products with price > 5 in SQLite database.`);

    let dbUpdated = 0;
    for (const p of allProducts) {
      const newPrice = roundPriceEndingIn9(p.price);
      let newOrig = p.originalPrice;
      if (p.originalPrice != null && p.originalPrice > 5) {
        const roundedOrig = roundPriceEndingIn9(p.originalPrice);
        newOrig = roundedOrig > newPrice ? roundedOrig : null;
      }
      if (newPrice !== p.price || newOrig !== p.originalPrice) {
        await prisma.product.update({
          where: { id: p.id },
          data: {
            price: newPrice,
            originalPrice: newOrig
          }
        });
        dbUpdated++;
      }
    }
    console.log(`Successfully updated ${dbUpdated} products in SQLite database.`);
    await prisma.$disconnect();
  } catch (err) {
    console.warn('Prisma update warning:', err.message);
  }

  console.log('=== ALL PRICING UPDATES COMPLETE! ===');
}

run().catch(console.error);
