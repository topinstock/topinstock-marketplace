const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const allTrees = await prisma.product.findMany({
    where: {
      OR: [
        { category: { slug: 'brazi-de-craciun' } },
        { category: { slug: 'brazi-craciun' } },
        { title: { contains: 'brad artificial', mode: 'insensitive' } },
        { title: { contains: 'brazi artificiali', mode: 'insensitive' } },
        { title: { contains: 'brad de craciun', mode: 'insensitive' } },
        { title: { contains: 'brad de crăciun', mode: 'insensitive' } }
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

  // Filter actual artificial trees (not candles, napkins, paper bags, etc.)
  const realTrees = allTrees.filter(t => {
    const s = t.title.toLowerCase();
    return !s.includes('lumanare') && !s.includes('farfurii') && !s.includes('pahare') && 
           !s.includes('pungi') && !s.includes('servetele') && !s.includes('bentita') && 
           !s.includes('costum');
  });

  console.log(`Found ${realTrees.length} real artificial Christmas tree products in DB.`);

  // Find all trees from TeoMarket S3 or having flippy in image / title / desc
  const targetTrees = realTrees.filter(t => {
    let imgs = [];
    try { imgs = JSON.parse(t.images); } catch {}
    const hasTeoS3 = imgs.some(img => img.includes('images-teomarket') || img.includes('flippy'));
    return hasTeoS3;
  });

  console.log(`Found ${targetTrees.length} trees with TeoMarket/Flippy images.`);

  const rawDir = path.join(__dirname, '..', 'scratch', 'trees_to_clean');
  if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

  const treeList = [];

  for (let i = 0; i < targetTrees.length; i++) {
    const t = targetTrees[i];
    let imgs = [];
    try { imgs = JSON.parse(t.images); } catch {}
    const firstImg = imgs[0];
    const rawFilename = `${t.sku}_raw.jpg`;
    const rawPath = path.join(rawDir, rawFilename);

    console.log(`[${i + 1}/${targetTrees.length}] ${t.sku}: ${t.title}`);
    console.log(`     Image URL: ${firstImg}`);

    if (!fs.existsSync(rawPath) && firstImg) {
      try {
        await download(firstImg, rawPath);
        console.log(`     Downloaded to ${rawFilename}`);
      } catch (e) {
        console.error(`     Error downloading ${firstImg}: ${e.message}`);
      }
    }

    treeList.push({
      id: t.id,
      sku: t.sku,
      title: t.title,
      firstImg,
      rawPath,
      cleanedPublicPath: `/images/brazi/${t.sku}.jpg`,
      cleanedDiskPath: path.join(__dirname, '..', 'public', 'images', 'brazi', `${t.sku}.jpg`)
    });
  }

  const manifestPath = path.join(__dirname, '..', 'scratch', 'trees_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(treeList, null, 2));
  console.log(`\nSaved manifest of ${treeList.length} trees to ${manifestPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

