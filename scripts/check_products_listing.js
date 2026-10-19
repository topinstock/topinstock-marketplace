const https = require('https');

https.get('https://teomarket.com/products', {
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
      console.log('pagination:', json.props.pagination);
      console.log('products type/length:', Array.isArray(json.props.products), json.props.products?.length);
      if (json.props.products && json.props.products.length > 0) {
        console.log('Sample product:', json.props.products[0]);
      }
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
    }
  });
}).on('error', console.error);
