const https = require('https');

const testUrls = [
  'https://images.joma-sport.com/101966.100_1.jpg',
  'https://images.joma-sport.com/103200.100_1.jpg',
  'https://www.joma-sport.com/dw/image/v2/BDTJ_PRD/on/demandware.static/-/Sites-joma-master/default/dw101966_100.jpg',
  'https://cdn.joma-sport.com/product/101966.100.jpg'
];

async function checkUrl(url) {
  return new Promise(resolve => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => resolve({ url, status: e.message }));
  });
}

async function main() {
  for (const u of testUrls) {
    const res = await checkUrl(u);
    console.log(res.status, res.url);
  }
}

main();
