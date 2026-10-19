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
      console.log('Categories count:', json.props.categories?.length);
      console.log('Sample top-level categories:');
      console.log(json.props.categories?.slice(0, 10).map(c => ({ id: c.id, name: c.name, slug: c.slug, childrenCount: c.children?.length })));
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
    }
  });
}).on('error', console.error);
