const https = require('https');
const fs = require('fs');
const path = require('path');

const INERTIA_VERSION = '52864a628b10bbb25991700a2ac57cac';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = https.get(url, {
          headers: {
            'User-Agent': USER_AGENT,
            'X-Inertia': 'true',
            'X-Inertia-Version': INERTIA_VERSION,
            'Accept': 'text/html, application/xhtml+xml'
          },
          timeout: 15000
        }, res => {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve(json);
            } catch (e) {
              reject(new Error(`JSON parse error on ${url}: ${e.message}`));
            }
          });
        });

        req.on('timeout', () => {
          req.destroy(new Error(`Timeout on ${url}`));
        });

        req.on('error', reject);
      });
    } catch (err) {
      if (attempt === retries) throw err;
      await delay(1000 * attempt);
    }
  }
}

async function main() {
  console.log('====================================================');
  console.log('       TEOMARKET.COM COMPLETE CATALOG SCRAPER       ');
  console.log('====================================================');

  const OUTPUT_FILE = path.join(__dirname, 'teomarket_all_products_raw.json');
  const CAT_FILE = path.join(__dirname, 'teomarket_category_tree.json');

  // 1. Fetch category tree from homepage
  console.log('1. Fetching category tree from https://teomarket.com/ ...');
  const homeData = await fetchJsonWithRetry('https://teomarket.com/');
  const topCategories = homeData.props?.categories || [];
  fs.writeFileSync(CAT_FILE, JSON.stringify(topCategories, null, 2));
  console.log(`✓ Saved ${topCategories.length} top categories to ${CAT_FILE}`);

  // Build leaf categories list
  const leafCategories = [];
  function walk(cat, parentPath = []) {
    const currentPath = [...parentPath, { id: cat.id, name: cat.name, slug: cat.slug }];
    const subs = cat.subCategories || cat.subSubCategories || [];
    if (subs.length === 0) {
      leafCategories.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        path: currentPath
      });
    } else {
      subs.forEach(s => walk(s, currentPath));
    }
  }
  topCategories.forEach(c => walk(c));
  console.log(`✓ Found ${leafCategories.length} leaf categories in total.`);

  // Map to store products by ID: id -> { ...product, leafCategorySlug, leafCategoryName, categoryPath }
  const productMap = new Map();

  // If previous partial file exists, load it
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      for (const p of existing) {
        if (p && p.id) productMap.set(p.id, p);
      }
      console.log(`✓ Loaded ${productMap.size} previously saved products from cache.`);
    } catch (e) {
      console.log('Starting fresh.');
    }
  }

  // 2. Scrape Category by Category to get exact leaf category assignment
  console.log('\n2. Scraping products by category for precise SEO hierarchy...');
  const CONCURRENCY = 10;

  for (let i = 0; i < leafCategories.length; i += CONCURRENCY) {
    const batch = leafCategories.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (leaf) => {
      try {
        const firstPage = await fetchJsonWithRetry(`https://teomarket.com/categories/${leaf.slug}?page=1`);
        const total = parseInt(firstPage.props?.pagination?.total || 0, 10);
        const lastPage = parseInt(firstPage.props?.pagination?.last_page || 1, 10);
        const firstProducts = firstPage.props?.products || [];

        for (const p of firstProducts) {
          if (!productMap.has(p.id)) {
            productMap.set(p.id, {
              ...p,
              leafCategorySlug: leaf.slug,
              leafCategoryName: leaf.name,
              categoryPath: leaf.path
            });
          }
        }

        // Fetch remaining pages for this category if any
        if (lastPage > 1) {
          for (let page = 2; page <= lastPage; page++) {
            try {
              const pageData = await fetchJsonWithRetry(`https://teomarket.com/categories/${leaf.slug}?page=${page}`);
              const prods = pageData.props?.products || [];
              for (const p of prods) {
                if (!productMap.has(p.id)) {
                  productMap.set(p.id, {
                    ...p,
                    leafCategorySlug: leaf.slug,
                    leafCategoryName: leaf.name,
                    categoryPath: leaf.path
                  });
                }
              }
            } catch (pageErr) {
              console.error(`  Warning: failed page ${page} for category ${leaf.slug}: ${pageErr.message}`);
            }
          }
        }
      } catch (catErr) {
        console.error(`  Warning: failed category ${leaf.slug}: ${catErr.message}`);
      }
    }));

    if ((i + CONCURRENCY) % 40 === 0 || i + CONCURRENCY >= leafCategories.length) {
      console.log(`  Processed ${Math.min(i + CONCURRENCY, leafCategories.length)} / ${leafCategories.length} leaf categories (${productMap.size} unique products so far)...`);
    }
  }

  console.log(`✓ Finished category scrape. Found ${productMap.size} unique products.`);

  // 3. Scrape global products catalog (pages 1 to 749) to capture any unassigned/extra products
  console.log('\n3. Verifying and scraping global catalog /products?page=N (749 pages)...');
  const totalCatalogPages = 749;
  const PAGE_CONCURRENCY = 12;

  let newFromCatalog = 0;
  for (let p = 1; p <= totalCatalogPages; p += PAGE_CONCURRENCY) {
    const pages = [];
    for (let j = 0; j < PAGE_CONCURRENCY && (p + j) <= totalCatalogPages; j++) {
      pages.push(p + j);
    }

    await Promise.all(pages.map(async (pageNum) => {
      try {
        const pageData = await fetchJsonWithRetry(`https://teomarket.com/products?page=${pageNum}`);
        const prods = pageData.props?.products || [];
        for (const prod of prods) {
          if (!productMap.has(prod.id)) {
            productMap.set(prod.id, {
              ...prod,
              leafCategorySlug: null,
              leafCategoryName: null,
              categoryPath: null
            });
            newFromCatalog++;
          }
        }
      } catch (err) {
        console.error(`  Warning: error on global page ${pageNum}: ${err.message}`);
      }
    }));

    if (p % 60 === 1 || p + PAGE_CONCURRENCY > totalCatalogPages) {
      console.log(`  Scraped up to page ${Math.min(p + PAGE_CONCURRENCY - 1, totalCatalogPages)} / ${totalCatalogPages} (Total products: ${productMap.size})...`);
      // Save checkpoint
      const currentList = Array.from(productMap.values());
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(currentList));
    }
  }

  const finalList = Array.from(productMap.values());
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalList, null, 2));

  console.log('\n====================================================');
  console.log('              SCRAPING RESULTS SUMMARY              ');
  console.log('====================================================');
  console.log(`✓ Total unique products scraped: ${finalList.length}`);
  console.log(`✓ Products with precise leaf category: ${finalList.filter(p => p.leafCategorySlug).length}`);
  console.log(`✓ Additional products from global catalog: ${finalList.filter(p => !p.leafCategorySlug).length}`);
  console.log(`✓ Saved raw dataset to: ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});
