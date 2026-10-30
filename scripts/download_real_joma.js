const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const testUrls = [
  { file: 'academy_iv_royal_navy.jpg', url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw79342350/images/medium/101966.703_1.jpg?sw=900&sh=900&sm=fit' },
  { file: 'academy_iv_red_black.jpg', url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw6776647d/images/medium/101966.601_4.jpg?sw=900&sh=900&sm=fit' },
  { file: 'academy_iv_yellow_black.jpg', url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dwb9dc9772/images/medium/101966.901_1.jpg?sw=900&sh=900&sm=fit' },
  { file: 'academy_iv_white_navy.jpg', url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw6635bbeb/images/medium/101966.203_9.jpg?sw=900&sh=900&sm=fit' },
  { file: 'academy_iii_black.jpg', url: 'https://cdn.dsmcdn.com/mnresize/800/-/ty1767/prod/QC_PREP/20251007/10/1360a0c2-137c-345b-8d3a-dc008d2d7d34/1_org_zoom.jpg' },
  { file: 'combi_jacket_red.jpg', url: 'https://cdn.dsmcdn.com/mnresize/800/-/ty1766/prod/QC_PREP/20250929/12/25dd6fbd-9302-335c-9c9f-601524d3a463/1_org_zoom.jpg' },
  { file: 'combi_jacket_black.jpg', url: 'https://cdn.dsmcdn.com/mnresize/800/-/ty1719/prod/QC_PREP/20250805/15/c1f74d7a-5428-3df8-befe-fc6aa6547483/1_org_zoom.jpg' },
  { file: 'islandia_iii_navy.jpg', url: 'https://cdn.dsmcdn.com/mnresize/800/-/ty1784/prod/QC_PREP/20251030/12/03684aa7-3286-3bfa-af64-fe9a4cf34fc1/1_org_zoom.jpg' },
  { file: 'frf_ball.jpg', url: 'https://cdn.dsmcdn.com/mnresize/800/-/ty1772/prod/QC_PREP/20251013/14/07f1e703-d6cc-3dc4-8c7b-2f4b4534db54/1_org_zoom.jpg' }
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => {
        f.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const dir = path.join(process.cwd(), 'public/images/joma');
  for (const item of testUrls) {
    const dest = path.join(dir, item.file);
    try {
      await download(item.url, dest);
      const meta = await sharp(dest).metadata();
      console.log(`OK: ${item.file} -> ${meta.width}x${meta.height} (${meta.format})`);
    } catch (e) {
      console.error(`FAIL: ${item.file} ->`, e.message);
    }
  }
}

main();
