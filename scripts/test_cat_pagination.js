const https = require('https');

async function testCategory(slug) {
  return new Promise((resolve) => {
    https.get(`https://teomarket.com/categories/${slug}`, {
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
          resolve({
            slug,
            name: json.props.category?.name,
            total: json.props.pagination?.total,
            last_page: json.props.pagination?.last_page,
            products_count: json.props.products?.length
          });
        } catch (e) {
          resolve({ slug, error: e.message });
        }
      });
    }).on('error', err => resolve({ slug, error: err.message }));
  });
}

async function run() {
  const slugs = [
    'carnetele-razuibile',
    'carucioare-copii',
    'ghiozdane',
    'jucarii-si-jocuri',
    'accesorii-bucatarie'
  ];
  for (const s of slugs) {
    const res = await testCategory(s);
    console.log(res);
  }
}

run();
