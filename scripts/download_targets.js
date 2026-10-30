const https = require('https');
const fs = require('fs');
const path = require('path');

const targets = [
  {
    name: 'championship_vii_black_red.jpg',
    url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw1e4ea106/images/medium/102751.106_1.jpg?sw=900&sh=900&sm=fit'
  },
  {
    name: 'eco_championship_royal_navy.jpg',
    url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw11f07b1d/images/medium/102751.703_1.jpg?sw=900&sh=900&sm=fit'
  },
  {
    name: 'phoenix_ii_black_white.jpg',
    url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw48fc9228/images/medium/103121.102_4.jpg?sw=900&sh=900&sm=fit'
  },
  {
    name: 'montreal_jacket_white_navy.jpg',
    url: 'https://www.joma-sport.com/dw/image/v2/BFRV_PRD/on/demandware.static/-/Sites-joma-masterCatalog/default/dw6ef6f4b3/images/medium/102744.203_1.jpg?sw=900&sh=900&sm=fit'
  }
];

function download(url, dest) {
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
  const dir = path.join(process.cwd(), 'public/images/joma');
  for (const t of targets) {
    const dest = path.join(dir, t.name);
    try {
      await download(t.url, dest);
      console.log('Downloaded:', t.name, fs.statSync(dest).size, 'bytes');
    } catch (e) {
      console.log('Failed:', t.name, e.message);
    }
  }
}

run();

