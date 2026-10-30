const https = require('https');

const models = [
  { name: 'Academy IV Tracksuit', code: '101966', colors: ['100', '331', '600', '700', '450', '900'] },
  { name: 'Championship VII Tracksuit', code: '103200', colors: ['100', '331', '600', '700', '020', '450'] },
  { name: 'Danubio Tracksuit', code: '102740', colors: ['100', '331', '600', '700', '010', '020'] },
  { name: 'Campus IV Tracksuit', code: '102103', colors: ['100', '331', '600', '700'] },
  { name: 'Phoenix II Tracksuit', code: '103121', colors: ['100', '331', '600', '700', '020', '900'] },
  { name: 'Winner II Tracksuit', code: '103001', colors: ['100', '331', '600', '700', '020'] },
  { name: 'Montreal Tracksuit', code: '102744', colors: ['100', '331', '600', '700'] },
  { name: 'Essential II Tracksuit', code: '102438', colors: ['100', '331', '600', '700'] },
  { name: 'Islandia III Winter Coat', code: '101697', colors: ['100', '331'] },
  { name: 'Combi All-Weather Jacket', code: '101664', colors: ['100', '331', '600', '700', '020', '900'] }
];

async function check(url) {
  return new Promise(resolve => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

async function run() {
  const verified = [];
  for (const m of models) {
    const verifiedColors = [];
    for (const c of m.colors) {
      const url = `https://images.joma-sport.com/${m.code}.${c}_1.jpg`;
      const ok = await check(url);
      if (ok) {
        verifiedColors.push({ colorCode: c, url });
      }
    }
    console.log(`${m.name} (${m.code}): ${verifiedColors.length} verified colors`);
    verified.push({ ...m, verifiedColors });
  }

  require('fs').writeFileSync('scratch/verified_joma_models.json', JSON.stringify(verified, null, 2));
}

run();
