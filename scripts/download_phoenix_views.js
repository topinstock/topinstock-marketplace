const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw2588cb28/images/medium/103121.102_1.jpg',
  'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dwab6b9448/images/medium/103121.102_2.jpg',
  'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw879adee4/images/medium/103121.102_3.jpg',
  'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw48fc9228/images/medium/103121.102_4.jpg',
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => { f.close(); resolve(); });
    }).on('error', reject);
  });
}

async function run() {
  const dir = path.join(process.cwd(), 'scratch/phoenix_views');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < urls.length; i++) {
    const dest = path.join(dir, `view_${i+1}.jpg`);
    await download(urls[i], dest);
    console.log(`Downloaded view_${i+1}.jpg`, fs.statSync(dest).size, 'bytes');
  }
}

run();

