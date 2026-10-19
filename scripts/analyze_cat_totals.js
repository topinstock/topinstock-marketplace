const https = require('https');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-Inertia': 'true',
        'X-Inertia-Version': '52864a628b10bbb25991700a2ac57cac'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function analyze() {
  const home = await fetchJson('https://teomarket.com/');
  const topCats = home.props.categories || [];
  
  for (const cat of topCats) {
    try {
      const catData = await fetchJson(`https://teomarket.com/categories/${cat.slug}`);
      const total = catData.props.pagination?.total || 0;
      console.log(`[Top Category] ${cat.name} (${cat.slug}): ${total} products`);
      if (cat.subCategories) {
        for (const sub of cat.subCategories.slice(0, 5)) {
          const subData = await fetchJson(`https://teomarket.com/categories/${sub.slug}`);
          console.log(`   -> ${sub.name} (${sub.slug}): ${subData.props.pagination?.total || 0} products`);
        }
      }
    } catch (e) {
      console.log(`Error on ${cat.slug}: ${e.message}`);
    }
  }
}

analyze();
