const https = require('https');

https.get('https://teomarket.com/products?page=1', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'X-Inertia': 'true',
    'X-Inertia-Version': '52864a628b10bbb25991700a2ac57cac'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const p1 = json.props.products[0];
    const p2 = json.props.products[1];
    const p3 = json.props.products[2];
    console.log('Product 1 keys with non-null values:');
    for (const [k, v] of Object.entries(p1)) {
      if (v !== null && v !== undefined) console.log(`  ${k}:`, typeof v === 'object' ? JSON.stringify(v) : v);
    }
  });
});
