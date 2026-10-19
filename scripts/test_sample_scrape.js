const https = require('https');
const fs = require('fs');

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
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function scrapeSample() {
  console.log('Testing category fetch with pagination...');
  const catRes = await fetchJson('https://teomarket.com/categories/accesorii-bucatarie?page=1');
  console.log('Category name:', catRes.props.category?.name);
  console.log('Products on page 1:', catRes.props.products?.length);
  if (catRes.props.products?.[0]) {
    const p = catRes.props.products[0];
    console.log('Sample product:', {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price_ron,
      image: p.image
    });
  }
}

scrapeSample();
