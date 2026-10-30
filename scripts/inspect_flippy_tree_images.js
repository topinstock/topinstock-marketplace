const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const prisma = new PrismaClient();

const treeSkus = [
  'TIS-TEO-36628', 'TIS-TEO-11866', 'TIS-TEO-12911', 'TIS-TEO-12886',
  'TIS-TEO-12912', 'TIS-TEO-12894', 'TIS-TEO-12888', 'TIS-TEO-12889',
  'TIS-TEO-11870', 'TIS-TEO-25095', 'TIS-TEO-25664', 'TIS-TEO-25093',
  'TIS-TEO-25665', 'TIS-TEO-25094', 'TIS-TEO-11860'
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
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

async function run() {
  const prods = await prisma.product.findMany({
    where: { sku: { in: treeSkus } },
    select: { id: true, sku: true, title: true, images: true }
  });

  console.log(`Found ${prods.length} matching trees in DB.`);

  const outDir = path.join(__dirname, '..', 'scratch', 'flippy_samples');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    let imgs = [];
    try { imgs = JSON.parse(p.images); } catch {}
    console.log(`[${p.sku}] ${p.title}`);
    console.log(`   Images (${imgs.length}):`);
    for (let j = 0; j < Math.min(3, imgs.length); j++) {
      console.log(`     (${j}): ${imgs[j]}`);
      const filename = `${p.sku}_img${j}.jpg`;
      const dest = path.join(outDir, filename);
      if (!fs.existsSync(dest)) {
        try {
          await download(imgs[j], dest);
          console.log(`       Downloaded to ${dest}`);
        } catch (e) {
          console.log(`       Error downloading: ${e.message}`);
        }
      }
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

