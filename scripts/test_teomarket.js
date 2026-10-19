const https = require('https');

const options = {
  hostname: 'teomarket.com',
  path: '/products/husa-apple-iphone-55s5se-motomo-v2-auriu',
  method: 'GET',
  headers: {
    'X-Inertia': 'true',
    'X-Inertia-Version': '52864a628b10bbb25991700a2ac57cac',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'text/html, application/xhtml+xml'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const p = json.props.product;
    console.log('Product Keys:', Object.keys(p));
    console.log({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode,
      price_ron: p.price_ron,
      original_price_ron: p.original_price_ron,
      categories: p.categories,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      images: p.images,
      attributes: p.attributes,
      description: p.description
    });
  });
});
req.end();
