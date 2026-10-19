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

async function run() {
  const home = await fetchJson('https://teomarket.com/');
  const topCats = home.props.categories || [];
  const allLeafCats = [];

  function walk(cat, parentPath = []) {
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
  console.log(`Found ${allLeafCats.length} leaf categories.`);

  // Let's sample or check total pages
  let totalCategoryPages = 0;
  let totalCategoryProducts = 0;

  // Let's batch check in chunks of 20
  for (let i = 0; i < allLeafCats.length; i += 20) {
    const chunk = allLeafCats.slice(i, i + 20);
    const results = await Promise.all(
      chunk.map(async (cat) => {
        try {
          const res = await fetchJson(`https://teomarket.com/categories/${cat.slug}`);
          const total = parseInt(res.props.pagination?.total || 0, 10);
          const lastPage = parseInt(res.props.pagination?.last_page || 1, 10);
          return { slug: cat.slug, total, lastPage };
        } catch (e) {
          return { slug: cat.slug, total: 0, lastPage: 0, error: e.message };
        }
      })
    );
    for (const r of results) {
      totalCategoryProducts += r.total;
      totalCategoryPages += r.lastPage;
    }
    console.log(`Checked ${Math.min(i + 20, allLeafCats.length)} / ${allLeafCats.length} leaf cats (accumulated pages: ${totalCategoryPages}, products: ${totalCategoryProducts})`);
  }

  console.log(`\nDONE: Total category pages to fetch: ${totalCategoryPages}, Total products: ${totalCategoryProducts}`);
}

run();
