const https = require('https');

async function fetchPage(page) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    https.get(`https://teomarket.com/products?page=${page}`, {
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
          const json = JSON.parse(data);
          resolve({ page, count: json.props.products?.length || 0, time: Date.now() - start });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function benchmark() {
  console.log('Fetching pages 1 to 10 concurrently...');
  const t0 = Date.now();
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(fetchPage(i));
  }
  const results = await Promise.all(promises);
  const totalTime = Date.now() - t0;
  console.log('Results:', results);
  console.log(`Fetched 10 pages (${results.reduce((a, b) => a + b.count, 0)} products) in ${totalTime}ms (avg ${(totalTime / 10).toFixed(1)}ms per page)`);
}

benchmark();
