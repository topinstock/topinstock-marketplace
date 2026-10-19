const https = require('https');

https.get('https://teomarket.com/', {
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
      const cats = json.props.categories || [];
      console.log('Top categories on TeoMarket:');
      cats.forEach(c => {
        console.log(`- [${c.id}] ${c.name} (${c.slug}) -> ${c.subCategories?.length || 0} subcats`);
      });
    } catch (e) {
      console.log('Error:', e.message);
    }
  });
});
