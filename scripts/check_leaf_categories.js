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
    const json = JSON.parse(data);
    const topCats = json.props.categories || [];
    let totalCategories = 0;
    const allLeafCats = [];

    function walk(cat, parentPath = []) {
      totalCategories++;
      const currentPath = [...parentPath, { id: cat.id, name: cat.name, slug: cat.slug }];
      const subs = cat.subCategories || cat.subSubCategories || [];
      if (subs.length === 0) {
        allLeafCats.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          path: currentPath
        });
      } else {
        subs.forEach(s => walk(s, currentPath));
      }
    }

    topCats.forEach(c => walk(c));
    console.log(`Total categories in tree: ${totalCategories}`);
    console.log(`Total leaf categories: ${allLeafCats.length}`);
    console.log('First 10 leaf categories:');
    allLeafCats.slice(0, 10).forEach(l => {
      console.log(` - ${l.path.map(p => p.name).join(' > ')} (/categories/${l.slug})`);
    });
  });
});
